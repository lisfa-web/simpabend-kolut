import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { usePagination } from "@/hooks/usePagination";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, Eye, Loader2, FileCheck, Banknote, AlertCircle } from "lucide-react";
import { useSp2dList } from "@/hooks/useSp2dList";
import { useSp2dMutation } from "@/hooks/useSp2dMutation";
import { Sp2dStatusBadge } from "./components/Sp2dStatusBadge";
import { Sp2dFilters } from "./components/Sp2dFilters";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/currency";
import { generateSpmPDF } from "@/lib/spmPdfUtils";
import { getJenisSpmLabel } from "@/lib/jenisSpmOptions";
import { useAuth } from "@/hooks/useAuth";

const Sp2dList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { hasRole } = useAuth();
  const [selectedSp2dId, setSelectedSp2dId] = useState<string | null>(null);
  const [showDisburseDialog, setShowDisburseDialog] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    opd_id: "all",
    tanggal_dari: "",
    tanggal_sampai: "",
  });

  // Pagination hooks
  const paginationReady = usePagination(10);
  const paginationTerbit = usePagination(10);
  const paginationUjiBank = usePagination(10);
  const paginationCair = usePagination(10);

  // Prepare filter params for queries
  const filterParams = {
    search: filters.search,
    opd_id: filters.opd_id !== "all" ? filters.opd_id : undefined,
    tanggal_dari: filters.tanggal_dari || undefined,
    tanggal_sampai: filters.tanggal_sampai || undefined,
  };

  // Query for SP2D Terbit (pending & diterbitkan)
  const { data: sp2dTerbit, isLoading: isLoadingTerbit } = useSp2dList({
    ...filterParams,
    status: ["pending", "diterbitkan"],
  });

  // Query for SP2D in bank testing phase
  const { data: sp2dUjiBank, isLoading: isLoadingUjiBank } = useSp2dList({
    ...filterParams,
    status: "diuji_bank",
  });

  // Query for SP2D Cair
  const { data: sp2dCair, isLoading: isLoadingCair } = useSp2dList({
    ...filterParams,
    status: "cair",
  });

  const { disburseSp2d } = useSp2dMutation();

  // Query untuk logo dan nama instansi
  const { data: configData } = useQuery({
    queryKey: ["sistem-config-sp2d"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("config_sistem")
        .select("key, value")
        .in("key", ["logo_instansi_url", "nama_instansi"]);
      
      if (error) throw error;
      
      const config: Record<string, string> = {};
      data?.forEach(item => {
        config[item.key] = item.value;
      });
      
      return {
        logoUrl: config.logo_instansi_url || null,
        namaInstansi: config.nama_instansi || "PEMERINTAH KABUPATEN KOLAKA UTARA"
      };
    },
  });

  const handleDisburse = () => {
    if (selectedSp2dId) {
      disburseSp2d.mutate(selectedSp2dId, {
        onSuccess: () => {
          setShowDisburseDialog(false);
          setSelectedSp2dId(null);
        },
      });
    }
  };

  const handlePrintSpm = (spm: any) => {
    if (!spm) return;

    const spmData = {
      nomor_spm: spm.nomor_spm || "DRAFT",
      tanggal_spm: spm.tanggal_ajuan || new Date().toISOString(),
      tanggal_ajuan: spm.tanggal_ajuan || new Date().toISOString(),
      jenis_spm: spm.jenis_spm?.nama_jenis || "SPM",
      opd: {
        nama_opd: spm.opd?.nama_opd || "-",
        kode_opd: spm.opd?.kode_opd || "-",
      },
      vendor: spm.vendor ? {
        nama_vendor: spm.vendor.nama_vendor,
        npwp: spm.vendor.npwp || "-",
        nama_bank: spm.vendor.nama_bank || "-",
        nomor_rekening: spm.vendor.nomor_rekening || "-",
        nama_rekening: spm.vendor.nama_rekening || "-",
      } : undefined,
      uraian: spm.uraian || "-",
      nilai_spm: spm.nilai_spm,
      potongan_pajak: spm.potongan_pajak_spm?.map((pajak: any) => ({
        jenis_pajak: pajak.jenis_pajak || pajak.uraian,
        rekening_pajak: pajak.rekening_pajak || "-",
        uraian: pajak.uraian || "",
        tarif: pajak.tarif,
        dasar_pengenaan: pajak.dasar_pengenaan,
        jumlah_pajak: pajak.jumlah_pajak,
      })) || [],
      total_potongan: spm.total_potongan || 0,
      nilai_bersih: spm.nilai_bersih || spm.nilai_spm,
    };

    generateSpmPDF(
      spmData, 
      configData?.logoUrl,
      "Kuasa Bendahara Umum Daerah",
      "",
      "Lasusua",
      configData?.namaInstansi
    );

    toast({
      title: "Mencetak SPM",
      description: "Dokumen sedang disiapkan untuk dicetak",
    });
  };

  // Fetch SPM yang sudah disetujui dan belum ada SP2D
  const { data: approvedSpm, isLoading: isLoadingApproved } = useQuery({
    queryKey: ["approved-spm-for-sp2d", filters.search],
    queryFn: async () => {
      try {
        // Ambil semua SPM ID yang sudah punya SP2D
        const { data: sp2dList, error: sp2dError } = await supabase
          .from("sp2d")
          .select("spm_id");
        if (sp2dError) {
          console.warn("SP2D fetch restricted or failed; proceeding without exclusion.", sp2dError);
        }

        const usedSpmIds = (sp2dList || [])
          .map((s) => s.spm_id)
          .filter(Boolean);

        // Ambil SPM yang statusnya sudah di tahap akhir (siap SP2D)
        let query = supabase
          .from("spm")
          .select(`
            id,
            nomor_spm,
            nilai_spm,
            tanggal_disetujui,
            opd:opd_id(nama_opd, kode_opd),
            jenis_spm:jenis_spm_id(nama_jenis)
          `)
          .in("status", ["disetujui", "kepala_bkad_review"]) 
          .order("tanggal_disetujui", { ascending: false })
          .limit(100);

        if (usedSpmIds.length > 0) {
          const inList = `(${usedSpmIds.map((id: string) => `"${id}"`).join(",")})`;
          query = query.not("id", "in", inList);
        }

        if (filters.search) {
          query = query.ilike("nomor_spm", `%${filters.search}%`);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data || [];
      } catch (err) {
        console.error("Error fetching approved SPM:", err);
        return [];
      }
    },
  });

  // Check if user has permission to view SP2D data
  const canViewSp2d = hasRole("kuasa_bud") || hasRole("kepala_bkad") || 
                      hasRole("administrator") || hasRole("super_admin") ||
                      hasRole("bendahara_opd");

  const canManageSp2d = hasRole("kuasa_bud") || hasRole("administrator") || 
                        hasRole("super_admin");

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {!canViewSp2d && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Akses Terbatas</AlertTitle>
            <AlertDescription>
              Anda tidak memiliki akses untuk melihat data SP2D. Halaman ini hanya dapat diakses oleh Kuasa BUD, Kepala BKAD, Administrator, dan Bendahara OPD.
            </AlertDescription>
          </Alert>
        )}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Pengelolaan SP2D</h1>
            <p className="text-muted-foreground">
              Kelola Surat Perintah Pencairan Dana
            </p>
          </div>
          {canManageSp2d && (
            <Button onClick={() => navigate("/sp2d/buat")}>
              <Plus className="h-4 w-4 mr-2" />
              Terbit SP2D
            </Button>
          )}
        </div>

        {/* Filter Component */}
        <Sp2dFilters 
          onFilterChange={setFilters}
          initialFilters={filters}
        />

        <Tabs defaultValue="ready" className="w-full">
          <TabsList className="grid w-full max-w-2xl grid-cols-4">
            <TabsTrigger value="ready" className="gap-2">
              <FileCheck className="h-4 w-4" />
              SPM Siap Diproses
              {approvedSpm && approvedSpm.length > 0 && (
                <Badge variant="secondary" className="ml-1">{approvedSpm.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="terbit" className="gap-2">
              <FileCheck className="h-4 w-4" />
              SP2D Terbit
              {sp2dTerbit && sp2dTerbit.length > 0 && (
                <Badge variant="secondary" className="ml-1">{sp2dTerbit.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="uji" className="gap-2">
              <Banknote className="h-4 w-4" />
              Uji Bank
              {sp2dUjiBank && sp2dUjiBank.length > 0 && (
                <Badge variant="secondary" className="ml-1">{sp2dUjiBank.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="cair" className="gap-2">
              <Banknote className="h-4 w-4" />
              SP2D Cair
              {sp2dCair && sp2dCair.length > 0 && (
                <Badge variant="secondary" className="ml-1">{sp2dCair.length}</Badge>
              )}
            </TabsTrigger>
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
                    <TableHeader className="sticky top-0 z-10">
                      <TableRow className="bg-gradient-to-r from-primary/90 via-primary/80 to-primary/90 hover:from-primary hover:via-primary/90 hover:to-primary border-b-2 border-primary">
                        <TableHead className="text-primary-foreground font-bold">Nomor SPM</TableHead>
                        <TableHead className="text-primary-foreground font-bold">OPD</TableHead>
                        <TableHead className="text-primary-foreground font-bold">Jenis SPM</TableHead>
                        <TableHead className="text-primary-foreground font-bold">Nilai SPM</TableHead>
                        <TableHead className="text-primary-foreground font-bold">Tanggal Disetujui</TableHead>
                        <TableHead className="text-primary-foreground font-bold">Aksi</TableHead>
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
                        paginationReady.paginateData(approvedSpm)?.map((spm, index) => {
                          const colors = [
                            "bg-blue-50 hover:bg-blue-100",
                            "bg-green-50 hover:bg-green-100", 
                            "bg-purple-50 hover:bg-purple-100",
                            "bg-pink-50 hover:bg-pink-100",
                            "bg-amber-50 hover:bg-amber-100",
                            "bg-cyan-50 hover:bg-cyan-100",
                            "bg-rose-50 hover:bg-rose-100",
                            "bg-indigo-50 hover:bg-indigo-100",
                          ];
                          return (
                          <TableRow 
                            key={spm.id}
                            className={`${colors[index % colors.length]} transition-colors duration-200`}
                          >
                            <TableCell className="font-medium">
                              {spm.nomor_spm || "-"}
                            </TableCell>
                            <TableCell>{spm.opd?.nama_opd || "-"}</TableCell>
                            <TableCell>{(spm as any).jenis_spm?.nama_jenis || "-"}</TableCell>
                            <TableCell>{formatCurrency(spm.nilai_spm)}</TableCell>
                            <TableCell>
                              {spm.tanggal_disetujui
                                ? format(new Date(spm.tanggal_disetujui), "dd MMM yyyy HH:mm", {
                                    locale: localeId,
                                  })
                                : (spm as any).tanggal_kepala_bkad
                                ? format(new Date((spm as any).tanggal_kepala_bkad), "dd MMM yyyy HH:mm", {
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
                                  Terbit SP2D
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                )}
                {approvedSpm && approvedSpm.length > 0 && (
                  <DataTablePagination
                    pageIndex={paginationReady.pagination.pageIndex}
                    pageSize={paginationReady.pagination.pageSize}
                    pageCount={paginationReady.getPageCount(approvedSpm.length)}
                    totalItems={approvedSpm.length}
                    onPageChange={paginationReady.goToPage}
                    onPageSizeChange={paginationReady.setPageSize}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="terbit" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Daftar SP2D Terbit</CardTitle>
                <p className="text-sm text-muted-foreground">
                  SP2D yang baru dibuat atau sudah terbit, siap dikirim ke bank
                </p>
              </CardHeader>
              <CardContent className="p-0">
                {isLoadingTerbit ? (
                  <div className="flex justify-center items-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader className="sticky top-0 z-10">
                      <TableRow className="bg-gradient-to-r from-primary/90 via-primary/80 to-primary/90 hover:from-primary hover:via-primary/90 hover:to-primary border-b-2 border-primary">
                        <TableHead className="text-primary-foreground font-bold">Nomor SP2D</TableHead>
                        <TableHead className="text-primary-foreground font-bold">Nomor SPM</TableHead>
                        <TableHead className="text-primary-foreground font-bold">OPD</TableHead>
                        <TableHead className="text-primary-foreground font-bold">Nilai SP2D</TableHead>
                        <TableHead className="text-primary-foreground font-bold">Tanggal Terbit</TableHead>
                        <TableHead className="text-primary-foreground font-bold">Status</TableHead>
                        <TableHead className="text-primary-foreground font-bold">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sp2dTerbit?.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8">
                            <div className="flex flex-col items-center gap-2">
                              <FileCheck className="h-12 w-12 text-muted-foreground/50" />
                              <p className="text-muted-foreground">
                                Tidak ada SP2D yang terbit
                              </p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginationTerbit.paginateData(sp2dTerbit)?.map((sp2d, index) => {
                          const colors = [
                            "bg-blue-50 hover:bg-blue-100",
                            "bg-green-50 hover:bg-green-100", 
                            "bg-purple-50 hover:bg-purple-100",
                            "bg-pink-50 hover:bg-pink-100",
                            "bg-amber-50 hover:bg-amber-100",
                            "bg-cyan-50 hover:bg-cyan-100",
                            "bg-rose-50 hover:bg-rose-100",
                            "bg-indigo-50 hover:bg-indigo-100",
                          ];
                          return (
                          <TableRow 
                            key={sp2d.id}
                            className={`${colors[index % colors.length]} transition-colors duration-200`}
                          >
                            <TableCell className="font-medium">
                              {sp2d.nomor_sp2d || "-"}
                            </TableCell>
                            <TableCell>{sp2d.spm?.nomor_spm || "-"}</TableCell>
                            <TableCell>{(sp2d as any).opd?.nama_opd || "-"}</TableCell>
                            <TableCell>
                              {formatCurrency(Number(sp2d.nilai_sp2d))}
                            </TableCell>
                            <TableCell>
                              {sp2d.tanggal_sp2d
                                ? format(new Date(sp2d.tanggal_sp2d), "dd MMM yyyy HH:mm", {
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
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                )}
                {sp2dTerbit && sp2dTerbit.length > 0 && (
                  <DataTablePagination
                    pageIndex={paginationTerbit.pagination.pageIndex}
                    pageSize={paginationTerbit.pagination.pageSize}
                    pageCount={paginationTerbit.getPageCount(sp2dTerbit.length)}
                    totalItems={sp2dTerbit.length}
                    onPageChange={paginationTerbit.goToPage}
                    onPageSizeChange={paginationTerbit.setPageSize}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="uji" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>SP2D dalam Tahap Uji Bank</CardTitle>
                <p className="text-sm text-muted-foreground">
                  SP2D yang sedang dalam proses uji di Bank Sultra untuk pemindahbukuan
                </p>
              </CardHeader>
              <CardContent className="p-0">
                {isLoadingUjiBank ? (
                  <div className="flex justify-center items-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader className="sticky top-0 z-10">
                      <TableRow className="bg-gradient-to-r from-primary/90 via-primary/80 to-primary/90 hover:from-primary hover:via-primary/90 hover:to-primary border-b-2 border-primary">
                        <TableHead className="text-primary-foreground font-bold">Nomor SP2D</TableHead>
                        <TableHead className="text-primary-foreground font-bold">Nomor SPM</TableHead>
                        <TableHead className="text-primary-foreground font-bold">Nomor Penguji</TableHead>
                        <TableHead className="text-primary-foreground font-bold">OPD</TableHead>
                        <TableHead className="text-primary-foreground font-bold">Nilai SP2D</TableHead>
                        <TableHead className="text-primary-foreground font-bold">Dikirim ke Bank</TableHead>
                        <TableHead className="text-primary-foreground font-bold">Status</TableHead>
                        <TableHead className="text-primary-foreground font-bold">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sp2dUjiBank?.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8">
                            <div className="flex flex-col items-center gap-2">
                              <Banknote className="h-12 w-12 text-muted-foreground/50" />
                              <p className="text-muted-foreground">
                                Tidak ada SP2D dalam tahap uji bank
                              </p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginationUjiBank.paginateData(sp2dUjiBank)?.map((sp2d, index) => {
                          const colors = [
                            "bg-blue-50 hover:bg-blue-100",
                            "bg-green-50 hover:bg-green-100", 
                            "bg-purple-50 hover:bg-purple-100",
                            "bg-pink-50 hover:bg-pink-100",
                            "bg-amber-50 hover:bg-amber-100",
                            "bg-cyan-50 hover:bg-cyan-100",
                            "bg-rose-50 hover:bg-rose-100",
                            "bg-indigo-50 hover:bg-indigo-100",
                          ];
                          return (
                          <TableRow 
                            key={sp2d.id}
                            className={`${colors[index % colors.length]} transition-colors duration-200`}
                          >
                            <TableCell className="font-medium">
                              {sp2d.nomor_sp2d || "-"}
                            </TableCell>
                            <TableCell>{sp2d.spm?.nomor_spm || "-"}</TableCell>
                            <TableCell>
                              {sp2d.nomor_penguji ? (
                                <Badge variant="outline" className="font-mono">
                                  {sp2d.nomor_penguji}
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground text-xs">Belum ada</span>
                              )}
                            </TableCell>
                            <TableCell>{(sp2d as any).opd?.nama_opd || "-"}</TableCell>
                            <TableCell>
                              {formatCurrency(Number(sp2d.nilai_sp2d))}
                            </TableCell>
                            <TableCell>
                              {sp2d.tanggal_kirim_bank
                                ? format(new Date(sp2d.tanggal_kirim_bank), "dd MMM yyyy HH:mm", {
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
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                )}
                {sp2dUjiBank && sp2dUjiBank.length > 0 && (
                  <DataTablePagination
                    pageIndex={paginationUjiBank.pagination.pageIndex}
                    pageSize={paginationUjiBank.pagination.pageSize}
                    pageCount={paginationUjiBank.getPageCount(sp2dUjiBank.length)}
                    totalItems={sp2dUjiBank.length}
                    onPageChange={paginationUjiBank.goToPage}
                    onPageSizeChange={paginationUjiBank.setPageSize}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cair" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Daftar SP2D Cair</CardTitle>
                <p className="text-sm text-muted-foreground">
                  SP2D yang sudah dicairkan ke rekening vendor
                </p>
              </CardHeader>
              <CardContent className="p-0">
                {isLoadingCair ? (
                  <div className="flex justify-center items-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader className="sticky top-0 z-10">
                      <TableRow className="bg-gradient-to-r from-primary/90 via-primary/80 to-primary/90 hover:from-primary hover:via-primary/90 hover:to-primary border-b-2 border-primary">
                        <TableHead className="text-primary-foreground font-bold">Nomor SP2D</TableHead>
                        <TableHead className="text-primary-foreground font-bold">Nomor SPM</TableHead>
                        <TableHead className="text-primary-foreground font-bold">OPD</TableHead>
                        <TableHead className="text-primary-foreground font-bold">Nilai SP2D</TableHead>
                        <TableHead className="text-primary-foreground font-bold">Total Potongan</TableHead>
                        <TableHead className="text-primary-foreground font-bold">Nilai Diterima</TableHead>
                        <TableHead className="text-primary-foreground font-bold">Tanggal Cair</TableHead>
                        <TableHead className="text-primary-foreground font-bold">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sp2dCair?.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8">
                            <div className="flex flex-col items-center gap-2">
                              <Banknote className="h-12 w-12 text-muted-foreground/50" />
                              <p className="text-muted-foreground">
                                Tidak ada SP2D yang sudah cair
                              </p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginationCair.paginateData(sp2dCair)?.map((sp2d, index) => {
                          const colors = [
                            "bg-blue-50 hover:bg-blue-100",
                            "bg-green-50 hover:bg-green-100", 
                            "bg-purple-50 hover:bg-purple-100",
                            "bg-pink-50 hover:bg-pink-100",
                            "bg-amber-50 hover:bg-amber-100",
                            "bg-cyan-50 hover:bg-cyan-100",
                            "bg-rose-50 hover:bg-rose-100",
                            "bg-indigo-50 hover:bg-indigo-100",
                          ];
                          return (
                          <TableRow 
                            key={sp2d.id}
                            className={`${colors[index % colors.length]} transition-colors duration-200`}
                          >
                            <TableCell className="font-medium">
                              {sp2d.nomor_sp2d || "-"}
                            </TableCell>
                            <TableCell>{sp2d.spm?.nomor_spm || "-"}</TableCell>
                            <TableCell>{(sp2d as any).opd?.nama_opd || "-"}</TableCell>
                            <TableCell>
                              {formatCurrency(Number(sp2d.nilai_sp2d))}
                            </TableCell>
                            <TableCell className="text-destructive">
                              - {formatCurrency(Number(sp2d.total_potongan || 0))}
                            </TableCell>
                            <TableCell className="font-semibold text-success">
                              {formatCurrency(Number(sp2d.nilai_diterima || sp2d.nilai_sp2d))}
                            </TableCell>
                            <TableCell>
                              {sp2d.tanggal_cair
                                ? format(new Date(sp2d.tanggal_cair), "dd MMM yyyy HH:mm", {
                                    locale: localeId,
                                  })
                                : "-"}
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
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                )}
                {sp2dCair && sp2dCair.length > 0 && (
                  <DataTablePagination
                    pageIndex={paginationCair.pagination.pageIndex}
                    pageSize={paginationCair.pagination.pageSize}
                    pageCount={paginationCair.getPageCount(sp2dCair.length)}
                    totalItems={sp2dCair.length}
                    onPageChange={paginationCair.goToPage}
                    onPageSizeChange={paginationCair.setPageSize}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Disbursement Confirmation Dialog */}
        <AlertDialog open={showDisburseDialog} onOpenChange={setShowDisburseDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Konfirmasi Pencairan Dana</AlertDialogTitle>
              <AlertDialogDescription>
                Apakah Anda yakin ingin mencairkan dana SP2D ini? Dana akan ditransfer ke rekening vendor yang tercantum.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDisburse}
                disabled={disburseSp2d.isPending}
              >
                {disburseSp2d.isPending ? "Memproses..." : "Cairkan Dana"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
};

export default Sp2dList;
