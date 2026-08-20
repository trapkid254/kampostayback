#!/usr/bin/env node
'use strict';

const mongoose = require('mongoose');
const env = require('../src/config/env');
const Property = require('../src/models/Property');
const User = require('../src/models/User');
const University = require('../src/models/University');
const Booking = require('../src/models/Booking');
const Review = require('../src/models/Review');
const imageStorage = require('../src/services/imageStorage');

async function main() {
  const mongo = env.MONGODB_URI;
  if (!mongo) {
    console.error('MONGODB_URI not set in env. Aborting.');
    process.exit(1);
  }
  
  console.log('⚠️  WARNING: This will delete ALL data from the database!');
  console.log('⚠️  This includes:');
  console.log('   - All properties');
  console.log('   - All users (students, landlords, admins)');
  console.log('   - All bookings');
  console.log('   - All reviews');
  console.log('   - All universities');
  console.log('   - All images in GridFS');
  console.log('');
  console.log('Press Ctrl+C to cancel or wait 5 seconds to continue...');
  
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  await mongoose.connect(mongo);
  console.log('Connected to MongoDB.');

  try {
    // Delete all properties and their images
    console.log('\n🏠 Deleting properties...');
    const props = await Property.find({});
    console.log(`Found ${props.length} properties.`);
    for (const p of props) {
      try {
        const imgs = p.media?.images || [];
        const vids = p.media?.videos || [];
        for (const img of imgs) {
          if (img.publicId) {
            try {
              await imageStorage.deleteImage(img.publicId);
              console.log('  Deleted image:', img.publicId);
            } catch (err) {
              console.warn('  Could not delete image', img.publicId, err.message);
            }
          }
        }
        for (const v of vids) {
          if (v.publicId) {
            try {
              await imageStorage.deleteImage(v.publicId);
              console.log('  Deleted video:', v.publicId);
            } catch (err) {
              console.warn('  Could not delete video', v.publicId, err.message);
            }
          }
        }
        await Property.deleteOne({ _id: p._id });
        console.log('  Deleted property:', p.title);
      } catch (err) {
        console.error('  Failed to delete property', p._id.toString(), err.message);
      }
    }

    // Delete all bookings
    console.log('\n📅 Deleting bookings...');
    const bookingsDeleted = await Booking.deleteMany({});
    console.log(`Deleted ${bookingsDeleted.deletedCount} bookings.`);

    // Delete all reviews
    console.log('\n⭐ Deleting reviews...');
    const reviewsDeleted = await Review.deleteMany({});
    console.log(`Deleted ${reviewsDeleted.deletedCount} reviews.`);

    // Delete all users
    console.log('\n👤 Deleting users...');
    const users = await User.find({});
    console.log(`Found ${users.length} users.`);
    for (const u of users) {
      try {
        await User.deleteOne({ _id: u._id });
        console.log(`  Deleted user: ${u.email} (${u.role})`);
      } catch (err) {
        console.error('  Failed to delete user', u._id.toString(), err.message);
      }
    }

    // Delete all universities
    console.log('\n🎓 Deleting universities...');
    const universitiesDeleted = await University.deleteMany({});
    console.log(`Deleted ${universitiesDeleted.deletedCount} universities.`);

    console.log('\n✅ All data has been deleted successfully!');
  } catch (err) {
    console.error('\n❌ Error during deletion:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

main();
