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

interface Sp2dFiltersProps {
  onFilterChange: (filters: {
    search: string;
    status: string;
    opd_id: string;
    tanggal_dari: string;
    tanggal_sampai: string;
  }) => void;
  initialFilters?: {
    search?: string;
    status?: string;
    opd_id?: string;
    tanggal_dari?: string;
    tanggal_sampai?: string;
  };
}

export const Sp2dFilters = ({ onFilterChange, initialFilters }: Sp2dFiltersProps) => {
  const [search, setSearch] = useState(initialFilters?.search || "");
  const [status, setStatus] = useState(initialFilters?.status || "all");
  const [opdId, setOpdId] = useState(initialFilters?.opd_id || "all");
  const [tanggalDari, setTanggalDari] = useState(initialFilters?.tanggal_dari || "");
  const [tanggalSampai, setTanggalSampai] = useState(initialFilters?.tanggal_sampai || "");
  const [isOpen, setIsOpen] = useState(false);

  // Fetch OPD list
  const { data: opdList } = useQuery({
    queryKey: ["opd-list-filter"],
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
    setStatus("all");
    setOpdId("all");
    setTanggalDari("");
    setTanggalSampai("");
    onFilterChange({
      search: "",
      status: "all",
      opd_id: "all",
      tanggal_dari: "",
      tanggal_sampai: "",
    });
  };

  // Count active filters
  const activeFiltersCount = [
    search,
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
          placeholder="Cari nomor SP2D, nomor SPM, atau nama penerima..."
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
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Filter SP2D</SheetTitle>
            <SheetDescription>
              Atur filter untuk mempersempit pencarian
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-6 py-6">
            {/* Status Filter */}
            <div className="space-y-2">
              <Label htmlFor="status-filter">Status SP2D</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger id="status-filter">
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="diterbitkan">Diterbitkan</SelectItem>
                  <SelectItem value="dikirim_bank">Dikirim ke Bank</SelectItem>
                  <SelectItem value="diuji_bank">Diuji Bank</SelectItem>
                  <SelectItem value="dikonfirmasi_bank">Dikonfirmasi Bank</SelectItem>
                  <SelectItem value="cair">Dicairkan</SelectItem>
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
              <Label>Periode Tanggal</Label>
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
