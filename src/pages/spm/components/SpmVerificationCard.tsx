import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/currency";
import { SpmStatusBadge } from "./SpmStatusBadge";
import { Calendar, FileText, Building2, Eye } from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

interface SpmVerificationCardProps {
  spm: any;
  onVerify: (spmId: string) => void;
}

export const SpmVerificationCard = ({ spm, onVerify }: SpmVerificationCardProps) => {
  const navigate = useNavigate();

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              {spm.nomor_spm || "Draft"}
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Building2 className="h-4 w-4" />
              {spm.opd?.nama_opd}
            </div>
          </div>
          <SpmStatusBadge status={spm.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Jenis SPM</p>
            <Badge variant="outline" className="mt-1">
              {spm.jenis_spm?.toUpperCase()}
            </Badge>
          </div>
          <div>
            <p className="text-muted-foreground">Nilai SPM</p>
            <p className="font-medium mt-1">{formatCurrency(spm.nilai_spm)}</p>
            {spm.total_potongan > 0 && (
              <>
                <p className="text-xs text-muted-foreground mt-1">
                  Potongan: {formatCurrency(spm.total_potongan)}
                </p>
                <p className="text-sm font-semibold text-primary mt-1">
                  Netto: {formatCurrency(spm.nilai_bersih || (spm.nilai_spm - spm.total_potongan))}
                </p>
              </>
            )}
          </div>
          <div className="col-span-2">
            <p className="text-muted-foreground">Uraian</p>
            <p className="text-sm mt-1 line-clamp-2">{spm.uraian}</p>
          </div>
          <div className="col-span-2 flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            Diajukan: {format(new Date(spm.tanggal_ajuan), "dd MMM yyyy HH:mm", { locale: localeId })}
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => navigate(`/input-spm/detail/${spm.id}`)}
          >
            <Eye className="h-4 w-4 mr-2" />
            Detail
          </Button>
          <Button
            size="sm"
            className="flex-1"
            onClick={() => onVerify(spm.id)}
          >
            Verifikasi
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
