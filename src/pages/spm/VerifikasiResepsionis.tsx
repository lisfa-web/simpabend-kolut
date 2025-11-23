import { useState } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { useSpmList } from "@/hooks/useSpmList";
import { SpmVerificationCard } from "./components/SpmVerificationCard";
import { Input } from "@/components/ui/input";
import { Search, Loader2, FileText, Inbox } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePagination } from "@/hooks/usePagination";
import { DataTablePagination } from "@/components/ui/data-table-pagination";

export default function VerifikasiResepsionis() {
  const [search, setSearch] = useState("");
  const paginationBaru = usePagination(10);
  const paginationProses = usePagination(10);
  
  // Tab "Perlu Verifikasi" hanya untuk status "diajukan" (belum ada nomor antrian)
  const { data: spmListBaru, isLoading: loadingBaru } = useSpmList({
    status: ["diajukan"],
    search,
  });

  // Tab "Sudah Diproses" untuk SPM yang sudah diverifikasi resepsionis
  const { data: spmListProses, isLoading: loadingProses } = useSpmList({
    status: ["resepsionis_verifikasi"],
    search,
  });

  const paginatedSpmBaru = paginationBaru.paginateData(spmListBaru || []);
  const paginatedSpmProses = paginationProses.paginateData(spmListProses || []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Verifikasi Resepsionis</h1>
          <p className="text-muted-foreground">Terima dan berikan nomor antrian untuk SPM yang masuk</p>
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

        {/* Tabs */}
        <Tabs defaultValue="baru" className="space-y-4">
          <TabsList>
            <TabsTrigger value="baru">
              Perlu Verifikasi ({spmListBaru?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="proses">
              Sudah Diproses ({spmListProses?.length || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="baru" className="space-y-4">
            {loadingBaru ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : spmListBaru && spmListBaru.length > 0 ? (
              <>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {paginatedSpmBaru.map((spm) => (
                    <SpmVerificationCard
                      key={spm.id}
                      spm={spm}
                    />
                  ))}
                </div>
                <DataTablePagination
                  pageIndex={paginationBaru.pagination.pageIndex}
                  pageSize={paginationBaru.pagination.pageSize}
                  pageCount={paginationBaru.getPageCount(spmListBaru.length)}
                  totalItems={spmListBaru.length}
                  onPageChange={paginationBaru.goToPage}
                  onPageSizeChange={paginationBaru.setPageSize}
                />
              </>
            ) : (
              <div className="text-center py-16 animate-fade-in">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted/50 mb-4">
                  <Inbox className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Belum Ada SPM Yang Perlu Diverifikasi</h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  SPM yang diajukan akan muncul di sini untuk diberikan nomor antrian
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="proses" className="space-y-4">
            {loadingProses ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : spmListProses && spmListProses.length > 0 ? (
              <>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {paginatedSpmProses.map((spm) => (
                    <SpmVerificationCard
                      key={spm.id}
                      spm={spm}
                    />
                  ))}
                </div>
                <DataTablePagination
                  pageIndex={paginationProses.pagination.pageIndex}
                  pageSize={paginationProses.pagination.pageSize}
                  pageCount={paginationProses.getPageCount(spmListProses.length)}
                  totalItems={spmListProses.length}
                  onPageChange={paginationProses.goToPage}
                  onPageSizeChange={paginationProses.setPageSize}
                />
              </>
            ) : (
              <div className="text-center py-16 animate-fade-in">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted/50 mb-4">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Tidak Ada SPM Yang Sudah Diproses</h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  SPM yang telah Anda verifikasi dan masih dalam tahap verifikasi lanjutan akan muncul di sini
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
