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
import { useAuth } from "@/hooks/useAuth";
import { Database } from "@/integrations/supabase/types";
import { useSidebarTemplate } from "@/hooks/useSidebarTemplate";
import { SIDEBAR_TEMPLATES } from "@/types/sidebar";
import { getIconClasses, getIconWrapperClasses } from "@/lib/iconStyles";
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

  // Validate template exists, fallback to blue-gradient if not found
  const validTemplate = activeTemplate && SIDEBAR_TEMPLATES[activeTemplate] 
    ? activeTemplate 
    : 'blue-gradient';
  const theme = SIDEBAR_TEMPLATES[validTemplate];

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
                  
                  return (
                    <SidebarMenuItem key={item.path}>
                      <SidebarMenuButton asChild isActive={isActive(item.path)} tooltip={item.name} className="text-base group">
                        <NavLink to={item.path}>
                          {wrapperClasses ? (
                            <div className={wrapperClasses}>
                              <IconComponent className={iconClasses} />
                            </div>
                          ) : (
                            <IconComponent className={iconClasses} />
                          )}
                          <span>{item.name}</span>
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
