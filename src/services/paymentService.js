'use strict';

const https = require('https');
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const AppError = require('../utils/AppError');
const env = require('../config/env');
const notificationService = require('./notificationService');

const isSandbox = !env.MPESA_CONSUMER_KEY || !env.MPESA_CONSUMER_SECRET || env.MPESA_ENV === 'sandbox';

function httpRequest(url, options, body) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const reqOptions = {
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      method: options.method || 'GET',
      headers: options.headers || {},
    };

    const req = https.request(reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          resolve(data);
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(typeof body === 'string' ? body : JSON.stringify(body));
    req.end();
  });
}

async function getAccessToken() {
  const auth = Buffer.from(`${env.MPESA_CONSUMER_KEY}:${env.MPESA_CONSUMER_SECRET}`).toString('base64');
  const baseUrl = isSandbox
    ? 'https://sandbox.safaricom.co.ke'
    : 'https://api.safaricom.co.ke';

  const response = await httpRequest(`${baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
    method: 'GET',
    headers: { Authorization: `Basic ${auth}` },
  });

  if (!response.access_token) {
    throw new AppError('Failed to obtain M-Pesa access token.', 502, 'MPESA_AUTH_FAILED');
  }
  return { token: response.access_token, baseUrl };
}

function formatPhone(phone) {
  const digits = String(phone).replace(/\D/g, '');
  if (digits.startsWith('254')) return digits;
  if (digits.startsWith('0')) return `254${digits.slice(1)}`;
  if (digits.length === 9) return `254${digits}`;
  return digits;
}

function generatePassword() {
  const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
  const data = env.MPESA_SHORTCODE + env.MPESA_PASSKEY + timestamp;
  return Buffer.from(data).toString('base64');
}

async function initiateSTKPush({ userId, phoneNumber, amount, bookingId, description }) {
  const formattedPhone = formatPhone(phoneNumber);
  const payment = await Payment.create({
    user: userId,
    booking: bookingId,
    amount,
    phoneNumber: formattedPhone,
    description: description || 'KampoStay payment',
    status: 'pending',
    method: isSandbox && !env.MPESA_CONSUMER_KEY ? 'sandbox' : 'mpesa_stk',
  });

  if (isSandbox && !env.MPESA_CONSUMER_KEY) {
    payment.status = 'completed';
    payment.mpesa = {
      merchantRequestId: `SANDBOX-MR-${Date.now()}`,
      checkoutRequestId: `SANDBOX-CR-${Date.now()}`,
      responseCode: '0',
      responseDescription: 'Success. Sandbox mode — no real M-Pesa credentials configured.',
      receiptNumber: `SANDBOX${Date.now()}`,
      transactionDate: new Date().toISOString(),
    };
    payment.receipt = payment.mpesa.receiptNumber;
    payment.completedAt = new Date();
    await payment.save();

    if (bookingId) {
      await Booking.findByIdAndUpdate(bookingId, { payment: payment._id, status: 'confirmed' });
    }

    await notificationService.notify(userId, {
      type: 'payment',
      title: 'Payment Successful (Sandbox)',
      body: `KSh ${amount} payment simulated successfully. Receipt: ${payment.receipt}`,
      data: { paymentId: payment._id },
    });

    return payment;
  }

  try {
    const { token, baseUrl } = await getAccessToken();
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
    const callbackUrl = env.MPESA_CALLBACK_URL || `${env.APP_URL}/api/v1/payments/mpesa/callback`;

    const stkPayload = {
      BusinessShortCode: env.MPESA_SHORTCODE,
      Password: generatePassword(),
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.round(amount),
      PartyA: formattedPhone,
      PartyB: env.MPESA_SHORTCODE,
      PhoneNumber: formattedPhone,
      CallBackURL: callbackUrl,
      AccountReference: `KS-${payment._id.toString().slice(-8)}`,
      TransactionDesc: description || 'KampoStay Payment',
    };

    const response = await httpRequest(`${baseUrl}/mpesa/stkpush/v1/processrequest`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }, stkPayload);

    payment.status = 'processing';
    payment.mpesa = {
      merchantRequestId: response.MerchantRequestID,
      checkoutRequestId: response.CheckoutRequestID,
      responseCode: response.ResponseCode,
      responseDescription: response.ResponseDescription,
    };
    await payment.save();

    return payment;
  } catch (err) {
    payment.status = 'failed';
    payment.failureReason = err.message;
    payment.failedAt = new Date();
    await payment.save();
    throw new AppError(`M-Pesa STK Push failed: ${err.message}`, 502, 'MPESA_STK_FAILED');
  }
}

async function handleCallback(payload) {
  const body = payload?.Body?.stkCallback;
  if (!body) throw new AppError('Invalid callback payload.', 400);

  const checkoutRequestId = body.CheckoutRequestID;
  const payment = await Payment.findOne({ 'mpesa.checkoutRequestId': checkoutRequestId });
  if (!payment) throw new AppError('Payment not found.', 404);

  payment.mpesa.callbackPayload = payload;
  payment.mpesa.resultCode = body.ResultCode;
  payment.mpesa.resultDesc = body.ResultDesc;

  if (body.ResultCode === 0) {
    const metadata = body.CallbackMetadata?.Item || [];
    const receipt = metadata.find((i) => i.Name === 'MpesaReceiptNumber');
    payment.status = 'completed';
    payment.receipt = receipt?.Value?.toString();
    payment.mpesa.receiptNumber = payment.receipt;
    payment.completedAt = new Date();

    if (payment.booking) {
      await Booking.findByIdAndUpdate(payment.booking, { status: 'confirmed', payment: payment._id });
    }

    await notificationService.notify(payment.user, {
      type: 'payment',
      title: 'Payment Successful',
      body: `Your payment of KSh ${payment.amount} was successful. Receipt: ${payment.receipt}`,
      data: { paymentId: payment._id },
    });
  } else {
    payment.status = 'failed';
    payment.failedAt = new Date();
    payment.failureReason = body.ResultDesc;
  }

  await payment.save();
  return payment;
}

async function getPaymentById(id, userId, role) {
  const payment = await Payment.findById(id).populate('booking');
  if (!payment) throw new AppError('Payment not found.', 404);
  if (role !== 'admin' && payment.user.toString() !== userId.toString()) {
    throw new AppError('Not authorized.', 403);
  }
  return payment;
}

async function listPayments(userId, role, filters = {}) {
  const query = role === 'admin' ? {} : { user: userId };
  if (filters.status) query.status = filters.status;

  return Payment.find(query).sort('-createdAt').limit(50);
}

module.exports = { initiateSTKPush, handleCallback, getPaymentById, listPayments, isSandbox };
