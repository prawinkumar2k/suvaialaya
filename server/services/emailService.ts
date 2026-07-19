import { Resend } from 'resend';
import { Booking } from '../models/Booking';
import { User } from '../models/User';
import { Event } from '../models/Event';

// Note: In production, RESEND_API_KEY must be in .env
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export const sendBookingConfirmationEmail = async (bookingId: string, type: 'confirmation' | 'cancellation' = 'confirmation') => {
  if (!resend) {
    console.log(`[Email Service] Resend API key not configured. Skipping email send (${type}) for booking:`, bookingId);
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

    await resend.emails.send({
      from: 'Suvaialaya Reservations <reservations@suvaialaya.com>', // Note: Domain must be verified in Resend
      to: [userEmail],
      subject: emailSubject,
      html: emailHtml,
    });

    console.log(`[Email Service] ${type} email sent successfully to ${userEmail}`);
  } catch (error) {
    console.error(`[Email Service] Failed to send ${type} email:`, error);
  }
};
