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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Plus, Pencil, Trash2, Link, ArrowUpDown } from "lucide-react";
import { usePajakPerJenisSpmList } from "@/hooks/usePajakPerJenisSpmList";
import { usePajakPerJenisSpmMutation } from "@/hooks/usePajakPerJenisSpmMutation";
import { getJenisSpmLabel } from "@/hooks/useJenisSpmTaxInfo";

const kategoriColors: Record<string, string> = {
  pajak_pusat: "bg-blue-100 text-blue-800 border-blue-200",
  pajak_daerah: "bg-yellow-100 text-yellow-800 border-yellow-200",
  iuran_non_pajak: "bg-purple-100 text-purple-800 border-purple-200",
  lainnya: "bg-gray-100 text-gray-800 border-gray-200",
};

const PajakPerJenisSpmList = () => {
  const navigate = useNavigate();
  const [filterJenisSpm, setFilterJenisSpm] = useState<string>("all");
  
  // Pass filter to hook
  const filters = filterJenisSpm !== "all" ? { jenis_spm: filterJenisSpm } : undefined;
  const { data: mappingList = [], isLoading } = usePajakPerJenisSpmList(filters);
  
  const { deleteMapping } = usePajakPerJenisSpmMutation();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDelete = () => {
    if (deleteId) {
      deleteMapping.mutate(deleteId);
      setDeleteId(null);
    }
  };

  const groupedByJenis = mappingList.reduce((acc, item) => {
    if (!acc[item.jenis_spm]) {
      acc[item.jenis_spm] = [];
    }
    acc[item.jenis_spm].push(item);
    return acc;
  }, {} as Record<string, typeof mappingList>);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Link className="h-8 w-8 text-primary" />
              Mapping Pajak per Jenis SPM
            </h1>
            <p className="text-muted-foreground mt-2">
              Kelola pajak yang akan dipotong untuk setiap jenis SPM
            </p>
          </div>
          <Button onClick={() => navigate("/masterdata/pajak/mapping/tambah")}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Mapping
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Daftar Mapping</CardTitle>
              <Select value={filterJenisSpm} onValueChange={setFilterJenisSpm}>
                <SelectTrigger className="w-[250px]">
                  <SelectValue placeholder="Filter Jenis SPM" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Jenis SPM</SelectItem>
                  <SelectItem value="up">UP (Uang Persediaan)</SelectItem>
                  <SelectItem value="gu">GU (Ganti Uang)</SelectItem>
                  <SelectItem value="tu">TU (Tambah Uang)</SelectItem>
                  <SelectItem value="ls_gaji">LS Gaji</SelectItem>
                  <SelectItem value="ls_barang_jasa">LS Barang & Jasa</SelectItem>
                  <SelectItem value="ls_belanja_modal">LS Belanja Modal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Memuat data...
              </div>
            ) : mappingList.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Belum ada mapping pajak
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupedByJenis).map(([jenis, items]) => (
                  <div key={jenis} className="border rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      {getJenisSpmLabel(jenis)}
                      <Badge variant="secondary">{items.length} pajak</Badge>
                    </h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[60px]">Urutan</TableHead>
                          <TableHead>Nama Pajak</TableHead>
                          <TableHead>Kategori</TableHead>
                          <TableHead className="text-right">Tarif</TableHead>
                          <TableHead>Default</TableHead>
                          <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {items.map((mapping) => (
                          <TableRow key={mapping.id}>
                            <TableCell className="text-center">
                              <Badge variant="outline" className="font-mono">
                                {mapping.urutan}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">
                                  {mapping.master_pajak?.nama_pajak}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {mapping.master_pajak?.kode_pajak}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {mapping.master_pajak?.kategori && (
                                <Badge
                                  variant="outline"
                                  className={kategoriColors[mapping.master_pajak.kategori] || ""}
                                >
                                  {mapping.master_pajak.kategori.replace(/_/g, " ")}
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right font-mono">
                              {mapping.tarif_khusus ? (
                                <span className="text-primary font-semibold">
                                  {mapping.tarif_khusus}%
                                </span>
                              ) : (
                                <span>{mapping.master_pajak?.tarif_default}%</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={mapping.is_default ? "default" : "secondary"}
                              >
                                {mapping.is_default ? "Auto" : "Manual"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    navigate(`/masterdata/pajak/mapping/edit/${mapping.id}`)
                                  }
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => setDeleteId(mapping.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Mapping?</AlertDialogTitle>
            <AlertDialogDescription>
              Aksi ini tidak dapat dibatalkan. Mapping pajak akan dihapus permanen.
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

export default PajakPerJenisSpmList;
