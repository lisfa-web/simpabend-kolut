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
import { useSubkegiatanMutation } from "@/hooks/useSubkegiatanMutation";
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

export default function SubkegiatanList() {
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { deleteSubkegiatan } = useSubkegiatanMutation();

  const isSuperAdmin = hasRole("super_admin");

  const { data: subkegiatan, isLoading } = useQuery({
    queryKey: ["subkegiatan-all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subkegiatan")
        .select(`
          *,
          kegiatan:kegiatan_id (
            nama_kegiatan,
            kode_kegiatan,
            program:program_id (
              nama_program,
              kode_program
            )
          )
        `)
        .order("nama_subkegiatan");

      if (error) throw error;
      return data;
    },
  });

  const filteredSubkegiatan = subkegiatan?.filter((item) =>
    item.nama_subkegiatan.toLowerCase().includes(search.toLowerCase()) ||
    item.kode_subkegiatan.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async () => {
    if (deleteId) {
      await deleteSubkegiatan.mutateAsync(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Sub Kegiatan</h1>
            <p className="text-muted-foreground">
              Kelola data sub kegiatan anggaran
            </p>
          </div>
          <Button onClick={() => navigate("/masterdata/subkegiatan/new")}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Sub Kegiatan
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Daftar Sub Kegiatan</CardTitle>
            <div className="flex gap-4 mt-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Cari sub kegiatan..."
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
                  <TableHead>Kode</TableHead>
                  <TableHead>Nama Sub Kegiatan</TableHead>
                  <TableHead>Kegiatan</TableHead>
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
                ) : filteredSubkegiatan && filteredSubkegiatan.length > 0 ? (
                  filteredSubkegiatan.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {item.kode_subkegiatan}
                      </TableCell>
                      <TableCell>{item.nama_subkegiatan}</TableCell>
                      <TableCell>
                        {item.kegiatan?.nama_kegiatan || "-"}
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
                              navigate(`/masterdata/subkegiatan/${item.id}`)
                            }
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {isSuperAdmin && (
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
                      Tidak ada data sub kegiatan
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
            <AlertDialogTitle>Hapus Sub Kegiatan</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus sub kegiatan ini? Tindakan ini tidak dapat dibatalkan.
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
