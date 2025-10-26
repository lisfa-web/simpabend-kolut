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
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Database } from "@/integrations/supabase/types";
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

  const canAccessMenu = (menuRoles?: AppRole[]) => {
    if (!menuRoles || menuRoles.length === 0) return true;
    return roles.some((role) => menuRoles.includes(role));
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="bg-gradient-to-br from-blue-600 to-blue-700 text-white border-b-0">
        <div className="px-4 py-6">
          {open ? (
            <>
              <h1 className="text-2xl font-bold">SIMPA BEND</h1>
              <p className="text-sm opacity-90">BKAD Kolaka Utara</p>
            </>
          ) : (
            <h1 className="text-xl font-bold text-center">SB</h1>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-gradient-to-b from-blue-50 via-white to-gray-50">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems
                .filter((item) => canAccessMenu(item.roles))
                .map((item) => (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton asChild isActive={isActive(item.path)} tooltip={item.name} className="text-base">
                      <NavLink to={item.path}>
                        <item.icon className="h-6 w-6" />
                        <span>{item.name}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
