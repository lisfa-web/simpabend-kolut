import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TrendingUp, Award } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface TopVendorsProps {
  data?: Array<{
    vendor_id: string;
    vendor_name: string;
    total_spm: number;
    total_nilai: number;
  }>;
  isLoading?: boolean;
}

const VENDOR_COLORS = [
  { bg: "#3b82f6", light: "#dbeafe", gradient: "from-blue-500 to-blue-600" },    // Blue
  { bg: "#8b5cf6", light: "#ede9fe", gradient: "from-purple-500 to-purple-600" }, // Purple  
  { bg: "#ec4899", light: "#fce7f3", gradient: "from-pink-500 to-pink-600" },     // Pink
  { bg: "#f59e0b", light: "#fef3c7", gradient: "from-amber-500 to-amber-600" },   // Amber
  { bg: "#10b981", light: "#d1fae5", gradient: "from-green-500 to-green-600" },   // Green
];

const MEDAL_ICONS = ["🥇", "🥈", "🥉", "🏆", "⭐"];

export const TopVendorsWidget = ({ data, isLoading }: TopVendorsProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            Top 5 Vendor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const maxValue = data?.[0]?.total_nilai || 1;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            Top 5 Vendor
          </div>
          <Badge variant="outline" className="gap-1">
            <TrendingUp className="w-3 h-3" />
            Berdasarkan Nilai
          </Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">Vendor dengan total nilai SPM tertinggi</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data && data.length > 0 ? (
            data.map((vendor, index) => {
              const color = VENDOR_COLORS[index];
              const percentage = (vendor.total_nilai / maxValue) * 100;
              
              return (
                <div 
                  key={vendor.vendor_id} 
                  className="group relative overflow-hidden rounded-xl transition-all hover:shadow-md"
                  style={{ 
                    background: `linear-gradient(135deg, ${color.light} 0%, white 100%)`,
                    border: `2px solid ${color.light}`
                  }}
                >
                  {/* Decorative gradient overlay */}
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity"
                    style={{ 
                      background: `linear-gradient(135deg, ${color.bg} 0%, transparent 100%)`
                    }}
                  />
                  
                  <div className="relative p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div 
                          className={`flex items-center justify-center w-10 h-10 rounded-full text-white text-lg font-bold shadow-lg bg-gradient-to-br ${color.gradient}`}
                        >
                          {MEDAL_ICONS[index]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                            {vendor.vendor_name}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge 
                              variant="secondary" 
                              className="text-xs"
                              style={{ backgroundColor: color.light, color: color.bg }}
                            >
                              <Users className="w-3 h-3 mr-1" />
                              {vendor.total_spm} SPM
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <p 
                          className="text-sm font-bold"
                          style={{ color: color.bg }}
                        >
                          {new Intl.NumberFormat("id-ID", {
                            style: "currency",
                            currency: "IDR",
                            notation: "compact",
                            maximumFractionDigits: 1,
                          }).format(vendor.total_nilai)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {percentage.toFixed(0)}% dari top vendor
                        </p>
                      </div>
                    </div>
                    
                    {/* Colorful progress bar */}
                    <div className="relative h-2 bg-white rounded-full overflow-hidden shadow-inner">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${color.gradient} transition-all duration-500 shadow-sm`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-2 opacity-20" />
              <p className="text-sm">Tidak ada data vendor</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
