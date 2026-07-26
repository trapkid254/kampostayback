'use strict';

const nodemailer = require('nodemailer');
const env = require('../config/env');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  if (env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });
  } else {
    transporter = {
      sendMail: async (options) => {
        console.log('[Email Fallback] Would send email:', {
          to: options.to,
          subject: options.subject,
          text: options.text?.slice(0, 200),
        });
        return { messageId: `fallback-${Date.now()}`, accepted: [options.to] };
      },
    };
  }

  return transporter;
}

async function sendEmail({ to, subject, text, html }) {
  const mailOptions = {
    from: env.EMAIL_FROM,
    to,
    subject,
    text,
    html: html || text,
  };
  return getTransporter().sendMail(mailOptions);
}

async function sendWelcomeEmail(user) {
  return sendEmail({
    to: user.email,
    subject: `Welcome to ${env.APP_NAME}`,
    text: `Hi ${user.profile?.firstName || 'there'},\n\nWelcome to ${env.APP_NAME}! Find verified student accommodation across Kenya.\n\nBest,\nThe ${env.APP_NAME} Team`,
  });
}

async function sendPasswordResetEmail(user, resetUrl) {
  return sendEmail({
    to: user.email,
    subject: `${env.APP_NAME} — Password Reset`,
    text: `Hi ${user.profile?.firstName || 'there'},\n\nReset your password using this link (valid for 1 hour):\n${resetUrl}\n\nIf you did not request this, ignore this email.`,
  });
}

async function sendVerificationEmail(user, verifyUrl) {
  return sendEmail({
    to: user.email,
    subject: `${env.APP_NAME} — Verify Your Email`,
    text: `Hi ${user.profile?.firstName || 'there'},\n\nVerify your email:\n${verifyUrl}`,
  });
}

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendVerificationEmail,
};
