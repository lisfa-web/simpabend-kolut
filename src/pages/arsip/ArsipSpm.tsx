import { useState } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useArsipSpmList } from "@/hooks/useArsipSpmList";
import { formatCurrency } from "@/lib/currency";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Search, FileSpreadsheet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { usePagination } from "@/hooks/usePagination";
import { TablePagination } from "@/pages/laporan/components/TablePagination";
import { exportToExcel, arsipSpmColumns } from "@/lib/excelExport";
import { toast } from "sonner";

const ArsipSpm = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [search, setSearch] = useState("");

  const { data: arsipList, isLoading } = useArsipSpmList({
    startDate,
    endDate,
    search,
  });

  const { pagination, paginateData, setPageSize, goToPage } = usePagination(10);
  const paginatedData = paginateData(arsipList);
  const totalItems = arsipList?.length || 0;

  const handleReset = () => {
    setStartDate("");
    setEndDate("");
    setSearch("");
    goToPage(0);
  };

  const handleExport = () => {
    if (!arsipList || arsipList.length === 0) {
      toast.error("Tidak ada data untuk diekspor");
      return;
    }
    exportToExcel(arsipList, "arsip-spm", arsipSpmColumns);
    toast.success("Data berhasil diekspor");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Arsip SPM</h1>
            <p className="text-muted-foreground">
              Daftar arsip dokumen SPM yang telah disetujui
            </p>
          </div>
          <Button onClick={handleExport} variant="outline">
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                type="date"
                placeholder="Tanggal Mulai"
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value); goToPage(0); }}
              />
              <Input
                type="date"
                placeholder="Tanggal Akhir"
                value={endDate}
                onChange={(e) => { setEndDate(e.target.value); goToPage(0); }}
              />
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari nomor/penerima..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); goToPage(0); }}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" onClick={handleReset}>
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">No</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Nomor SPM</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Tanggal</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">OPD</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Penerima</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold">Nilai SPM</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold">Nilai Bersih</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                        Memuat data...
                      </td>
                    </tr>
                  ) : paginatedData?.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                        Tidak ada data arsip
                      </td>
                    </tr>
                  ) : (
                    paginatedData?.map((item, index) => (
                      <tr key={item.id} className="border-b hover:bg-muted/50">
                        <td className="px-4 py-3 text-sm">{pagination.pageIndex * pagination.pageSize + index + 1}</td>
                        <td className="px-4 py-3 text-sm font-medium">{item.nomor_spm}</td>
                        <td className="px-4 py-3 text-sm">
                          {format(new Date(item.tanggal_spm), "dd MMM yyyy", { locale: id })}
                        </td>
                        <td className="px-4 py-3 text-sm">{item.opd?.nama_opd}</td>
                        <td className="px-4 py-3 text-sm">{item.nama_penerima}</td>
                        <td className="px-4 py-3 text-sm text-right">{formatCurrency(item.nilai_spm)}</td>
                        <td className="px-4 py-3 text-sm text-right">{formatCurrency(item.nilai_bersih)}</td>
                        <td className="px-4 py-3 text-sm">
                          <Badge variant="secondary">{item.status}</Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {totalItems > 0 && (
              <div className="p-4 border-t">
                <TablePagination
                  currentPage={pagination.pageIndex}
                  pageSize={pagination.pageSize}
                  totalItems={totalItems}
                  onPageChange={goToPage}
                  onPageSizeChange={setPageSize}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ArsipSpm;
