import { useState, useEffect } from "react";
import { Search, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface SpmFiltersProps {
  onFilterChange: (filters: {
    search: string;
    jenis_spm_id: string;
    status: string;
    opd_id: string;
    tanggal_dari: string;
    tanggal_sampai: string;
  }) => void;
  initialFilters?: {
    search?: string;
    jenis_spm_id?: string;
    status?: string;
    opd_id?: string;
    tanggal_dari?: string;
    tanggal_sampai?: string;
  };
}

export const SpmFilters = ({ onFilterChange, initialFilters }: SpmFiltersProps) => {
  const [search, setSearch] = useState(initialFilters?.search || "");
  const [jenisSpmId, setJenisSpmId] = useState(initialFilters?.jenis_spm_id || "all");
  const [status, setStatus] = useState(initialFilters?.status || "all");
  const [opdId, setOpdId] = useState(initialFilters?.opd_id || "all");
  const [tanggalDari, setTanggalDari] = useState(initialFilters?.tanggal_dari || "");
  const [tanggalSampai, setTanggalSampai] = useState(initialFilters?.tanggal_sampai || "");
  const [isOpen, setIsOpen] = useState(false);

  // Fetch Jenis SPM from database
  const { data: jenisSpmList } = useQuery({
    queryKey: ["jenis-spm-filter"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jenis_spm")
        .select("id, nama_jenis, deskripsi")
        .eq("is_active", true)
        .order("nama_jenis");
      
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch OPD list
  const { data: opdList } = useQuery({
    queryKey: ["opd-list-spm-filter"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("opd")
        .select("id, nama_opd, kode_opd")
        .eq("is_active", true)
        .order("nama_opd");
      
      if (error) throw error;
      return data || [];
    },
  });

  // Apply filters
  const applyFilters = () => {
    onFilterChange({
      search,
      jenis_spm_id: jenisSpmId,
      status,
      opd_id: opdId,
      tanggal_dari: tanggalDari,
      tanggal_sampai: tanggalSampai,
    });
    setIsOpen(false);
  };

  // Reset filters
  const resetFilters = () => {
    setSearch("");
    setJenisSpmId("all");
    setStatus("all");
    setOpdId("all");
    setTanggalDari("");
    setTanggalSampai("");
    onFilterChange({
      search: "",
      jenis_spm_id: "all",
      status: "all",
      opd_id: "all",
      tanggal_dari: "",
      tanggal_sampai: "",
    });
  };

  // Count active filters (excluding search)
  const activeFiltersCount = [
    jenisSpmId !== "all" ? jenisSpmId : "",
    status !== "all" ? status : "",
    opdId !== "all" ? opdId : "",
    tanggalDari,
    tanggalSampai,
  ].filter(Boolean).length;

  // Update search in real-time
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      onFilterChange({
        search,
        jenis_spm_id: jenisSpmId,
        status,
        opd_id: opdId,
        tanggal_dari: tanggalDari,
        tanggal_sampai: tanggalSampai,
      });
    }, 300);

    return () => clearTimeout(delaySearch);
  }, [search]);

  return (
    <div className="flex gap-2">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Cari nomor SPM, uraian, atau nama penerima..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Filter Sheet */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" className="relative">
            <Filter className="h-4 w-4 mr-2" />
            Filter
            {activeFiltersCount > 0 && (
              <Badge 
                variant="destructive" 
                className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
              >
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Filter SPM</SheetTitle>
            <SheetDescription>
              Atur filter untuk mempersempit pencarian
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-6 py-6">
            {/* Jenis SPM Filter */}
            <div className="space-y-2">
              <Label htmlFor="jenis-spm-filter">Jenis SPM</Label>
              <Select value={jenisSpmId} onValueChange={setJenisSpmId}>
                <SelectTrigger id="jenis-spm-filter">
                  <SelectValue placeholder="Pilih jenis SPM" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Jenis SPM</SelectItem>
                  {jenisSpmList?.map((jenis) => (
                    <SelectItem key={jenis.id} value={jenis.id}>
                      {jenis.nama_jenis}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <Label htmlFor="status-filter">Status SPM</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger id="status-filter">
                  <SelectValue placeholder="Pilih status" />
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
                  <SelectItem value="perlu_revisi">Perlu Revisi</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* OPD Filter */}
            <div className="space-y-2">
              <Label htmlFor="opd-filter">OPD</Label>
              <Select value={opdId} onValueChange={setOpdId}>
                <SelectTrigger id="opd-filter">
                  <SelectValue placeholder="Pilih OPD" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua OPD</SelectItem>
                  {opdList?.map((opd) => (
                    <SelectItem key={opd.id} value={opd.id}>
                      {opd.kode_opd} - {opd.nama_opd}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Range Filter */}
            <div className="space-y-2">
              <Label>Periode Tanggal Ajuan</Label>
              <div className="space-y-2">
                <div>
                  <Label htmlFor="tanggal-dari" className="text-xs text-muted-foreground">
                    Dari Tanggal
                  </Label>
                  <Input
                    id="tanggal-dari"
                    type="date"
                    value={tanggalDari}
                    onChange={(e) => setTanggalDari(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="tanggal-sampai" className="text-xs text-muted-foreground">
                    Sampai Tanggal
                  </Label>
                  <Input
                    id="tanggal-sampai"
                    type="date"
                    value={tanggalSampai}
                    onChange={(e) => setTanggalSampai(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Active Filters */}
            {activeFiltersCount > 0 && (
              <div className="space-y-2">
                <Label className="text-sm">Filter Aktif:</Label>
                <div className="flex flex-wrap gap-2">
                  {jenisSpmId !== "all" && (
                    <Badge variant="secondary" className="gap-1">
                      Jenis SPM
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => setJenisSpmId("all")}
                      />
                    </Badge>
                  )}
                  {status !== "all" && (
                    <Badge variant="secondary" className="gap-1">
                      Status: {status}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => setStatus("all")}
                      />
                    </Badge>
                  )}
                  {opdId !== "all" && (
                    <Badge variant="secondary" className="gap-1">
                      OPD
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => setOpdId("all")}
                      />
                    </Badge>
                  )}
                  {tanggalDari && (
                    <Badge variant="secondary" className="gap-1">
                      Dari: {tanggalDari}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => setTanggalDari("")}
                      />
                    </Badge>
                  )}
                  {tanggalSampai && (
                    <Badge variant="secondary" className="gap-1">
                      Sampai: {tanggalSampai}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => setTanggalSampai("")}
                      />
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={resetFilters}
              className="flex-1"
            >
              <X className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button
              onClick={applyFilters}
              className="flex-1"
            >
              <Filter className="h-4 w-4 mr-2" />
              Terapkan
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};
