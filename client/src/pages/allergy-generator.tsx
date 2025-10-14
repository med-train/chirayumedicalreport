import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Heart } from "lucide-react";
import { PatientForm } from "@/components/patient-form";
import { MedicationTable } from "@/components/medication-table";
import { ReportPreview } from "@/components/report-preview";
import { PatientHistory } from "@/components/patient-history";
import { TemplateManagement } from "@/components/template-management";
import { useIsMobile } from "@/hooks/use-mobile";
import type { FormData, TestItem } from "@/types";

export default function AllergyGenerator() {
  const isMobile = useIsMobile();
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    patientName: "",
    age: null,
    sex: "",
    doctorName: "",
    mobile: "",
    testName: "",
    testItems: []
  });

  const [currentDateTime, setCurrentDateTime] = useState<string>("");

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setCurrentDateTime(now.toISOString().slice(0, 16));
    };
    
    updateDateTime();
    const interval = setInterval(updateDateTime, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, []);

  const handleFormDataChange = (newData: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...newData }));
  };

  const handleTestItemsChange = (testItems: TestItem[]) => {
    setFormData(prev => ({ ...prev, testItems }));
  };

  const handleTemplateLoad = (templateData: { name: string; testItems: TestItem[] }) => {
    setFormData(prev => ({
      ...prev,
      testName: templateData.name,
      testItems: templateData.testItems
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              {/* <Heart className="text-primary text-2xl" /> */}
              <h1 className="text-xl font-semibold text-gray-900">Allergy Report Generator</h1>
            </div>
            <div className="flex items-center space-x-4">
              {isMobile && (
                <button 
                  onClick={() => setShowHistoryModal(true)}
                  className="lg:hidden bg-primary text-white px-3 py-2 rounded-md text-sm"
                  data-testid="button-show-history"
                >
                  History
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="lg:grid lg:grid-cols-4 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Patient Form */}
            <PatientForm 
              formData={formData}
              currentDateTime={currentDateTime}
              onFormDataChange={handleFormDataChange}
              onTemplateLoad={handleTemplateLoad}
            />

            {/* Medication Table */}
            <MedicationTable 
              testItems={formData.testItems}
              testName={formData.testName}
              onTestItemsChange={handleTestItemsChange}
              formData={formData}
              currentDateTime={currentDateTime}
            />

            {/* Report Preview */}
            <ReportPreview 
              formData={formData}
              currentDateTime={currentDateTime}
            />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 mt-6 lg:mt-0 space-y-6">
            <PatientHistory mobile={formData.mobile} />
            <TemplateManagement onTemplateLoad={handleTemplateLoad} />
          </div>
        </div>
      </div>

      {/* Mobile History Modal */}
      {isMobile && showHistoryModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 lg:hidden">
          <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-white shadow-xl">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Patient Historya</h2>
              <button 
                onClick={() => setShowHistoryModal(false)}
                className="text-gray-400 hover:text-gray-600"
                data-testid="button-close-history"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <PatientHistory mobile={formData.mobile} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
