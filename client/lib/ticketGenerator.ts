import { jsPDF } from "jspdf";
import QRCode from "qrcode";

/* ────────────────────────────────────────────────────────────────────────
   Draw a repeating diamond ornament strip along a line
──────────────────────────────────────────────────────────────────────── */
function drawOrnamentH(doc: jsPDF, x: number, y: number, length: number,
                       green: string, gold: string) {
  const step = 6;
  const half = 2.2;
  const count = Math.floor(length / step);
  for (let i = 0; i < count; i++) {
    const cx = x + i * step + step / 2;
    // Diamond
    doc.setDrawColor(green);
    doc.setLineWidth(0.25);
    doc.lines([[half, half], [half, -half], [-half, -half], [-half, half]], cx - half, y, [1, 1], "S", true);
    // Inner gold fill
    doc.setFillColor(gold);
    doc.setLineWidth(0);
    const s = half * 0.5;
    doc.lines([[s, s], [s, -s], [-s, -s], [-s, s]], cx - s, y, [1, 1], "F", true);
    // Centre dot
    doc.setFillColor(green);
    doc.circle(cx, y, 0.5, "F");
  }
}

function drawOrnamentV(doc: jsPDF, x: number, y: number, length: number,
                       green: string, gold: string) {
  const step = 6;
  const half = 2.2;
  const count = Math.floor(length / step);
  for (let i = 0; i < count; i++) {
    const cy = y + i * step + step / 2;
    doc.setDrawColor(green);
    doc.setLineWidth(0.25);
    doc.lines([[half, half], [half, -half], [-half, -half], [-half, half]], x - half, cy, [1, 1], "S", true);
    doc.setFillColor(gold);
    doc.setLineWidth(0);
    const s = half * 0.5;
    doc.lines([[s, s], [s, -s], [-s, -s], [-s, s]], x - s, cy, [1, 1], "F", true);
    doc.setFillColor(green);
    doc.circle(x, cy, 0.5, "F");
  }
}

/* ────────────────────────────────────────────────────────────────────────
   Corner arc ornament
──────────────────────────────────────────────────────────────────────── */
function drawCorner(doc: jsPDF, cx: number, cy: number,
                    flipX: boolean, flipY: boolean, gold: string) {
  const sx = flipX ? -1 : 1;
  const sy = flipY ? -1 : 1;
  doc.setDrawColor(gold);
  doc.setLineWidth(0.5);
  // Draw two arcs via lines approximation
  doc.lines(
    [[sx * 0, sy * 0], [sx * 3, sy * 0], [sx * 3, sy * 1.5], [sx * 0, sy * 1.5]],
    cx, cy, [1, 1], "S", false
  );
  doc.setFillColor(gold);
  doc.circle(cx, cy, 1.2, "F");
}

/* ────────────────────────────────────────────────────────────────────────
   Main export
──────────────────────────────────────────────────────────────────────── */
export const generatePremiumTicket = async (
  booking: any, 
  user: any = null,
  options: { returnBase64?: boolean } = {}
) => {
  try {
    const W = 90;
    const H = 170;

    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: [W, H] });

    const green  = "#1a3d2b";
    const gold   = "#c9841a";
    const cream  = "#FDFCF9";
    const cream2 = "#F8F5EF";
    const gray   = "#5A6070";

    // ── Format data ──────────────────────────────────────────────────────
    const dateObj   = new Date(booking.date);
    const bookingDate = dateObj.toLocaleDateString("en-US", {
      weekday: "short", month: "short", day: "numeric", year: "numeric",
    });
    const dayStr   = dateObj.getDate().toString().padStart(2, "0");
    const monthStr = dateObj.toLocaleString("default", { month: "short" }).toUpperCase();
    const slotHour = (booking.slotTime ?? "11:00").split(":")[0].padStart(2, "0");
    const rawId    = booking._id ?? booking.bookingId ?? "MKV" + Math.random().toString(36).substr(2, 5);
    const shortId  = rawId.slice(-4).toUpperCase();
    const ticketId = `${dayStr}${monthStr}${slotHour}-${shortId}`;
    const pax      = booking.numberOfGuests ?? 1;
    const slot     = booking.slotTime ?? "11:00 AM";

    // ── Background ───────────────────────────────────────────────────────
    doc.setFillColor(cream);
    doc.rect(0, 0, W, H, "F");

    // ── Double gold outer border ──────────────────────────────────────────
    doc.setDrawColor(gold);
    doc.setLineWidth(0.7);
    doc.rect(3, 3, W - 6, H - 6);
    doc.setLineWidth(0.2);
    doc.rect(4.5, 4.5, W - 9, H - 9);

    // ── Ornamental borders (all 4 sides, inside the gold rect) ───────────
    drawOrnamentH(doc, 7,      7,    W - 14, green, gold);  // top
    drawOrnamentH(doc, 7,      H - 7, W - 14, green, gold); // bottom
    drawOrnamentV(doc, 7,      7,    H - 14, green, gold);  // left
    drawOrnamentV(doc, W - 7,  7,    H - 14, green, gold);  // right

    // Corner gold dots
    for (const [cx, cy] of [[7, 7], [W - 7, 7], [W - 7, H - 7], [7, H - 7]]) {
      doc.setFillColor(gold);
      doc.circle(cx, cy, 1.8, "F");
      doc.setFillColor(cream);
      doc.circle(cx, cy, 0.7, "F");
    }

    // ── Logo (SVG rendered as shapes) ─────────────────────────────────────
    // Try to load the real logo PNG first
    const loadImageBase64 = async (url: string): Promise<string | null> => {
      try {
        const fullUrl = url.startsWith("http") ? url : window.location.origin + url;
        const res = await fetch(fullUrl);
        const ct  = res.headers.get("content-type") ?? "";
        if (!res.ok || !ct.includes("image")) return null;
        const blob = await res.blob();
        return new Promise<string | null>((resolve) => {
          const r = new FileReader();
          r.onloadend = () => resolve(r.result as string);
          r.onerror   = () => resolve(null);
          r.readAsDataURL(blob);
        });
      } catch { return null; }
    };

    const logoX = W / 2;
    const logoY = 24;

    const logoBase64 = await loadImageBase64("/suvaialaya-logo.png");
    if (logoBase64) {
      doc.addImage(logoBase64, "PNG", logoX - 11, logoY - 11, 22, 22);
    } else {
      // Fallback text if image missing
      doc.setFillColor("#1a3d2b");
      doc.circle(logoX, logoY, 10, "F");
      doc.setTextColor("#fff8ec"); doc.setFont("helvetica", "bold"); doc.setFontSize(7);
      doc.text("S", logoX, logoY + 2.5, { align: "center" });
    }


    // ── Header text ───────────────────────────────────────────────────────
    doc.setTextColor(gold);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(5.5);
    doc.text("THE  MADURAI  VIRUNDHU", W / 2, 39, { align: "center", charSpace: 0.5 });

    // Gold divider
    doc.setDrawColor(gold);
    doc.setLineWidth(0.3);
    doc.line(W / 2 - 14, 41.5, W / 2 + 14, 41.5);
    doc.setFillColor(gold); doc.circle(W / 2, 41.5, 0.9, "F");

    // Big title
    doc.setTextColor(green);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("SEAT", W / 2, 50, { align: "center" });
    doc.text("RESERVED", W / 2, 60, { align: "center" });

    // Second divider
    doc.setDrawColor(gold);
    doc.setLineWidth(0.2);
    doc.line(W / 2 - 16, 64, W / 2 + 16, 64);

    // Status / Guests
    doc.setFont("helvetica", "normal");
    doc.setFontSize(5.5);
    doc.setTextColor(gray);
    doc.text("STATUS:", 26, 70);
    doc.setTextColor(gold); doc.setFont("helvetica", "bold");
    doc.text("CONFIRMED", 41, 70);

    doc.setTextColor(gray);  doc.setFont("helvetica", "normal");
    doc.text("GUESTS:", 26, 75);
    doc.setTextColor(gold);  doc.setFont("helvetica", "bold");
    doc.text(`${pax}  PAX`, 41, 75);

    // ── Tear line ─────────────────────────────────────────────────────────
    doc.setDrawColor("#BBBBBB");
    doc.setLineWidth(0.15);
    doc.setLineDashPattern([1.5, 1.5], 0);
    doc.line(9, 82, W - 9, 82);
    doc.setLineDashPattern([], 0);
    // Cutout circles
    doc.setFillColor(cream);
    doc.setDrawColor("#AAAAAA"); doc.setLineWidth(0.15);
    doc.circle(3, 82, 3, "FD");
    doc.circle(W - 3, 82, 3, "FD");

    // ── Details section ───────────────────────────────────────────────────
    doc.setFillColor(cream2);
    doc.roundedRect(10, 86, W - 20, 30, 2, 2, "F");

    const rows = [
      { label: "DATE",  value: bookingDate, x: 15, y: 93 },
      { label: "TIME",  value: slot,        x: 56, y: 93 },
      { label: "VENUE", value: "Suvaialaya Restaurant", x: 15, y: 108 },
    ];
    for (const { label, value, x, y } of rows) {
      doc.setFont("helvetica", "normal"); doc.setFontSize(5); doc.setTextColor(gray);
      doc.text(label, x, y);
      doc.setFont("helvetica", "bold"); doc.setFontSize(7.5); doc.setTextColor(green);
      doc.text(value, x, y + 5);
    }

    // ── Tear line 2 ───────────────────────────────────────────────────────
    doc.setDrawColor("#BBBBBB");
    doc.setLineWidth(0.15);
    doc.setLineDashPattern([1.5, 1.5], 0);
    doc.line(9, 122, W - 9, 122);
    doc.setLineDashPattern([], 0);
    doc.setFillColor(cream);
    doc.setDrawColor("#AAAAAA"); doc.setLineWidth(0.15);
    doc.circle(3, 122, 3, "FD");
    doc.circle(W - 3, 122, 3, "FD");

    // ── QR Code ───────────────────────────────────────────────────────────
    const qrSize = 34;
    const qrX = (W - qrSize) / 2;
    const qrY = 127;

    const qrDataUrl = await QRCode.toDataURL(ticketId, {
      width: 200, margin: 1,
      color: { dark: green, light: "#FFFFFF" },
    });
    // white rounded box behind QR
    doc.setFillColor("#FFFFFF");
    doc.setDrawColor(green); doc.setLineWidth(0.3);
    doc.roundedRect(qrX - 2, qrY - 2, qrSize + 4, qrSize + 4, 1.5, 1.5, "FD");
    doc.addImage(qrDataUrl, "PNG", qrX, qrY, qrSize, qrSize);

    // Ticket ID pill
    const idY = qrY + qrSize + 7;
    doc.setFillColor("#EEF5EC");
    doc.setDrawColor(green); doc.setLineWidth(0.2);
    doc.roundedRect(20, idY - 3.5, W - 40, 7, 2, 2, "FD");
    doc.setFont("helvetica", "normal"); doc.setFontSize(5); doc.setTextColor(gray);
    doc.text("ID:", W / 2 - 3, idY, { align: "right" });
    doc.setFont("helvetica", "bold"); doc.setFontSize(6); doc.setTextColor(gold);
    doc.text(ticketId, W / 2 - 2, idY);

    // ── Footer ────────────────────────────────────────────────────────────
    doc.setFont("helvetica", "bold"); doc.setFontSize(7.5); doc.setTextColor(green);
    doc.text("Suvaialaya Welcomes You", W / 2, H - 12, { align: "center" });
    doc.setFont("helvetica", "normal"); doc.setFontSize(4.5); doc.setTextColor(gray);
    doc.text("Present this ticket at the entrance  •  Madurai", W / 2, H - 7, { align: "center" });

    // ── Save or Return ───────────────────────────────────────────────────
    if (options.returnBase64) {
      return doc.output('datauristring');
    } else {
      doc.save(`Suvaialaya-Ticket-${ticketId}.pdf`);
      return null;
    }
  } catch (err) {
    console.error("Error generating ticket:", err);
  }
};
