import mongoose from 'mongoose';
import QRCode from 'qrcode';
import { config } from 'dotenv';
config();

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/suvaialaya';

await mongoose.connect(uri);
const db = mongoose.connection.db;

// 1. Backfill missing QR codes
const bookings = await db.collection('bookings').find({ qrCodeUrl: { $exists: false } }).toArray();
console.log('Bookings missing QR:', bookings.length);

let qrFixed = 0;
for (const booking of bookings) {
  try {
    const qrPayload = JSON.stringify({ id: booking._id.toString(), ts: Date.now() });
    const qrCodeDataUrl = await QRCode.toDataURL(qrPayload, {
      errorCorrectionLevel: 'H', margin: 2, width: 300,
      color: { dark: '#0F3B28', light: '#F9F6F0' }
    });
    await db.collection('bookings').updateOne(
      { _id: booking._id },
      { $set: { qrCodeUrl: qrCodeDataUrl } }
    );
    qrFixed++;
    process.stdout.write('.');
  } catch (e) {
    console.error('\nFailed QR for', booking._id, e.message);
  }
}
console.log('\nQR codes backfilled:', qrFixed);

// 2. Final state check
const remaining = await db.collection('bookings').countDocuments({ qrCodeUrl: { $exists: false } });
const total = await db.collection('bookings').countDocuments();
console.log(`Total bookings: ${total} | Still missing QR: ${remaining}`);

await mongoose.connection.close();
process.exit(0);
