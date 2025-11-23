import { useState } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { useSpmList } from "@/hooks/useSpmList";
import { SpmVerificationCard } from "./components/SpmVerificationCard";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import { usePagination } from "@/hooks/usePagination";
import { DataTablePagination } from "@/components/ui/data-table-pagination";

export default function VerifikasiPbmd() {
  const [search, setSearch] = useState("");
  const pagination = usePagination(10);

  const { data: spmList, isLoading } = useSpmList({
    status: "pbmd_verifikasi",
    search,
  });

  const paginatedSpm = pagination.paginateData(spmList || []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Verifikasi PBMD</h1>
          <p className="text-muted-foreground">Verifikasi kelengkapan aset dan inventaris untuk SPM</p>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari SPM..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* SPM List */}
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : spmList && spmList.length > 0 ? (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {paginatedSpm.map((spm) => (
                <SpmVerificationCard
                  key={spm.id}
                  spm={spm}
                />
              ))}
            </div>
            <DataTablePagination
              pageIndex={pagination.pagination.pageIndex}
              pageSize={pagination.pagination.pageSize}
              pageCount={pagination.getPageCount(spmList.length)}
              totalItems={spmList.length}
              onPageChange={pagination.goToPage}
              onPageSizeChange={pagination.setPageSize}
            />
          </>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            Tidak ada SPM untuk diverifikasi
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
