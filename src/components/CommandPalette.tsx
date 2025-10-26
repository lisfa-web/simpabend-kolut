import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  LayoutDashboard,
  FileText,
  CheckSquare,
  Calculator,
  Wallet,
  UserCog,
  FileCheck,
  BarChart3,
  Mail,
  Users,
  Database,
  Settings,
  BookOpen,
  Clock,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface NavItem {
  name: string;
  path: string;
  icon: any;
  category: string;
  roles?: string[];
}

const navItems: NavItem[] = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard, category: "Navigasi" },
  { name: "Input SPM", path: "/input-spm", icon: FileText, category: "SPM", roles: ["bendahara_opd", "administrator"] },
  { name: "Verifikasi Resepsionis", path: "/verifikasi-resepsionis", icon: CheckSquare, category: "Verifikasi", roles: ["resepsionis", "administrator"] },
  { name: "Verifikasi PBMD", path: "/verifikasi-pbmd", icon: Settings, category: "Verifikasi", roles: ["pbmd", "administrator"] },
  { name: "Verifikasi Akuntansi", path: "/verifikasi-akuntansi", icon: Calculator, category: "Verifikasi", roles: ["akuntansi", "administrator"] },
  { name: "Verifikasi Perbendaharaan", path: "/verifikasi-perbendaharaan", icon: Wallet, category: "Verifikasi", roles: ["perbendaharaan", "administrator"] },
  { name: "Approval Kepala BKAD", path: "/approval-kepala-bkad", icon: UserCog, category: "Approval", roles: ["kepala_bkad", "administrator"] },
  { name: "SP2D", path: "/sp2d", icon: FileCheck, category: "SP2D", roles: ["kuasa_bud", "kepala_bkad", "administrator"] },
  { name: "Laporan", path: "/laporan", icon: BarChart3, category: "Laporan" },
  { name: "Surat", path: "/surat", icon: Mail, category: "Surat", roles: ["administrator", "kepala_bkad"] },
  { name: "Manajemen User", path: "/users", icon: Users, category: "Master Data", roles: ["administrator"] },
  { name: "Master Data", path: "/masterdata", icon: Database, category: "Master Data", roles: ["administrator"] },
  { name: "Pengaturan", path: "/pengaturan", icon: Settings, category: "Sistem", roles: ["super_admin"] },
  { name: "Panduan Manual", path: "/panduan-manual", icon: BookOpen, category: "Bantuan" },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const { roles } = useAuth();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSelect = (path: string) => {
    setOpen(false);
    navigate(path);
    setSearch("");
  };

  const canAccess = (itemRoles?: string[]) => {
    if (!itemRoles || itemRoles.length === 0) return true;
    return roles.some((role) => itemRoles.includes(role));
  };

  const filteredItems = navItems.filter((item) => canAccess(item.roles));

  const groupedItems = filteredItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, NavItem[]>);

  const recentPages = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Input SPM", path: "/input-spm", icon: FileText },
    { name: "Laporan", path: "/laporan", icon: BarChart3 },
  ].filter((item) => {
    const navItem = navItems.find((ni) => ni.path === item.path);
    return navItem && canAccess(navItem.roles);
  });

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput 
        placeholder="Ketik untuk mencari menu atau tekan Ctrl+K..." 
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        <CommandEmpty>Tidak ada hasil ditemukan.</CommandEmpty>

        {!search && (
          <>
            <CommandGroup heading="Terakhir Dikunjungi">
              {recentPages.map((item) => {
                const Icon = item.icon;
                return (
                  <CommandItem
                    key={item.path}
                    onSelect={() => handleSelect(item.path)}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        {Object.entries(groupedItems).map(([category, items]) => (
          <CommandGroup key={category} heading={category}>
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <CommandItem
                  key={item.path}
                  onSelect={() => handleSelect(item.path)}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {item.path}
                  </span>
                </CommandItem>
              );
            })}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  );
}
