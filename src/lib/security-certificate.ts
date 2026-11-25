import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import type { VdpHallEntry } from "@/lib/vdp-settings";

const GOLD = [207, 169, 104] as const;
const DEEP_GOLD = [141, 105, 54] as const;
const INK = [20, 18, 15] as const;
const IVORY = [247, 242, 232] as const;

function drawFlourish(doc: jsPDF, x: number, y: number, direction: 1 | -1) {
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.45);
  doc.ellipse(x, y, 17, 4, "S");
  doc.ellipse(x + 22 * direction, y - 6, 10, 2.8, "S");
  doc.ellipse(x + 35 * direction, y - 10, 5, 1.5, "S");
  doc.line(x - 17 * direction, y, x - 30 * direction, y + 4);
}

export async function createSecurityCertificate(entry: VdpHallEntry) {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const width = 297;
  const height = 210;
  const verificationUrl = `${window.location.origin}/vulnerability-disclosure?certificate=${encodeURIComponent(entry.certificateId)}`;

  doc.setFillColor(...INK);
  doc.rect(0, 0, width, height, "F");
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.7);
  doc.rect(8, 8, width - 16, height - 16, "S");
  doc.setDrawColor(...DEEP_GOLD);
  doc.setLineWidth(0.2);
  doc.rect(12, 12, width - 24, height - 24, "S");

  drawFlourish(doc, 48, 30, 1);
  drawFlourish(doc, 249, 30, -1);
  drawFlourish(doc, 48, 179, 1);
  drawFlourish(doc, 249, 179, -1);

  doc.setTextColor(...GOLD);
  doc.setFont("times", "bold");
  doc.setFontSize(13);
  doc.text("SR STUDIO", width / 2, 29, { align: "center", charSpace: 2.5 });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.text("VULNERABILITY DISCLOSURE PROGRAM", width / 2, 36, {
    align: "center",
    charSpace: 1.5,
  });

  doc.setTextColor(...IVORY);
  doc.setFont("times", "italic");
  doc.setFontSize(30);
  doc.text("Certificate of Recognition", width / 2, 62, { align: "center" });
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.35);
  doc.line(105, 70, 192, 70);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(204, 197, 185);
  doc.text("This certificate is proudly presented to", width / 2, 87, {
    align: "center",
  });
  doc.setFont("times", "italic");
  doc.setFontSize(27);
  doc.setTextColor(...GOLD);
  doc.text(entry.name, width / 2, 104, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(...IVORY);
  doc.text(`for responsibly disclosing ${entry.category}`, width / 2, 117, {
    align: "center",
  });
  doc.setTextColor(204, 197, 185);
  doc.setFontSize(8.5);
  const note = `Your contribution strengthened the security of SR Studio and helped protect irreplaceable wedding memories.`;
  doc.text(doc.splitTextToSize(note, 155), width / 2, 130, {
    align: "center",
    maxWidth: 155,
  });

  const qr = await QRCode.toDataURL(verificationUrl, {
    width: 240,
    margin: 1,
    color: { dark: "#14120f", light: "#f7f2e8" },
  });
  doc.addImage(qr, "PNG", 30, 144, 25, 25);
  doc.setFontSize(6.5);
  doc.setTextColor(204, 197, 185);
  doc.text("SCAN TO VERIFY", 42.5, 174, { align: "center", charSpace: 0.7 });

  doc.setDrawColor(...GOLD);
  doc.line(197, 164, 254, 164);
  doc.setFont("times", "italic");
  doc.setFontSize(18);
  doc.setTextColor(...GOLD);
  doc.text("SR Studio", 225.5, 160, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(204, 197, 185);
  doc.text("AUTHORIZED SIGNATURE", 225.5, 170, {
    align: "center",
    charSpace: 0.9,
  });

  doc.setFontSize(7.5);
  doc.setTextColor(...GOLD);
  doc.text(`VALIDATOR: ${entry.certificateId}`, width / 2, 190, {
    align: "center",
    charSpace: 0.6,
  });
  doc.setTextColor(204, 197, 185);
  doc.text(
    `Recognition date: ${entry.date}  ·  Reference: ${entry.refId || "SR-STUDIO-VDP"}`,
    width / 2,
    197,
    { align: "center" },
  );
  return doc;
}

export async function previewSecurityCertificate(entry: VdpHallEntry) {
  const doc = await createSecurityCertificate(entry);
  const blob = doc.output("blob");
  return URL.createObjectURL(blob);
}

export async function downloadSecurityCertificate(entry: VdpHallEntry) {
  const doc = await createSecurityCertificate(entry);
  doc.save(
    `sr-studio-security-recognition-${entry.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.pdf`,
  );
}
