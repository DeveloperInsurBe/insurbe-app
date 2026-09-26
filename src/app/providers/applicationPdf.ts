import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

/**
 * TEAM INBOX FOR NEW PUBLIC INSURANCE APPLICATIONS
 */
export const APPLICATIONS_TEAM_EMAIL = "pradeep.k@insurbe.com";

export async function generateApplicationPDF(
  title: string,
  rows: [string, string | undefined | null][],
) {
  const pdfDoc = await PDFDocument.create();

  let page = pdfDoc.addPage([600, 800]);

  const font = await pdfDoc.embedFont(
    StandardFonts.Helvetica,
  );

  const boldFont = await pdfDoc.embedFont(
    StandardFonts.HelveticaBold,
  );

  /**
   * STANDARD FONTS ONLY SUPPORT WINANSI
   */
  const safe = (text: string) =>
    text.replace(/[^\x20-\x7E\xA0-\xFF]/g, "?");

  let y = 760;

  page.drawText(title, {
    x: 50,
    y,
    size: 22,
    font: boldFont,
    color: rgb(0.45, 0.04, 0.82),
  });

  y -= 50;

  for (const [label, value] of rows) {
    if (y < 50) {
      page = pdfDoc.addPage([600, 800]);
      y = 760;
    }

    page.drawText(safe(label), {
      x: 50,
      y,
      size: 12,
      font: boldFont,
      color: rgb(0, 0, 0),
    });

    page.drawText(safe(String(value || "-")), {
      x: 220,
      y,
      size: 12,
      font,
      color: rgb(0.2, 0.2, 0.2),
    });

    y -= 28;
  }

  const pdfBytes = await pdfDoc.save();

  return Buffer.from(pdfBytes);
}
