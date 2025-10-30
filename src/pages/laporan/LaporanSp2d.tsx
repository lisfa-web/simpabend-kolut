import { useState } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, FileText, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLaporanSp2d } from "@/hooks/useLaporanSp2d";
import { useOpdList } from "@/hooks/useOpdList";
import { FilterPeriode } from "./components/FilterPeriode";
import { SummaryCard } from "./components/SummaryCard";
import { ExportButton } from "./components/ExportButton";
import { ChartSp2d } from "./components/ChartSp2d";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/currency";
import { format, parseISO } from "date-fns";
import { id } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";

const LaporanSp2d = () => {
  const navigate = useNavigate();
  const [tanggalDari, setTanggalDari] = useState("");
  const [tanggalSampai, setTanggalSampai] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [opdFilter, setOpdFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data: opdList } = useOpdList();
  const { data: sp2dResult, isLoading, error } = useLaporanSp2d({
    tanggal_dari: tanggalDari,
    tanggal_sampai: tanggalSampai,
    status: statusFilter,
    opd_id: opdFilter,
    page: currentPage,
    pageSize: pageSize,
  });

  const sp2dList = sp2dResult?.data || [];
  const totalCount = sp2dResult?.count || 0;
  const totalSp2d = sp2dList.length;
  const totalNilai = sp2dList.reduce((sum, item) => sum + Number(item.nilai_sp2d || 0), 0);
  const totalPotongan = sp2dList.reduce((sum, item) => sum + Number(item.total_potongan || 0), 0);
  const totalDiterima = sp2dList.reduce((sum, item) => sum + Number(item.nilai_diterima || item.nilai_sp2d || 0), 0);

  // Reset to page 1 when filters change
  const handleFilterChange = (setter: (value: string) => void) => (value: string) => {
    setter(value);
    setCurrentPage(1);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" }> = {
      pending: { label: "Pending", variant: "secondary" },
      diproses: { label: "Diproses", variant: "default" },
      diterbitkan: { label: "Diterbitkan", variant: "default" },
      dibatalkan: { label: "Dibatalkan", variant: "destructive" },
    };

    const config = statusConfig[status] || { label: status, variant: "secondary" };
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
              <h1 className="text-3xl font-bold">Laporan SP2D</h1>
              <p className="text-muted-foreground">
                Rekapitulasi pencairan dana SP2D
              </p>
            </div>
          </div>
          <ExportButton data={sp2dList || []} filename="laporan-sp2d" />
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
              onTanggalDariChange={handleFilterChange(setTanggalDari)}
              onTanggalSampaiChange={handleFilterChange(setTanggalSampai)}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={statusFilter} onValueChange={handleFilterChange(setStatusFilter)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Semua Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="diproses">Diproses</SelectItem>
                    <SelectItem value="diterbitkan">Diterbitkan</SelectItem>
                    <SelectItem value="dibatalkan">Dibatalkan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>OPD</Label>
                <Select value={opdFilter} onValueChange={handleFilterChange(setOpdFilter)}>
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
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <SummaryCard
            title="Total SP2D"
            value={totalSp2d}
            icon={FileText}
            description={`Dari filter yang dipilih`}
          />
          <SummaryCard
            title="Nilai SP2D (Bruto)"
            value={formatCurrency(totalNilai)}
            icon={DollarSign}
            description={`Total nilai SP2D`}
          />
          <SummaryCard
            title="Total Potongan"
            value={formatCurrency(totalPotongan)}
            icon={DollarSign}
            description={`Total potongan pajak`}
          />
          <SummaryCard
            title="Nilai Diterima (Netto)"
            value={formatCurrency(totalDiterima)}
            icon={DollarSign}
            description={`Total nilai diterima`}
          />
        </div>

        {/* Charts */}
        {sp2dList && sp2dList.length > 0 && <ChartSp2d data={sp2dList} />}

        {/* Data Table */}
        <Card>
          <CardHeader>
            <CardTitle>Data SP2D</CardTitle>
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
            ) : sp2dList && sp2dList.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nomor SP2D</TableHead>
                      <TableHead>Nomor SPM</TableHead>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>OPD</TableHead>
                      <TableHead className="text-right">Nilai SP2D</TableHead>
                      <TableHead className="text-right">Total Potongan</TableHead>
                      <TableHead className="text-right">Nilai Diterima</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sp2dList.map((sp2d: any) => (
                      <TableRow key={sp2d.id}>
                        <TableCell className="font-medium">
                          {sp2d.nomor_sp2d || "-"}
                        </TableCell>
                        <TableCell>{sp2d.spm?.nomor_spm || "-"}</TableCell>
                        <TableCell>
                          {sp2d.tanggal_sp2d
                            ? format(parseISO(sp2d.tanggal_sp2d), "dd MMM yyyy", {
                                locale: id,
                              })
                            : "-"}
                        </TableCell>
                        <TableCell>{sp2d.spm?.opd?.nama_opd || "-"}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(sp2d.nilai_sp2d)}
                        </TableCell>
                        <TableCell className="text-right text-destructive">
                          - {formatCurrency(sp2d.total_potongan || 0)}
                        </TableCell>
                        <TableCell className="text-right font-semibold text-success">
                          {formatCurrency(sp2d.nilai_diterima || sp2d.nilai_sp2d)}
                        </TableCell>
                        <TableCell>{getStatusBadge(sp2d.status)}</TableCell>
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
                  Menampilkan {sp2dList.length} dari {totalCount} data
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
                    disabled={sp2dList.length < pageSize}
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

export default LaporanSp2d;
