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
import { Plus, Search, Edit, Trash2, Ban, CheckCircle } from "lucide-react";
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
  const { isSuperAdmin, isRegularAdmin, isAdminOrAkuntansi } = useAuth();
  const [search, setSearch] = useState("");
  const [deactivateId, setDeactivateId] = useState<string | null>(null);
  const [activateId, setActivateId] = useState<string | null>(null);
  const [permanentDeleteId, setPermanentDeleteId] = useState<string | null>(null);

  const { deleteSubkegiatan, activateSubkegiatan, permanentDeleteSubkegiatan } = useSubkegiatanMutation();

  const isSuperAdminUser = isSuperAdmin();
  const canManage = isAdminOrAkuntansi();

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

  const handleDeactivate = async () => {
    if (deactivateId) {
      await deleteSubkegiatan.mutateAsync(deactivateId);
      setDeactivateId(null);
    }
  };

  const handleActivate = async () => {
    if (activateId) {
      await activateSubkegiatan.mutateAsync(activateId);
      setActivateId(null);
    }
  };

  const handlePermanentDelete = async () => {
    if (permanentDeleteId) {
      await permanentDeleteSubkegiatan.mutateAsync(permanentDeleteId);
      setPermanentDeleteId(null);
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
                    <TableRow 
                      key={item.id}
                      className={!item.is_active ? "opacity-60 bg-muted/30" : ""}
                    >
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
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          
                          {canManage && (
                            <>
                              {item.is_active ? (
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => setDeactivateId(item.id)}
                                  title="Nonaktifkan"
                                >
                                  <Ban className="h-4 w-4 text-orange-600" />
                                </Button>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => setActivateId(item.id)}
                                  title="Aktifkan"
                                >
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                </Button>
                              )}
                            </>
                          )}
                          
                          {isSuperAdminUser && (
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => setPermanentDeleteId(item.id)}
                              title="Hapus Permanen"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
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

      <AlertDialog open={!!deactivateId} onOpenChange={() => setDeactivateId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Nonaktifkan Sub Kegiatan</AlertDialogTitle>
            <AlertDialogDescription>
              Data Sub Kegiatan akan dinonaktifkan dan tidak muncul di pilihan aktif. 
              Data tetap tersimpan dan dapat diaktifkan kembali.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeactivate}>Nonaktifkan</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!activateId} onOpenChange={() => setActivateId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Aktifkan Sub Kegiatan</AlertDialogTitle>
            <AlertDialogDescription>
              Data Sub Kegiatan akan diaktifkan kembali dan muncul di pilihan aktif.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleActivate}>Aktifkan</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!permanentDeleteId} onOpenChange={() => setPermanentDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">
              ⚠️ Hapus Permanen Sub Kegiatan
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p className="font-semibold text-destructive">
                PERINGATAN: Tindakan ini tidak dapat dibatalkan!
              </p>
              <p>
                Data Sub Kegiatan akan dihapus PERMANEN dari database. Semua histori dan 
                relasi akan hilang selamanya.
              </p>
              <p className="text-muted-foreground text-sm">
                Pastikan tidak ada SPM yang terkait dengan Sub Kegiatan ini.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handlePermanentDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Hapus Permanen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
