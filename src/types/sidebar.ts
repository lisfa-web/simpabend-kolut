export type SidebarTemplate = 'blue-gradient' | 'emerald-clean' | 'slate-elegant' | 'purple-vibrant' | 'teal-dark' | 'rose-bold';

export type IconStyle = 
  | 'standard'           // Default, ikut parent color
  | 'colorful-per-menu'  // Setiap menu punya warna sendiri
  | 'rounded-background' // Icon dengan background rounded
  | 'gradient-icon'      // Icon dengan gradient
  | 'subtle-accent';     // Subtle default, accent on hover/active

export interface IconColorMap {
  [menuName: string]: string;
}

export interface SidebarThemeConfig {
  id: SidebarTemplate;
  name: string;
  description: string;
  iconStyle: IconStyle;
  preview: {
    headerGradient: string;
    contentGradient: string;
    headerText: string;
    activeMenu: string;
  };
  classes: {
    header: string;
    content: string;
    activeItem: string;
    logoSubtitle: string;
  };
}

// Icon color mapping untuk colorful-per-menu style
export const ICON_COLORS: IconColorMap = {
  "Dashboard": "text-blue-600",
  "Input SPM": "text-green-600",
  "Verifikasi Resepsionis": "text-purple-600",
  "Verifikasi PBMD": "text-amber-600",
  "Verifikasi Akuntansi": "text-cyan-600",
  "Verifikasi Perbendaharaan": "text-emerald-600",
  "Approval Kepala BKAD": "text-rose-600",
  "SP2D": "text-indigo-600",
  "Laporan": "text-orange-600",
  "Surat": "text-pink-600",
  "Manajemen User": "text-teal-600",
  "Master Data": "text-violet-600",
  "Pengaturan": "text-slate-600",
  "Audit Trail": "text-fuchsia-600",
  "Panduan Manual": "text-sky-600",
  "Kelola Panduan": "text-lime-600",
};

// Background colors untuk rounded-background style
export const ICON_BG_COLORS: IconColorMap = {
  "Dashboard": "bg-blue-600",
  "Input SPM": "bg-green-600",
  "Verifikasi Resepsionis": "bg-purple-600",
  "Verifikasi PBMD": "bg-amber-600",
  "Verifikasi Akuntansi": "bg-cyan-600",
  "Verifikasi Perbendaharaan": "bg-emerald-600",
  "Approval Kepala BKAD": "bg-rose-600",
  "SP2D": "bg-indigo-600",
  "Laporan": "bg-orange-600",
  "Surat": "bg-pink-600",
  "Manajemen User": "bg-teal-600",
  "Master Data": "bg-violet-600",
  "Pengaturan": "bg-slate-600",
  "Audit Trail": "bg-fuchsia-600",
  "Panduan Manual": "bg-sky-600",
  "Kelola Panduan": "bg-lime-600",
};

export const SIDEBAR_TEMPLATES: Record<SidebarTemplate, SidebarThemeConfig> = {
  'blue-gradient': {
    id: 'blue-gradient',
    name: 'Blue Gradient',
    description: 'Professional dan modern dengan gradasi biru',
    iconStyle: 'standard',
    preview: {
      headerGradient: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
      contentGradient: 'linear-gradient(180deg, #eff6ff 0%, #ffffff 40%, #f9fafb 100%)',
      headerText: '#ffffff',
      activeMenu: '#dbeafe',
    },
    classes: {
      header: 'bg-gradient-to-br from-blue-600 to-blue-700 text-white',
      content: 'bg-gradient-to-b from-blue-50 via-white to-gray-50',
      activeItem: 'bg-blue-100 border-l-4 border-blue-600',
      logoSubtitle: 'opacity-90',
    },
  },
  'emerald-clean': {
    id: 'emerald-clean',
    name: 'Emerald Clean',
    description: 'Fresh dan clean dengan nuansa hijau emerald',
    iconStyle: 'subtle-accent',
    preview: {
      headerGradient: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
      contentGradient: 'linear-gradient(180deg, #ecfdf5 0%, #ffffff 50%, #f8fafc 100%)',
      headerText: '#ffffff',
      activeMenu: '#d1fae5',
    },
    classes: {
      header: 'bg-gradient-to-br from-emerald-600 to-emerald-700 text-white',
      content: 'bg-gradient-to-b from-emerald-50 via-white to-slate-50',
      activeItem: 'bg-emerald-100 border-l-4 border-emerald-600',
      logoSubtitle: 'opacity-90',
    },
  },
  'slate-elegant': {
    id: 'slate-elegant',
    name: 'Slate Elegant',
    description: 'Elegant dan sophisticated dengan accent gold',
    iconStyle: 'gradient-icon',
    preview: {
      headerGradient: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
      contentGradient: 'linear-gradient(180deg, #f1f5f9 0%, #ffffff 50%, #f9fafb 100%)',
      headerText: '#ffffff',
      activeMenu: '#e2e8f0',
    },
    classes: {
      header: 'bg-gradient-to-br from-slate-800 to-slate-900 text-white',
      content: 'bg-gradient-to-b from-slate-100 via-white to-gray-50',
      activeItem: 'bg-slate-200 shadow-sm',
      logoSubtitle: 'text-amber-200 opacity-95',
    },
  },
  'purple-vibrant': {
    id: 'purple-vibrant',
    name: 'Purple Vibrant',
    description: 'Bold dan energetic dengan gradasi ungu vibrant',
    iconStyle: 'colorful-per-menu',
    preview: {
      headerGradient: 'linear-gradient(135deg, #7e22ce 0%, #581c87 100%)',
      contentGradient: 'linear-gradient(180deg, #e9d5ff 0%, #f3e8ff 100%)',
      headerText: '#ffffff',
      activeMenu: '#d8b4fe',
    },
    classes: {
      header: 'bg-gradient-to-br from-purple-700 to-purple-900 text-white',
      content: 'bg-gradient-to-b from-purple-200 to-purple-50',
      activeItem: 'bg-purple-300 border-l-4 border-purple-700',
      logoSubtitle: 'text-purple-100 opacity-95',
    },
  },
  'teal-dark': {
    id: 'teal-dark',
    name: 'Teal Dark',
    description: 'Professional dan striking dengan cyan-teal gelap',
    iconStyle: 'rounded-background',
    preview: {
      headerGradient: 'linear-gradient(135deg, #155e75 0%, #134e4a 100%)',
      contentGradient: 'linear-gradient(180deg, #99f6e4 0%, #cffafe 100%)',
      headerText: '#ffffff',
      activeMenu: '#5eead4',
    },
    classes: {
      header: 'bg-gradient-to-br from-cyan-800 to-teal-900 text-white',
      content: 'bg-gradient-to-b from-teal-100 to-cyan-50',
      activeItem: 'bg-teal-200 border-l-4 border-teal-700',
      logoSubtitle: 'text-cyan-100 opacity-95',
    },
  },
  'rose-bold': {
    id: 'rose-bold',
    name: 'Rose Bold',
    description: 'Warm dan welcoming dengan rose-pink bold',
    iconStyle: 'colorful-per-menu',
    preview: {
      headerGradient: 'linear-gradient(135deg, #be123c 0%, #9f1239 100%)',
      contentGradient: 'linear-gradient(180deg, #fecdd3 0%, #fce7f3 100%)',
      headerText: '#ffffff',
      activeMenu: '#fda4af',
    },
    classes: {
      header: 'bg-gradient-to-br from-rose-700 to-pink-900 text-white',
      content: 'bg-gradient-to-b from-rose-200 to-pink-50',
      activeItem: 'bg-rose-300 border-l-4 border-rose-700',
      logoSubtitle: 'text-rose-100 opacity-95',
    },
  },
};
