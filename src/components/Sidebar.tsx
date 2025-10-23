import { NavLink } from "react-router-dom";
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
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

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
    name: "Pengaturan", 
    icon: Settings, 
    path: "/pengaturan",
    roles: ["administrator"]
  },
];

const Sidebar = () => {
  const { roles } = useAuth();

  const canAccessMenu = (menuRoles?: AppRole[]) => {
    if (!menuRoles || menuRoles.length === 0) return true;
    return roles.some((role) => menuRoles.includes(role));
  };

  return (
    <aside className="w-64 bg-primary min-h-screen flex flex-col text-primary-foreground">
      <div className="p-6 border-b border-primary/20">
        <h1 className="text-xl font-bold">SIMPA BEND</h1>
        <p className="text-xs opacity-80">BKAD Kolaka Utara</p>
      </div>

      <nav className="flex-1 py-4">
        {menuItems
          .filter((item) => canAccessMenu(item.roles))
          .map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-6 py-3 transition-colors ${
                  isActive
                    ? "bg-gradient-to-r from-accent to-success text-accent-foreground font-semibold"
                    : "text-primary-foreground/80 hover:bg-primary/80"
                }`
              }
            >
              <item.icon className="h-5 w-5" />
              <span>{item.name}</span>
            </NavLink>
          ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
