// ✅ ReportPreview.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, FileDown, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { FormData, TestItem } from "@/types";
import reportLogo from "@/components/assets/Chirayu-Child-Clinic-Pediatrician-Bangalore-9e8946.jpg";
import { useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface ReportPreviewProps {
  formData: FormData;
  currentDateTime: string;
}

// ✅ PDF Generator merged inside file
function generatePDF(
  formData: FormData,
  currentDateTime: string,
  resultsText: string,
  reportLogo: string
) {
  const doc = new jsPDF();

  // Logo
  if (reportLogo) {
    doc.addImage(reportLogo, "JPEG", 15, 10, 30, 30);
  }

  // Title
  doc.setFontSize(16);
  doc.text("ALLERGY TEST REPORT", 105, 20, { align: "center" });

  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date(currentDateTime).toLocaleString()}`, 105, 28, {
    align: "center",
  });

  // Patient Info
  doc.setFontSize(12);
  doc.text("Patient Information", 14, 50);
  doc.setFontSize(10);
  doc.text(`Patient Name: ${formData.patientName}`, 14, 58);
  doc.text(`Age: ${formData.age} years`, 14, 64);
  doc.text(`Sex: ${formData.sex}`, 14, 70);
  doc.text(`Mobile: ${formData.mobile || "—"}`, 14, 76);
  doc.text(`Doctor: ${formData.doctorName}`, 105, 58);
  doc.text(`Test Name: ${formData.testName}`, 105, 64);
  doc.text(`Time In: ${formData.timeIn ||  "—"}`, 105, 70);
  doc.text(`Time Out: ${formData.timeOut || "—"}`, 105, 76);
  doc.text(`Diagnosis: ${formData.diagnosis || "—"}`, 105, 82);

  // Table Head
  const tableHead = [["Test Row", "Antigen", "Wheal Diameter (mm)", "Remarks"]];
  const tableBody: any[] = [];

  // ✅ Keep heading rows merged + pull real testRow values
  formData.testItems.forEach((item: TestItem) => {
    if (item.testRow === "heading") {
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
        item.testRow || "—", // ← pull from input
        item.antigen || "—",
        item.whealDiameter || "—",
        item.isPositive ? "Positive" : "Negative",
      ]);
    }
  });

  autoTable(doc, {
    startY: 90,
    head: tableHead,
    body: tableBody,
    theme: "grid",
    styles: { fontSize: 9 },
    headStyles: { fillColor: [220, 220, 220], textColor: 0 },
  });

  // Results
  let finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(12);
  doc.text("Results / Interpretation", 14, finalY);
  doc.setFontSize(10);
  doc.text(resultsText, 14, finalY + 6);

  // Footer
  doc.setFontSize(9);
  doc.text(
    "This report is generated electronically and is valid without signature.",
    105,
    285,
    { align: "center" }
  );

  doc.save(`${formData.patientName || "report"}_allergy_test.pdf`);
}

// ✅ Component
export function ReportPreview({ formData, currentDateTime }: ReportPreviewProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [resultsText, setResultsText] = useState<string>(`RESULTS: type here

DOCTOR’S SIGNATURE:

INTERPRETATION:

Reference Value (Wheal Diameter): ≥3mm = Positive. <3mm = Negative.

SALINE = Always should be negative for a valid test.
HISTAMINE = Always should be positive for a valid test.
P = Pseudopods Flare ups   E = Erythema Reaction`);

  const saveReportMutation = useMutation({
    mutationFn: async () => {
      // Patient
      let patientId: string;
      try {
        if (formData.mobile) {
          const res = await apiRequest("GET", `/api/patients/mobile/${formData.mobile}`);
          const existing = await res.json();
          patientId = existing.id;
        } else throw new Error("No mobile");
      } catch {
        const res = await apiRequest("POST", "/api/patients", {
          name: formData.patientName,
          age: formData.age,
          sex: formData.sex,
          mobile: formData.mobile || undefined,
        });
        const newP = await res.json();
        patientId = newP.id;
      }

      // Doctor
      let doctorId: string;
      try {
        const res = await apiRequest("GET", `/api/doctors/name/${encodeURIComponent(formData.doctorName)}`);
        const existing = await res.json();
        doctorId = existing.id;
      } catch {
        const res = await apiRequest("POST", "/api/doctors", { name: formData.doctorName });
        const newD = await res.json();
        doctorId = newD.id;
      }

      // Report
      const reportRes = await apiRequest("POST", "/api/reports", {
  patientId,
  doctorId,
  testName: formData.testName,
  testItems: formData.testItems.map((item) => ({
    testRow: item.testRow,
    antigen: item.antigen,
    whealDiameter: item.whealDiameter,
    isPositive: item.isPositive,
  })),
  resultsText,
  timeIn: formData.timeIn || null,
  timeOut: formData.timeOut || null,
  diagnosis: formData.diagnosis || null,
});

      return reportRes.json();
    },
    onSuccess: () => {
      toast({ title: "Report Saved", description: "The report has been saved successfully." });
      queryClient.invalidateQueries({ queryKey: ["/api/reports"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save report.", variant: "destructive" });
    },
  });

  const handleSaveReport = () => {
    if (!formData.patientName || !formData.age || !formData.sex || !formData.doctorName || !formData.testName) {
      toast({ title: "Error", description: "Fill all fields before saving.", variant: "destructive" });
      return;
    }
    if (formData.testItems.length === 0) {
      toast({ title: "Error", description: "Add at least one test item.", variant: "destructive" });
      return;
    }
    saveReportMutation.mutate();
  };

  const handleGeneratePDF = () => {
    if (!formData.patientName || !formData.age || !formData.sex || !formData.doctorName || !formData.testName) {
      toast({ title: "Error", description: "Fill all fields before generating PDF.", variant: "destructive" });
      return;
    }
    try {
      generatePDF(formData, currentDateTime, resultsText, reportLogo);
      toast({ title: "PDF Generated", description: "Report downloaded successfully." });
    } catch {
      toast({ title: "Error", description: "Failed to generate PDF.", variant: "destructive" });
    }
  };

  const formatDateTime = (dateTimeString: string) =>
    new Date(dateTimeString).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

  return (
    <Card data-testid="card-report-preview">
      <CardHeader className="border-b border-gray-200">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center text-gray-900">
            <Eye className="text-primary mr-2" />
            Report Preview
          </CardTitle>
          <div className="flex space-x-2">
            <Button onClick={handleGeneratePDF} className="bg-red-600 text-white hover:bg-red-700" size="sm">
              <FileDown className="h-4 w-4 mr-1" /> Download PDF
            </Button>
            <Button
              onClick={handleSaveReport}
              disabled={saveReportMutation.isPending}
              className="bg-green-600 text-white hover:bg-green-700"
              size="sm"
            >
              <Save className="h-4 w-4 mr-1" /> Save Report
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="border border-gray-300 rounded-lg p-6 bg-white">
          {/* Header */}
          <div className="flex items-center justify-center mb-6 pb-4 border-b-2 border-gray-200 relative">
            <img src={reportLogo} alt="Clinic Logo" className="absolute left-0 w-50 h-20" />
            <div className="text-center w-full">
              <h3 className="text-xl font-bold text-gray-900 mb-2">ALLERGY TEST REPORT</h3>
              <p className="ml-12 text-sm text-gray-600">Generated on: {formatDateTime(currentDateTime)}</p>
            </div>
          </div>

          {/* Patient Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <p className="flex justify-between py-1"><span className="font-medium">Patient Name:</span> {formData.patientName || "—"}</p>
              <p className="flex justify-between py-1"><span className="font-medium">Patient ID:</span> {formData.patientId || "—"}</p>
              <p className="flex justify-between py-1"><span className="font-medium">Age:</span> {formData.age ? `${formData.age} years` : "—"}</p>
              <p className="flex justify-between py-1"><span className="font-medium">Sex:</span> {formData.sex || "—"}</p>
              <p className="flex justify-between py-1"><span className="font-medium">Test Name:</span> {formData.testName || "—"}</p>
              <p className="flex justify-between py-1"><span className="font-medium">Diagnosis:</span> {formData.diagnosis || "—"}</p>
            </div>
            <div>
              <p className="flex justify-between py-1"><span className="font-medium">Doctor:</span> {formData.doctorName || "—"}</p>
              <p className="flex justify-between py-1"><span className="font-medium">Test Name:</span> {formData.testName || "—"}</p>
              <p className="flex justify-between py-1"><span className="font-medium">Mobile:</span> {formData.mobile || "—"}</p>
               <p className="flex justify-between py-1"><span className="font-medium">Time In:</span> {formData.timeIn ||"—"}</p>
              <p className="flex justify-between py-1"><span className="font-medium">Time Out:</span> {formData.timeOut || "—"}</p>
             
            </div>
          </div>
          

          {/* Test Results */}
          <h4 className="text-lg font-semibold text-gray-900 mb-3">Test Results</h4>
          <div className="overflow-x-auto mb-6">
            <table className="w-full border-collapse border border-gray-400">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-3 py-2 text-left text-sm font-semibold">Test Row</th>
                  <th className="border px-3 py-2 text-left text-sm font-semibold">Antigen</th>
                  <th className="border px-3 py-2 text-center text-sm font-semibold">Wheal Diameter (mm)</th>
                  <th className="border px-3 py-2 text-center text-sm font-semibold">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {formData.testItems.length > 0 ? (
                  formData.testItems.map((item, i) =>
                    item.testRow === "heading" ? (
                      <tr key={i} className="bg-gray-100 font-bold text-center">
                        <td colSpan={4} className="border px-2 py-1">{item.antigen || "—"}</td>
                      </tr>
                    ) : (
                      <tr key={i}>
                        <td className="border px-2 py-1">{item.testRow || "—"}</td>
                        <td className="border px-2 py-1">{item.antigen || "—"}</td>
                        <td className="border px-2 py-1">{item.whealDiameter || "—"}</td>
                        <td className="border px-2 py-1">
                          <Badge variant={item.isPositive ? "destructive" : "secondary"} className={item.isPositive ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}>
                            {item.isPositive ? "Positive" : "Negative"}
                          </Badge>
                        </td>
                      </tr>
                    )
                  )
                ) : (
                  <tr><td colSpan={4} className="border px-3 py-2 text-center text-sm text-gray-500">No test items added yet</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Results Text */}
          <h4 className="text-lg font-semibold text-gray-900 mb-2">Results / Interpretation</h4>
          <textarea
            className="w-full border rounded-md p-3 text-sm"
            rows={10}
            value={resultsText}
            onChange={(e) => setResultsText(e.target.value)}
          />

          {/* Footer */}
          <div className="text-center pt-4 border-t mt-6">
            <p className="text-sm text-gray-600">This report is generated electronically and is valid without signature.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
