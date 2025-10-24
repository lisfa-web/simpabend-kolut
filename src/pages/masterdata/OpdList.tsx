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
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Edit, Trash2, Ban, CheckCircle } from "lucide-react";
import { useOpdList } from "@/hooks/useOpdList";
import { useOpdMutation } from "@/hooks/useOpdMutation";

const OpdList = () => {
  const navigate = useNavigate();
  const { isSuperAdmin, isRegularAdmin, isAdminOrAkuntansi } = useAuth();
  const [search, setSearch] = useState("");
  const [deactivateId, setDeactivateId] = useState<string | null>(null);
  const [activateId, setActivateId] = useState<string | null>(null);
  const [permanentDeleteId, setPermanentDeleteId] = useState<string | null>(null);

  const { data: opdList, isLoading } = useOpdList();
  const { deleteOpd, activateOpd, permanentDeleteOpd } = useOpdMutation();

  const isSuperAdminUser = isSuperAdmin();
  const isRegularAdminUser = isRegularAdmin();
  const canManage = isAdminOrAkuntansi();

  const filteredData = opdList?.filter(
    (opd) =>
      opd.nama_opd.toLowerCase().includes(search.toLowerCase()) ||
      opd.kode_opd.toLowerCase().includes(search.toLowerCase())
  );

  const handleDeactivate = () => {
    if (deactivateId) {
      deleteOpd.mutate(deactivateId, {
        onSuccess: () => setDeactivateId(null),
      });
    }
  };

  const handleActivate = () => {
    if (activateId) {
      activateOpd.mutate(activateId, {
        onSuccess: () => setActivateId(null),
      });
    }
  };

  const handlePermanentDelete = () => {
    if (permanentDeleteId) {
      permanentDeleteOpd.mutate(permanentDeleteId, {
        onSuccess: () => setPermanentDeleteId(null),
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Master Data OPD</h1>
            <p className="text-muted-foreground">
              Kelola data Organisasi Perangkat Daerah
            </p>
          </div>
          <Button onClick={() => navigate("/masterdata/opd/create")}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah OPD
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Cari nama atau kode OPD..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kode OPD</TableHead>
                <TableHead>Nama OPD</TableHead>
                <TableHead>Alamat</TableHead>
                <TableHead>Telepon</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Memuat data...
                  </TableCell>
                </TableRow>
              ) : filteredData && filteredData.length > 0 ? (
                filteredData.map((opd) => (
                  <TableRow 
                    key={opd.id}
                    className={!opd.is_active ? "opacity-60 bg-muted/30" : ""}
                  >
                    <TableCell className="font-medium">{opd.kode_opd}</TableCell>
                    <TableCell>{opd.nama_opd}</TableCell>
                    <TableCell>{opd.alamat || "-"}</TableCell>
                    <TableCell>{opd.telepon || "-"}</TableCell>
                    <TableCell>{opd.email || "-"}</TableCell>
                    <TableCell>
                      <Badge variant={opd.is_active ? "default" : "secondary"}>
                        {opd.is_active ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate(`/masterdata/opd/${opd.id}/edit`)}
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        
                        {canManage && (
                          <>
                            {opd.is_active ? (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeactivateId(opd.id)}
                                title="Nonaktifkan"
                              >
                                <Ban className="h-4 w-4 text-orange-600" />
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setActivateId(opd.id)}
                                title="Aktifkan"
                              >
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              </Button>
                            )}
                          </>
                        )}
                        
                        {isSuperAdminUser && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setPermanentDeleteId(opd.id)}
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
                  <TableCell
                    colSpan={7}
                    className="text-center py-8 text-muted-foreground"
                  >
                    Tidak ada data OPD
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <AlertDialog open={!!deactivateId} onOpenChange={() => setDeactivateId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Nonaktifkan OPD</AlertDialogTitle>
            <AlertDialogDescription>
              Data OPD akan dinonaktifkan dan tidak muncul di pilihan aktif. 
              Data tetap tersimpan dan dapat diaktifkan kembali.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeactivate}>
              Nonaktifkan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!activateId} onOpenChange={() => setActivateId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Aktifkan OPD</AlertDialogTitle>
            <AlertDialogDescription>
              Data OPD akan diaktifkan kembali dan muncul di pilihan aktif.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleActivate}>
              Aktifkan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!permanentDeleteId} onOpenChange={() => setPermanentDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">
              ⚠️ Hapus Permanen OPD
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p className="font-semibold text-destructive">
                PERINGATAN: Tindakan ini tidak dapat dibatalkan!
              </p>
              <p>
                Data OPD akan dihapus PERMANEN dari database. Semua histori dan 
                relasi akan hilang selamanya.
              </p>
              <p className="text-muted-foreground text-sm">
                Pastikan tidak ada user, SPM, atau pejabat yang terkait dengan OPD ini.
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
};

export default OpdList;
