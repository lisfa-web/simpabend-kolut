import { useState } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { useSpmList } from "@/hooks/useSpmList";
import { useSpmVerification } from "@/hooks/useSpmVerification";
import { useRequestPin } from "@/hooks/useRequestPin";
import { useAuth } from "@/hooks/useAuth";
import { SpmVerificationCard } from "./components/SpmVerificationCard";
import { VerificationDialog } from "./components/VerificationDialog";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function ApprovalKepalaBkad() {
  const [search, setSearch] = useState("");
  const [selectedSpmId, setSelectedSpmId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { user } = useAuth();

  const { data: spmList, isLoading } = useSpmList({
    status: "kepala_bkad_review",
    search,
  });

  const { verifySpm } = useSpmVerification("kepala_bkad");
  const requestPin = useRequestPin();

  const handleVerify = (spmId: string) => {
    setSelectedSpmId(spmId);
    setDialogOpen(true);
  };

  const handleRequestPin = () => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "User tidak terautentikasi",
        variant: "destructive",
      });
      return;
    }

    requestPin.mutate({
      userId: user.id,
      spmId: selectedSpmId || undefined,
    });
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
          <h1 className="text-3xl font-bold">Persetujuan Kepala BKAD</h1>
          <p className="text-muted-foreground">Review dan setujui SPM untuk penerbitan SP2D</p>
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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {spmList.map((spm) => (
              <SpmVerificationCard
                key={spm.id}
                spm={spm}
                onVerify={handleVerify}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            Tidak ada SPM untuk direview
          </div>
        )}
      </div>

      {/* Verification Dialog */}
      <VerificationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmitVerification}
        title="Persetujuan Kepala BKAD"
        showPin
        isLoading={verifySpm.isPending}
        onRequestPin={handleRequestPin}
        isRequestingPin={requestPin.isPending}
      />
    </DashboardLayout>
  );
}
