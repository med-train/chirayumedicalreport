import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, FileDown } from "lucide-react";
import { generatePDF } from "@/lib/pdf-generator";
import { useToast } from "@/hooks/use-toast";
import type { FormData } from "@/types";
import reportLogo from "@/components/assets/Chirayu-Child-Clinic-Pediatrician-Bangalore-9e8946.jpg"

interface ReportPreviewModalProps {
  formData: FormData;
  currentDateTime: string;
  children: React.ReactNode;
}

export function ReportPreviewModal({ formData, currentDateTime, children }: ReportPreviewModalProps) {
  const { toast } = useToast();

  const safeFormData = formData || {
    patientName: "",
    age: null,
    sex: "",
    doctorName: "",
    mobile: "",
    testName: "",
    testItems: [],
    medications: [] 
  };

  const handleGeneratePDF = () => {
    if (!safeFormData.patientName || !safeFormData.age || !safeFormData.sex || !safeFormData.doctorName || !safeFormData.testName) {
      toast({
        title: "Error",
        description: "Please fill in all required fields before generating PDF.",
        variant: "destructive",
      });
      return;
    }

    try {
      generatePDF(safeFormData, currentDateTime);
      toast({
        title: "PDF Generated",
        description: "The PDF report has been downloaded successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="flex items-center text-gray-900">
              <Eye className="text-primary mr-2" />
              Report Preview
            </DialogTitle>
            <Button
              onClick={handleGeneratePDF}
              className="bg-red-600 text-white hover:bg-red-700"
              size="sm"
              data-testid="button-generate-pdf-modal"
            >
              <FileDown className="h-4 w-4 mr-1" />
              Download PDF
            </Button>
          </div>
        </DialogHeader>

        <div className="border border-gray-300 rounded-lg p-6 bg-white">
          {/* ===== Report Header ===== */}
          <div className="flex items-center justify-center mb-6 pb-4 border-b-2 border-gray-200 relative">
            <img
              src={reportLogo}
              alt="Clinic Logo"
              className="absolute left-0 w-32 h-auto"
            />
            <div className="text-center w-full">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                ALLERGY TEST REPORT
              </h3>
              <div className="text-sm text-gray-600">
                <p className="ml-12">
                  Generated on: {formatDateTime(currentDateTime)}
                </p>
              </div>
            </div>
          </div>

          {/* ===== Patient Info ===== */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <div className="flex justify-between py-1">
                <span className="font-medium text-gray-700">Patient Name:</span>
                <span className="text-gray-900">{safeFormData.patientName || "—"}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="font-medium text-gray-700">Age:</span>
                <span className="text-gray-900">{safeFormData.age ? `${safeFormData.age} years` : "—"}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="font-medium text-gray-700">Sex:</span>
                <span className="text-gray-900 capitalize">{safeFormData.sex || "—"}</span>
              </div>
            </div>
            <div>
              <div className="flex justify-between py-1">
                <span className="font-medium text-gray-700">Doctor:</span>
                <span className="text-gray-900">{safeFormData.doctorName || "—"}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="font-medium text-gray-700">Test Name:</span>
                <span className="text-gray-900">{safeFormData.testName || "—"}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="font-medium text-gray-700">Mobile:</span>
                <span className="text-gray-900">{safeFormData.mobile || "—"}</span>
              </div>
            </div>
          </div>

          {/* ===== Test Results ===== */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Test Results</h4>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-400">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-400 px-3 py-2 text-left text-sm font-semibold">Test Row</th>
                    <th className="border border-gray-400 px-3 py-2 text-left text-sm font-semibold">Antigen</th>
                    <th className="border border-gray-400 px-3 py-2 text-center text-sm font-semibold">Wheal Diameter (mm)</th>
                    <th className="border border-gray-400 px-3 py-2 text-center text-sm font-semibold">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {safeFormData.testItems.length > 0 ? (
                    safeFormData.testItems.map((item, index) => (
                      <tr key={index}>
                        <td className="border border-gray-400 px-3 py-2 text-sm">{item.testRow || "—"}</td>
                        <td className="border border-gray-400 px-3 py-2 text-sm">{item.antigen || "—"}</td>
                        <td className="border border-gray-400 px-3 py-2 text-center text-sm">{item.whealDiameter}</td>
                        <td className="border border-gray-400 px-3 py-2 text-center text-sm">
                          <Badge
                            variant={item.isPositive ? "destructive" : "secondary"}
                            className={item.isPositive ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}
                          >
                            {item.isPositive ? "Positive" : "Negative"}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="border border-gray-400 px-3 py-2 text-center text-sm text-gray-500">
                        No test items added yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ===== Medications Table ===== */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Medications</h4>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-400">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-400 px-3 py-2 text-left text-sm font-semibold">Medicine Name</th>
                    <th className="border border-gray-400 px-3 py-2 text-center text-sm font-semibold">Dosage</th>
                    <th className="border border-gray-400 px-3 py-2 text-center text-sm font-semibold">Frequency</th>
                    <th className="border border-gray-400 px-3 py-2 text-center text-sm font-semibold">Duration</th>
                    <th className="border border-gray-400 px-3 py-2 text-left text-sm font-semibold">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {safeFormData.medications?.length > 0 ? (
                    safeFormData.medications.map((med, idx) => (
                      <tr key={idx}>
                        <td className="border border-gray-400 px-3 py-2 text-sm">{med.name || "—"}</td>
                        <td className="border border-gray-400 px-3 py-2 text-center text-sm">{med.dosage || "—"}</td>
                        <td className="border border-gray-400 px-3 py-2 text-center text-sm">{med.frequency || "—"}</td>
                        <td className="border border-gray-400 px-3 py-2 text-center text-sm">{med.duration || "—"}</td>
                        <td className="border border-gray-400 px-3 py-2 text-sm">{med.remarks || "—"}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="border border-gray-400 px-3 py-2 text-center text-sm text-gray-500">
                        No medications prescribed
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ===== Interpretation ===== */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Results / Interpretation</h4>
            <textarea
              className="w-full border border-gray-300 rounded-md p-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
              rows={10}
              defaultValue={`RESULTS: type here

DOCTOR’S SIGNATURE:

INTERPRETATION:

Reference Value (Wheal Diameter):  ≥3mm = Positive. <3mm = Negative.

SALINE = Always should be negative for a valid test.
HISTAMINE = Always should be positive for a valid test.
P = Pseudopods Flare ups   E = Erythema Reaction`}
            />
          </div>

          {/* ===== Footer ===== */}
          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              This report is generated electronically and is valid without signature.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
