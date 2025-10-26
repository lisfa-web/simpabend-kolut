import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Edit, Trash2, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { useMasterPajakList } from "@/hooks/useMasterPajakList";
import { useMasterPajakMutation } from "@/hooks/useMasterPajakMutation";
import { Skeleton } from "@/components/ui/skeleton";

const JENIS_PAJAK_LABELS: Record<string, string> = {
  pph_21: "PPh 21",
  pph_22: "PPh 22",
  pph_23: "PPh 23",
  pph_4_ayat_2: "PPh 4(2)",
  ppn: "PPN",
};

export default function MasterPajakList() {
  const navigate = useNavigate();
  const { data: pajakList, isLoading } = useMasterPajakList();
  const { deletePajak } = useMasterPajakMutation();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!deleteId) return;
    await deletePajak.mutateAsync(deleteId);
    setDeleteId(null);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Master Pajak</h1>
            <p className="text-muted-foreground">
              Kelola data master pajak dan tarif potongan
            </p>
          </div>
          <Button onClick={() => navigate("/masterdata/pajak/tambah")}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Pajak
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Daftar Pajak
            </CardTitle>
            <CardDescription>
              Data master pajak yang tersedia di sistem
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kode</TableHead>
                    <TableHead>Nama Pajak</TableHead>
                    <TableHead>Jenis</TableHead>
                    <TableHead>Rekening</TableHead>
                    <TableHead className="text-right">Tarif Default</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pajakList?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        Belum ada data pajak
                      </TableCell>
                    </TableRow>
                  ) : (
                    pajakList?.map((pajak) => (
                      <TableRow key={pajak.id}>
                        <TableCell className="font-medium">{pajak.kode_pajak}</TableCell>
                        <TableCell>{pajak.nama_pajak}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {JENIS_PAJAK_LABELS[pajak.jenis_pajak] || pajak.jenis_pajak}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{pajak.rekening_pajak}</TableCell>
                        <TableCell className="text-right font-semibold">
                          {pajak.tarif_default}%
                        </TableCell>
                        <TableCell>
                          <Badge variant={pajak.is_active ? "default" : "secondary"}>
                            {pajak.is_active ? "Aktif" : "Nonaktif"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/masterdata/pajak/edit/${pajak.id}`)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => setDeleteId(pajak.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus pajak ini? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
