import { useState, useMemo } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, DollarSign, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLaporanKeuangan } from "@/hooks/useLaporanKeuangan";
import { useOpdList } from "@/hooks/useOpdList";
import { FilterPeriode } from "./components/FilterPeriode";
import { SummaryCard } from "./components/SummaryCard";
import { ExportButton } from "./components/ExportButton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/currency";

const LaporanKeuangan = () => {
  const navigate = useNavigate();
  const [tanggalDari, setTanggalDari] = useState("");
  const [tanggalSampai, setTanggalSampai] = useState("");
  const [opdFilter, setOpdFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data: opdList } = useOpdList();
  const { data, isLoading, error } = useLaporanKeuangan({
    tanggal_dari: tanggalDari,
    tanggal_sampai: tanggalSampai,
    opd_id: opdFilter,
    page: currentPage,
    pageSize: pageSize,
  });

  const spmData = data?.spm?.data || [];
  const sp2dData = data?.sp2d?.data || [];
  const spmTotalCount = data?.spm?.count || 0;
  const sp2dTotalCount = data?.sp2d?.count || 0;

  // Reset to page 1 when filters change
  const handleFilterChange = (setter: (value: string) => void) => (value: string) => {
    setter(value);
    setCurrentPage(1);
  };

  // Group by OPD
  const opdSummary = useMemo(() => {
    const summary: any = {};

    spmData.forEach((spm: any) => {
      const opdId = spm.opd?.id;
      const opdName = spm.opd?.nama_opd || "Tidak Diketahui";
      
      if (!summary[opdId]) {
        summary[opdId] = {
          nama_opd: opdName,
          jumlah_spm: 0,
          total_nilai_spm: 0,
          total_nilai_sp2d: 0,
        };
      }
      
      summary[opdId].jumlah_spm += 1;
      summary[opdId].total_nilai_spm += Number(spm.nilai_spm || 0);
    });

    sp2dData.forEach((sp2d: any) => {
      const opdId = sp2d.spm?.opd?.id;
      
      if (summary[opdId]) {
        summary[opdId].total_nilai_sp2d += Number(sp2d.nilai_sp2d || 0);
      }
    });

    return Object.values(summary);
  }, [spmData, sp2dData]);

  const totalSpm = spmData.length;
  const totalNilaiSpm = spmData.reduce((sum: number, item: any) => sum + Number(item.nilai_spm || 0), 0);
  const totalNilaiSp2d = sp2dData.reduce((sum: number, item: any) => sum + Number(item.nilai_sp2d || 0), 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/laporan")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Laporan Keuangan</h1>
              <p className="text-muted-foreground">
                Ringkasan nilai per OPD dan Program
              </p>
            </div>
          </div>
          <ExportButton data={opdSummary} filename="laporan-keuangan" />
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SummaryCard
            title="Total SPM"
            value={totalSpm}
            icon={DollarSign}
          />
          <SummaryCard
            title="Total Nilai SPM"
            value={formatCurrency(totalNilaiSpm)}
            icon={DollarSign}
          />
          <SummaryCard
            title="Total Nilai SP2D"
            value={formatCurrency(totalNilaiSp2d)}
            icon={TrendingUp}
          />
        </div>

        {/* Data Table */}
        <Card>
          <CardHeader>
            <CardTitle>Ringkasan per OPD</CardTitle>
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
            ) : opdSummary && opdSummary.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>OPD</TableHead>
                      <TableHead className="text-right">Jumlah SPM</TableHead>
                      <TableHead className="text-right">Total Nilai SPM</TableHead>
                      <TableHead className="text-right">Total Nilai SP2D Cair</TableHead>
                      <TableHead className="text-right">Persentase Realisasi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {opdSummary.map((item: any, index: number) => {
                      const realisasi = item.total_nilai_spm > 0
                        ? ((item.total_nilai_sp2d / item.total_nilai_spm) * 100).toFixed(2)
                        : 0;
                      
                      return (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            {item.nama_opd}
                          </TableCell>
                          <TableCell className="text-right">
                            {item.jumlah_spm}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(item.total_nilai_spm)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(item.total_nilai_sp2d)}
                          </TableCell>
                          <TableCell className="text-right">
                            {realisasi}%
                          </TableCell>
                        </TableRow>
                      );
                    })}
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

export default LaporanKeuangan;
