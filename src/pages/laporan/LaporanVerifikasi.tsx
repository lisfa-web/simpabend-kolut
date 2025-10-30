import { useState } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLaporanVerifikasi } from "@/hooks/useLaporanVerifikasi";
import { FilterPeriode } from "./components/FilterPeriode";
import { SummaryCard } from "./components/SummaryCard";
import { ExportButton } from "./components/ExportButton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/currency";
import { format, parseISO } from "date-fns";
import { id } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";

const LaporanVerifikasi = () => {
  const navigate = useNavigate();
  const [tanggalDari, setTanggalDari] = useState("");
  const [tanggalSampai, setTanggalSampai] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data: spmResult, isLoading, error } = useLaporanVerifikasi({
    tanggal_dari: tanggalDari,
    tanggal_sampai: tanggalSampai,
    page: currentPage,
    pageSize: pageSize,
  });

  const spmList = spmResult?.data || [];
  const totalCount = spmResult?.count || 0;

  // Count per tahap berdasarkan timestamp verifikasi
  const resepsionisCount = spmList.filter((i: any) => i.tanggal_resepsionis).length;
  const pbmdCount = spmList.filter((i: any) => i.tanggal_pbmd).length;
  const akuntansiCount = spmList.filter((i: any) => i.tanggal_akuntansi).length;
  const perbendaharaanCount = spmList.filter((i: any) => i.tanggal_perbendaharaan).length;

  // Reset to page 1 when filters change
  const handleFilterChange = (setter: (value: string) => void) => (value: string) => {
    setter(value);
    setCurrentPage(1);
  };
  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      draft: { label: "Draft", variant: "secondary" },
      diajukan: { label: "Diajukan", variant: "default" },
      verifikasi_resepsionis: { label: "Resepsionis", variant: "outline" },
      resepsionis_verifikasi: { label: "Resepsionis", variant: "outline" },
      verifikasi_pbmd: { label: "PBMD", variant: "outline" },
      pbmd_verifikasi: { label: "PBMD", variant: "outline" },
      verifikasi_akuntansi: { label: "Akuntansi", variant: "outline" },
      akuntansi_verifikasi: { label: "Akuntansi", variant: "outline" },
      verifikasi_perbendaharaan: { label: "Perbendaharaan", variant: "outline" },
      perbendaharaan_verifikasi: { label: "Perbendaharaan", variant: "outline" },
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
              <h1 className="text-3xl font-bold">Laporan Verifikasi</h1>
              <p className="text-muted-foreground">
                Progress verifikasi SPM per tahap
              </p>
            </div>
          </div>
          <ExportButton data={spmList} filename="laporan-verifikasi" />
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filter Laporan</CardTitle>
          </CardHeader>
          <CardContent>
            <FilterPeriode
              tanggalDari={tanggalDari}
              tanggalSampai={tanggalSampai}
              onTanggalDariChange={handleFilterChange(setTanggalDari)}
              onTanggalSampaiChange={handleFilterChange(setTanggalSampai)}
            />
          </CardContent>
        </Card>

        {/* Summary by Status */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <SummaryCard
            title="Resepsionis"
            value={resepsionisCount}
            icon={CheckCircle2}
          />
          <SummaryCard
            title="PBMD"
            value={pbmdCount}
            icon={CheckCircle2}
          />
          <SummaryCard
            title="Akuntansi"
            value={akuntansiCount}
            icon={CheckCircle2}
          />
          <SummaryCard
            title="Perbendaharaan"
            value={perbendaharaanCount}
            icon={CheckCircle2}
          />
        </div>

        {/* Data Table */}
        <Card>
          <CardHeader>
            <CardTitle>Data Verifikasi SPM</CardTitle>
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
                      <TableHead>Tanggal Ajuan</TableHead>
                      <TableHead>OPD</TableHead>
                      <TableHead>Bendahara</TableHead>
                      <TableHead className="text-right">Nilai</TableHead>
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
                        <TableCell>{spm.bendahara?.full_name || "-"}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(spm.nilai_spm)}
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
            
            {/* Pagination */}
            {totalCount > pageSize && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Menampilkan {spmList.length} dari {totalCount} data
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Sebelumnya
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => p + 1)}
                    disabled={spmList.length < pageSize}
                  >
                    Selanjutnya
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default LaporanVerifikasi;
