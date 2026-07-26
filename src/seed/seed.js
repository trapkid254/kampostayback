'use strict';

require('dotenv').config();
const mongoose = require('mongoose');
const env = require('../config/env');
const User = require('../models/User');
const University = require('../models/University');
const Property = require('../models/Property');
const FAQ = require('../models/FAQ');
const Blog = require('../models/Blog');
const Coupon = require('../models/Coupon');
const Setting = require('../models/Setting');

const UNIVERSITIES = [
  { name: 'Jomo Kenyatta University of Agriculture and Technology', aliases: ['JKUAT', 'J.K.U.A.T'], city: 'Juja', county: 'Kiambu', coords: [37.0106, -1.0954], studentCount: 45000, featured: true },
  { name: 'University of Nairobi', aliases: ['UoN', 'UON'], city: 'Nairobi', county: 'Nairobi', coords: [36.8219, -1.2921], studentCount: 84000, featured: true },
  { name: 'Kenyatta University', aliases: ['KU'], city: 'Kahawa', county: 'Kiambu', coords: [36.9250, -1.1806], studentCount: 70000, featured: true },
  { name: 'Egerton University', aliases: ['Egerton'], city: 'Njoro', county: 'Nakuru', coords: [35.9180, -0.3677], studentCount: 30000, featured: false },
  { name: 'Moi University', aliases: ['MU'], city: 'Eldoret', county: 'Uasin Gishu', coords: [35.2890, 0.2936], studentCount: 35000, featured: false },
  { name: 'Masinde Muliro University of Science and Technology', aliases: ['MMUST'], city: 'Kakamega', county: 'Kakamega', coords: [34.7520, 0.2827], studentCount: 25000, featured: false },
  { name: 'Maseno University', aliases: ['Maseno'], city: 'Maseno', county: 'Kisumu', coords: [34.5990, 0.0074], studentCount: 22000, featured: false },
  { name: 'Technical University of Kenya', aliases: ['TUK'], city: 'Nairobi', county: 'Nairobi', coords: [36.8172, -1.2864], studentCount: 15000, featured: true },
  { name: 'KCA University', aliases: ['KCA'], city: 'Nairobi', county: 'Nairobi', coords: [36.7878, -1.2195], studentCount: 12000, featured: false },
  { name: 'Mount Kenya University', aliases: ['MKU'], city: 'Thika', county: 'Kiambu', coords: [37.0742, -1.0332], studentCount: 40000, featured: true },
  { name: 'Strathmore University', aliases: ['Strathmore', 'Strath'], city: 'Nairobi', county: 'Nairobi', coords: [36.8065, -1.3180], studentCount: 6000, featured: true },
  { name: 'Daystar University', aliases: ['Daystar'], city: 'Nairobi', county: 'Nairobi', coords: [36.7520, -1.3030], studentCount: 5000, featured: false },
  { name: 'Riara University', aliases: ['Riara'], city: 'Nairobi', county: 'Nairobi', coords: [36.7680, -1.2920], studentCount: 3000, featured: false },
  { name: 'Zetech University', aliases: ['Zetech'], city: 'Ruiru', county: 'Kiambu', coords: [36.9560, -1.1500], studentCount: 8000, featured: false },
  { name: 'Kisii University', aliases: ['Kisii Uni'], city: 'Kisii', county: 'Kisii', coords: [34.7740, -0.6773], studentCount: 18000, featured: false },
  { name: 'Kabarak University', aliases: ['Kabarak'], city: 'Molo', county: 'Nakuru', coords: [35.7350, -0.2450], studentCount: 8000, featured: false },
  { name: 'Catholic University of Eastern Africa', aliases: ['CUEA'], city: 'Nairobi', county: 'Nairobi', coords: [36.8940, -1.3030], studentCount: 6000, featured: false },
  { name: 'Dedan Kimathi University of Technology', aliases: ['DeKUT', 'Kimathi'], city: 'Nyeri', county: 'Nyeri', coords: [36.9570, -0.4197], studentCount: 12000, featured: false },
  { name: 'Pwani University', aliases: ['PU'], city: 'Kilifi', county: 'Kilifi', coords: [39.8490, -3.6330], studentCount: 10000, featured: false },
  { name: 'Multimedia University of Kenya', aliases: ['MMU'], city: 'Rongai', county: 'Kajiado', coords: [36.7300, -1.3970], studentCount: 9000, featured: false },
  { name: 'Kenya Methodist University', aliases: ['KeMU'], city: 'Meru', county: 'Meru', coords: [37.6500, 0.0470], studentCount: 7000, featured: false },
  { name: 'Laikipia University', aliases: ['Laikipia'], city: 'Nyahururu', county: 'Laikipia', coords: [36.3680, 0.0370], studentCount: 11000, featured: false },
  { name: 'South Eastern Kenya University', aliases: ['SEKU'], city: 'Kitui', county: 'Kitui', coords: [38.0100, -1.3670], studentCount: 15000, featured: false },
  { name: 'University of Eldoret', aliases: ['UoE'], city: 'Eldoret', county: 'Uasin Gishu', coords: [35.2800, 0.5200], studentCount: 8000, featured: false },
  { name: 'Machakos University', aliases: ['MksU'], city: 'Machakos', county: 'Machakos', coords: [37.2630, -1.5170], studentCount: 14000, featured: false },
];

const SAMPLE_PROPERTIES = [
  { title: 'Cozy Bedsitter near JKUAT Gate A', roomType: 'bedsitter', rent: 7500, deposit: 7500, estate: 'Juja', offset: [0.008, 0.005], amenities: { wifi: true, furnished: true, water: true } },
  { title: 'Shared Room — Kahawa Sukari', roomType: 'shared', rent: 4500, deposit: 4500, estate: 'Kahawa Sukari', offset: [0.012, -0.008], amenities: { wifi: true, water: true, kitchen: true } },
  { title: 'Single Room with Ensuite — Ruaraka', roomType: 'single', rent: 12000, deposit: 12000, estate: 'Ruaraka', offset: [-0.015, 0.01], amenities: { wifi: true, furnished: true, parking: true } },
  { title: 'Studio Apartment — Parklands', roomType: 'studio', rent: 18000, deposit: 18000, estate: 'Parklands', offset: [0.02, 0.015], amenities: { wifi: true, furnished: true, laundry: true, parking: true } },
  { title: 'Hostel Bed — UoN Main Campus', roomType: 'hostel_bed', rent: 3500, deposit: 3500, estate: 'Nairobi CBD', offset: [0.001, 0.002], amenities: { wifi: true, water: true, kitchen: true } },
  { title: 'One Bedroom — Thika MKU Area', roomType: 'one_bedroom', rent: 10000, deposit: 10000, estate: 'Section 9 Thika', offset: [0.006, -0.004], amenities: { wifi: true, parking: true } },
];

async function seed() {
  console.log('[Seed] Connecting to MongoDB...');
  await mongoose.connect(env.MONGODB_URI);
  console.log('[Seed] Clearing existing data...');

  await Promise.all([
    User.deleteMany({}),
    University.deleteMany({}),
    Property.deleteMany({}),
    FAQ.deleteMany({}),
    Blog.deleteMany({}),
    Coupon.deleteMany({}),
    Setting.deleteMany({}),
  ]);

  try {
    await Promise.all([
      require('../models/Review').deleteMany({}),
      require('../models/MarketplaceItem').deleteMany({}),
      require('../models/RoommateProfile').deleteMany({}),
      require('../models/Booking').deleteMany({}),
      require('../models/Payment').deleteMany({}),
    ]);
  } catch {
    /* models optional on first run */
  }

  console.log('[Seed] Creating admin user...');
  const admin = await User.create({
    email: env.SEED_ADMIN_EMAIL,
    password: env.SEED_ADMIN_PASSWORD,
    role: 'admin',
    profile: { firstName: 'KampoStay', lastName: 'Admin', phone: '+254700000001' },
    verification: { email: { verified: true, verifiedAt: new Date() }, phone: { verified: true }, adminApproved: true, adminApprovedAt: new Date() },
  });

  console.log('[Seed] Creating universities...');
  const universities = await University.insertMany(
    UNIVERSITIES.map((u) => ({
      name: u.name,
      aliases: u.aliases,
      location: {
        city: u.city,
        county: u.county,
        country: 'Kenya',
        address: `${u.name}, ${u.city}`,
        coordinates: { type: 'Point', coordinates: u.coords },
      },
      studentCount: u.studentCount,
      featured: u.featured,
    }))
  );

  const byAliasOrName = (needle) =>
    universities.find(
      (u) =>
        u.name.toLowerCase().includes(needle.toLowerCase())
        || (u.aliases || []).some((a) => String(a).toLowerCase() === needle.toLowerCase())
    );

  const jkuat = byAliasOrName('JKUAT') || byAliasOrName('Jomo Kenyatta');
  const uon = byAliasOrName('University of Nairobi') || byAliasOrName('UoN');
  const ku = byAliasOrName('Kenyatta University') || byAliasOrName('KU');
  if (!jkuat || !uon || !ku) {
    throw new Error(`Seed university lookup failed (jkuat=${!!jkuat}, uon=${!!uon}, ku=${!!ku})`);
  }

  console.log('[Seed] Creating landlords and students...');
  const landlord1 = await User.create({
    email: 'landlord1@kampostay.co.ke',
    password: 'Landlord@123',
    role: 'landlord',
    profile: { firstName: 'James', lastName: 'Kamau', phone: '+254712345678' },
    verification: { email: { verified: true }, phone: { verified: true }, adminApproved: true, adminApprovedAt: new Date() },
  });

  const landlord2 = await User.create({
    email: 'landlord2@kampostay.co.ke',
    password: 'Landlord@123',
    role: 'landlord',
    profile: { firstName: 'Mary', lastName: 'Wanjiku', phone: '+254723456789' },
    verification: { email: { verified: true }, phone: { verified: true }, adminApproved: true, adminApprovedAt: new Date() },
  });

  const student1 = await User.create({
    email: 'student1@kampostay.co.ke',
    password: 'Student@123',
    role: 'student',
    profile: { firstName: 'Brian', lastName: 'Ochieng', phone: '+254734567890', university: jkuat._id },
    verification: { email: { verified: true }, phone: { verified: true }, adminApproved: true },
    studentVerificationBadge: { active: true, issuedAt: new Date(), expiresAt: new Date(Date.now() + 365 * 86400000) },
  });

  const student2 = await User.create({
    email: 'student2@kampostay.co.ke',
    password: 'Student@123',
    role: 'student',
    profile: { firstName: 'Grace', lastName: 'Akinyi', phone: '+254745678901', university: uon._id },
    verification: { email: { verified: true }, phone: { verified: true }, adminApproved: true },
    studentVerificationBadge: { active: true, issuedAt: new Date() },
  });

  console.log('[Seed] Creating properties...');
  const uniMap = [jkuat, jkuat, ku, uon, uon, universities.find((u) => u.name.includes('Mount Kenya'))];
  const landlords = [landlord1, landlord1, landlord2, landlord2, landlord1, landlord2];

  for (let i = 0; i < SAMPLE_PROPERTIES.length; i++) {
    const p = SAMPLE_PROPERTIES[i];
    const uni = uniMap[i];
    const [lng, lat] = uni.location.coordinates.coordinates;
    const dist = Math.sqrt(p.offset[0] ** 2 + p.offset[1] ** 2) * 111;
    const walkMin = Math.max(5, Math.round(dist / 5 * 60));

    await Property.create({
      title: p.title,
      description: `${p.title}. Located in ${p.estate}, walking distance from ${uni.name}. Water and security included. Ideal for students looking for affordable, verified accommodation in Kenya.`,
      landlord: landlords[i]._id,
      university: uni._id,
      rent: p.rent,
      deposit: p.deposit,
      roomType: p.roomType,
      roomSize: p.roomType === 'bedsitter' ? 20 : 12,
      distanceFromCampus: Math.round(dist * 100) / 100,
      walkingTimeMinutes: walkMin,
      amenities: { ...p.amenities, electricityType: 'prepaid', bathrooms: 1, genderRestriction: 'none' },
      location: {
        address: `${p.estate}, ${uni.location.city}`,
        estate: p.estate,
        city: uni.location.city,
        county: uni.location.county,
        coordinates: { type: 'Point', coordinates: [lng + p.offset[0], lat + p.offset[1]] },
      },
      media: {
        images: [{ url: `https://placehold.co/800x600/1e40af/ffffff?text=${encodeURIComponent(p.title.slice(0, 20))}`, isPrimary: true }],
      },
      houseRules: ['No loud music after 10 PM', 'Visitors must sign in', 'Rent due by 5th of each month'],
      verification: { status: 'verified', verifiedAt: new Date(), verifiedBy: admin._id },
      status: 'published',
      featured: i < 2,
      publishedAt: new Date(),
      nearbyFacilities: [
        { name: 'Mini Mart', type: 'shop', distanceMeters: 200, walkingMinutes: 3 },
        { name: 'Matatu Stage', type: 'transport', distanceMeters: 350, walkingMinutes: 5 },
      ],
      emergencyContacts: [{ name: 'Caretaker', phone: '+254700000099', relation: 'caretaker' }],
    });
  }

  console.log('[Seed] Creating FAQs...');
  await FAQ.insertMany([
    { question: 'How do I pay rent on KampoStay?', answer: 'You can pay via M-Pesa STK Push directly on the platform. Go to your booking, click Pay Now, enter your M-Pesa number, and confirm the prompt on your phone.', category: 'payments', order: 1 },
    { question: 'Are listings verified?', answer: 'Yes. Every listing goes through our verification process. We check landlord identity, property photos, and location. Verified listings show a green badge.', category: 'trust', order: 2 },
    { question: 'What universities does KampoStay cover?', answer: 'We cover 25+ Kenyan universities including JKUAT, UoN, Kenyatta University, MKU, Strathmore, TUK, and many more across the country.', category: 'general', order: 3 },
    { question: 'Can I schedule a viewing before paying?', answer: 'Absolutely. Book a free viewing through the property page. Meet the landlord, inspect the room, and only pay when you are satisfied.', category: 'bookings', order: 4 },
    { question: 'How does the roommate matching work?', answer: 'Create a roommate profile with your lifestyle preferences. Our compatibility engine scores matches based on sleep schedule, cleanliness, budget, and interests.', category: 'roommates', order: 5 },
    { question: 'What if I suspect a scam listing?', answer: 'Report it immediately using the Report button on any listing. Our fraud detection team reviews reports within 24 hours and suspends confirmed scam accounts.', category: 'trust', order: 6 },
  ]);

  console.log('[Seed] Creating blog posts...');
  await Blog.insertMany([
    {
      title: 'Top 10 Student Hostels Near JKUAT in 2026',
      excerpt: 'A comprehensive guide to affordable, verified accommodation near JKUAT main campus in Juja.',
      content: 'Finding the right hostel near JKUAT can be overwhelming. In this guide, we cover the best estates — Juja, Kahawa Sukari, and Ruiru — with average rents from KSh 4,500 to KSh 12,000...',
      author: admin._id,
      category: 'guides',
      tags: ['jkuat', 'hostels', 'juja'],
      status: 'published',
      publishedAt: new Date(),
      seo: { metaTitle: 'Best JKUAT Hostels 2026 | KampoStay', metaDescription: 'Verified student hostels near JKUAT. Compare prices, amenities, and walking distance.' },
    },
    {
      title: 'M-Pesa Rent Payments: A Student Guide',
      excerpt: 'Everything you need to know about paying rent via M-Pesa on KampoStay.',
      content: 'M-Pesa has revolutionized how Kenyan students pay rent. With KampoStay STK Push integration, you can pay deposit and first month rent in seconds...',
      author: admin._id,
      category: 'payments',
      tags: ['mpesa', 'rent', 'payments'],
      status: 'published',
      publishedAt: new Date(),
    },
    {
      title: 'How to Spot Rental Scams in Nairobi',
      excerpt: 'Protect yourself from fake listings and fraudulent landlords.',
      content: 'Rental scams target students every intake season. Red flags include: prices too good to be true, landlords refusing viewings, requests for wire transfers...',
      author: admin._id,
      category: 'safety',
      tags: ['scams', 'safety', 'nairobi'],
      status: 'published',
      publishedAt: new Date(),
    },
  ]);

  console.log('[Seed] Creating coupons and settings...');
  await Coupon.create({
    code: 'WELCOME500',
    description: 'KSh 500 off your first booking',
    discountType: 'fixed',
    discountValue: 500,
    minAmount: 3000,
    usageLimit: 1000,
    validUntil: new Date(Date.now() + 365 * 86400000),
  });

  await Setting.insertMany([
    { key: 'platform_name', value: 'KampoStay', type: 'string', isPublic: true, description: 'Platform display name' },
    { key: 'default_currency', value: 'KES', type: 'string', isPublic: true },
    { key: 'booking_deposit_percentage', value: 100, type: 'number', description: 'Default deposit as % of rent' },
    { key: 'maintenance_mode', value: false, type: 'boolean', isPublic: true },
    { key: 'support_email', value: 'support@kampostay.co.ke', type: 'string', isPublic: true },
    { key: 'support_phone', value: '+254700000000', type: 'string', isPublic: true },
  ]);

  console.log('[Seed] Creating reviews, marketplace, roommates, bookings...');
  const Review = require('../models/Review');
  const MarketplaceItem = require('../models/MarketplaceItem');
  const RoommateProfile = require('../models/RoommateProfile');
  const Booking = require('../models/Booking');

  const published = await Property.find({ status: 'published' }).limit(6);
  if (published[0]) {
    await Review.create({
      property: published[0]._id,
      author: student1._id,
      landlord: published[0].landlord || landlord1._id,
      ratings: { overall: 5, cleanliness: 5, location: 4, value: 5, landlord: 5 },
      text: 'Clean, safe, and walking distance to campus. Landlord is responsive.',
      verifiedTenant: true,
    });
  }
  if (published[1]) {
    await Review.create({
      property: published[1]._id,
      author: student2._id,
      landlord: published[1].landlord || landlord2._id,
      ratings: { overall: 4, cleanliness: 4, location: 5, value: 4, landlord: 4 },
      text: 'Good value for money. Water is reliable. Would recommend for first years.',
      verifiedTenant: true,
    });
  }

  await MarketplaceItem.create([
    {
      title: 'Engineering textbooks bundle',
      description: 'First-year engineering books in good condition. Pickup near Juja.',
      seller: student1._id,
      university: jkuat._id,
      category: 'books',
      price: 2500,
      condition: 'good',
      contactPhone: '+254734567890',
      location: { city: 'Juja', county: 'Kiambu' },
      images: [{ url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&q=80' }],
      status: 'available',
    },
    {
      title: 'Study desk + chair',
      description: 'Wooden study desk with chair. Perfect for bedsitters.',
      seller: student2._id,
      university: uon._id,
      category: 'furniture',
      price: 4500,
      condition: 'like_new',
      contactPhone: '+254745678901',
      location: { city: 'Nairobi', county: 'Nairobi' },
      images: [{ url: 'https://images.unsplash.com/photo-1518455027359-f95cb9670161?w=400&q=80' }],
      status: 'available',
    },
  ]);

  await RoommateProfile.create([
    {
      user: student1._id,
      university: jkuat._id,
      bio: 'CS student, tidy, early sleeper. Looking for a quiet roommate near JKUAT.',
      budget: { min: 3500, max: 7000, currency: 'KES' },
      lifestyle: {
        sleepSchedule: 'early_bird',
        cleanliness: 5,
        noiseTolerance: 2,
        smoking: 'no',
        drinking: 'no',
        guests: 'sometimes',
        cooking: 'sometimes',
        studyHabits: 'quiet',
        pets: false,
      },
      preferences: { gender: 'any', sameUniversity: true },
      interests: ['coding', 'football', 'study'],
      course: 'Computer Science',
      yearOfStudy: 2,
      isActive: true,
    },
    {
      user: student2._id,
      university: uon._id,
      bio: 'Business student who likes a clean shared space and weekend markets.',
      budget: { min: 4000, max: 9000, currency: 'KES' },
      lifestyle: {
        sleepSchedule: 'flexible',
        cleanliness: 4,
        noiseTolerance: 3,
        smoking: 'no',
        drinking: 'social',
        guests: 'sometimes',
        cooking: 'often',
        studyHabits: 'moderate',
        pets: false,
      },
      preferences: { gender: 'any', sameUniversity: true },
      interests: ['cooking', 'music', 'campus'],
      course: 'Business',
      yearOfStudy: 1,
      isActive: true,
    },
  ]);

  if (published[0]) {
    await Booking.create({
      property: published[0]._id,
      student: student1._id,
      landlord: landlord1._id,
      type: 'viewing',
      scheduledDate: new Date(Date.now() + 3 * 86400000),
      amount: 0,
      currency: 'KES',
      status: 'confirmed',
      notes: 'Seeded demo viewing',
    });
  }

  console.log('\n[Seed] Complete!');
  console.log('──────────────────────────────────────');
  console.log(`Admin:     ${env.SEED_ADMIN_EMAIL} / ${env.SEED_ADMIN_PASSWORD}`);
  console.log('Landlord:  landlord1@kampostay.co.ke / Landlord@123');
  console.log('Student:   student1@kampostay.co.ke / Student@123');
  console.log(`Universities: ${universities.length}`);
  console.log(`Properties:   ${SAMPLE_PROPERTIES.length}`);
  console.log('──────────────────────────────────────\n');

  await mongoose.connection.close();
  process.exit(0);
}

seed().catch((err) => {
  console.error('[Seed] Failed:', err);
  process.exit(1);
});
