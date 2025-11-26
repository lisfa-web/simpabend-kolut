import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
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
import { useMasterBankList } from "@/hooks/useMasterBankList";
import { useMasterBankMutation } from "@/hooks/useMasterBankMutation";

const MasterBankList = () => {
  const navigate = useNavigate();
  const { isAdminOrAkuntansi } = useAuth();
  const [search, setSearch] = useState("");
  const [deactivateId, setDeactivateId] = useState<string | null>(null);
  const [activateId, setActivateId] = useState<string | null>(null);
  
  const pagination = usePagination(10);

  const { data: bankList, isLoading } = useMasterBankList();
  const { deleteBank, activateBank } = useMasterBankMutation();

  const canManage = isAdminOrAkuntansi();

  const filteredData = bankList?.filter((bank) =>
    bank.nama_bank.toLowerCase().includes(search.toLowerCase()) ||
    bank.kode_bank.toLowerCase().includes(search.toLowerCase())
  );

  const handleDeactivate = () => {
    if (deactivateId) {
      deleteBank.mutate(deactivateId, {
        onSuccess: () => setDeactivateId(null),
      });
    }
  };

  const handleActivate = () => {
    if (activateId) {
      activateBank.mutate(activateId, {
        onSuccess: () => setActivateId(null),
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Master Data Bank</h1>
            <p className="text-muted-foreground">Kelola data Bank untuk rekening</p>
          </div>
          {canManage && (
            <Button onClick={() => navigate("/masterdata/bank/create")}>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Bank
            </Button>
          )}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Cari nama atau kode bank..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kode Bank</TableHead>
                <TableHead>Nama Bank</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    Memuat data...
                  </TableCell>
                </TableRow>
              ) : filteredData && filteredData.length > 0 ? (
                pagination.paginateData(filteredData).map((bank) => (
                  <TableRow 
                    key={bank.id}
                    className={!bank.is_active ? "opacity-60 bg-muted/30" : ""}
                  >
                    <TableCell className="font-medium">
                      {bank.kode_bank}
                    </TableCell>
                    <TableCell>{bank.nama_bank}</TableCell>
                    <TableCell>
                      <Badge variant={bank.is_active ? "default" : "secondary"}>
                        {bank.is_active ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {canManage && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                navigate(`/masterdata/bank/${bank.id}/edit`)
                              }
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            
                            {bank.is_active ? (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeactivateId(bank.id)}
                                title="Nonaktifkan"
                              >
                                <Ban className="h-4 w-4 text-orange-600" />
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setActivateId(bank.id)}
                                title="Aktifkan"
                              >
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-8 text-muted-foreground"
                  >
                    Tidak ada data bank
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
            <AlertDialogTitle>Nonaktifkan Bank</AlertDialogTitle>
            <AlertDialogDescription>
              Data Bank akan dinonaktifkan dan tidak muncul di pilihan aktif. 
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
            <AlertDialogTitle>Aktifkan Bank</AlertDialogTitle>
            <AlertDialogDescription>
              Data Bank akan diaktifkan kembali dan muncul di pilihan aktif.
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

export default MasterBankList;
