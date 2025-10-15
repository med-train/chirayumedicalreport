import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserCheck, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { FormData, TestTemplate } from "@/types";

interface PatientFormProps {
  formData: FormData;
  currentDateTime: string;
  onFormDataChange: (data: Partial<FormData>) => void;
  onTemplateLoad: (templateData: { name: string; testItems: any[] }) => void;
}

export function PatientForm({ formData, currentDateTime, onFormDataChange, onTemplateLoad }: PatientFormProps) {
  const [showTemplateDropdown, setShowTemplateDropdown] = useState(false);
  const [templateSearchQuery, setTemplateSearchQuery] = useState("");

  const { data: templates = [] } = useQuery<TestTemplate[]>({
    queryKey: ["/api/templates"],
  });

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(templateSearchQuery.toLowerCase())
  );

  const handleTestNameChange = (value: string) => {
    setTemplateSearchQuery(value);
    onFormDataChange({ testName: value });
    setShowTemplateDropdown(true);
  };

  const handleTemplateSelect = (template: TestTemplate) => {
    onTemplateLoad({
      name: template.name,
      testItems: template.testItems || []
    });
    setShowTemplateDropdown(false);
    setTemplateSearchQuery(template.name);
  };

  useEffect(() => {
    const handleClickOutside = () => setShowTemplateDropdown(false);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <Card data-testid="card-patient-form">
      <CardHeader className="border-b border-gray-200">
        <CardTitle className="flex items-center text-gray-900">
          <UserCheck className="text-primary mr-2" />
          Patient Information
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="patientName" className="block text-sm font-medium text-gray-700 mb-2">
              Patient Name<span className="text-red-600">*</span>
            </Label>
            <Input
              id="patientName"
              type="text"
              placeholder="Enter patient name"
              value={formData.patientName}
              onChange={(e) => onFormDataChange({ patientName: e.target.value })}
              className="w-full"
              data-testid="input-patient-name"
            />
          </div>
          <div>
            <Label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-2">
              Age <span className="text-red-600">*</span>
            </Label>
            <Input
              id="age"
              type="number"
              placeholder="Age"
              value={formData.age || ""}
              onChange={(e) => onFormDataChange({ age: e.target.value ? parseInt(e.target.value) : null })}
              className="w-full"
              data-testid="input-age"
            />
          </div>
          <div>
            <Label htmlFor="sex" className="block text-sm font-medium text-gray-700 mb-2">
              Sex <span className="text-red-600">*</span>
            </Label>
            <Select value={formData.sex} onValueChange={(value) => onFormDataChange({ sex: value })}>
              <SelectTrigger data-testid="select-sex">
                <SelectValue placeholder="Select sex" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="doctorName" className="block text-sm font-medium text-gray-700 mb-2">
              Doctor's Name <span className="text-red-600">*</span>
            </Label>
            <Input
              id="doctorName"
              type="text"
              placeholder="Enter doctor's name"
              value={formData.doctorName}
              onChange={(e) => onFormDataChange({ doctorName: e.target.value })}
              className="w-full"
              data-testid="input-doctor-name"
            />
          </div>
          <div>
            <Label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-2">
              Mobile Number
            </Label>
            <Input
              id="mobile"
              type="tel"
              placeholder="Enter mobile number"
              value={formData.mobile}
              onChange={(e) => onFormDataChange({ mobile: e.target.value })}
              className="w-full"
              data-testid="input-mobile"
            />
          </div>
          {/* <div>
            <Label htmlFor="dateTime" className="block text-sm font-medium text-gray-700 mb-2">
              Date & Time
            </Label>
            <Input
              id="dateTime"
              type="datetime-local"
              value={currentDateTime}
              readOnly
              className="w-full bg-gray-50 text-gray-600"
              data-testid="input-datetime"
            />
          </div> */}
           <div>
            <Label htmlFor="diagnosis" className="block text-sm font-medium text-gray-700 mb-2">
              Diagnosis<span className="text-red-600">*</span>
            </Label>
            <Input
              id="diagnosis"
              type="text"
              placeholder="Enter diagnosis"
              value={formData.diagnosis}
              onChange={(e) => onFormDataChange({ diagnosis: e.target.value })}
              className="w-full"
              data-testid="input-diagnosis"
            />
          </div>
           <div>
            <Label htmlFor="timeIn" className="block text-sm font-medium text-gray-700 mb-2">
              Time IN<span className="text-red-600">*</span>
            </Label>
            <Input
              id="timeIn"
              type="text"
              placeholder="Enter time in"
              value={formData.timeIn}
              onChange={(e) => onFormDataChange({ timeIn: e.target.value })}
              className="w-full"
              data-testid="input-time-in"
            />
          </div>
           <div>
            <Label htmlFor="timeOut" className="block text-sm font-medium text-gray-700 mb-2">
              Time Out<span className="text-red-600">*</span>
            </Label>
            <Input
              id="timeOut"
              type="text"
              placeholder="Enter time out"
              value={formData.timeOut}
              onChange={(e) => onFormDataChange({ timeOut: e.target.value })}
              className="w-full"
              data-testid="input-time-out"
            />
          </div>
           <div>
            <Label htmlFor="patientId" className="block text-sm font-medium text-gray-700 mb-2">
              Patient Id<span className="text-red-600">*</span>
            </Label>
            <Input
              id="patientId"
              type="text"
              placeholder="Enter patient Id"
              value={formData.patientId}
              onChange={(e) => onFormDataChange({ patientId: e.target.value })}
              className="w-full"
              data-testid="input-patient-id"
            />
          </div>
        </div>
         
        
        <div className="mt-6">
          <Label htmlFor="testName" className="block text-sm font-medium text-gray-700 mb-2">
            Test Name <span className="text-red-600">*</span>
          </Label>
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <Input
              id="testName"
              type="text"
              placeholder="Search or select test name..."
              value={templateSearchQuery}
              onChange={(e) => handleTestNameChange(e.target.value)}
              onFocus={() => setShowTemplateDropdown(true)}
              className="w-full pr-10"
              data-testid="input-test-name"
            />
            <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
            
            {showTemplateDropdown && filteredTemplates.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto z-10">
                {filteredTemplates.map((template) => (
                  <div
                    key={template.id}
                    onClick={() => handleTemplateSelect(template)}
                    className="px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    data-testid={`template-option-${template.id}`}
                  >
                    <span>{template.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
