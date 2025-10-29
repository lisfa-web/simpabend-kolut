import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, FileText, CheckCircle2, XCircle } from "lucide-react";
import { useJenisSpmList } from "@/hooks/useJenisSpmList";
import { useJenisSpmMutation } from "@/hooks/useJenisSpmMutation";

const JenisSpmList = () => {
  const navigate = useNavigate();
  const { data: jenisSpmList = [], isLoading } = useJenisSpmList();
  const { deleteJenisSpm } = useJenisSpmMutation();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDelete = () => {
    if (deleteId) {
      deleteJenisSpm.mutate(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <FileText className="h-8 w-8 text-primary" />
              Jenis SPM
            </h1>
            <p className="text-muted-foreground mt-2">
              Kelola data jenis Surat Perintah Membayar (SPM)
            </p>
          </div>
          <Button onClick={() => navigate("/masterdata/jenis-spm/tambah")}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Jenis SPM
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Daftar Jenis SPM</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Memuat data...
              </div>
            ) : jenisSpmList.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Belum ada data jenis SPM
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Jenis</TableHead>
                    <TableHead>Deskripsi</TableHead>
                    <TableHead className="text-center">Ada Pajak</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jenisSpmList.map((jenis) => (
                    <TableRow key={jenis.id}>
                      <TableCell className="font-medium">{jenis.nama_jenis}</TableCell>
                      <TableCell className="max-w-md text-sm text-muted-foreground">
                        {jenis.deskripsi || "-"}
                      </TableCell>
                      <TableCell className="text-center">
                        {jenis.ada_pajak ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600 inline" />
                        ) : (
                          <XCircle className="h-5 w-5 text-gray-400 inline" />
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={jenis.is_active ? "default" : "secondary"}>
                          {jenis.is_active ? "Aktif" : "Nonaktif"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/masterdata/jenis-spm/edit/${jenis.id}`)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setDeleteId(jenis.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Jenis SPM?</AlertDialogTitle>
            <AlertDialogDescription>
              Aksi ini tidak dapat dibatalkan. Data jenis SPM akan dihapus permanen.
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
};

export default JenisSpmList;
