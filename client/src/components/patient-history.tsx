import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { History, ChevronRight, Download, Info } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { generatePDF } from "@/lib/pdf-generator";
import type { ReportWithRelations } from "@/types";

interface PatientHistoryProps {
  mobile: string;
}

export function PatientHistory({ mobile }: PatientHistoryProps) {
  const { toast } = useToast();

  const { data: reports = [], isLoading } = useQuery<ReportWithRelations[]>({
    queryKey: ["/api/reports/mobile", mobile],
    enabled: !!mobile && mobile.length > 0,
  });

const handleOpenReport = (report: ReportWithRelations) => {
  const formData = {
    patientName: report.patient?.name || "",
    age: report.patient?.age || null,
    sex: report.patient?.sex || "",
    doctorName: report.doctor?.name || "",
    mobile: report.patient?.mobile || "",
    testName: report.testName || "",
    testItems: (report.testItems || []).map((t: any) => ({
      testRow: t.testRow || "#",
      antigen: t.antigen,
      whealDiameter: t.whealDiameter,
      isPositive: t.isPositive ?? false,
    })),
    timeIn: report.timeIn || "",
    timeOut: report.timeOut || "",
    diagnosis: report.diagnosis || "",
  };

  try {
    generatePDF(
      formData,
      new Date(report.createdAt).toISOString(),
      report.resultsText || ""
    );

    toast({
      title: "Report Downloaded",
      description: "The historical report has been downloaded as PDF.",
    });
  } catch (error) {
    console.error("PDF failed:", error);
    toast({
      title: "Error",
      description: "Failed to download report. Please try again.",
      variant: "destructive",
    });
  }
};




  const handleExportAllReports = () => {
    if (reports.length === 0) {
      toast({
        title: "No Reports",
        description: "No reports available to export.",
        variant: "destructive",
      });
      return;
    }

    reports.forEach((report, index) => {
      setTimeout(() => {
        const formData = {
          patientName: report.patient.name,
          age: report.patient.age,
          sex: report.patient.sex,
          doctorName: report.doctor.name,
          mobile: report.patient.mobile || "",
          testName: report.testName,
          testItems: report.testItems || [],
        };

        try {
          generatePDF(formData, report.createdAt?.toISOString() || new Date().toISOString(), `report_${index + 1}_`);
        } catch (error) {
          console.error("Failed to generate PDF for report:", report.id);
        }
      }, index * 1000); // Delay to avoid overwhelming the browser
    });

    toast({
      title: "Export Started",
      description: `Exporting ${reports.length} reports. Downloads will start shortly.`,
    });
  };

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Card data-testid="card-patient-history">
      <CardHeader className="border-b border-gray-200">
        <CardTitle className="flex items-center text-gray-900">
          <History className="text-primary mr-2" />
          Patient History
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-3">
          {!mobile ? (
            <div className="text-sm text-gray-600 mb-4 flex items-center">
              <Info className="h-4 w-4 mr-1" />
              Enter mobile number to view patient history
            </div>
          ) : isLoading ? (
            <div className="text-sm text-gray-600">Loading patient history...</div>
          ) : reports.length === 0 ? (
            <div className="text-sm text-gray-600">No previous reports found for this mobile number.</div>
          ) : (
            <>
              {reports.map((report) => (
                <div
                  key={report.id}
                  onClick={() => handleOpenReport(report)}
                  className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                  data-testid={`report-item-${report.id}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-900 text-sm">{report.testName}</h4>
                      <p className="text-xs text-gray-600 mt-1">
                        {formatDate(report.createdAt || new Date())} - {report.doctor.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {report.testItems?.length || 0} tests performed
                      </p>
                      {report.diagnosis && (
                        <p className="text-xs text-gray-700 mt-1">Diagnosis: {report.diagnosis}</p>
                      )}
                      {(report.timeIn || report.timeOut) && (
                        <p className="text-xs text-gray-500">
                          Time In: {report.timeIn || "--"} | Time Out: {report.timeOut || "--"}
                        </p>
                      )}

                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              ))}

              <div className="mt-6 pt-4 border-t border-gray-200">
                <Button
                  onClick={handleExportAllReports}
                  className="w-full bg-gray-600 text-white hover:bg-gray-700"
                  size="sm"
                  data-testid="button-export-all-reports"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Export All Reports
                </Button>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
