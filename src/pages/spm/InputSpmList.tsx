import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePagination } from "@/hooks/usePagination";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
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
import { SubmitSpmDialog } from "./components/SubmitSpmDialog";
import { formatCurrency } from "@/lib/currency";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Plus, Eye, Edit, Trash2, Send, Search, Loader2 } from "lucide-react";
import { JENIS_SPM_OPTIONS, getJenisSpmLabel } from "@/lib/jenisSpmOptions";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const InputSpmList = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [jenisSpmFilter, setJenisSpmFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [submitSpmId, setSubmitSpmId] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  
  const pagination = usePagination(10);

  const { data: spmList, isLoading } = useSpmList({
    search,
    jenis_spm_id: jenisSpmFilter === "all" ? undefined : jenisSpmFilter,
    status: statusFilter === "all" ? undefined : statusFilter,
  });

  const { deleteSpm, updateSpm } = useSpmMutation();

  const handleDelete = async () => {
    if (deleteId) {
      await deleteSpm.mutateAsync(deleteId);
      setDeleteId(null);
    }
  };

  const validateSpmBeforeSubmit = async (spmId: string) => {
    const errors: string[] = [];
    
    try {
      // Get SPM detail
      const { data: spm, error: spmError } = await supabase
        .from("spm")
        .select("*, jenis_spm:jenis_spm_id(nama_jenis)")
        .eq("id", spmId)
        .single();

      if (spmError || !spm) {
        errors.push("Data SPM tidak ditemukan");
        return errors;
      }

      // Check lampiran
      const { data: lampiran, error: lampiranError } = await supabase
        .from("lampiran_spm")
        .select("jenis_lampiran")
        .eq("spm_id", spmId);

      if (lampiranError) {
        errors.push("Gagal memeriksa lampiran");
        return errors;
      }

      const jenisSpm = spm.jenis_spm?.nama_jenis?.toLowerCase() || "";
      const isLsType = jenisSpm.startsWith("ls");

      // Check required documents
      const hasDokumenSpm = lampiran?.some(l => 
        l.jenis_lampiran === "spm"
      );
      const hasTbk = lampiran?.some(l => 
        l.jenis_lampiran === "tbk" || l.jenis_lampiran === "kwitansi"
      );

      if (!hasDokumenSpm) {
        errors.push("Dokumen SPM wajib diupload");
      }

      if (isLsType && !hasTbk) {
        errors.push("TBK/Kuitansi wajib diupload untuk SPM LS");
      }

      // Check basic data
      if (!spm.nilai_spm || spm.nilai_spm <= 0) {
        errors.push("Nilai SPM harus lebih dari 0");
      }

      if (!spm.uraian || spm.uraian.trim().length < 10) {
        errors.push("Uraian minimal 10 karakter");
      }

    } catch (error: any) {
      console.error("Validation error:", error);
      errors.push("Terjadi kesalahan saat validasi");
    }

    return errors;
  };

  const handleInitiateSubmit = async (id: string) => {
    setIsValidating(true);
    setSubmitSpmId(id);
    
    const errors = await validateSpmBeforeSubmit(id);
    setValidationErrors(errors);
    setIsValidating(false);
  };

  const handleConfirmSubmit = async () => {
    if (!submitSpmId) return;

    try {
      await updateSpm.mutateAsync({
        id: submitSpmId,
        data: { status: "diajukan", tanggal_ajuan: new Date().toISOString() },
      });

      toast({
        title: "Berhasil",
        description: "SPM berhasil diajukan dan masuk ke proses verifikasi",
      });

      setSubmitSpmId(null);
      setValidationErrors([]);
    } catch (error: any) {
      toast({
        title: "Gagal",
        description: error.message || "Gagal mengajukan SPM",
        variant: "destructive",
      });
    }
  };

  const canEdit = (status: string) => 
    status === "draft" || status === "perlu_revisi";
  const canDelete = (status: string) => status === "draft";
  const canSubmit = (status: string) => 
    status === "draft" || status === "perlu_revisi";

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
              {JENIS_SPM_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
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
                pagination.paginateData(spmList)?.map((spm: any, index: number) => (
                  <TableRow 
                    key={spm.id}
                    className={index % 2 === 0 ? "bg-primary/10" : "bg-secondary/10"}
                  >
                    <TableCell className="font-medium">
                      {spm.nomor_spm || "-"}
                    </TableCell>
                    <TableCell>{spm.jenis_spm?.nama_jenis || "-"}</TableCell>
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
                          onClick={() => handleInitiateSubmit(spm.id)}
                          disabled={isValidating}
                          title={spm.status === "draft" ? "Ajukan SPM" : "Ajukan Ulang SPM"}
                        >
                          {isValidating && submitSpmId === spm.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
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
          {spmList && spmList.length > 0 && (
            <DataTablePagination
              pageIndex={pagination.pagination.pageIndex}
              pageSize={pagination.pagination.pageSize}
              pageCount={pagination.getPageCount(spmList.length)}
              totalItems={spmList.length}
              onPageChange={pagination.goToPage}
              onPageSizeChange={pagination.setPageSize}
            />
          )}
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

      {/* Submit SPM Dialog with Validation */}
      {submitSpmId && (
        <SubmitSpmDialog
          open={!!submitSpmId}
          onOpenChange={(open) => {
            if (!open) {
              setSubmitSpmId(null);
              setValidationErrors([]);
            }
          }}
          onConfirm={handleConfirmSubmit}
          spmData={{
            nomor_spm: spmList?.find((s: any) => s.id === submitSpmId)?.nomor_spm || "Draft",
            nilai_spm: spmList?.find((s: any) => s.id === submitSpmId)?.nilai_spm || 0,
            uraian: spmList?.find((s: any) => s.id === submitSpmId)?.uraian || "",
          }}
          validationErrors={validationErrors}
          isSubmitting={updateSpm.isPending}
        />
      )}
    </DashboardLayout>
  );
};

export default InputSpmList;
