import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, Clock, AlertTriangle, AlertCircle, CheckCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/currency";
import { Link } from "react-router-dom";
import { format, differenceInDays, addDays, isToday, isTomorrow, isPast } from "date-fns";
import { id as localeId } from "date-fns/locale";

interface DeadlineCalendarWidgetProps {
  isLoading?: boolean;
  opdFilter?: string;
}

const SLA_DAYS = 4; // SLA target: 4 hari kerja

export const DeadlineCalendarWidget = ({ isLoading: parentLoading, opdFilter }: DeadlineCalendarWidgetProps) => {
  const { data: deadlines, isLoading } = useQuery({
    queryKey: ["deadline-calendar", opdFilter],
    queryFn: async () => {
      const now = new Date();
      
      // Get SPM that are in progress (not draft, not approved, not revision)
      let query = supabase
        .from("spm")
        .select("id, nomor_spm, status, nilai_spm, updated_at, tanggal_ajuan, opd_id, opd:opd_id(nama_opd)")
        .not("status", "in", '("draft","disetujui","perlu_revisi")')
        .order("updated_at", { ascending: true });

      if (opdFilter && opdFilter !== "all") {
        query = query.eq("opd_id", opdFilter);
      }

      const { data: spmData } = await query;

      // Calculate deadline for each SPM (SLA 4 days from last update)
      const deadlineItems = (spmData || []).map((spm: any) => {
        const lastUpdate = new Date(spm.updated_at);
        const deadline = addDays(lastUpdate, SLA_DAYS);
        const daysRemaining = differenceInDays(deadline, now);
        
        let urgency: 'critical' | 'warning' | 'normal' | 'overdue';
        if (daysRemaining < 0) urgency = 'overdue';
        else if (daysRemaining === 0) urgency = 'critical';
        else if (daysRemaining <= 1) urgency = 'warning';
        else urgency = 'normal';

        return {
          ...spm,
          deadline,
          daysRemaining,
          urgency,
        };
      });

      // Sort by urgency then deadline
      deadlineItems.sort((a, b) => {
        const urgencyOrder = { overdue: 0, critical: 1, warning: 2, normal: 3 };
        if (urgencyOrder[a.urgency] !== urgencyOrder[b.urgency]) {
          return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
        }
        return a.deadline.getTime() - b.deadline.getTime();
      });

      // Group by date
      const grouped: Record<string, typeof deadlineItems> = {};
      deadlineItems.forEach((item) => {
        const dateKey = format(item.deadline, "yyyy-MM-dd");
        if (!grouped[dateKey]) grouped[dateKey] = [];
        grouped[dateKey].push(item);
      });

      // Statistics
      const overdue = deadlineItems.filter(d => d.urgency === 'overdue').length;
      const critical = deadlineItems.filter(d => d.urgency === 'critical').length;
      const warning = deadlineItems.filter(d => d.urgency === 'warning').length;

      return {
        items: deadlineItems.slice(0, 10),
        grouped,
        stats: { overdue, critical, warning, total: deadlineItems.length },
      };
    },
  });

  if (isLoading || parentLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  const getUrgencyStyle = (urgency: string) => {
    switch (urgency) {
      case 'overdue': return { 
        bg: 'bg-red-100 dark:bg-red-950', 
        border: 'border-red-300 dark:border-red-700',
        text: 'text-red-700 dark:text-red-300',
        badge: 'bg-red-500 text-white'
      };
      case 'critical': return { 
        bg: 'bg-orange-100 dark:bg-orange-950', 
        border: 'border-orange-300 dark:border-orange-700',
        text: 'text-orange-700 dark:text-orange-300',
        badge: 'bg-orange-500 text-white'
      };
      case 'warning': return { 
        bg: 'bg-amber-100 dark:bg-amber-950', 
        border: 'border-amber-300 dark:border-amber-700',
        text: 'text-amber-700 dark:text-amber-300',
        badge: 'bg-amber-500 text-white'
      };
      default: return { 
        bg: 'bg-green-50 dark:bg-green-950', 
        border: 'border-green-200 dark:border-green-800',
        text: 'text-green-700 dark:text-green-300',
        badge: 'bg-green-500 text-white'
      };
    }
  };

  const getDeadlineLabel = (deadline: Date, daysRemaining: number) => {
    if (daysRemaining < 0) return `Terlambat ${Math.abs(daysRemaining)} hari`;
    if (isToday(deadline)) return "Hari ini";
    if (isTomorrow(deadline)) return "Besok";
    return `${daysRemaining} hari lagi`;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      "resepsionis_verifikasi": "Resepsionis",
      "pbmd_verifikasi": "PBMD",
      "akuntansi_validasi": "Akuntansi",
      "perbendaharaan_verifikasi": "Perbendaharaan",
      "kepala_bkad_review": "Kepala BKAD",
      "diajukan": "Diajukan",
    };
    return labels[status] || status;
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Calendar className="h-5 w-5 text-primary" />
          Kalender Deadline SLA
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Target SLA: {SLA_DAYS} hari kerja per tahap
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats Bar */}
        <div className="flex gap-2">
          {deadlines?.stats.overdue > 0 && (
            <Badge variant="destructive" className="gap-1">
              <AlertTriangle className="h-3 w-3" />
              {deadlines.stats.overdue} Terlambat
            </Badge>
          )}
          {deadlines?.stats.critical > 0 && (
            <Badge className="bg-orange-500 gap-1">
              <AlertCircle className="h-3 w-3" />
              {deadlines.stats.critical} Hari Ini
            </Badge>
          )}
          {deadlines?.stats.warning > 0 && (
            <Badge className="bg-amber-500 gap-1">
              <Clock className="h-3 w-3" />
              {deadlines.stats.warning} Besok
            </Badge>
          )}
          {deadlines?.stats.total === 0 && (
            <Badge className="bg-green-500 gap-1">
              <CheckCircle className="h-3 w-3" />
              Semua Aman
            </Badge>
          )}
        </div>

        {/* Deadline List */}
        <ScrollArea className="h-[280px]">
          <div className="space-y-2">
            {deadlines?.items.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="h-10 w-10 mx-auto mb-2 text-green-500" />
                <p className="text-sm">Tidak ada deadline mendekati</p>
              </div>
            ) : (
              deadlines?.items.map((item: any) => {
                const style = getUrgencyStyle(item.urgency);
                return (
                  <Link
                    key={item.id}
                    to={`/spm/timeline/${item.id}`}
                    className={`block p-3 rounded-lg border transition-all hover:shadow-md ${style.bg} ${style.border}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm truncate">{item.nomor_spm || "Draft"}</span>
                          <Badge variant="outline" className="text-xs shrink-0">
                            {getStatusLabel(item.status)}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {item.opd?.nama_opd || "Unknown OPD"}
                        </div>
                        <div className="text-xs font-medium mt-1">
                          {formatCurrency(item.nilai_spm)}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <Badge className={`${style.badge} text-xs`}>
                          {getDeadlineLabel(item.deadline, item.daysRemaining)}
                        </Badge>
                        <div className="text-xs text-muted-foreground mt-1">
                          {format(item.deadline, "dd MMM", { locale: localeId })}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
