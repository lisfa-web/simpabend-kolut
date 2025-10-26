import { useState } from "react";
import { Navigate } from "react-router-dom";
import { Palette, Check } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { useSidebarTemplate, useSidebarTemplateMutation } from "@/hooks/useSidebarTemplate";
import { SIDEBAR_TEMPLATES, SidebarTemplate as SidebarTemplateType } from "@/types/sidebar";

const SidebarTemplate = () => {
  const { isSuperAdmin } = useAuth();
  const { data: activeTemplate, isLoading } = useSidebarTemplate();
  const mutation = useSidebarTemplateMutation();
  const [selectedTemplate, setSelectedTemplate] = useState<SidebarTemplateType | null>(null);

  if (!isSuperAdmin()) {
    return <Navigate to="/unauthorized" replace />;
  }

  const handleApply = () => {
    if (selectedTemplate) {
      mutation.mutate(selectedTemplate);
    }
  };

  const currentTemplate = selectedTemplate || activeTemplate || 'blue-gradient';

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Template Sidebar</h1>
          <p className="text-muted-foreground mt-2">
            Pilih tema sidebar yang sesuai dengan preferensi Anda
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Pilih Template
            </CardTitle>
            <CardDescription>
              Pilih salah satu template di bawah ini. Perubahan akan diterapkan ke seluruh sistem.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={currentTemplate}
              onValueChange={(value) => setSelectedTemplate(value as SidebarTemplateType)}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {Object.values(SIDEBAR_TEMPLATES).map((template) => (
                <div key={template.id} className="relative">
                  <Label
                    htmlFor={template.id}
                    className={`cursor-pointer block ${
                      currentTemplate === template.id
                        ? 'ring-2 ring-primary ring-offset-2'
                        : ''
                    } rounded-lg overflow-hidden transition-all hover:shadow-lg`}
                  >
                    <Card className="border-2">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{template.name}</CardTitle>
                            <CardDescription className="text-sm mt-1">
                              {template.description}
                            </CardDescription>
                          </div>
                          {currentTemplate === template.id && (
                            <div className="bg-primary text-primary-foreground rounded-full p-1">
                              <Check className="h-4 w-4" />
                            </div>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {/* Dashboard Header Preview */}
                          <div className="border rounded-lg p-3 bg-card">
                            <div className="text-xs text-muted-foreground mb-2 font-medium">
                              Dashboard Header:
                            </div>
                            <div 
                              className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold shadow-sm bg-gradient-to-r ${template.dashboardHeaderGradient} ${template.dashboardHeaderText}`}
                            >
                              Sistem Monitoring & Validasi
                            </div>
                          </div>

                          {/* Mini Sidebar Preview */}
                          <div className="border rounded-lg overflow-hidden h-48">
                          {/* Header Preview */}
                          <div
                            className="h-16 p-3 flex flex-col justify-center"
                            style={{ background: template.preview.headerGradient }}
                          >
                            <div
                              className="font-bold text-sm"
                              style={{ color: template.preview.headerText }}
                            >
                              SIMPA BEND
                            </div>
                            <div
                              className="text-xs opacity-90"
                              style={{ color: template.preview.headerText }}
                            >
                              BKAD Kolaka Utara
                            </div>
                          </div>

                          {/* Content Preview */}
                          <div
                            className="flex-1 p-3 space-y-2"
                            style={{ background: template.preview.contentGradient }}
                          >
                            {/* Menu Items Preview */}
                            <div className="flex items-center gap-2 p-2 rounded text-xs text-gray-700">
                              <div className="w-4 h-4 bg-gray-400 rounded"></div>
                              <span>Dashboard</span>
                            </div>
                            <div
                              className="flex items-center gap-2 p-2 rounded text-xs font-medium"
                              style={{ background: template.preview.activeMenu }}
                            >
                              <div className="w-4 h-4 bg-gray-600 rounded"></div>
                              <span>Menu Aktif</span>
                            </div>
                            <div className="flex items-center gap-2 p-2 rounded text-xs text-gray-700">
                              <div className="w-4 h-4 bg-gray-400 rounded"></div>
                              <span>Pengaturan</span>
                            </div>
                          </div>
                        </div>
                          
                          {/* Icon Style Badge */}
                          <div className="px-3 py-2 bg-gray-50 border-t mt-3">
                            <div className="text-xs text-gray-600">
                              <span className="font-medium">Icon Style: </span>
                              {template.iconStyle === 'standard' && '● Standard'}
                              {template.iconStyle === 'colorful-per-menu' && '🎨 Colorful'}
                              {template.iconStyle === 'rounded-background' && '⬜ Rounded BG'}
                              {template.iconStyle === 'gradient-icon' && '✨ Gradient'}
                              {template.iconStyle === 'subtle-accent' && '🎯 Subtle Accent'}
                            </div>
                          </div>
                        </div>

                        {/* Radio Button */}
                        <div className="mt-4 flex items-center justify-center">
                          <RadioGroupItem
                            value={template.id}
                            id={template.id}
                            className="sr-only"
                          />
                          <Label
                            htmlFor={template.id}
                            className="text-sm font-medium cursor-pointer"
                          >
                            {currentTemplate === template.id ? (
                              <span className="text-primary">✓ Template Aktif</span>
                            ) : (
                              <span className="text-muted-foreground">Pilih Template</span>
                            )}
                          </Label>
                        </div>
                      </CardContent>
                    </Card>
                  </Label>
                </div>
              ))}
            </RadioGroup>

            <div className="mt-6 flex justify-end">
              <Button
                onClick={handleApply}
                disabled={!selectedTemplate || mutation.isPending}
                size="lg"
              >
                {mutation.isPending ? 'Menerapkan...' : 'Terapkan Template'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default SidebarTemplate;
