import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { usePejabatMutation } from "@/hooks/usePejabatMutation";
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

export default function PejabatDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { deletePejabat } = usePejabatMutation();

  const { data: pejabat, isLoading } = useQuery({
    queryKey: ["pejabat", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pejabat")
        .select(`
          *,
          opd:opd_id (
            id,
            nama_opd,
            kode_opd
          )
        `)
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const handleDelete = () => {
    if (id) {
      deletePejabat.mutate(id);
      navigate("/surat/pejabat");
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">Memuat data...</div>
      </DashboardLayout>
    );
  }

  if (!pejabat) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">Data tidak ditemukan</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-3xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/surat/pejabat")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Detail Pejabat</h1>
              <p className="text-muted-foreground mt-2">Informasi lengkap pejabat</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate(`/surat/pejabat/${id}/edit`)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={!pejabat.is_active}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Nonaktifkan
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Konfirmasi Nonaktifkan</AlertDialogTitle>
                  <AlertDialogDescription>
                    Apakah Anda yakin ingin menonaktifkan data pejabat ini? Data yang dinonaktifkan tidak dapat digunakan untuk penandatanganan surat.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>Nonaktifkan</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informasi Pejabat</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-sm text-muted-foreground">NIP</div>
              <div className="col-span-2 font-mono">{pejabat.nip}</div>

              <div className="text-sm text-muted-foreground">Nama Lengkap</div>
              <div className="col-span-2 font-medium">{pejabat.nama_lengkap}</div>

              <div className="text-sm text-muted-foreground">Jabatan</div>
              <div className="col-span-2">{pejabat.jabatan}</div>

              <div className="text-sm text-muted-foreground">OPD</div>
              <div className="col-span-2">{pejabat.opd?.nama_opd || "-"}</div>

              <div className="text-sm text-muted-foreground">Status</div>
              <div className="col-span-2">
                <Badge variant={pejabat.is_active ? "default" : "secondary"}>
                  {pejabat.is_active ? "Aktif" : "Tidak Aktif"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {pejabat.ttd_url && (
          <Card>
            <CardHeader>
              <CardTitle>Tanda Tangan Digital</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-4 bg-muted/50">
                <img
                  src={pejabat.ttd_url}
                  alt="Tanda tangan"
                  className="max-h-32 mx-auto"
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
