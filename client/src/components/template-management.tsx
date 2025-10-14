import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bookmark, Edit, Trash2, Plus } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { TestTemplate } from "@/types";

interface TemplateManagementProps {
  onTemplateLoad: (templateData: { name: string; testItems: any[] }) => void;
}

export function TemplateManagement({ onTemplateLoad }: TemplateManagementProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: templates = [], isLoading } = useQuery<TestTemplate[]>({
    queryKey: ["/api/templates"],
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: async (templateId: string) => {
      await apiRequest("DELETE", `/api/templates/${templateId}`);
    },
    onSuccess: () => {
      toast({
        title: "Template Deleted",
        description: "The template has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/templates"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete template. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleLoadTemplate = (template: TestTemplate) => {
    onTemplateLoad({
      name: template.name,
      testItems: template.testItems || []
    });
    toast({
      title: "Template Loaded",
      description: `Template "${template.name}" has been loaded successfully.`,
    });
  };

  const handleDeleteTemplate = (templateId: string, templateName: string) => {
    if (window.confirm(`Are you sure you want to delete the template "${templateName}"?`)) {
      deleteTemplateMutation.mutate(templateId);
    }
  };

  const handleEditTemplate = (template: TestTemplate) => {
    // Load template for editing
    onTemplateLoad({
      name: template.name,
      testItems: template.testItems || []
    });
    toast({
      title: "Template Loaded for Editing",
      description: `Template "${template.name}" loaded. Make changes and save to update.`,
    });
  };

  const handleCreateNewTemplate = () => {
    toast({
      title: "Create New Template",
      description: "Fill in the test details below and click 'Save Template' to create a new template.",
    });
  };

  return (
    <Card data-testid="card-template-management">
      <CardHeader className="border-b border-gray-200">
        <CardTitle className="flex items-center text-gray-900">
          <Bookmark className="text-primary mr-2" />
          Saved Templates
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-3">
          {isLoading ? (
            <div className="text-sm text-gray-600">Loading templates...</div>
          ) : templates.length === 0 ? (
            <div className="text-sm text-gray-600">No saved templates yet.</div>
          ) : (
            templates.map((template) => (
              <div
                key={template.id}
                className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors"
                data-testid={`template-item-${template.id}`}
              >
                <div className="flex justify-between items-center">
                  <div 
                    onClick={() => handleLoadTemplate(template)}
                    className="flex-1 cursor-pointer"
                  >
                    <h4 className="font-medium text-gray-900 text-sm">{template.name}</h4>
                    <p className="text-xs text-gray-600">
                      {template.testItems?.length || 0} test items
                    </p>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditTemplate(template)}
                      className="text-primary hover:text-blue-700 hover:bg-blue-50 p-1"
                      data-testid={`button-edit-template-${template.id}`}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteTemplate(template.id, template.name)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1"
                      data-testid={`button-delete-template-${template.id}`}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
          
          <div className="mt-4">
            <Button
              onClick={handleCreateNewTemplate}
              variant="outline"
              className="w-full border-2 border-dashed border-gray-300 text-gray-600 hover:border-primary hover:text-primary"
              data-testid="button-create-new-template"
            >
              <Plus className="h-4 w-4 mr-1" />
              Create New Template
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
