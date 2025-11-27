import { useState } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSpmList } from "@/hooks/useSpmList";
import { useSp2dList } from "@/hooks/useSp2dList";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Search, Clock } from "lucide-react";
import { ExportButton } from "@/pages/laporan/components/ExportButton";
import { Badge } from "@/components/ui/badge";
import { SpmStatusBadge } from "@/pages/spm/components/SpmStatusBadge";
import { Sp2dStatusBadge } from "@/pages/spm/components/Sp2dStatusBadge";

const TimelineIndex = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [search, setSearch] = useState("");

  const { data: spmList, isLoading: spmLoading } = useSpmList({
    tanggal_dari: startDate,
    tanggal_sampai: endDate,
    search,
  });

  const { data: sp2dList, isLoading: sp2dLoading } = useSp2dList({
    tanggal_dari: startDate,
    tanggal_sampai: endDate,
    search,
  });

  const handleReset = () => {
    setStartDate("");
    setEndDate("");
    setSearch("");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Clock className="h-8 w-8 text-primary" />
              Timeline Dokumen
            </h1>
            <p className="text-muted-foreground">
              Timeline proses SPM dan SP2D Anda
            </p>
          </div>
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
                onChange={(e) => setStartDate(e.target.value)}
              />
              <Input
                type="date"
                placeholder="Tanggal Akhir"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari nomor dokumen..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" onClick={handleReset}>
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="spm" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="spm">Timeline SPM</TabsTrigger>
            <TabsTrigger value="sp2d">Timeline SP2D</TabsTrigger>
          </TabsList>

          <TabsContent value="spm">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Timeline SPM</CardTitle>
                <ExportButton data={spmList || []} filename="timeline-spm" />
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b bg-muted/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Nomor SPM</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Tanggal Ajuan</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Tahapan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {spmLoading ? (
                        <tr>
                          <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                            Memuat data...
                          </td>
                        </tr>
                      ) : spmList?.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                            Tidak ada data timeline
                          </td>
                        </tr>
                      ) : (
                        spmList?.map((spm) => (
                          <tr key={spm.id} className="border-b hover:bg-muted/50">
                            <td className="px-4 py-3 text-sm font-medium">{spm.nomor_spm}</td>
                            <td className="px-4 py-3 text-sm">
                              {spm.tanggal_ajuan && format(new Date(spm.tanggal_ajuan), "dd MMM yyyy", { locale: id })}
                            </td>
                            <td className="px-4 py-3">
                              <SpmStatusBadge status={spm.status} />
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <div className="space-y-1">
                                {spm.tanggal_resepsionis && (
                                  <div className="text-xs text-muted-foreground">
                                    ✓ Resepsionis: {format(new Date(spm.tanggal_resepsionis), "dd/MM HH:mm")}
                                  </div>
                                )}
                                {spm.tanggal_pbmd && (
                                  <div className="text-xs text-muted-foreground">
                                    ✓ PBMD: {format(new Date(spm.tanggal_pbmd), "dd/MM HH:mm")}
                                  </div>
                                )}
                                {spm.tanggal_akuntansi && (
                                  <div className="text-xs text-muted-foreground">
                                    ✓ Akuntansi: {format(new Date(spm.tanggal_akuntansi), "dd/MM HH:mm")}
                                  </div>
                                )}
                                {spm.tanggal_perbendaharaan && (
                                  <div className="text-xs text-muted-foreground">
                                    ✓ Perbendaharaan: {format(new Date(spm.tanggal_perbendaharaan), "dd/MM HH:mm")}
                                  </div>
                                )}
                                {spm.tanggal_kepala_bkad && (
                                  <div className="text-xs text-muted-foreground">
                                    ✓ Kepala BKAD: {format(new Date(spm.tanggal_kepala_bkad), "dd/MM HH:mm")}
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sp2d">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Timeline SP2D</CardTitle>
                <ExportButton data={sp2dList || []} filename="timeline-sp2d" />
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b bg-muted/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Nomor SP2D</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Tanggal Terbit</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Tahapan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sp2dLoading ? (
                        <tr>
                          <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                            Memuat data...
                          </td>
                        </tr>
                      ) : sp2dList?.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                            Tidak ada data timeline
                          </td>
                        </tr>
                      ) : (
                        sp2dList?.map((sp2d) => (
                          <tr key={sp2d.id} className="border-b hover:bg-muted/50">
                            <td className="px-4 py-3 text-sm font-medium">{sp2d.nomor_sp2d}</td>
                            <td className="px-4 py-3 text-sm">
                              {sp2d.tanggal_sp2d && format(new Date(sp2d.tanggal_sp2d), "dd MMM yyyy", { locale: id })}
                            </td>
                            <td className="px-4 py-3">
                              <Sp2dStatusBadge status={sp2d.status} />
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <div className="space-y-1">
                                {sp2d.tanggal_sp2d && (
                                  <div className="text-xs text-muted-foreground">
                                    ✓ Diterbitkan: {format(new Date(sp2d.tanggal_sp2d), "dd/MM HH:mm")}
                                  </div>
                                )}
                                {sp2d.tanggal_kirim_bank && (
                                  <div className="text-xs text-muted-foreground">
                                    ✓ Kirim Bank: {format(new Date(sp2d.tanggal_kirim_bank), "dd/MM HH:mm")}
                                  </div>
                                )}
                                {sp2d.tanggal_konfirmasi_bank && (
                                  <div className="text-xs text-muted-foreground">
                                    ✓ Konfirmasi Bank: {format(new Date(sp2d.tanggal_konfirmasi_bank), "dd/MM HH:mm")}
                                  </div>
                                )}
                                {sp2d.tanggal_cair && (
                                  <div className="text-xs text-muted-foreground">
                                    ✓ Cair: {format(new Date(sp2d.tanggal_cair), "dd/MM HH:mm")}
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default TimelineIndex;
