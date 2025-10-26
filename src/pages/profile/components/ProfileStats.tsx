import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUserActivity } from "@/hooks/useUserActivity";
import { useUserSp2dActivity } from "@/hooks/useUserSp2dActivity";
import { FileText, CheckCircle2, Clock, XCircle, Loader2 } from "lucide-react";

const ProfileStats = () => {
  const { data: spmActivity, isLoading: loadingSpm } = useUserActivity();
  const { data: sp2dActivity, isLoading: loadingSp2d } = useUserSp2dActivity();

  if (loadingSpm || loadingSp2d) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const spmStats = [
    {
      title: "Total SPM",
      value: spmActivity?.totalCount || 0,
      icon: FileText,
      description: "Total SPM yang dikerjakan",
    },
    {
      title: "Disetujui",
      value: spmActivity?.byStatus?.disetujui || 0,
      icon: CheckCircle2,
      description: "SPM yang telah disetujui",
    },
    {
      title: "Diproses",
      value: (spmActivity?.byStatus?.resepsionis_verifikasi || 0) + 
             (spmActivity?.byStatus?.pbmd_verifikasi || 0) +
             (spmActivity?.byStatus?.akuntansi_validasi || 0) +
             (spmActivity?.byStatus?.perbendaharaan_verifikasi || 0) +
             (spmActivity?.byStatus?.kepala_bkad_review || 0),
      icon: Clock,
      description: "SPM dalam proses verifikasi",
    },
    {
      title: "Ditolak/Revisi",
      value: (spmActivity?.byStatus?.ditolak || 0) + (spmActivity?.byStatus?.perlu_revisi || 0),
      icon: XCircle,
      description: "SPM ditolak atau perlu revisi",
    },
  ];

  const sp2dStats = [
    {
      title: "Total SP2D",
      value: sp2dActivity?.totalCount || 0,
      icon: FileText,
      description: "Total SP2D yang dikerjakan",
    },
    {
      title: "Dicairkan",
      value: sp2dActivity?.byStatus?.cair || 0,
      icon: CheckCircle2,
      description: "SP2D yang telah dicairkan",
    },
    {
      title: "Diterbitkan",
      value: sp2dActivity?.byStatus?.diterbitkan || 0,
      icon: Clock,
      description: "SP2D telah diterbitkan",
    },
    {
      title: "Gagal",
      value: sp2dActivity?.byStatus?.gagal || 0,
      icon: XCircle,
      description: "SP2D gagal diproses",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Statistik SPM</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {spmStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {(sp2dActivity?.totalCount || 0) > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Statistik SP2D</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {sp2dStats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.title}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {stat.title}
                    </CardTitle>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stat.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileStats;
