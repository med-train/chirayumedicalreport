import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { FormData, TestItem } from "@/types";
import logo from './public/Chirayu-Child-Clinic-Pediatrician-Bangalore-9e8946.jpg';

export function generatePDF(
  formData: FormData,
  currentDateTime: string,
  resultsText: string,
  reportLogo?: string
) {
  const doc = new jsPDF();
  const marginX = 14;
  let y = 15;

  // ===== Logo + Header =====
  const logoToUse = reportLogo || logo;
  
  if (logoToUse) {
    try {
      doc.addImage(logoToUse, "JPEG", marginX, y, 40, 20);
    } catch (err) {
      console.warn("Logo error:", err);
    }
  }

  // ... rest of your code

  doc.setFont("helvetica", "bold").setFontSize(16);
  doc.text("ALLERGY TEST REPORT", 115, y + 10, { align: "center" });

  doc.setFont("helvetica", "normal").setFontSize(10);
  const formattedDate = new Date(currentDateTime).toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  doc.text(`Generated on: ${formattedDate}`, 115, y + 18, { align: "center" });

  y += 40;

  // ===== Patient Info (Two-column grid) =====
  doc.setFont("helvetica", "bold").setFontSize(12);
  doc.text("Patient Information", marginX, y);
  y += 8;

  const leftX = marginX;
  const rightX = 105;
  const lineSpacing = 6;
  doc.setFont("helvetica", "normal").setFontSize(10);

  const patientInfoLeft = [
    `Patient Name: ${formData.patientName || "—"}`,
    `Patient ID: ${formData.patientId || "—"}`,
    `Age: ${formData.age ? formData.age + " years" : "—"}`,
    `Sex: ${formData.sex || "—"}`,
    `Test Name: ${formData.testName || "—"}`,
   
  ];

  const patientInfoRight = [
    `Doctor: ${formData.doctorName || "—"}`,
    `Mobile: ${formData.mobile || "—"}`,
    `Time In: ${formData.timeIn || "—"}`,
    `Time Out: ${formData.timeOut || "—"}`,
    `Diagnosis: ${formData.diagnosis || "—"}`,
  ];

  patientInfoLeft.forEach((text, i) => doc.text(text, leftX, y + i * lineSpacing));
  patientInfoRight.forEach((text, i) => doc.text(text, rightX, y + i * lineSpacing));

  y += patientInfoLeft.length * lineSpacing + 10;

  // ===== Test Results Table =====
  doc.setFont("helvetica", "bold").setFontSize(12);
  doc.text("Test Results", marginX, y);
  y += 6;

  const tableHead = [["Test Row", "Antigen", "Wheal Diameter (mm)", "Remarks"]];
  const tableBody: any[] = [];

  formData.testItems.forEach((item: TestItem) => {
    if (item.testRow === "heading") {
      // Heading row spans all 4 columns
      tableBody.push([
        {
          content: item.antigen || "—",
          colSpan: 4,
          styles: {
            halign: "center",
            fontStyle: "bold",
            fillColor: [240, 240, 240],
          },
        },
      ]);
    } else {
      tableBody.push([
        item.testRow || "—",
        item.antigen || "—",
        item.whealDiameter || "—",
        item.isPositive ? "Positive" : "Negative",
      ]);
    }
  });

  autoTable(doc, {
    startY: y + 2,
    head: tableHead,
    body: tableBody,
    theme: "grid",
    styles: { fontSize: 9 },
    headStyles: { fillColor: [220, 220, 220], textColor: 0 },
    bodyStyles: { halign: "center" },
    columnStyles: {
      0: { halign: "left" },
      1: { halign: "left" },
    },
  });

  y = (doc as any).lastAutoTable.finalY + 10;

  // ===== Results / Interpretation =====
  doc.setFont("helvetica", "bold").setFontSize(12);
  doc.text("Results / Interpretation", marginX, y);
  y += 6;
  doc.setFont("helvetica", "normal").setFontSize(10);

  const wrappedText = doc.splitTextToSize(resultsText, 180);
  wrappedText.forEach((line: string) => {
    if (y > 275) {
      doc.addPage();
      y = 20;
    }
    doc.text(line, marginX, y);
    y += 5;
  });

  // ===== Footer =====
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9).setFont("helvetica", "normal");
    doc.text(
      "This report is generated electronically and is valid without signature.",
      105,
      285,
      { align: "center" }
    );
    doc.text(`Page ${i} of ${pageCount}`, 190, 285, { align: "right" });
  }

  // ===== Save PDF =====
  const fileName = `${formData.patientName || "report"}_allergy_test.pdf`;
  doc.save(fileName);
}
