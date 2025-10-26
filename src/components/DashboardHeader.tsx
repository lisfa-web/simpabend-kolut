import { LogOut } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { getRoleDisplayName, getRoleBadgeColor } from "@/lib/auth";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { NotificationPanel } from "@/components/NotificationPanel";
import { SidebarTrigger } from "@/components/ui/sidebar";

const DashboardHeader = () => {
  const { user, roles, logout } = useAuth();
  const { data: profile } = useUserProfile();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const primaryRole = roles[0];

  return (
    <header className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <Badge className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
            Sistem Monitoring & Validasi Digital
          </Badge>
        </div>

        <div className="flex items-center gap-4">
          <NotificationPanel />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {profile?.full_name ? getInitials(profile.full_name) : "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="text-left">
                  <p className="text-sm font-semibold">
                    {profile?.full_name || user?.email || "User"}
                  </p>
                  {primaryRole && (
                    <p className="text-xs text-muted-foreground">
                      {getRoleDisplayName(primaryRole)}
                    </p>
                  )}
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Akun Saya</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="px-2 py-1.5 text-sm">
                <p className="font-medium">{profile?.full_name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              {roles.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <div className="px-2 py-1.5">
                    <p className="text-xs font-medium mb-1">Role:</p>
                    <div className="flex flex-wrap gap-1">
                      {roles.map((role) => (
                        <Badge
                          key={role}
                          variant="secondary"
                          className={`text-xs ${getRoleBadgeColor(role)}`}
                        >
                          {getRoleDisplayName(role)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
