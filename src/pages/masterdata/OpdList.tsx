import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { useOpdList } from "@/hooks/useOpdList";
import { useOpdMutation } from "@/hooks/useOpdMutation";

const OpdList = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: opdList, isLoading } = useOpdList();
  const { deleteOpd } = useOpdMutation();

  const filteredData = opdList?.filter(
    (opd) =>
      opd.nama_opd.toLowerCase().includes(search.toLowerCase()) ||
      opd.kode_opd.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = () => {
    if (deleteId) {
      deleteOpd.mutate(deleteId, {
        onSuccess: () => setDeleteId(null),
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
                  <TableRow key={opd.id}>
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
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(opd.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus OPD</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus OPD ini? Tindakan ini tidak dapat
              dibatalkan.
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

export default OpdList;
