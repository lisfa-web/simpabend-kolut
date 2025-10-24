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
import { useProgramList } from "@/hooks/useProgramList";
import { useProgramMutation } from "@/hooks/useProgramMutation";
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

export default function ProgramList() {
  const navigate = useNavigate();
  const { isSuperAdmin, isRegularAdmin, isAdminOrAkuntansi } = useAuth();
  const [search, setSearch] = useState("");
  const [deactivateId, setDeactivateId] = useState<string | null>(null);
  const [activateId, setActivateId] = useState<string | null>(null);
  const [permanentDeleteId, setPermanentDeleteId] = useState<string | null>(null);

  const { data: programs, isLoading } = useProgramList();
  const { deleteProgram, activateProgram, permanentDeleteProgram } = useProgramMutation();

  const isSuperAdminUser = isSuperAdmin();
  const canManage = isAdminOrAkuntansi();

  const filteredPrograms = programs?.filter((program) =>
    program.nama_program.toLowerCase().includes(search.toLowerCase()) ||
    program.kode_program.toLowerCase().includes(search.toLowerCase())
  );

  const handleDeactivate = async () => {
    if (deactivateId) {
      await deleteProgram.mutateAsync(deactivateId);
      setDeactivateId(null);
    }
  };

  const handleActivate = async () => {
    if (activateId) {
      await activateProgram.mutateAsync(activateId);
      setActivateId(null);
    }
  };

  const handlePermanentDelete = async () => {
    if (permanentDeleteId) {
      await permanentDeleteProgram.mutateAsync(permanentDeleteId);
      setPermanentDeleteId(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Program</h1>
            <p className="text-muted-foreground">
              Kelola data program anggaran
            </p>
          </div>
          <Button onClick={() => navigate("/masterdata/program/new")}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Program
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Daftar Program</CardTitle>
            <div className="flex gap-4 mt-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Cari program..."
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
                  <TableHead>Kode Program</TableHead>
                  <TableHead>Nama Program</TableHead>
                  <TableHead>Tahun Anggaran</TableHead>
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
                ) : filteredPrograms && filteredPrograms.length > 0 ? (
                  filteredPrograms.map((program) => (
                    <TableRow key={program.id}>
                      <TableCell className="font-medium">
                        {program.kode_program}
                      </TableCell>
                      <TableCell>{program.nama_program}</TableCell>
                      <TableCell>{program.tahun_anggaran}</TableCell>
                      <TableCell>
                        <Badge variant={program.is_active ? "default" : "secondary"}>
                          {program.is_active ? "Aktif" : "Nonaktif"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() =>
                              navigate(`/masterdata/program/${program.id}`)
                            }
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          
                          {canManage && (
                            <>
                              {program.is_active ? (
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => setDeactivateId(program.id)}
                                  title="Nonaktifkan"
                                >
                                  <Ban className="h-4 w-4 text-orange-600" />
                                </Button>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => setActivateId(program.id)}
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
                              onClick={() => setPermanentDeleteId(program.id)}
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
                      Tidak ada data program
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
            <AlertDialogTitle>Nonaktifkan Program</AlertDialogTitle>
            <AlertDialogDescription>
              Data Program akan dinonaktifkan dan tidak muncul di pilihan aktif. 
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
            <AlertDialogTitle>Aktifkan Program</AlertDialogTitle>
            <AlertDialogDescription>
              Data Program akan diaktifkan kembali dan muncul di pilihan aktif.
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
              ⚠️ Hapus Permanen Program
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p className="font-semibold text-destructive">
                PERINGATAN: Tindakan ini tidak dapat dibatalkan!
              </p>
              <p>
                Data Program akan dihapus PERMANEN dari database. Semua histori dan 
                relasi akan hilang selamanya.
              </p>
              <p className="text-muted-foreground text-sm">
                Pastikan tidak ada kegiatan atau SPM yang terkait dengan Program ini.
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
