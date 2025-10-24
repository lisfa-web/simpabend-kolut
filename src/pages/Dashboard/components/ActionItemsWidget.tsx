import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowRight, UserCircle, FileText, ClipboardCheck, Calculator, Wallet, Shield, Briefcase } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { useNavigate } from "react-router-dom";
import { useDashboardActionItems } from "@/hooks/useDashboardActionItems";
import { useUserRole } from "@/hooks/useUserRole";
import { Skeleton } from "@/components/ui/skeleton";
import { getRoleDisplayName } from "@/lib/auth";

const getRoleIcon = (role: string) => {
  const icons: Record<string, any> = {
    bendahara_opd: FileText,
    resepsionis: UserCircle,
    pbmd: ClipboardCheck,
    akuntansi: Calculator,
    perbendaharaan: Wallet,
    kepala_bkad: Shield,
    kuasa_bud: Briefcase,
    administrator: Shield,
  };
  return icons[role] || AlertCircle;
};

const getRoleEmptyMessage = (roles: any[]) => {
  if (!roles || roles.length === 0) {
    return {
      title: "Tidak Ada Role",
      description: "Widget ini hanya menampilkan item untuk user dengan role tertentu. Hubungi administrator untuk mengatur role Anda.",
      icon: AlertCircle,
    };
  }

  const role = roles[0]?.role;
  const messages: Record<string, { title: string; description: string; icon: any }> = {
    bendahara_opd: {
      title: "Bendahara OPD",
      description: "Widget ini akan menampilkan SPM yang perlu direvisi oleh Anda.",
      icon: FileText,
    },
    resepsionis: {
      title: "Resepsionis",
      description: "Widget ini akan menampilkan SPM yang baru diajukan dan menunggu verifikasi Resepsionis.",
      icon: UserCircle,
    },
    pbmd: {
      title: "PBMD",
      description: "Widget ini akan menampilkan SPM yang telah diverifikasi Resepsionis dan menunggu verifikasi PBMD.",
      icon: ClipboardCheck,
    },
    akuntansi: {
      title: "Akuntansi",
      description: "Widget ini akan menampilkan SPM yang telah diverifikasi PBMD dan menunggu validasi Akuntansi.",
      icon: Calculator,
    },
    perbendaharaan: {
      title: "Perbendaharaan",
      description: "Widget ini akan menampilkan SPM yang telah divalidasi Akuntansi dan menunggu verifikasi Perbendaharaan.",
      icon: Wallet,
    },
    kepala_bkad: {
      title: "Kepala BKAD",
      description: "Widget ini akan menampilkan SPM yang telah diverifikasi Perbendaharaan dan menunggu approval Kepala BKAD.",
      icon: Shield,
    },
    kuasa_bud: {
      title: "Kuasa BUD",
      description: "Widget ini akan menampilkan SP2D yang menunggu verifikasi Kuasa BUD.",
      icon: Briefcase,
    },
    administrator: {
      title: "Administrator",
      description: "Widget ini akan menampilkan SPM yang menunggu approval Kepala BKAD.",
      icon: Shield,
    },
  };

  return messages[role] || {
    title: "Role Tidak Dikenal",
    description: "Widget ini menampilkan item yang memerlukan tindakan sesuai role Anda.",
    icon: AlertCircle,
  };
};

export const ActionItemsWidget = () => {
  const navigate = useNavigate();
  const { data: items, isLoading, error } = useDashboardActionItems();
  const { roles } = useUserRole();

  const handleItemClick = (id: string, type: "spm" | "sp2d") => {
    if (type === "spm") {
      navigate(`/spm/input/detail/${id}`);
    } else {
      navigate(`/spm/sp2d/detail/${id}`);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tindakan Diperlukan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tindakan Diperlukan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-destructive">
            <AlertCircle className="h-12 w-12 mx-auto mb-2" />
            <p className="text-sm font-medium">Gagal memuat data</p>
            <p className="text-xs text-muted-foreground mt-1">Silakan refresh halaman</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!items || items.length === 0) {
    const roleInfo = getRoleEmptyMessage(roles);
    const IconComponent = roleInfo.icon;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tindakan Diperlukan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <IconComponent className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
            <div className="flex items-center justify-center gap-2 mb-2">
              <Badge variant="outline" className="text-xs">
                {roles && roles.length > 0 ? getRoleDisplayName(roles[0].role) : "Tidak Ada Role"}
              </Badge>
            </div>
            <p className="text-sm font-medium text-foreground mb-1">{roleInfo.title}</p>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
              {roleInfo.description}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Tindakan Diperlukan</CardTitle>
          <Badge variant="destructive">{items.length}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
            onClick={() => handleItemClick(item.id, item.type)}
          >
            <div className="flex-1">
              <p className="text-sm font-medium">{item.title}</p>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(item.amount)} • {new Date(item.date).toLocaleDateString("id-ID")}
              </p>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
