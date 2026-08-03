#!/usr/bin/env node
'use strict';

const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const env = require('../src/config/env');
const Property = require('../src/models/Property');
const imageStorage = require('../src/services/imageStorage');

async function removeLocalFileForPublicId(publicId) {
  if (!publicId) return false;
  if (!publicId.startsWith('local/')) return false;
  const hash = publicId.split('/')[1];
  const uploadsDir = path.resolve(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadsDir)) return false;
  const files = fs.readdirSync(uploadsDir).filter((f) => f.startsWith(hash));
  files.forEach((f) => {
    try {
      fs.unlinkSync(path.join(uploadsDir, f));
      console.log('Removed local file:', f);
    } catch (err) {
      console.warn('Failed to remove local file', f, err.message);
    }
  });
  return files.length > 0;
}

async function main() {
  const mongo = env.MONGODB_URI;
  if (!mongo) {
    console.error('MONGODB_URI not set in env. Aborting.');
    process.exit(1);
  }
  await mongoose.connect(mongo, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to MongoDB.');

  try {
    const props = await Property.find({});
    console.log(`Found ${props.length} properties. Deleting...`);
    let deleted = 0;
    for (const p of props) {
      try {
        const imgs = p.media?.images || [];
        const vids = p.media?.videos || [];
        for (const img of imgs) {
          if (img.publicId) {
            try {
              await imageStorage.deleteImage(img.publicId);
              console.log('Deleted asset:', img.publicId);
            } catch (err) {
              console.warn('Could not delete asset', img.publicId, err.message);
            }
            await removeLocalFileForPublicId(img.publicId);
          }
        }
        for (const v of vids) {
          if (v.publicId) {
            try {
              await imageStorage.deleteImage(v.publicId);
              console.log('Deleted asset:', v.publicId);
            } catch (err) {
              console.warn('Could not delete asset', v.publicId, err.message);
            }
            await removeLocalFileForPublicId(v.publicId);
          }
        }
        await Property.deleteOne({ _id: p._id });
        deleted++;
        console.log('Deleted property', p._id.toString());
      } catch (err) {
        console.error('Failed to delete property', p._id.toString(), err.message);
      }
    }
    console.log(`Completed. Deleted ${deleted} properties.`);
  } catch (err) {
    console.error('Error during deletion:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

main();
