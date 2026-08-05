import { sendBookingConfirmationEmail } from './server/services/emailService';
import mongoose from 'mongoose';
import 'dotenv/config';

async function run() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  console.log('Testing email...');
  const { Booking } = await import('./server/models/Booking');
  const b = await Booking.findOne().sort({ createdAt: -1 });
  if (b) {
    try {
      await sendBookingConfirmationEmail(b._id.toString());
      console.log('Success!');
    } catch(e) {
      console.error(e);
    }
  }
  process.exit(0);
}
run();
