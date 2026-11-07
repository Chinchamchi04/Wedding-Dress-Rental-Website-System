import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../backend/.env') });

async function check() {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/wedding_dress_rental';
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 4000 }).catch(async () => {
      await mongoose.connect('mongodb://127.0.0.1:27017/wedding_dress_rental');
    });
    const count = await mongoose.connection.collection('dresses').countDocuments();
    console.log('DRESS_COUNT:', count);
    const dresses = await mongoose.connection.collection('dresses').find({}, { projection: { code: 1, name: 1, images: 1, rentPrice: 1 } }).limit(5).toArray();
    console.log('SAMPLE_DRESSES:', JSON.stringify(dresses, null, 2));
    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err);
  }
}
check();

