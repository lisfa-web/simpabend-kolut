import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Edit, Eye, Trash2, RotateCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePejabatList } from "@/hooks/usePejabatList";
import { usePejabatMutation } from "@/hooks/usePejabatMutation";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOpdList } from "@/hooks/useOpdList";

export default function PejabatList() {
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const [search, setSearch] = useState("");
  const [opdFilter, setOpdFilter] = useState<string>("");
  const [showInactive, setShowInactive] = useState(false);
  const [deactivateId, setDeactivateId] = useState<string | null>(null);
  const [activateId, setActivateId] = useState<string | null>(null);

  const isSuperAdmin = hasRole("super_admin");
  const { data: opdList = [] } = useOpdList({ is_active: true });
  const { data: pejabatList = [], isLoading } = usePejabatList({
    search,
    opd_id: opdFilter || undefined,
    is_active: showInactive ? undefined : true,
  });
  const { deletePejabat, activatePejabat } = usePejabatMutation();

  const handleDeactivate = () => {
    if (deactivateId) {
      deletePejabat.mutate(deactivateId);
      setDeactivateId(null);
    }
  };

  const handleActivate = () => {
    if (activateId) {
      activatePejabat.mutate(activateId);
      setActivateId(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Data Pejabat</h1>
            <p className="text-muted-foreground mt-2">
              Kelola data pejabat penandatangan surat
            </p>
          </div>
          <Button onClick={() => navigate("/surat/pejabat/buat")}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Pejabat
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filter & Pencarian</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cari nama atau NIP..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select 
                  value={opdFilter || "all"} 
                  onValueChange={(value) => setOpdFilter(value === "all" ? "" : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Semua OPD" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua OPD</SelectItem>
                    {opdList.map((opd) => (
                      <SelectItem key={opd.id} value={opd.id}>
                        {opd.nama_opd}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="show-inactive"
                  checked={showInactive}
                  onCheckedChange={setShowInactive}
                />
                <Label htmlFor="show-inactive">Tampilkan data nonaktif</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>NIP</TableHead>
                  <TableHead>Nama Lengkap</TableHead>
                  <TableHead>Jabatan</TableHead>
                  <TableHead>OPD</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Memuat data...
                    </TableCell>
                  </TableRow>
                ) : pejabatList.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Tidak ada data pejabat
                    </TableCell>
                  </TableRow>
                ) : (
                  pejabatList.map((pejabat) => (
                    <TableRow key={pejabat.id}>
                      <TableCell className="font-mono">{pejabat.nip}</TableCell>
                      <TableCell className="font-medium">{pejabat.nama_lengkap}</TableCell>
                      <TableCell>{pejabat.jabatan}</TableCell>
                      <TableCell>{pejabat.opd?.nama_opd || "-"}</TableCell>
                      <TableCell>
                        <Badge variant={pejabat.is_active ? "default" : "secondary"}>
                          {pejabat.is_active ? "Aktif" : "Tidak Aktif"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/surat/pejabat/${pejabat.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/surat/pejabat/${pejabat.id}/edit`)}
                            disabled={!pejabat.is_active}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {isSuperAdmin && pejabat.is_active ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeactivateId(pejabat.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          ) : isSuperAdmin && !pejabat.is_active ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setActivateId(pejabat.id)}
                            >
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                          ) : null}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={!!deactivateId} onOpenChange={() => setDeactivateId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Nonaktifkan</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menonaktifkan data pejabat ini? Data yang dinonaktifkan tidak dapat digunakan untuk penandatanganan surat.
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
            <AlertDialogTitle>Konfirmasi Aktifkan</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin mengaktifkan kembali data pejabat ini?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleActivate}>Aktifkan</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
