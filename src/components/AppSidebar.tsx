import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  CheckSquare,
  Settings,
  Calculator,
  Wallet,
  UserCog,
  FileCheck,
  BarChart3,
  Mail,
  Users,
  Database as DatabaseIcon,
  ScrollText,
  BookOpen,
  Building2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { Database } from "@/integrations/supabase/types";
import { useSidebarTemplate } from "@/hooks/useSidebarTemplate";
import { SIDEBAR_TEMPLATES } from "@/types/sidebar";
import { getIconClasses, getIconWrapperClasses } from "@/lib/iconStyles";
import { useMenuNotifications } from "@/hooks/useMenuNotifications";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";

type AppRole = Database["public"]["Enums"]["app_role"] | 'super_admin';

interface MenuItem {
  name: string;
  icon: any;
  path: string;
  roles?: AppRole[];
}

const menuItems: MenuItem[] = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { 
    name: "Input SPM", 
    icon: FileText, 
    path: "/input-spm",
    roles: ["bendahara_opd", "administrator"]
  },
  { 
    name: "Verifikasi Resepsionis", 
    icon: CheckSquare, 
    path: "/verifikasi-resepsionis",
    roles: ["resepsionis", "administrator"]
  },
  { 
    name: "Verifikasi PBMD", 
    icon: Settings, 
    path: "/verifikasi-pbmd",
    roles: ["pbmd", "administrator"]
  },
  { 
    name: "Verifikasi Akuntansi", 
    icon: Calculator, 
    path: "/verifikasi-akuntansi",
    roles: ["akuntansi", "administrator"]
  },
  { 
    name: "Verifikasi Perbendaharaan", 
    icon: Wallet, 
    path: "/verifikasi-perbendaharaan",
    roles: ["perbendaharaan", "administrator"]
  },
  { 
    name: "Approval Kepala BKAD", 
    icon: UserCog, 
    path: "/approval-kepala-bkad",
    roles: ["kepala_bkad", "administrator"]
  },
  { 
    name: "SP2D", 
    icon: FileCheck, 
    path: "/sp2d",
    roles: ["kuasa_bud", "kepala_bkad", "administrator"]
  },
  { 
    name: "Laporan", 
    icon: BarChart3, 
    path: "/laporan"
  },
  { 
    name: "Surat", 
    icon: Mail, 
    path: "/surat",
    roles: ["administrator", "kepala_bkad"]
  },
  { 
    name: "Manajemen User", 
    icon: Users, 
    path: "/users",
    roles: ["administrator"]
  },
  { 
    name: "Master Data", 
    icon: DatabaseIcon, 
    path: "/masterdata",
    roles: ["administrator"]
  },
  { 
    name: "Pengaturan", 
    icon: Settings, 
    path: "/pengaturan",
    roles: ["super_admin"]
  },
  { 
    name: "Audit Trail", 
    icon: ScrollText, 
    path: "/pengaturan/audit-trail",
    roles: ["administrator", "kepala_bkad"]
  },
  { 
    name: "Panduan Manual", 
    icon: BookOpen, 
    path: "/panduan-manual"
  },
  { 
    name: "Kelola Panduan", 
    icon: BookOpen, 
    path: "/panduan-manual/admin",
    roles: ["administrator"]
  },
];

export function AppSidebar() {
  const { roles } = useAuth();
  const location = useLocation();
  const { open } = useSidebar();
  const { data: activeTemplate } = useSidebarTemplate();
  const { data: notifications } = useMenuNotifications();

  // Validate template exists, fallback to blue-gradient if not found
  const validTemplate = activeTemplate && SIDEBAR_TEMPLATES[activeTemplate] 
    ? activeTemplate 
    : 'blue-gradient';
  const theme = SIDEBAR_TEMPLATES[validTemplate];

  // Get notification count for menu item
  const getNotificationCount = (path: string): number => {
    if (!notifications) return 0;
    const notificationMap: Record<string, number> = {
      "/input-spm": notifications.inputSpm,
      "/verifikasi-resepsionis": notifications.verifikasiResepsionis,
      "/verifikasi-pbmd": notifications.verifikasiPbmd,
      "/verifikasi-akuntansi": notifications.verifikasiAkuntansi,
      "/verifikasi-perbendaharaan": notifications.verifikasiPerbendaharaan,
      "/approval-kepala-bkad": notifications.approvalKepalaBkad,
      "/sp2d": notifications.sp2d,
    };
    return notificationMap[path] || 0;
  };

  const canAccessMenu = (menuRoles?: AppRole[]) => {
    if (!menuRoles || menuRoles.length === 0) return true;
    return roles.some((role) => menuRoles.includes(role));
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className={`${theme.classes.header} border-b`}>
        <div className="px-4 py-6">
          {open ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-white/10 backdrop-blur-sm">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-white text-sm">SIMPA BEND</h2>
                <p className="text-xs text-white/70">BKAD Kolaka Utara</p>
              </div>
            </div>
          ) : (
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-white/10 mx-auto">
              <Building2 className="w-6 h-6 text-white" />
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className={theme.classes.content}>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems
                .filter((item) => canAccessMenu(item.roles))
                .map((item) => {
                  const IconComponent = item.icon;
                  const iconClasses = getIconClasses({
                    style: theme.iconStyle,
                    menuName: item.name,
                    isActive: isActive(item.path),
                    templateId: validTemplate,
                  });
                  const wrapperClasses = getIconWrapperClasses(theme.iconStyle, item.name);
                  const notificationCount = getNotificationCount(item.path);
                  
                  return (
                    <SidebarMenuItem key={item.path}>
                      <SidebarMenuButton asChild isActive={isActive(item.path)} tooltip={item.name} className="text-base group">
                        <NavLink to={item.path} className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-3">
                            {wrapperClasses ? (
                              <div className={wrapperClasses}>
                                <IconComponent className={iconClasses} />
                              </div>
                            ) : (
                              <IconComponent className={iconClasses} />
                            )}
                            <span>{item.name}</span>
                          </div>
                          {notificationCount > 0 && open && (
                            <Badge 
                              variant="destructive" 
                              className="ml-auto h-5 w-5 flex items-center justify-center p-0 text-xs rounded-full animate-pulse"
                            >
                              {notificationCount > 99 ? "99+" : notificationCount}
                            </Badge>
                          )}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
