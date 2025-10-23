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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
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
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { data: programs, isLoading } = useProgramList();
  const { deleteProgram } = useProgramMutation();

  const filteredPrograms = programs?.filter((program) =>
    program.nama_program.toLowerCase().includes(search.toLowerCase()) ||
    program.kode_program.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async () => {
    if (deleteId) {
      await deleteProgram.mutateAsync(deleteId);
      setDeleteId(null);
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
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setDeleteId(program.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
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

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Program</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus program ini? Tindakan ini tidak dapat dibatalkan.
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
