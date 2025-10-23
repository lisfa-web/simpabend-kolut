import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTemplateSuratList } from "@/hooks/useTemplateSuratList";
import { usePejabatList } from "@/hooks/usePejabatList";
import { useState } from "react";
import { Printer, Download } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function GenerateSurat() {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [selectedPejabatId, setSelectedPejabatId] = useState<string>("");
  const [variables, setVariables] = useState<Record<string, string>>({
    nomor_surat: "",
    tanggal: new Date().toLocaleDateString("id-ID"),
    nama_opd: "",
    vendor: "",
    nomor_spm: "",
    nilai_spm: "",
  });

  const { data: templates = [] } = useTemplateSuratList({ is_active: true });
  const { data: pejabatList = [] } = usePejabatList({ is_active: true });

  const { data: selectedTemplate } = useQuery({
    queryKey: ["template_surat", selectedTemplateId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("template_surat")
        .select("*")
        .eq("id", selectedTemplateId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!selectedTemplateId,
  });

  const { data: selectedPejabat } = useQuery({
    queryKey: ["pejabat", selectedPejabatId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pejabat")
        .select(`
          *,
          opd:opd_id (
            nama_opd
          )
        `)
        .eq("id", selectedPejabatId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!selectedPejabatId,
  });

  const generateContent = () => {
    if (!selectedTemplate) return "";

    let content = selectedTemplate.konten_html;

    // Replace variables
    Object.entries(variables).forEach(([key, value]) => {
      content = content.replace(new RegExp(`{{${key}}}`, "g"), value);
    });

    // Replace pejabat data
    if (selectedPejabat) {
      content = content.replace(/{{nama_pejabat}}/g, selectedPejabat.nama_lengkap);
      content = content.replace(/{{jabatan_pejabat}}/g, selectedPejabat.jabatan);
      content = content.replace(/{{nip_pejabat}}/g, selectedPejabat.nip);
      if (selectedPejabat.opd) {
        content = content.replace(/{{nama_opd}}/g, selectedPejabat.opd.nama_opd);
      }
    }

    return content;
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const content = generateContent();
    const blob = new Blob([content], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `surat-${Date.now()}.html`;
    a.click();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Generate Surat</h1>
          <p className="text-muted-foreground mt-2">Buat surat baru dari template</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pilih Template & Pejabat</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Template Surat</Label>
                  <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.nama_template}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Pejabat Penandatangan</Label>
                  <Select value={selectedPejabatId} onValueChange={setSelectedPejabatId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih pejabat" />
                    </SelectTrigger>
                    <SelectContent>
                      {pejabatList.map((pejabat) => (
                        <SelectItem key={pejabat.id} value={pejabat.id}>
                          {pejabat.nama_lengkap} - {pejabat.jabatan}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {selectedTemplateId && (
              <Card>
                <CardHeader>
                  <CardTitle>Isi Data Surat</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Nomor Surat</Label>
                    <Input
                      value={variables.nomor_surat}
                      onChange={(e) =>
                        setVariables({ ...variables, nomor_surat: e.target.value })
                      }
                      placeholder="Contoh: 001/SPM/2024"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Tanggal</Label>
                    <Input
                      value={variables.tanggal}
                      onChange={(e) => setVariables({ ...variables, tanggal: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Nomor SPM (jika ada)</Label>
                    <Input
                      value={variables.nomor_spm}
                      onChange={(e) => setVariables({ ...variables, nomor_spm: e.target.value })}
                      placeholder="Nomor SPM"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Nilai SPM (jika ada)</Label>
                    <Input
                      value={variables.nilai_spm}
                      onChange={(e) => setVariables({ ...variables, nilai_spm: e.target.value })}
                      placeholder="Rp 0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Vendor/Penerima (jika ada)</Label>
                    <Input
                      value={variables.vendor}
                      onChange={(e) => setVariables({ ...variables, vendor: e.target.value })}
                      placeholder="Nama vendor"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex gap-4">
              <Button onClick={handlePrint} disabled={!selectedTemplateId}>
                <Printer className="mr-2 h-4 w-4" />
                Print
              </Button>
              <Button variant="outline" onClick={handleDownload} disabled={!selectedTemplateId}>
                <Download className="mr-2 h-4 w-4" />
                Download HTML
              </Button>
            </div>
          </div>

          <div>
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Preview Surat</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedTemplateId ? (
                  <div
                    className="border rounded-lg p-6 bg-white min-h-[600px] print:border-0"
                    dangerouslySetInnerHTML={{ __html: generateContent() }}
                  />
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    Pilih template untuk melihat preview
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
