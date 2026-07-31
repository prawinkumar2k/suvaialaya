import nodemailer from 'nodemailer';
import { config } from 'dotenv';
config();

console.log('SMTP Config:');
console.log('  HOST:', process.env.SMTP_HOST);
console.log('  PORT:', process.env.SMTP_PORT);
console.log('  USER:', process.env.SMTP_USER);
console.log('  PASS:', process.env.SMTP_PASS ? '[SET]' : '[MISSING]');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '465', 10),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  logger: true,
  debug: true,
});

try {
  console.log('\nVerifying SMTP connection...');
  await transporter.verify();
  console.log('✅ SMTP Connection OK');

  console.log('\nSending test OTP email...');
  const info = await transporter.sendMail({
    from: `"Suvaialaya Support" <${process.env.SMTP_USER}>`,
    to: 'prawinkumar2kk4@gmail.com',
    subject: 'OTP Test — Suvaialaya',
    html: `<h2>Your OTP is: <strong>123456</strong></h2><p>Valid for 10 minutes.</p>`
  });
  console.log('✅ Email sent! MessageId:', info.messageId);
} catch (err) {
  console.error('❌ Error:', err);
}
