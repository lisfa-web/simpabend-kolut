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

  const { data: opdList } = useOpdList();
  const { data: sp2dList, isLoading, error } = useLaporanSp2d({
    tanggal_dari: tanggalDari,
    tanggal_sampai: tanggalSampai,
    status: statusFilter,
    opd_id: opdFilter,
  });

  const totalSp2d = sp2dList?.length || 0;
  const totalNilai = sp2dList?.reduce((sum, item) => sum + Number(item.nilai_sp2d || 0), 0) || 0;

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
              onTanggalDariChange={setTanggalDari}
              onTanggalSampaiChange={setTanggalSampai}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
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
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SummaryCard
            title="Total SP2D"
            value={totalSp2d}
            icon={FileText}
            description={`Dari filter yang dipilih`}
          />
          <SummaryCard
            title="Total Nilai Cair"
            value={formatCurrency(totalNilai)}
            icon={DollarSign}
            description={`Total pencairan`}
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
                      <TableHead className="text-right">Nilai</TableHead>
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
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default LaporanSp2d;
