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

const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { name: "Input SPM", icon: FileText, path: "/input-spm" },
  { name: "Verifikasi", icon: CheckSquare, path: "/verifikasi" },
  { name: "PBMD", icon: Settings, path: "/pbmd" },
  { name: "Akuntansi", icon: Calculator, path: "/akuntansi" },
  { name: "Perbendaharaan", icon: Wallet, path: "/perbendaharaan" },
  { name: "Kepala BKAD", icon: UserCog, path: "/kepala-bkad" },
  { name: "SP2D", icon: FileCheck, path: "/sp2d" },
  { name: "Laporan", icon: BarChart3, path: "/laporan" },
  { name: "Surat", icon: Mail, path: "/surat" },
  { name: "Pengaturan", icon: Settings, path: "/pengaturan" },
];

const Sidebar = () => {
  return (
    <aside className="w-64 bg-[#1e3a8a] min-h-screen flex flex-col text-white">
      <div className="p-6 border-b border-blue-700">
        <h1 className="text-xl font-bold">SIMPA BEND</h1>
        <p className="text-xs text-blue-200">BKAD Kolaka Utara</p>
      </div>

      <nav className="flex-1 py-4">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-6 py-3 transition-colors ${
                isActive
                  ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-semibold"
                  : "text-blue-100 hover:bg-blue-800"
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
