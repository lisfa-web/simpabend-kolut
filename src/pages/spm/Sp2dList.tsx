import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Eye, Loader2, FileCheck } from "lucide-react";
import { useSp2dList } from "@/hooks/useSp2dList";
import { Sp2dStatusBadge } from "./components/Sp2dStatusBadge";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/currency";

const Sp2dList = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const { data: sp2dList, isLoading, error } = useSp2dList({
    search,
    status: statusFilter,
  });

  // Fetch SPM yang sudah disetujui dan belum ada SP2D
  const { data: approvedSpm, isLoading: isLoadingApproved } = useQuery({
    queryKey: ["approved-spm-for-sp2d"],
    queryFn: async () => {
      // Get all SPM IDs that already have SP2D
      const { data: sp2dList, error: sp2dError } = await supabase
        .from("sp2d")
        .select("spm_id");

      if (sp2dError) throw sp2dError;

      const usedSpmIds = sp2dList?.map((sp2d) => sp2d.spm_id) || [];

      // Fetch approved SPM excluding those with SP2D
      let query = supabase
        .from("spm")
        .select(`
          *,
          opd:opd_id(nama_opd, kode_opd),
          program:program_id(nama_program),
          kegiatan:kegiatan_id(nama_kegiatan),
          subkegiatan:subkegiatan_id(nama_subkegiatan),
          vendor:vendor_id(nama_vendor)
        `)
        .eq("status", "disetujui")
        .order("tanggal_disetujui", { ascending: false });

      if (usedSpmIds.length > 0) {
        query = query.not("id", "in", `(${usedSpmIds.join(",")})`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Daftar SP2D</h1>
            <p className="text-muted-foreground">
              Kelola Surat Perintah Pencairan Dana
            </p>
          </div>
          <Button onClick={() => navigate("/sp2d/buat")}>
            <Plus className="h-4 w-4 mr-2" />
            Buat SP2D
          </Button>
        </div>

        <Tabs defaultValue="ready" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="ready" className="gap-2">
              <FileCheck className="h-4 w-4" />
              SPM Siap Diproses
              {approvedSpm && approvedSpm.length > 0 && (
                <Badge variant="secondary" className="ml-1">{approvedSpm.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="list">Daftar SP2D</TabsTrigger>
          </TabsList>

          <TabsContent value="ready" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>SPM yang Sudah Disetujui</CardTitle>
                <p className="text-sm text-muted-foreground">
                  SPM yang telah disetujui Kepala BKAD dan siap untuk diproses menjadi SP2D
                </p>
              </CardHeader>
              <CardContent className="p-0">
                {isLoadingApproved ? (
                  <div className="flex justify-center items-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nomor SPM</TableHead>
                        <TableHead>OPD</TableHead>
                        <TableHead>Program</TableHead>
                        <TableHead>Nilai SPM</TableHead>
                        <TableHead>Tanggal Disetujui</TableHead>
                        <TableHead>Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {approvedSpm?.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            <div className="flex flex-col items-center gap-2">
                              <FileCheck className="h-12 w-12 text-muted-foreground/50" />
                              <p className="text-muted-foreground">
                                Tidak ada SPM yang siap diproses
                              </p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        approvedSpm?.map((spm) => (
                          <TableRow key={spm.id}>
                            <TableCell className="font-medium">
                              {spm.nomor_spm || "-"}
                            </TableCell>
                            <TableCell>{spm.opd?.nama_opd || "-"}</TableCell>
                            <TableCell>{spm.program?.nama_program || "-"}</TableCell>
                            <TableCell>{formatCurrency(spm.nilai_spm)}</TableCell>
                            <TableCell>
                              {spm.tanggal_disetujui
                                ? format(new Date(spm.tanggal_disetujui), "dd MMM yyyy HH:mm", {
                                    locale: localeId,
                                  })
                                : "-"}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => navigate(`/input-spm/detail/${spm.id}`)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => navigate("/sp2d/buat", { state: { spmId: spm.id } })}
                                >
                                  <Plus className="h-4 w-4 mr-1" />
                                  Buat SP2D
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="list" className="space-y-4">

        <Card>
          <CardHeader>
            <CardTitle>Filter & Pencarian</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari nomor SP2D/SPM..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select 
                value={statusFilter || "all"} 
                onValueChange={(value) => setStatusFilter(value === "all" ? "" : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Semua Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="diproses">Diproses</SelectItem>
                  <SelectItem value="diterbitkan">Diterbitkan</SelectItem>
                  <SelectItem value="cair">Dicairkan</SelectItem>
                  <SelectItem value="gagal">Gagal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

            <Card>
              <CardHeader>
                <CardTitle>Filter & Pencarian</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Cari nomor SP2D/SPM..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Select 
                    value={statusFilter || "all"} 
                    onValueChange={(value) => setStatusFilter(value === "all" ? "" : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Semua Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="diproses">Diproses</SelectItem>
                      <SelectItem value="diterbitkan">Diterbitkan</SelectItem>
                      <SelectItem value="cair">Dicairkan</SelectItem>
                      <SelectItem value="gagal">Gagal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="flex justify-center items-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : error ? (
                  <div className="flex flex-col justify-center items-center p-8 text-center">
                    <p className="text-destructive mb-4">Gagal memuat data SP2D</p>
                    <Button variant="outline" onClick={() => window.location.reload()}>
                      Coba Lagi
                    </Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nomor SP2D</TableHead>
                        <TableHead>Nomor SPM</TableHead>
                        <TableHead>OPD</TableHead>
                        <TableHead>Nilai SP2D</TableHead>
                        <TableHead>Tanggal SP2D</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sp2dList?.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8">
                            Tidak ada data SP2D
                          </TableCell>
                        </TableRow>
                      ) : (
                        sp2dList?.map((sp2d) => (
                          <TableRow key={sp2d.id}>
                            <TableCell className="font-medium">
                              {sp2d.nomor_sp2d || "-"}
                            </TableCell>
                            <TableCell>{sp2d.spm?.nomor_spm || "-"}</TableCell>
                            <TableCell>{sp2d.spm?.opd?.nama_opd || "-"}</TableCell>
                            <TableCell>
                              {new Intl.NumberFormat("id-ID", {
                                style: "currency",
                                currency: "IDR",
                              }).format(Number(sp2d.nilai_sp2d))}
                            </TableCell>
                            <TableCell>
                              {sp2d.tanggal_sp2d
                                ? format(new Date(sp2d.tanggal_sp2d), "dd MMM yyyy", {
                                    locale: localeId,
                                  })
                                : "-"}
                            </TableCell>
                            <TableCell>
                              <Sp2dStatusBadge status={sp2d.status || "pending"} />
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate(`/sp2d/${sp2d.id}`)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Sp2dList;
