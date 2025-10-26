import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Edit, Copy, Trash2 } from "lucide-react";
import LetterPreview from "@/components/surat/LetterPreview";
import { useLetterPreview } from "@/hooks/useLetterPreview";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTemplateSuratMutation } from "@/hooks/useTemplateSuratMutation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function TemplateSuratDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { deleteTemplate, duplicateTemplate } = useTemplateSuratMutation();
  const { sampleData, replaceVariables } = useLetterPreview();
  const [showSampleData, setShowSampleData] = useState(false);

  const { data: template, isLoading } = useQuery({
    queryKey: ["template_surat", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("template_surat")
        .select("*")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const handleDelete = () => {
    if (id) {
      deleteTemplate.mutate(id);
      navigate("/surat/template");
    }
  };

  const handleDuplicate = () => {
    if (id) {
      duplicateTemplate.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">Memuat data...</div>
      </DashboardLayout>
    );
  }

  if (!template) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">Data tidak ditemukan</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/surat/template")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Detail Template</h1>
              <p className="text-muted-foreground mt-2">Informasi lengkap template surat</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate(`/surat/template/${id}/edit`)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button variant="outline" onClick={handleDuplicate}>
              <Copy className="mr-2 h-4 w-4" />
              Duplikat
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Hapus
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
                  <AlertDialogDescription>
                    Apakah Anda yakin ingin menghapus template ini? Tindakan ini tidak dapat
                    dibatalkan.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>Hapus</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informasi Template</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-sm text-muted-foreground">Nama Template</div>
              <div className="col-span-2 font-medium">{template.nama_template}</div>

              <div className="text-sm text-muted-foreground">Jenis Surat</div>
              <div className="col-span-2">{template.jenis_surat}</div>

              <div className="text-sm text-muted-foreground">Status</div>
              <div className="col-span-2">
                <Badge variant={template.is_active ? "default" : "secondary"}>
                  {template.is_active ? "Aktif" : "Tidak Aktif"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Preview Konten</CardTitle>
              <div className="flex items-center gap-2">
                <Switch
                  id="sample-data"
                  checked={showSampleData}
                  onCheckedChange={setShowSampleData}
                />
                <Label htmlFor="sample-data" className="cursor-pointer">
                  Tampilkan Data Contoh
                </Label>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg p-6 bg-white min-h-[400px]">
              <LetterPreview
                kopSuratUrl={template.kop_surat_url}
                content={replaceVariables(template.konten_html, {}, showSampleData)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Konten HTML</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm font-mono">
              {template.konten_html}
            </pre>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
