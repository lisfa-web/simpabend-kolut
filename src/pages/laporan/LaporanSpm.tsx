import { useState } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, FileText, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLaporanSpm } from "@/hooks/useLaporanSpm";
import { useOpdList } from "@/hooks/useOpdList";
import { FilterPeriode } from "./components/FilterPeriode";
import { SummaryCard } from "./components/SummaryCard";
import { ExportButton } from "./components/ExportButton";
import { ChartSpm } from "./components/ChartSpm";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/currency";
import { format, parseISO } from "date-fns";
import { id } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";

const LaporanSpm = () => {
  const navigate = useNavigate();
  const [tanggalDari, setTanggalDari] = useState("");
  const [tanggalSampai, setTanggalSampai] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [opdFilter, setOpdFilter] = useState("all");
  const [jenisSpmFilter, setJenisSpmFilter] = useState("all");

  const { data: opdList } = useOpdList();
  const { data: spmList, isLoading, error } = useLaporanSpm({
    tanggal_dari: tanggalDari,
    tanggal_sampai: tanggalSampai,
    status: statusFilter,
    opd_id: opdFilter,
    jenis_spm: jenisSpmFilter,
  });

  const totalSpm = spmList?.length || 0;
  const totalNilai = spmList?.reduce((sum, item) => sum + Number(item.nilai_spm || 0), 0) || 0;

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      draft: { label: "Draft", variant: "secondary" },
      diajukan: { label: "Diajukan", variant: "default" },
      verifikasi_resepsionis: { label: "Resepsionis", variant: "outline" },
      verifikasi_pbmd: { label: "PBMD", variant: "outline" },
      verifikasi_akuntansi: { label: "Akuntansi", variant: "outline" },
      verifikasi_perbendaharaan: { label: "Perbendaharaan", variant: "outline" },
      approval_kepala_bkad: { label: "Kepala BKAD", variant: "outline" },
      disetujui: { label: "Disetujui", variant: "default" },
      ditolak: { label: "Ditolak", variant: "destructive" },
    };

    const config = statusConfig[status] || { label: status, variant: "outline" };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/laporan")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Laporan SPM</h1>
              <p className="text-muted-foreground">
                Rekapitulasi data SPM berdasarkan filter
              </p>
            </div>
          </div>
          <ExportButton data={spmList || []} filename="laporan-spm" />
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filter Laporan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FilterPeriode
              tanggalDari={tanggalDari}
              tanggalSampai={tanggalSampai}
              onTanggalDariChange={setTanggalDari}
              onTanggalSampaiChange={setTanggalSampai}
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Semua Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="diajukan">Diajukan</SelectItem>
                    <SelectItem value="disetujui">Disetujui</SelectItem>
                    <SelectItem value="ditolak">Ditolak</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>OPD</Label>
                <Select value={opdFilter} onValueChange={setOpdFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Semua OPD" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua OPD</SelectItem>
                    {opdList?.map((opd) => (
                      <SelectItem key={opd.id} value={opd.id}>
                        {opd.nama_opd}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Jenis SPM</Label>
                <Select value={jenisSpmFilter} onValueChange={setJenisSpmFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Semua Jenis" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Jenis</SelectItem>
                    <SelectItem value="ls">LS (Langsung)</SelectItem>
                    <SelectItem value="up">UP (Uang Persediaan)</SelectItem>
                    <SelectItem value="gu">GU (Ganti Uang)</SelectItem>
                    <SelectItem value="tu">TU (Tambah Uang)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SummaryCard
            title="Total SPM"
            value={totalSpm}
            icon={FileText}
            description={`Dari filter yang dipilih`}
          />
          <SummaryCard
            title="Total Nilai"
            value={formatCurrency(totalNilai)}
            icon={DollarSign}
            description={`Total nilai SPM`}
          />
        </div>

        {/* Charts */}
        {spmList && spmList.length > 0 && <ChartSpm data={spmList} />}

        {/* Data Table */}
        <Card>
          <CardHeader>
            <CardTitle>Data SPM</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="text-center p-8 text-destructive">
                Gagal memuat data laporan
              </div>
            ) : spmList && spmList.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nomor SPM</TableHead>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>OPD</TableHead>
                      <TableHead>Jenis</TableHead>
                      <TableHead className="text-right">Nilai (Bruto)</TableHead>
                      <TableHead className="text-right">Potongan</TableHead>
                      <TableHead className="text-right">Nilai Bersih</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {spmList.map((spm: any) => (
                      <TableRow key={spm.id}>
                        <TableCell className="font-medium">
                          {spm.nomor_spm || "-"}
                        </TableCell>
                        <TableCell>
                          {spm.tanggal_ajuan
                            ? format(parseISO(spm.tanggal_ajuan), "dd MMM yyyy", {
                                locale: id,
                              })
                            : "-"}
                        </TableCell>
                        <TableCell>{spm.opd?.nama_opd || "-"}</TableCell>
                        <TableCell className="uppercase">{spm.jenis_spm}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(spm.nilai_spm)}
                        </TableCell>
                        <TableCell className="text-right text-destructive">
                          {spm.total_potongan ? `-${formatCurrency(spm.total_potongan)}` : "-"}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(spm.nilai_bersih || spm.nilai_spm)}
                        </TableCell>
                        <TableCell>{getStatusBadge(spm.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center p-8 text-muted-foreground">
                Tidak ada data yang sesuai dengan filter
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default LaporanSpm;
