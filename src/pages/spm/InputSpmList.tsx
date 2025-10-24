import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { useSpmList } from "@/hooks/useSpmList";
import { useSpmMutation } from "@/hooks/useSpmMutation";
import { SpmStatusBadge } from "./components/SpmStatusBadge";
import { formatCurrency } from "@/lib/currency";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Plus, Eye, Edit, Trash2, Send, Search, Loader2 } from "lucide-react";

const InputSpmList = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [jenisSpmFilter, setJenisSpmFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: spmList, isLoading } = useSpmList({
    search,
    jenis_spm: jenisSpmFilter === "all" ? undefined : jenisSpmFilter,
    status: statusFilter === "all" ? undefined : statusFilter,
  });

  const { deleteSpm, updateSpm } = useSpmMutation();

  const handleDelete = async () => {
    if (deleteId) {
      await deleteSpm.mutateAsync(deleteId);
      setDeleteId(null);
    }
  };

  const handleSubmit = async (id: string) => {
    await updateSpm.mutateAsync({
      id,
      data: { status: "diajukan", tanggal_ajuan: new Date().toISOString() },
    });
  };

  const canEdit = (status: string) => 
    status === "draft" || status === "perlu_revisi" || status === "ditolak";
  const canDelete = (status: string) => status === "draft";
  const canSubmit = (status: string) => 
    status === "draft" || status === "perlu_revisi" || status === "ditolak";

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Input SPM</h1>
            <p className="text-muted-foreground">
              Kelola dan ajukan Surat Perintah Membayar
            </p>
          </div>
          <Button onClick={() => navigate("/input-spm/buat")}>
            <Plus className="mr-2 h-4 w-4" />
            Buat SPM Baru
          </Button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari nomor SPM atau uraian..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={jenisSpmFilter} onValueChange={setJenisSpmFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Semua Jenis SPM" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Jenis</SelectItem>
              <SelectItem value="UP">UP</SelectItem>
              <SelectItem value="GU">GU</SelectItem>
              <SelectItem value="TU">TU</SelectItem>
              <SelectItem value="LS_Gaji">LS Gaji</SelectItem>
              <SelectItem value="LS_Barang_Jasa">LS Barang & Jasa</SelectItem>
              <SelectItem value="LS_Belanja_Modal">LS Belanja Modal</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Semua Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="diajukan">Diajukan</SelectItem>
              <SelectItem value="resepsionis_verifikasi">Di Resepsionis</SelectItem>
              <SelectItem value="pbmd_verifikasi">Verifikasi PBMD</SelectItem>
              <SelectItem value="akuntansi_validasi">Validasi Akuntansi</SelectItem>
              <SelectItem value="perbendaharaan_verifikasi">Verifikasi Perbendaharaan</SelectItem>
              <SelectItem value="kepala_bkad_review">Review Kepala BKAD</SelectItem>
              <SelectItem value="disetujui">Disetujui</SelectItem>
              <SelectItem value="ditolak">Ditolak</SelectItem>
              <SelectItem value="perlu_revisi">Perlu Revisi</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nomor SPM</TableHead>
                <TableHead>Jenis</TableHead>
                <TableHead>Nilai</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tanggal Ajuan</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {spmList?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Belum ada SPM. Klik "Buat SPM Baru" untuk memulai.
                  </TableCell>
                </TableRow>
              ) : (
                spmList?.map((spm: any) => (
                  <TableRow key={spm.id}>
                    <TableCell className="font-medium">
                      {spm.nomor_spm || "-"}
                    </TableCell>
                    <TableCell>{spm.jenis_spm?.toUpperCase()}</TableCell>
                    <TableCell>{formatCurrency(spm.nilai_spm)}</TableCell>
                    <TableCell>
                      <SpmStatusBadge status={spm.status} />
                    </TableCell>
                    <TableCell>
                      {spm.tanggal_ajuan
                        ? format(new Date(spm.tanggal_ajuan), "dd MMM yyyy", { locale: id })
                        : "-"}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(`/input-spm/detail/${spm.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {canEdit(spm.status) && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate(`/input-spm/edit/${spm.id}`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      {canSubmit(spm.status) && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleSubmit(spm.id)}
                          title={spm.status === "draft" ? "Ajukan SPM" : "Ajukan Ulang"}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      )}
                      {canDelete(spm.status) && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(spm.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus SPM?</AlertDialogTitle>
            <AlertDialogDescription>
              SPM ini akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.
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

export default InputSpmList;
