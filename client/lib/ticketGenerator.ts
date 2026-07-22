import { jsPDF } from "jspdf";
import QRCode from "qrcode";

export const generatePremiumTicket = async (booking: any, user: any = null) => {
  try {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: [90, 160] // Adjusted for a sleeker profile
    });

    const primaryGreen = "#0B2D1F"; // Deeper forest green
    const accentGold = "#B8860B"; // Richer dark gold
    const textGray = "#4A4A4A";
    const bgCream = "#FAF9F6"; // Off-white luxury paper

    // Format Data
    const dateObj = new Date(booking.date);
    const bookingDate = dateObj.toLocaleDateString("en-US", { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    const dayStr = dateObj.getDate().toString().padStart(2, '0');
    const monthStr = dateObj.toLocaleString("default", { month: "short" }).toUpperCase();
    const slotHour = booking.slotTime ? booking.slotTime.split(":")[0].padStart(2, '0') : "11";
    
    const rawId = booking._id || booking.bookingId || "MKV-" + Math.random().toString(36).substr(2, 6);
    const shortId = rawId.substring(rawId.length - 4).toUpperCase();
    const ticketId = `${dayStr}${monthStr}${slotHour}-${shortId}`;

    const guestName = (booking.guestDetails?.fullName || user?.name || "Premium Guest").toUpperCase();
    const pax = booking.numberOfGuests || 1;

    // Background
    doc.setFillColor(bgCream);
    doc.rect(0, 0, 90, 160, "F");

    // Elegant Outer Border
    doc.setDrawColor(accentGold);
    doc.setLineWidth(0.4);
    doc.rect(4, 4, 82, 152);
    doc.setLineWidth(0.1);
    doc.rect(5.5, 5.5, 79, 149);

    // Load Image Helper (Robust Fetch + FileReader with Content-Type check)
    const loadImageBase64 = async (url: string): Promise<string | null> => {
      try {
        const fullUrl = url.startsWith('http') ? url : window.location.origin + url;
        const response = await fetch(fullUrl);
        const contentType = response.headers.get("content-type");
        if (!response.ok || !contentType || !contentType.includes("image")) return null;
        const blob = await response.blob();
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = () => resolve(null);
          reader.readAsDataURL(blob);
        });
      } catch (e) {
        return null;
      }
    };

    // Load Logo (Centered, Larger because it contains text)
    const logoBase64 = await loadImageBase64('/images/suvaialaya-logo.png');
    if (logoBase64) {
      // Draw larger logo, perfectly centered
      doc.addImage(logoBase64, "PNG", 25, 12, 40, 40);
    } else {
      // Fallback if logo fails
      doc.setTextColor(primaryGreen);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("SUVAIALAYA", 45, 25, { align: "center" });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.text("SOUTH INDIAN MULTI CUSINE RESTAURANT", 45, 32, { align: "center" });
    }

    // Title Section
    doc.setTextColor(primaryGreen);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    // Push title down to accommodate larger logo
    doc.text("MADURAI KARI VIRUNTHU", 45, 56, { align: "center" });

    // Decorative Divider
    doc.setDrawColor(accentGold);
    doc.setLineWidth(0.2);
    doc.line(15, 62, 75, 62);
    doc.setFillColor(accentGold);
    doc.circle(45, 62, 1, "F");

    // Guest Info Section (Centered, Clean)
    doc.setTextColor(textGray);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6);
    doc.text("CORDIALLY INVITING", 45, 72, { align: "center" });

    doc.setTextColor(primaryGreen);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(guestName, 45, 78, { align: "center" });

    // Details Grid (2 Columns, perfectly aligned)
    const startY = 82;
    
    // Left Column
    doc.setTextColor(textGray);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6);
    doc.text("DATE", 15, startY);
    
    doc.setTextColor(primaryGreen);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text(bookingDate, 15, startY + 4);

    doc.setTextColor(textGray);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6);
    doc.text("GUESTS", 15, startY + 14);
    
    doc.setTextColor(primaryGreen);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text(`${pax} PERSON(S)`, 15, startY + 18);

    // Right Column
    doc.setTextColor(textGray);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6);
    doc.text("TIME", 55, startY);
    
    doc.setTextColor(primaryGreen);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text(booking.slotTime || "11:00 AM", 55, startY + 4);

    doc.setTextColor(textGray);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6);
    doc.text("TICKET ID", 55, startY + 14);
    
    doc.setTextColor(primaryGreen);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text(ticketId, 55, startY + 18);

    // Minimalist Divider
    doc.setDrawColor(primaryGreen);
    doc.setLineWidth(0.1);
    doc.setLineDashPattern([1, 1], 0);
    doc.line(10, 110, 80, 110);
    doc.setLineDashPattern([], 0);

    // QR Code Area
    try {
      const verifyUrl = `${window.location.origin}/ticket/${ticketId}`;
      const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
        color: { dark: primaryGreen, light: bgCream },
        margin: 0
      });
      doc.addImage(qrDataUrl, "PNG", 35, 118, 20, 20);
    } catch (err) {
      console.error("QR generation failed", err);
    }

    // Footer
    doc.setTextColor(primaryGreen);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("Suvaialaya Welcomes You", 45, 146, { align: "center" });

    doc.setTextColor(textGray);
    doc.setFontSize(5);
    doc.setFont("helvetica", "normal");
    doc.text("Please present this pass at the reception.", 45, 151, { align: "center" });

    // Save
    doc.save(`Suvaialaya-Ticket-${ticketId}.pdf`);
  } catch (error) {
    console.error("Error generating premium ticket:", error);
  }
};
