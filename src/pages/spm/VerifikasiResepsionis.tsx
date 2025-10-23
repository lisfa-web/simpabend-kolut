import { useState } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { useSpmList } from "@/hooks/useSpmList";
import { useSpmVerification } from "@/hooks/useSpmVerification";
import { SpmVerificationCard } from "./components/SpmVerificationCard";
import { VerificationDialog } from "./components/VerificationDialog";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function VerifikasiResepsionis() {
  const [search, setSearch] = useState("");
  const [selectedSpmId, setSelectedSpmId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: spmListBaru, isLoading: loadingBaru } = useSpmList({
    status: "diajukan",
    search,
  });

  const { data: spmListProses, isLoading: loadingProses } = useSpmList({
    status: "resepsionis_verifikasi",
    search,
  });

  const { verifySpm } = useSpmVerification("resepsionis");

  const handleVerify = (spmId: string) => {
    setSelectedSpmId(spmId);
    setDialogOpen(true);
  };

  const handleSubmitVerification = (data: any) => {
    if (!selectedSpmId) return;

    verifySpm.mutate(
      {
        spmId: selectedSpmId,
        ...data,
      },
      {
        onSuccess: () => {
          setDialogOpen(false);
          setSelectedSpmId(null);
        },
      }
    );
  };

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
              SPM Baru ({spmListBaru?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="proses">
              Dalam Proses ({spmListProses?.length || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="baru" className="space-y-4">
            {loadingBaru ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : spmListBaru && spmListBaru.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {spmListBaru.map((spm) => (
                  <SpmVerificationCard
                    key={spm.id}
                    spm={spm}
                    onVerify={handleVerify}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                Tidak ada SPM baru
              </div>
            )}
          </TabsContent>

          <TabsContent value="proses" className="space-y-4">
            {loadingProses ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : spmListProses && spmListProses.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {spmListProses.map((spm) => (
                  <SpmVerificationCard
                    key={spm.id}
                    spm={spm}
                    onVerify={handleVerify}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                Tidak ada SPM dalam proses
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Verification Dialog */}
      <VerificationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmitVerification}
        title="Verifikasi Resepsionis"
        showNomorAntrian
        showNomorBerkas
        isLoading={verifySpm.isPending}
      />
    </DashboardLayout>
  );
}
