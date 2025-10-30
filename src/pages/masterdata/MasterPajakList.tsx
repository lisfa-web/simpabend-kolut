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
import { Plus, Pencil, Trash2, Receipt } from "lucide-react";
import { useMasterPajakList } from "@/hooks/useMasterPajakList";
import { useMasterPajakMutation } from "@/hooks/useMasterPajakMutation";
import { usePagination } from "@/hooks/usePagination";
import { DataTablePagination } from "@/components/ui/data-table-pagination";

const jenisPajakLabels: Record<string, string> = {
  pph_21: "PPh 21",
  pph_22: "PPh 22",
  pph_23: "PPh 23",
  pph_4_ayat_2: "PPh Pasal 4 Ayat 2",
  ppn: "PPN",
};

const MasterPajakList = () => {
  const navigate = useNavigate();
  const pagination = usePagination(10);
  const { data: pajakList = [], isLoading } = useMasterPajakList();
  const { deletePajak } = useMasterPajakMutation();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDelete = () => {
    if (deleteId) {
      deletePajak.mutate(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Receipt className="h-8 w-8 text-primary" />
              Master Pajak
            </h1>
            <p className="text-muted-foreground mt-2">
              Kelola data master pajak (PPh, PPN) dan tarifnya
            </p>
          </div>
          <Button onClick={() => navigate("/masterdata/pajak/tambah")}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Master Pajak
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Daftar Master Pajak</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Memuat data...
              </div>
            ) : pajakList.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Belum ada data master pajak
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kode</TableHead>
                    <TableHead>Nama Pajak</TableHead>
                    <TableHead>Jenis</TableHead>
                    <TableHead>Rekening</TableHead>
                    <TableHead>Deskripsi</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagination.paginateData(pajakList).map((pajak) => (
                    <TableRow key={pajak.id}>
                      <TableCell className="font-medium">{pajak.kode_pajak}</TableCell>
                      <TableCell>{pajak.nama_pajak}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {jenisPajakLabels[pajak.jenis_pajak] || pajak.jenis_pajak}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {pajak.rekening_pajak}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                        {pajak.deskripsi || "-"}
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
                            <Pencil className="h-4 w-4" />
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
                  ))}
                </TableBody>
              </Table>
            )}
            {pajakList.length > 0 && (
              <DataTablePagination
                pageIndex={pagination.pagination.pageIndex}
                pageSize={pagination.pagination.pageSize}
                pageCount={pagination.getPageCount(pajakList.length)}
                totalItems={pajakList.length}
                onPageChange={pagination.goToPage}
                onPageSizeChange={pagination.setPageSize}
              />
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Master Pajak?</AlertDialogTitle>
            <AlertDialogDescription>
              Aksi ini tidak dapat dibatalkan. Data master pajak akan dihapus permanen.
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

export default MasterPajakList;
