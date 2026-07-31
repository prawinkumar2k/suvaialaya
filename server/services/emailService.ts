import nodemailer from 'nodemailer';
import { Booking } from '../models/Booking';
import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';

// ─── Lazy transporter factory ─────────────────────────────────────────────────
// Created on first use so that env vars are guaranteed to be loaded.
let _transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (!_transporter) {
    _transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '465', 10),
      secure: true, // always SSL on 465
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return _transporter;
}


export const sendBookingConfirmationEmail = async (bookingId: string, type: 'confirmation' | 'cancellation' = 'confirmation') => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log(`[Email Service] SMTP credentials not configured. Skipping email send (${type}) for booking:`, bookingId);
    return;
  }

  try {
    const booking: any = await Booking.findById(bookingId).populate("user").populate("event");
    if (!booking) return;

    const userEmail = booking.guestDetails?.email || booking.user?.email;
    const userName = booking.guestDetails?.fullName || booking.user?.name || "Valued Guest";
    const eventName = booking.event?.title || "Madurai Kari Virunthu";

    const isCancellation = type === 'cancellation';
    const statusText = isCancellation ? 'Booking Cancelled' : 'Booking Confirmed';
    const emailSubject = isCancellation 
      ? `Your Reservation has been Cancelled: ${eventName}` 
      : `Your Booking is Confirmed: ${eventName}`;

    const mainMessage = isCancellation
      ? `Your reservation for <strong>${eventName}</strong> has been cancelled. If this was done in error, or if you have questions regarding your refund status, please contact our support team.`
      : `Your reservation for <strong>${eventName}</strong> has been successfully confirmed. We are thrilled to host you for an authentic South Indian culinary experience.`;

    const emailHtml = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #F9F6F0; padding: 40px; border: 2px solid #D4AF37;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #0F3B28; margin: 0; font-size: 28px; text-transform: uppercase;">Suvaialaya</h1>
          <p style="color: #D4AF37; margin: 5px 0 0; font-size: 12px; letter-spacing: 2px; text-transform: uppercase;">${statusText}</p>
        </div>
        
        <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <p style="color: #333; font-size: 16px;">Dear <strong>${userName}</strong>,</p>
          <p style="color: #555; line-height: 1.6;">${mainMessage}</p>
          
          <table style="width: 100%; margin-top: 25px; border-collapse: collapse;">
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 12px 0; color: #777; font-size: 12px; text-transform: uppercase; font-weight: bold;">Booking ID</td>
              <td style="padding: 12px 0; text-align: right; color: #0F3B28; font-weight: bold;">${booking._id}</td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 12px 0; color: #777; font-size: 12px; text-transform: uppercase; font-weight: bold;">Date</td>
              <td style="padding: 12px 0; text-align: right; color: #0F3B28; font-weight: bold;">${booking.date}</td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 12px 0; color: #777; font-size: 12px; text-transform: uppercase; font-weight: bold;">Time Slot</td>
              <td style="padding: 12px 0; text-align: right; color: #0F3B28; font-weight: bold;">${booking.slotTime}</td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 12px 0; color: #777; font-size: 12px; text-transform: uppercase; font-weight: bold;">Guests</td>
              <td style="padding: 12px 0; text-align: right; color: #0F3B28; font-weight: bold;">${booking.numberOfGuests} Pax</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; color: #777; font-size: 12px; text-transform: uppercase; font-weight: bold;">Amount ${isCancellation ? 'Paid' : 'Paid'}</td>
              <td style="padding: 12px 0; text-align: right; color: #0F3B28; font-weight: bold;">₹${booking.totalAmount}</td>
            </tr>
          </table>
        </div>
        
        <div style="text-align: center; margin-top: 30px; color: #777; font-size: 12px;">
          <p>${isCancellation ? 'If you have any queries, please reply directly to this email.' : 'Please present this email or your E-Ticket at the entrance.'}</p>
          <p>Suvaialaya Restaurant, 123 Heritage Road, Madurai</p>
        </div>
      </div>
    `;

    let attachments = [];
    
    // Generate PDF Ticket only for confirmations
    if (!isCancellation) {
      try {
        const doc = new jsPDF();
        
        // Header
        doc.setFillColor(15, 59, 40); // Dark Green
        doc.rect(0, 0, 210, 40, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.text("SUVAIALAYA", 105, 20, { align: "center" });
        doc.setFontSize(12);
        doc.setTextColor(212, 175, 55); // Gold
        doc.text("OFFICIAL E-TICKET", 105, 30, { align: "center" });

        // Booking Details
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(12);
        doc.text("Booking Details", 20, 60);
        doc.setLineWidth(0.5);
        doc.line(20, 62, 190, 62);

        doc.setFontSize(10);
        doc.text(`Booking ID:`, 20, 75);
        doc.text(`${booking._id}`, 60, 75);
        
        doc.text(`Guest Name:`, 20, 85);
        doc.text(`${userName}`, 60, 85);
        
        doc.text(`Event Date:`, 20, 95);
        doc.text(`${booking.date}`, 60, 95);
        
        doc.text(`Time Slot:`, 20, 105);
        doc.text(`${booking.slotTime}`, 60, 105);
        
        doc.text(`Party Size:`, 20, 115);
        doc.text(`${booking.numberOfGuests} Pax`, 60, 115);
        
        doc.text(`Amount Paid:`, 20, 125);
        doc.text(`INR ${booking.totalAmount}`, 60, 125);

        // QR Code
        const qrPayload = JSON.stringify({ id: booking._id.toString(), ts: Date.now() });
        const qrDataUrl = await QRCode.toDataURL(qrPayload, {
          errorCorrectionLevel: 'H',
          margin: 1,
          width: 200,
          color: { dark: '#0F3B28', light: '#FFFFFF' }
        });
        
        // Add QR code to right side
        doc.addImage(qrDataUrl, 'PNG', 130, 70, 60, 60);

        // Footer
        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.text("Please present this QR code at the reception for check-in.", 105, 160, { align: "center" });
        doc.text("Suvaialaya Restaurant · Madurai, Tamil Nadu", 105, 170, { align: "center" });

        const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
        
        attachments.push({
          filename: `Suvaialaya_Ticket_${booking._id}.pdf`,
          content: pdfBuffer,
        });
      } catch (pdfErr) {
        console.error("[Email Service] Failed to generate PDF attachment:", pdfErr);
      }
    }

    await getTransporter().sendMail({
      from: `"Suvaialaya Reservations" <${process.env.SMTP_USER}>`,
      to: userEmail,
      subject: emailSubject,
      html: emailHtml,
      attachments: attachments.length > 0 ? attachments : undefined,
    });

    console.log(`[Email Service] ${type} email sent successfully to ${userEmail}`);
  } catch (error) {
    console.error(`[Email Service] Failed to send ${type} email:`, error);
  }
};

export const sendPasswordResetOTPEmail = async (email: string, otp: string): Promise<void> => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error(`SMTP credentials not configured. Cannot send OTP to ${email}`);
  }

  const emailHtml = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 500px; margin: 0 auto; background-color: #F9F6F0; padding: 30px; border: 2px solid #D4AF37; border-radius: 8px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #0F3B28; margin: 0; font-size: 24px; text-transform: uppercase;">Suvaialaya</h1>
        <p style="color: #D4AF37; margin: 5px 0 0; font-size: 11px; letter-spacing: 2px; text-transform: uppercase;">Password Reset Request</p>
      </div>
      <div style="background-color: white; padding: 25px; border-radius: 6px; text-align: center;">
        <p style="color: #333; font-size: 15px; margin-bottom: 20px;">Use the following One-Time Password (OTP) to reset your account password. This code is valid for <strong>10 minutes</strong>.</p>
        <div style="font-size: 40px; font-weight: bold; letter-spacing: 10px; color: #0F3B28; background: #F0F7F0; padding: 20px 30px; border-radius: 8px; display: inline-block; margin: 10px 0; border: 2px dashed #0F3B28;">
          ${otp}
        </div>
        <p style="color: #888; font-size: 12px; margin-top: 20px;">If you did not request a password reset, please ignore this email.</p>
      </div>
    </div>
  `;

  // This will throw if SMTP fails — caller handles error
  await getTransporter().sendMail({
    from: `"Suvaialaya Support" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Your Password Reset OTP — Suvaialaya",
    html: emailHtml,
  });

  console.log(`[Email Service] ✅ Password reset OTP sent to ${email}`);
};

