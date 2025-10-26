import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import { useUserActivity } from "@/hooks/useUserActivity";
import { useUserRole } from "@/hooks/useUserRole";
import { SpmStatusBadge } from "@/pages/spm/components/SpmStatusBadge";
import { formatCurrency } from "@/lib/currency";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Search, Eye, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const getRoleLabel = (spm: any, userId: string): string => {
  if (spm.bendahara_id === userId) return "Pengaju";
  if (spm.verified_by_resepsionis === userId) return "Verifikasi Resepsionis";
  if (spm.verified_by_pbmd === userId) return "Verifikasi PBMD";
  if (spm.verified_by_akuntansi === userId) return "Validasi Akuntansi";
  if (spm.verified_by_perbendaharaan === userId) return "Verifikasi Perbendaharaan";
  if (spm.verified_by_kepala_bkad === userId) return "Review Kepala BKAD";
  return "Terkait";
};

const MySpmTable = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: spmData, isLoading } = useUserActivity({
    search,
    status: statusFilter === "all" ? undefined : statusFilter,
  });

  if (isLoading) {
    return (
      <Card className="p-12">
        <div className="flex justify-center items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari nomor SPM atau uraian..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[200px]">
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

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nomor SPM</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>OPD</TableHead>
                <TableHead>Nilai</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Peran Saya</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!spmData?.data || spmData.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Belum ada SPM yang dikerjakan
                  </TableCell>
                </TableRow>
              ) : (
                spmData.data.map((spm: any) => (
                  <TableRow key={spm.id}>
                    <TableCell className="font-medium">
                      {spm.nomor_spm || "-"}
                    </TableCell>
                    <TableCell>
                      {spm.tanggal_ajuan
                        ? format(new Date(spm.tanggal_ajuan), "dd MMM yyyy", { locale: id })
                        : "-"}
                    </TableCell>
                    <TableCell>{spm.opd?.nama_opd || "-"}</TableCell>
                    <TableCell>{formatCurrency(spm.nilai_spm)}</TableCell>
                    <TableCell>
                      <SpmStatusBadge status={spm.status} />
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {getRoleLabel(spm, user?.id || "")}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(`/input-spm/timeline/${spm.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </Card>
  );
};

export default MySpmTable;
