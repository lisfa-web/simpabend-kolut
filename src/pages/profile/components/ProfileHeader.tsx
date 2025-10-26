import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useUserRole } from "@/hooks/useUserRole";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Mail, Phone, Calendar, Building2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const getRoleDisplayName = (role: string): string => {
  const roleMap: Record<string, string> = {
    administrator: "Administrator",
    super_admin: "Super Admin",
    bendahara_opd: "Bendahara OPD",
    resepsionis: "Resepsionis",
    pbmd: "PBMD",
    akuntansi: "Akuntansi",
    perbendaharaan: "Perbendaharaan",
    kepala_bkad: "Kepala BKAD",
    kuasa_bud: "Kuasa BUD",
  };
  return roleMap[role] || role;
};

const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const ProfileHeader = () => {
  const { user } = useAuth();
  const { data: profile, isLoading } = useUserProfile();
  const { roles } = useUserRole();

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-start gap-6">
          <Skeleton className="h-24 w-24 rounded-full" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex flex-col md:flex-row items-start gap-6">
        <Avatar className="h-24 w-24">
          <AvatarFallback className="text-2xl">
            {getInitials(profile?.full_name || "User")}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-4">
          <div>
            <h2 className="text-2xl font-bold">{profile?.full_name}</h2>
            <div className="flex flex-wrap gap-2 mt-2">
              {roles.map((roleObj, index) => (
                <Badge key={`${roleObj.role}-${roleObj.opd_id || index}`} variant="secondary">
                  {getRoleDisplayName(roleObj.role)}
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span>{profile?.email || user?.email}</span>
            </div>
            {profile?.phone && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>{profile.phone}</span>
              </div>
            )}
            {roles.some(r => r.opd_id) && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Building2 className="h-4 w-4" />
                <span>OPD Terdaftar</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                Bergabung {profile?.created_at ? format(new Date(profile.created_at), "dd MMMM yyyy", { locale: id }) : "-"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ProfileHeader;
