import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/currency";
import { formatJenisSpm } from "@/lib/formatHelpers";
import { SpmStatusBadge } from "./SpmStatusBadge";
import { Calendar, FileText, Building2, Eye, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface SpmVerificationCardProps {
  spm: any;
  onVerify: (spmId: string) => void;
}

export const SpmVerificationCard = ({ spm, onVerify }: SpmVerificationCardProps) => {
  const navigate = useNavigate();

  return (
    <Card className={cn(
      "min-h-[340px]",
      "group hover:shadow-lg hover:border-primary/20 transition-all duration-200",
      "border-border/60 bg-gradient-to-br from-background to-muted/5",
      "animate-fade-in"
    )}>
      <CardHeader className="pb-3">
        <div className="space-y-3">
          {/* Status Badge - Centered at Top */}
          <div className="flex justify-center">
            <SpmStatusBadge 
              status={spm.status} 
              className={cn(
                "text-xs font-semibold",
                spm.status === 'diajukan' && "animate-pulse"
              )}
            />
          </div>
          
          {/* SPM Number and OPD Info */}
          <div className="space-y-1">
            <CardTitle className="text-xl font-bold flex items-start gap-2">
              <FileText className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <span className="break-words leading-tight flex-1">{spm.nomor_spm || "Draft"}</span>
            </CardTitle>
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <Building2 className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span className="break-words leading-tight flex-1">{spm.opd?.nama_opd}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Section 1: Jenis SPM */}
        <div>
          <p className="text-xs text-muted-foreground mb-1.5">Jenis SPM</p>
          <Badge variant="outline" className="font-semibold">
            {formatJenisSpm(spm.jenis_spm)}
          </Badge>
        </div>

        {/* Section 2: Nilai SPM (Bruto) */}
        <div>
          <p className="text-xs text-muted-foreground mb-1.5">Nilai SPM</p>
          <p className="font-semibold text-base sm:text-lg">{formatCurrency(spm.nilai_spm)}</p>
        </div>

        {/* Section 3: Potongan & Netto - Full Width Bar */}
        {spm.total_potongan > 0 && (
          <div className="p-3 bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-lg shadow-sm">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Potongan:</span>
                <span className="text-sm font-medium text-destructive">
                  {formatCurrency(spm.total_potongan)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-primary/20">
                <span className="text-xs text-muted-foreground">Nilai Netto:</span>
                <span className="text-base sm:text-lg font-bold text-primary">
                  {formatCurrency(spm.nilai_bersih || (spm.nilai_spm - spm.total_potongan))}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Section 4: Uraian */}
        <div>
          <p className="text-xs text-muted-foreground mb-1.5">Uraian</p>
          <p className="text-sm leading-relaxed line-clamp-2">{spm.uraian}</p>
        </div>

        {/* Section 5: Metadata */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1 border-t border-border/50">
          <Calendar className="h-3.5 w-3.5" />
          <span>Diajukan: {format(new Date(spm.tanggal_ajuan), "dd MMM yyyy HH:mm", { locale: localeId })}</span>
        </div>

        {/* Section 6: Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="ghost"
            size="sm"
            className="flex-1"
            onClick={() => navigate(`/input-spm/detail/${spm.id}`)}
          >
            <Eye className="h-4 w-4 mr-2" />
            Detail
          </Button>
          <Button
            size="sm"
            className="flex-1 bg-primary hover:bg-primary/90 shadow-md"
            onClick={() => onVerify(spm.id)}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Verifikasi
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
