import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useKegiatanMutation } from "@/hooks/useKegiatanMutation";
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

export default function KegiatanList() {
  const navigate = useNavigate();
  const { isSuperAdmin } = useAuth();
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { deleteKegiatan } = useKegiatanMutation();

  const isSuperAdminUser = isSuperAdmin();

  const { data: kegiatan, isLoading } = useQuery({
    queryKey: ["kegiatan-all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("kegiatan")
        .select(`
          *,
          program:program_id (
            nama_program,
            kode_program
          )
        `)
        .order("nama_kegiatan");

      if (error) throw error;
      return data;
    },
  });

  const filteredKegiatan = kegiatan?.filter((item) =>
    item.nama_kegiatan.toLowerCase().includes(search.toLowerCase()) ||
    item.kode_kegiatan.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async () => {
    if (deleteId) {
      await deleteKegiatan.mutateAsync(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Kegiatan</h1>
            <p className="text-muted-foreground">
              Kelola data kegiatan anggaran
            </p>
          </div>
          <Button onClick={() => navigate("/masterdata/kegiatan/new")}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Kegiatan
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Daftar Kegiatan</CardTitle>
            <div className="flex gap-4 mt-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Cari kegiatan..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kode Kegiatan</TableHead>
                  <TableHead>Nama Kegiatan</TableHead>
                  <TableHead>Program</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      Memuat data...
                    </TableCell>
                  </TableRow>
                ) : filteredKegiatan && filteredKegiatan.length > 0 ? (
                  filteredKegiatan.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {item.kode_kegiatan}
                      </TableCell>
                      <TableCell>{item.nama_kegiatan}</TableCell>
                      <TableCell>
                        {item.program?.nama_program || "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={item.is_active ? "default" : "secondary"}>
                          {item.is_active ? "Aktif" : "Nonaktif"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() =>
                              navigate(`/masterdata/kegiatan/${item.id}`)
                            }
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {isSuperAdminUser && (
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => setDeleteId(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      Tidak ada data kegiatan
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Kegiatan</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus kegiatan ini? Tindakan ini tidak dapat dibatalkan.
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
