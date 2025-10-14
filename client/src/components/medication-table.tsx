import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Plus, Save, Trash2, FileSpreadsheet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { ReportPreviewModal } from "@/components/report-preview-modal";
import type { TestItem, FormData } from "@/types";

interface MedicationTableProps {
  testItems: TestItem[];
  testName: string;
  onTestItemsChange: (testItems: TestItem[]) => void;
  formData: FormData;
  currentDateTime: string;
}

export function MedicationTable({
  testItems,
  testName,
  onTestItemsChange,
  formData,
  currentDateTime,
}: MedicationTableProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const saveTemplateMutation = useMutation({
    mutationFn: async (templateData: { name: string; testItems: TestItem[] }) => {
      const response = await apiRequest("POST", "/api/templates", templateData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Template Saved",
        description: "Test template has been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/templates"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save template. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAddRow = () => {
    const newItem: TestItem = {
      testRow: "",
      antigen: "",
      whealDiameter: "",
      isPositive: false,
    };
    onTestItemsChange([...testItems, newItem]);
  };

  const handleAddHeading = () => {
    const newItem: TestItem = {
      testRow: "heading", // special marker for heading row
      antigen: "", // reuse antigen field to store heading text
      whealDiameter: "",
      isPositive: false,
    };
    onTestItemsChange([...testItems, newItem]);
  };

  const handleRemoveRow = (index: number) => {
    const newItems = testItems.filter((_, i) => i !== index);
    onTestItemsChange(newItems);
  };

  const handleItemChange = (index: number, field: keyof TestItem, value: any) => {
    const newItems = [...testItems];
    newItems[index] = { ...newItems[index], [field]: value };
    onTestItemsChange(newItems);
  };

  const handleSaveTemplate = () => {
    if (!testName) {
      toast({
        title: "Error",
        description: "Please enter a test name before saving template.",
        variant: "destructive",
      });
      return;
    }

    if (testItems.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one test item before saving template.",
        variant: "destructive",
      });
      return;
    }

    saveTemplateMutation.mutate({
      name: testName,
      testItems: testItems,
    });
  };

  return (
    <Card data-testid="card-medication-table">
      <CardHeader className="border-b border-gray-200">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center text-gray-900">
            <FileSpreadsheet className="text-primary mr-2" />
            Test Results
          </CardTitle>
          <div className="flex space-x-2">
            <ReportPreviewModal formData={formData} currentDateTime={currentDateTime}>
              {/* Optional Preview button can go here */}
            </ReportPreviewModal>
            <Button
              onClick={handleAddRow}
              className="bg-primary text-white hover:bg-blue-700"
              size="sm"
              data-testid="button-add-row"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Row
            </Button>
            <Button
              onClick={handleAddHeading}
              className="bg-purple-600 text-white hover:bg-purple-700"
              size="sm"
              data-testid="button-add-heading"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Heading
            </Button>
            <Button
              onClick={handleSaveTemplate}
              disabled={saveTemplateMutation.isPending}
              className="bg-green-600 text-white hover:bg-green-700"
              size="sm"
              data-testid="button-save-template"
            >
              <Save className="h-4 w-4 mr-1" />
              Save Template
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="text-left text-sm font-medium text-gray-700">Test Row</TableHead>
                <TableHead className="text-left text-sm font-medium text-gray-700">Antigen</TableHead>
                <TableHead className="text-left text-sm font-medium text-gray-700">Wheal Diameter (mm)</TableHead>
                <TableHead className="text-center text-sm font-medium text-gray-700">Remarks</TableHead>
                <TableHead className="text-center text-sm font-medium text-gray-700">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {testItems.map((item, index) =>
                item.testRow === "heading" ? (
                  <TableRow key={index} className="bg-gray-100">
                    <TableCell colSpan={5} className="text-center font-semibold text-gray-800">
                      <div className="flex justify-between items-center">
                        <Input
                          value={item.antigen}
                          onChange={(e) => handleItemChange(index, "antigen", e.target.value)}
                          placeholder="Enter heading"
                          className="text-center border-0 text-lg font-bold focus:ring-1 focus:ring-primary"
                          data-testid={`input-heading-${index}`}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveRow(index)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          data-testid={`button-remove-heading-${index}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  <TableRow key={index}>
                    <TableCell>
                      <Input
                        value={item.testRow}
                        onChange={(e) => handleItemChange(index, "testRow", e.target.value)}
                        placeholder="Test row..."
                        className="border-0 focus:ring-1 focus:ring-primary"
                        data-testid={`input-test-row-${index}`}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={item.antigen}
                        onChange={(e) => handleItemChange(index, "antigen", e.target.value)}
                        placeholder="Antigen name..."
                        className="border-0 focus:ring-1 focus:ring-primary"
                        data-testid={`input-antigen-${index}`}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={item.whealDiameter}
                        onChange={(e) => handleItemChange(index, "whealDiameter", e.target.value)}
                        placeholder="0.0"
                        className="border-0 focus:ring-1 focus:ring-primary"
                        data-testid={`input-wheal-diameter-${index}`}
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <Switch
                          checked={item.isPositive}
                          onCheckedChange={(checked) => handleItemChange(index, "isPositive", checked)}
                          data-testid={`switch-positive-${index}`}
                        />
                        <span
                          className={`text-sm ${
                            item.isPositive ? "text-green-600 font-medium" : "text-gray-700"
                          }`}
                        >
                          {item.isPositive ? "Positive" : "Negative"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveRow(index)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        data-testid={`button-remove-row-${index}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              )}
            </TableBody>
          </Table>
        </div>
        <div className="mt-4 text-sm text-gray-600 flex items-center">
          <span className="inline-block w-4 h-4 bg-blue-100 rounded-full mr-2"></span>
          Toggle the switch to mark results as Positive or Negative. Changes update the preview in real-time.
        </div>
      </CardContent>
    </Card>
  );
}
