import { useState, memo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, FileText, Building2, Calendar, Hash, Wallet, TrendingUp, ArrowRight } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

// Timeline component for verification steps
const VerificationTimeline = memo(({ 
  pbmdVerified, 
  akuntansiVerified, 
  perbendaharaanVerified 
}: { 
  pbmdVerified: boolean | null;
  akuntansiVerified: boolean | null;
  perbendaharaanVerified: boolean | null;
}) => {
  const steps = [
    { label: "PBMD", verified: pbmdVerified, icon: CheckCircle },
    { label: "Akuntansi", verified: akuntansiVerified, icon: CheckCircle },
    { label: "Perbendaharaan", verified: perbendaharaanVerified, icon: CheckCircle },
  ];

  return (
    <div className="flex items-center justify-between gap-2">
      {steps.map((step, index) => {
        const Icon = step.verified === null ? Clock : step.verified ? CheckCircle : XCircle;
        const bgColor = step.verified === null 
          ? "bg-muted" 
          : step.verified 
          ? "bg-success" 
          : "bg-destructive";
        const textColor = step.verified === null 
          ? "text-muted-foreground" 
          : step.verified 
          ? "text-success" 
          : "text-destructive";

        return (
          <div key={step.label} className="flex items-center gap-2 flex-1">
            <div className="flex flex-col items-center flex-1">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300",
                bgColor,
                step.verified && "animate-scale-in"
              )}>
                <Icon className="h-4 w-4 text-white" />
              </div>
              <span className={cn("text-xs mt-1 font-medium", textColor)}>
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <ArrowRight className={cn("h-4 w-4", textColor)} />
            )}
          </div>
        );
      })}
    </div>
  );
});

VerificationTimeline.displayName = "VerificationTimeline";

const Sp2dStatusBadge = memo(({ status }: { status: string }) => {
  const statusConfig = {
    diterbitkan: { 
      label: "Diterbitkan", 
      className: "bg-info/20 text-info border-info/30",
      icon: FileText
    },
    terkirim_bank: { 
      label: "Terkirim Bank", 
      className: "bg-primary/20 text-primary border-primary/30",
      icon: TrendingUp
    },
    dikonfirmasi_bank: { 
      label: "Dikonfirmasi", 
      className: "bg-accent/20 text-accent border-accent/30",
      icon: CheckCircle
    },
    cair: { 
      label: "Cair", 
      className: "bg-success/20 text-success border-success/30",
      icon: Wallet
    },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.diterbitkan;
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={cn("gap-1.5 font-medium", config.className)}>
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </Badge>
  );
});

Sp2dStatusBadge.displayName = "Sp2dStatusBadge";

const SpmSp2dTableWidget = memo(() => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading } = useQuery({
    queryKey: ["spm-sp2d-table", page, pageSize],
    queryFn: async () => {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, error, count } = await supabase
        .from("spm")
        .select(`
          id,
          nomor_antrian,
          tanggal_ajuan,
          nomor_spm,
          nama_penerima,
          verified_by_pbmd,
          verified_by_akuntansi,
          verified_by_perbendaharaan,
          status,
          opd:opd_id(nama_opd),
          sp2d(
            id,
            nomor_sp2d,
            nilai_sp2d,
            status,
            tanggal_cair
          )
        `, { count: 'exact' })
        .not("status", "eq", "draft")
        .order("tanggal_ajuan", { ascending: false })
        .range(from, to);

      if (error) throw error;
      return { data: data || [], count: count || 0 };
    },
    staleTime: 5 * 60 * 1000, // 5 menit
    refetchInterval: 5 * 60 * 1000, // Refresh setiap 5 menit (bukan 1 menit)
  });

  const totalPages = Math.ceil((data?.count || 0) / pageSize);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="border-b bg-gradient-to-r from-primary/5 via-accent/5 to-secondary/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Timeline SPM & SP2D</CardTitle>
          </div>
          <Badge variant="secondary" className="font-mono text-sm px-3 py-1">
            {data?.count || 0} Records
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-auto p-4 space-y-4 max-h-[600px]">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-2">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto" />
                <p className="text-sm text-muted-foreground">Loading data...</p>
              </div>
            </div>
          ) : data?.data && data.data.length > 0 ? (
            <div className="grid gap-4">
              {data.data.map((spm: any) => {
                const sp2d = Array.isArray(spm.sp2d) ? spm.sp2d[0] : spm.sp2d;
                const pbmdVerified = spm.status === "disetujui" || sp2d
                  ? true
                  : spm.verified_by_pbmd
                  ? spm.status !== "perlu_revisi"
                  : null;
                const akuntansiVerified = spm.status === "disetujui" || sp2d
                  ? true
                  : spm.verified_by_akuntansi
                  ? spm.status !== "perlu_revisi"
                  : null;
                const perbendaharaanVerified = spm.status === "disetujui" || sp2d
                  ? true
                  : spm.verified_by_perbendaharaan
                  ? spm.status !== "perlu_revisi"
                  : null;

                return (
                  <Card 
                    key={spm.id} 
                    className={cn(
                      "group hover:shadow-lg hover:scale-[1.01] transition-all duration-300 cursor-pointer",
                      "border-l-4",
                      sp2d && sp2d.status === "cair" 
                        ? "border-l-success" 
                        : pbmdVerified && akuntansiVerified && perbendaharaanVerified
                        ? "border-l-accent"
                        : "border-l-primary"
                    )}
                  >
                    <CardContent className="p-4 space-y-4">
                      {/* Header Section */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <Hash className="h-4 w-4 text-muted-foreground" />
                            <span className="font-mono text-lg font-bold text-primary">
                              {spm.nomor_antrian || "-"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5" />
                            {spm.tanggal_ajuan
                              ? format(new Date(spm.tanggal_ajuan), "dd MMMM yyyy", { locale: id })
                              : "-"}
                          </div>
                        </div>
                        <div className="text-right space-y-1">
                          <div className="text-xs text-muted-foreground">No. SPM</div>
                          <div className="font-mono text-sm font-semibold">
                            {spm.nomor_spm || "-"}
                          </div>
                        </div>
                      </div>

                      {/* Penerima & OPD */}
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                        <Building2 className="h-5 w-5 text-primary mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">{spm.nama_penerima}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {spm.opd?.nama_opd}
                          </p>
                        </div>
                      </div>

                      {/* Verification Timeline */}
                      <div className="space-y-2">
                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          Timeline Verifikasi
                        </div>
                        <VerificationTimeline
                          pbmdVerified={pbmdVerified}
                          akuntansiVerified={akuntansiVerified}
                          perbendaharaanVerified={perbendaharaanVerified}
                        />
                      </div>

                      {/* SP2D Information */}
                      {sp2d ? (
                        <div className="space-y-3 pt-3 border-t">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                              Informasi SP2D
                            </span>
                            <Sp2dStatusBadge status={sp2d.status} />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <div className="text-xs text-muted-foreground">Nomor SP2D</div>
                              <div className="font-mono text-sm font-semibold">{sp2d.nomor_sp2d}</div>
                            </div>
                            <div className="space-y-1 text-right">
                              <div className="text-xs text-muted-foreground">Nilai SP2D</div>
                              <div className="font-semibold text-sm text-success">
                                {formatCurrency(sp2d.nilai_sp2d)}
                              </div>
                            </div>
                          </div>
                          {sp2d.status === "cair" && sp2d.tanggal_cair && (
                            <div className="flex items-center gap-2 text-xs text-success">
                              <Wallet className="h-3.5 w-3.5" />
                              Cair pada {format(new Date(sp2d.tanggal_cair), "dd MMMM yyyy", { locale: id })}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="pt-3 border-t">
                          <Badge variant="outline" className="bg-muted/50 w-full justify-center py-2">
                            <FileText className="h-3.5 w-3.5 mr-1.5" />
                            SP2D Belum Diterbitkan
                          </Badge>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-sm font-medium text-muted-foreground">No data available</p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                SPM records will appear here once submitted
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="border-t p-4 bg-muted/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Rows per page:</span>
              <Select
                value={pageSize.toString()}
                onValueChange={(value) => {
                  setPageSize(Number(value));
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-[80px] h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground font-medium">
                Page {page} of {totalPages || 1}
              </span>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 hover:bg-primary hover:text-primary-foreground transition-colors"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 hover:bg-primary hover:text-primary-foreground transition-colors"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

SpmSp2dTableWidget.displayName = "SpmSp2dTableWidget";

export { SpmSp2dTableWidget };
