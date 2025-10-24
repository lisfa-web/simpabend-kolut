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
import { useVendorList } from "@/hooks/useVendorList";
import { useVendorMutation } from "@/hooks/useVendorMutation";

const VendorList = () => {
  const navigate = useNavigate();
  const { isSuperAdmin, isRegularAdmin, isAdminOrAkuntansi } = useAuth();
  const [search, setSearch] = useState("");
  const [deactivateId, setDeactivateId] = useState<string | null>(null);
  const [activateId, setActivateId] = useState<string | null>(null);
  const [permanentDeleteId, setPermanentDeleteId] = useState<string | null>(null);

  const { data: vendorList, isLoading } = useVendorList();
  const { deleteVendor, activateVendor, permanentDeleteVendor } = useVendorMutation();

  const isSuperAdminUser = isSuperAdmin();
  const canManage = isAdminOrAkuntansi();

  const filteredData = vendorList?.filter((vendor) =>
    vendor.nama_vendor.toLowerCase().includes(search.toLowerCase())
  );

  const handleDeactivate = () => {
    if (deactivateId) {
      deleteVendor.mutate(deactivateId, {
        onSuccess: () => setDeactivateId(null),
      });
    }
  };

  const handleActivate = () => {
    if (activateId) {
      activateVendor.mutate(activateId, {
        onSuccess: () => setActivateId(null),
      });
    }
  };

  const handlePermanentDelete = () => {
    if (permanentDeleteId) {
      permanentDeleteVendor.mutate(permanentDeleteId, {
        onSuccess: () => setPermanentDeleteId(null),
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Master Data Vendor</h1>
            <p className="text-muted-foreground">Kelola data Vendor/Rekanan</p>
          </div>
          <Button onClick={() => navigate("/masterdata/vendor/create")}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Vendor
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Cari nama vendor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Vendor</TableHead>
                <TableHead>NPWP</TableHead>
                <TableHead>Telepon</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Bank</TableHead>
                <TableHead>No. Rekening</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    Memuat data...
                  </TableCell>
                </TableRow>
              ) : filteredData && filteredData.length > 0 ? (
                filteredData.map((vendor) => (
                  <TableRow key={vendor.id}>
                    <TableCell className="font-medium">
                      {vendor.nama_vendor}
                    </TableCell>
                    <TableCell>{vendor.npwp || "-"}</TableCell>
                    <TableCell>{vendor.telepon || "-"}</TableCell>
                    <TableCell>{vendor.email || "-"}</TableCell>
                    <TableCell>{vendor.nama_bank || "-"}</TableCell>
                    <TableCell>{vendor.nomor_rekening || "-"}</TableCell>
                    <TableCell>
                      <Badge variant={vendor.is_active ? "default" : "secondary"}>
                        {vendor.is_active ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            navigate(`/masterdata/vendor/${vendor.id}/edit`)
                          }
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        
                        {canManage && (
                          <>
                            {vendor.is_active ? (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeactivateId(vendor.id)}
                                title="Nonaktifkan"
                              >
                                <Ban className="h-4 w-4 text-orange-600" />
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setActivateId(vendor.id)}
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
                            onClick={() => setPermanentDeleteId(vendor.id)}
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
                    colSpan={8}
                    className="text-center py-8 text-muted-foreground"
                  >
                    Tidak ada data vendor
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
            <AlertDialogTitle>Nonaktifkan Vendor</AlertDialogTitle>
            <AlertDialogDescription>
              Data Vendor akan dinonaktifkan dan tidak muncul di pilihan aktif. 
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
            <AlertDialogTitle>Aktifkan Vendor</AlertDialogTitle>
            <AlertDialogDescription>
              Data Vendor akan diaktifkan kembali dan muncul di pilihan aktif.
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
              ⚠️ Hapus Permanen Vendor
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p className="font-semibold text-destructive">
                PERINGATAN: Tindakan ini tidak dapat dibatalkan!
              </p>
              <p>
                Data Vendor akan dihapus PERMANEN dari database. Semua histori dan 
                relasi akan hilang selamanya.
              </p>
              <p className="text-muted-foreground text-sm">
                Pastikan tidak ada SPM yang terkait dengan Vendor ini.
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

export default VendorList;
