export type SidebarTemplate = 'blue-gradient' | 'emerald-clean' | 'slate-elegant';

export interface SidebarThemeConfig {
  id: SidebarTemplate;
  name: string;
  description: string;
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

export const SIDEBAR_TEMPLATES: Record<SidebarTemplate, SidebarThemeConfig> = {
  'blue-gradient': {
    id: 'blue-gradient',
    name: 'Blue Gradient',
    description: 'Professional dan modern dengan gradasi biru',
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
};
