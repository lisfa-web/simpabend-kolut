import { IconStyle, ICON_COLORS, ICON_BG_COLORS } from "@/types/sidebar";
import { cn } from "@/lib/utils";

interface GetIconClassesParams {
  style: IconStyle;
  menuName: string;
  isActive: boolean;
  templateId: string;
}

export function getIconClasses({ 
  style, 
  menuName, 
  isActive,
  templateId 
}: GetIconClassesParams): string {
  const baseClasses = "h-6 w-6 transition-all duration-200";
  
  switch (style) {
    case 'standard':
      return cn(baseClasses, "group-hover:opacity-80");
    
    case 'colorful-per-menu':
      const color = ICON_COLORS[menuName] || "text-gray-600";
      return cn(
        baseClasses, 
        color,
        "group-hover:brightness-110"
      );
    
    case 'rounded-background':
      return cn(
        "h-4 w-4 text-white transition-all duration-200",
        "group-hover:scale-110"
      );
    
    case 'gradient-icon':
      // Gradient based on template
      const gradientMap: Record<string, string> = {
        'blue-gradient': 'from-blue-600 to-blue-800',
        'emerald-clean': 'from-emerald-600 to-emerald-800',
        'slate-elegant': 'from-slate-600 to-slate-900',
        'purple-vibrant': 'from-purple-600 to-purple-900',
        'teal-dark': 'from-cyan-600 to-teal-900',
        'rose-bold': 'from-rose-600 to-pink-900',
      };
      const gradient = gradientMap[templateId] || 'from-gray-600 to-gray-800';
      
      return cn(
        baseClasses,
        "bg-gradient-to-br bg-clip-text text-transparent",
        gradient,
        "group-hover:brightness-125"
      );
    
    case 'subtle-accent':
      return cn(
        baseClasses,
        isActive ? "text-current" : "text-gray-600",
        "group-hover:text-current transition-colors"
      );
    
    default:
      return baseClasses;
  }
}

export function getIconWrapperClasses(style: IconStyle, menuName: string): string | null {
  if (style === 'rounded-background') {
    const bgColor = ICON_BG_COLORS[menuName] || "bg-gray-600";
    return cn(
      "p-1.5 rounded-lg transition-all duration-200",
      bgColor,
      "group-hover:shadow-md group-hover:scale-105"
    );
  }
  return null;
}
