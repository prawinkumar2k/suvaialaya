import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { Booking } from '../models/Booking';
import '../models/User';
import '../models/Event';
import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import { Resend } from 'resend';

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
  if (!process.env.RESEND_API_KEY && (!process.env.SMTP_USER || !process.env.SMTP_PASS)) {
    console.log(`[Email Service] Neither Resend nor SMTP credentials configured. Skipping email send (${type}) for booking:`, bookingId);
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
          <p>N, 256/B, nearby Narayana Hrudayalaya Hospital, Bommasandra Industrial Area, Bommasandra, Karnataka 560099</p>
        </div>
      </div>
    `;

    let attachments = [];
    
    // Generate PDF Ticket only for confirmations
    if (!isCancellation) {
      try {
        const W = 90;
        const H = 190;
        const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: [W, H] });
        const green  = "#1a3d2b";
        const gold   = "#c9841a";
        const cream  = "#FDFCF9";
        const cream2 = "#F8F5EF";
        const gray   = "#5A6070";

        // Helper functions
        const drawOrnamentH = (x: number, y: number, length: number) => {
          const step = 6; const half = 2.2; const count = Math.floor(length / step);
          for (let i = 0; i < count; i++) {
            const cx = x + i * step + step / 2;
            doc.setDrawColor(green); doc.setLineWidth(0.25);
            doc.lines([[half, half], [half, -half], [-half, -half], [-half, half]], cx - half, y, [1, 1], "S", true);
            doc.setFillColor(gold); doc.setLineWidth(0); const s = half * 0.5;
            doc.lines([[s, s], [s, -s], [-s, -s], [-s, s]], cx - s, y, [1, 1], "F", true);
            doc.setFillColor(green); doc.circle(cx, y, 0.5, "F");
          }
        };

        const drawOrnamentV = (x: number, y: number, length: number) => {
          const step = 6; const half = 2.2; const count = Math.floor(length / step);
          for (let i = 0; i < count; i++) {
            const cy = y + i * step + step / 2;
            doc.setDrawColor(green); doc.setLineWidth(0.25);
            doc.lines([[half, half], [half, -half], [-half, -half], [-half, half]], x - half, cy, [1, 1], "S", true);
            doc.setFillColor(gold); doc.setLineWidth(0); const s = half * 0.5;
            doc.lines([[s, s], [s, -s], [-s, -s], [-s, s]], x - s, cy, [1, 1], "F", true);
            doc.setFillColor(green); doc.circle(x, cy, 0.5, "F");
          }
        };

        // Format data
        const dateObj = new Date(booking.date);
        const bookingDate = dateObj.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
        const dayStr = dateObj.getDate().toString().padStart(2, "0");
        const monthStr = dateObj.toLocaleString("default", { month: "short" }).toUpperCase();
        const slotHour = (booking.slotTime ?? "11:00").split(":")[0].padStart(2, "0");
        const rawId = booking._id.toString();
        const shortId = rawId.slice(-4).toUpperCase();
        const ticketId = `${dayStr}${monthStr}${slotHour}-${shortId}`;
        const pax = booking.numberOfGuests ?? 1;
        const slot = booking.slotTime ?? "11:00 AM";

        // Background
        doc.setFillColor(cream);
        doc.rect(0, 0, W, H, "F");

        // Borders
        doc.setDrawColor(gold); doc.setLineWidth(0.7); doc.rect(3, 3, W - 6, H - 6);
        doc.setLineWidth(0.2); doc.rect(4.5, 4.5, W - 9, H - 9);
        drawOrnamentH(7, 7, W - 14); drawOrnamentH(7, H - 7, W - 14);
        drawOrnamentV(7, 7, H - 14); drawOrnamentV(W - 7, 7, H - 14);

        for (const [cx, cy] of [[7, 7], [W - 7, 7], [W - 7, H - 7], [7, H - 7]]) {
          doc.setFillColor(gold); doc.circle(cx, cy, 1.8, "F");
          doc.setFillColor(cream); doc.circle(cx, cy, 0.7, "F");
        }

        // Logo
        const logoX = W / 2; const logoY = 22;
        try {
          const logoPath = path.resolve(process.cwd(), 'client', 'public', 'logo.png');
          const logoBuf = fs.readFileSync(logoPath);
          const logoBase64 = `data:image/png;base64,${logoBuf.toString('base64')}`;
          doc.addImage(logoBase64, "PNG", logoX - 11, logoY - 11, 22, 22);
        } catch (e) {
          doc.setFillColor("#1a3d2b"); doc.circle(logoX, logoY, 10, "F");
          doc.setTextColor("#fff8ec"); doc.setFont("helvetica", "bold"); doc.setFontSize(7);
          doc.text("S", logoX, logoY + 2.5, { align: "center" });
        }

        // Header text
        doc.setTextColor(gold); doc.setFont("helvetica", "bold"); doc.setFontSize(5.5);
        doc.text("THE  MADURAI  VIRUNDHU", W / 2, 38, { align: "center", charSpace: 0.5 });
        doc.setDrawColor(gold); doc.setLineWidth(0.3); doc.line(W / 2 - 14, 41, W / 2 + 14, 41);
        doc.setFillColor(gold); doc.circle(W / 2, 41, 0.9, "F");

        doc.setTextColor(green); doc.setFont("helvetica", "bold"); doc.setFontSize(20);
        doc.text("SEAT", W / 2, 49, { align: "center" });
        doc.text("RESERVED", W / 2, 59, { align: "center" });
        doc.setDrawColor(gold); doc.setLineWidth(0.2); doc.line(W / 2 - 16, 63, W / 2 + 16, 63);

        // Status
        doc.setFont("helvetica", "normal"); doc.setFontSize(5.5); doc.setTextColor(gray);
        doc.text("STATUS:", 26, 69);
        doc.setTextColor(gold); doc.setFont("helvetica", "bold"); doc.text("CONFIRMED", 41, 69);
        doc.setTextColor(gray); doc.setFont("helvetica", "normal"); doc.text("GUESTS:", 26, 74);
        doc.setTextColor(gold); doc.setFont("helvetica", "bold"); doc.text(`${pax}  PAX`, 41, 74);

        // Tear line 1
        doc.setDrawColor("#c9841a"); doc.setLineWidth(0.2); doc.setLineDashPattern([2, 2], 0);
        doc.line(8, 80, W - 8, 80); doc.setLineDashPattern([], 0);

        // Details
        doc.setFillColor(cream2); doc.roundedRect(10, 84, W - 20, 28, 2, 2, "F");
        const rows = [
          { label: "DATE", value: bookingDate, x: 15, y: 91 },
          { label: "TIME", value: slot, x: 56, y: 91 },
          { label: "VENUE", value: "Suvaialaya Restaurant", x: 15, y: 104 },
        ];
        for (const { label, value, x, y } of rows) {
          doc.setFont("helvetica", "normal"); doc.setFontSize(5); doc.setTextColor(gray); doc.text(label, x, y);
          doc.setFont("helvetica", "bold"); doc.setFontSize(7.5); doc.setTextColor(green); doc.text(value, x, y + 5);
        }

        // Tear line 2
        doc.setDrawColor("#c9841a"); doc.setLineWidth(0.2); doc.setLineDashPattern([2, 2], 0);
        doc.line(8, 118, W - 8, 118); doc.setLineDashPattern([], 0);

        // QR Code
        const qrSize = 34; const qrX = (W - qrSize) / 2; const qrY = 124;
        const qrPayload = JSON.stringify({ id: booking._id.toString(), ts: Date.now() });
        const qrDataUrl = await QRCode.toDataURL(qrPayload, {
          errorCorrectionLevel: 'H', margin: 1, width: 200, color: { dark: green, light: "#FFFFFF" }
        });
        doc.setFillColor("#FFFFFF"); doc.setDrawColor(green); doc.setLineWidth(0.3);
        doc.roundedRect(qrX - 2, qrY - 2, qrSize + 4, qrSize + 4, 1.5, 1.5, "FD");
        doc.addImage(qrDataUrl, "PNG", qrX, qrY, qrSize, qrSize);

        const idY = qrY + qrSize + 7;
        doc.setFillColor("#EEF5EC"); doc.setDrawColor(green); doc.setLineWidth(0.2);
        doc.roundedRect(20, idY - 4.5, W - 40, 7, 2, 2, "FD");
        doc.setFont("helvetica", "normal"); doc.setFontSize(5); doc.setTextColor(gray);
        doc.text("ID:", W / 2 - 3, idY, { align: "right" });
        doc.setFont("helvetica", "bold"); doc.setFontSize(6); doc.setTextColor(gold); doc.text(ticketId, W / 2 - 2, idY);

        // Footer
        doc.setFont("helvetica", "bold"); doc.setFontSize(7.5); doc.setTextColor(green);
        doc.text("Suvaialaya Welcomes You", W / 2, 174, { align: "center" });
        doc.setFont("helvetica", "normal"); doc.setFontSize(4.5); doc.setTextColor(gray);
        doc.text("Present this ticket at the entrance  •  Bengaluru", W / 2, 178, { align: "center" });

        const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
        
        attachments.push({
          filename: `Suvaialaya_Ticket_${ticketId}.pdf`,
          content: pdfBuffer,
        });
      } catch (pdfErr) {
        console.error("[Email Service] Failed to generate PDF attachment:", pdfErr);
      }
    }

    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: `Suvaialaya Reservations <onboarding@resend.dev>`,
        to: userEmail,
        subject: emailSubject,
        html: emailHtml,
        attachments: attachments.length > 0 ? attachments : undefined,
      });
    } else {
      await getTransporter().sendMail({
        from: `"Suvaialaya Reservations" <${process.env.SMTP_USER}>`,
        to: userEmail,
        subject: emailSubject,
        html: emailHtml,
        attachments: attachments.length > 0 ? attachments : undefined,
      });
    }

    console.log(`[Email Service] ${type} email sent successfully to ${userEmail}`);
  } catch (error) {
    console.error(`[Email Service] Failed to send ${type} email:`, error);
  }
};

export const sendPasswordResetOTPEmail = async (email: string, otp: string): Promise<void> => {
  if (!process.env.RESEND_API_KEY && (!process.env.SMTP_USER || !process.env.SMTP_PASS)) {
    throw new Error(`Email credentials not configured. Cannot send OTP to ${email}`);
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

  // This will throw if it fails — caller handles error
  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: `Suvaialaya Support <onboarding@resend.dev>`,
      to: email,
      subject: "Your Password Reset OTP — Suvaialaya",
      html: emailHtml,
    });
  } else {
    await getTransporter().sendMail({
      from: `"Suvaialaya Support" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Your Password Reset OTP — Suvaialaya",
      html: emailHtml,
    });
  }

  console.log(`[Email Service] ✅ Password reset OTP sent to ${email}`);
};

