import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePagination } from "@/hooks/usePagination";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
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
import { Plus, Search, Edit, Ban, CheckCircle } from "lucide-react";
import { usePihakKetigaList } from "@/hooks/usePihakKetigaList";
import { usePihakKetigaMutation } from "@/hooks/usePihakKetigaMutation";
import { useMasterBankList } from "@/hooks/useMasterBankList";

const PihakKetigaList = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [deactivateId, setDeactivateId] = useState<string | null>(null);
  const [activateId, setActivateId] = useState<string | null>(null);
  
  const pagination = usePagination(10);

  const { data: pihakKetigaList, isLoading } = usePihakKetigaList();
  const { data: bankList } = useMasterBankList();
  const { updatePihakKetiga, deletePihakKetiga } = usePihakKetigaMutation();

  const filteredData = pihakKetigaList?.filter((pk) =>
    pk.nama_pihak_ketiga.toLowerCase().includes(search.toLowerCase())
  );

  const getBankName = (bankId: string | null) => {
    if (!bankId) return "-";
    return bankList?.find(b => b.id === bankId)?.nama_bank || "-";
  };

  const handleDeactivate = () => {
    if (deactivateId) {
      updatePihakKetiga.mutate(
        { id: deactivateId, data: { is_active: false } },
        { onSuccess: () => setDeactivateId(null) }
      );
    }
  };

  const handleActivate = () => {
    if (activateId) {
      updatePihakKetiga.mutate(
        { id: activateId, data: { is_active: true } },
        { onSuccess: () => setActivateId(null) }
      );
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Master Data Pihak Ketiga</h1>
            <p className="text-muted-foreground">Kelola data Pihak Ketiga</p>
          </div>
          <Button onClick={() => navigate("/masterdata/pihak-ketiga/create")}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Pihak Ketiga
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Cari nama pihak ketiga..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>NPWP</TableHead>
                <TableHead>Telepon</TableHead>
                <TableHead>Bank</TableHead>
                <TableHead>No. Rekening</TableHead>
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
                pagination.paginateData(filteredData).map((pk) => (
                  <TableRow 
                    key={pk.id}
                    className={!pk.is_active ? "opacity-60 bg-muted/30" : ""}
                  >
                    <TableCell className="font-medium">
                      {pk.nama_pihak_ketiga}
                    </TableCell>
                    <TableCell>{pk.npwp || "-"}</TableCell>
                    <TableCell>{pk.telepon || "-"}</TableCell>
                    <TableCell>{getBankName(pk.bank_id)}</TableCell>
                    <TableCell>{pk.nomor_rekening || "-"}</TableCell>
                    <TableCell>
                      <Badge variant={pk.is_active ? "default" : "secondary"}>
                        {pk.is_active ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            navigate(`/masterdata/pihak-ketiga/${pk.id}/edit`)
                          }
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        
                        {pk.is_active ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeactivateId(pk.id)}
                            title="Nonaktifkan"
                          >
                            <Ban className="h-4 w-4 text-orange-600" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setActivateId(pk.id)}
                            title="Aktifkan"
                          >
                            <CheckCircle className="h-4 w-4 text-green-600" />
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
                    Tidak ada data pihak ketiga
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          {filteredData && filteredData.length > 0 && (
            <DataTablePagination
              pageIndex={pagination.pagination.pageIndex}
              pageSize={pagination.pagination.pageSize}
              pageCount={pagination.getPageCount(filteredData.length)}
              totalItems={filteredData.length}
              onPageChange={pagination.goToPage}
              onPageSizeChange={pagination.setPageSize}
            />
          )}
        </div>
      </div>

      <AlertDialog open={!!deactivateId} onOpenChange={() => setDeactivateId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Nonaktifkan Pihak Ketiga</AlertDialogTitle>
            <AlertDialogDescription>
              Data akan dinonaktifkan dan tidak muncul di pilihan aktif.
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
            <AlertDialogTitle>Aktifkan Pihak Ketiga</AlertDialogTitle>
            <AlertDialogDescription>
              Data akan diaktifkan kembali dan muncul di pilihan aktif.
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
    </DashboardLayout>
  );
};

export default PihakKetigaList;
