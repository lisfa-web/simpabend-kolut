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
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary flex-shrink-0" />
              <span className="truncate">{spm.nomor_spm || "Draft"}</span>
            </CardTitle>
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <Building2 className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span className="break-words leading-tight flex-1">{spm.opd?.nama_opd}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-muted-foreground mb-1.5">Jenis SPM</p>
            <Badge variant="outline" className="font-semibold">
              {formatJenisSpm(spm.jenis_spm)}
            </Badge>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1.5">Nilai SPM</p>
            <p className="font-semibold text-base">{formatCurrency(spm.nilai_spm)}</p>
            {spm.total_potongan > 0 && (
              <div className="mt-2 p-2 bg-primary/10 border border-primary/20 rounded-md">
                <p className="text-xs text-muted-foreground">
                  Potongan: {formatCurrency(spm.total_potongan)}
                </p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-xs text-muted-foreground">Netto:</span>
                  <p className="text-base font-bold text-primary">
                    {formatCurrency(spm.nilai_bersih || (spm.nilai_spm - spm.total_potongan))}
                  </p>
                </div>
              </div>
            )}
          </div>
          <div className="col-span-2">
            <p className="text-xs text-muted-foreground mb-1.5">Uraian</p>
            <p className="text-sm leading-relaxed line-clamp-2">{spm.uraian}</p>
          </div>
          <div className="col-span-2 flex items-center gap-2 text-xs text-muted-foreground pt-1 border-t border-border/50">
            <Calendar className="h-3.5 w-3.5" />
            <span>Diajukan: {format(new Date(spm.tanggal_ajuan), "dd MMM yyyy HH:mm", { locale: localeId })}</span>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 hover-scale"
            onClick={() => navigate(`/input-spm/detail/${spm.id}`)}
          >
            <Eye className="h-4 w-4 mr-2" />
            Detail
          </Button>
          <Button
            size="sm"
            className="flex-1 bg-primary hover:bg-primary/90 shadow-md hover-scale"
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
