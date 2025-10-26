import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

interface TopVendorsProps {
  data?: Array<{
    vendor_id: string;
    vendor_name: string;
    total_spm: number;
    total_nilai: number;
  }>;
  isLoading?: boolean;
}

export const TopVendorsWidget = ({ data, isLoading }: TopVendorsProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Top 5 Vendor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
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
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Top 5 Vendor
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data && data.length > 0 ? (
            data.map((vendor, index) => (
              <div key={vendor.vendor_id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium line-clamp-1">
                        {vendor.vendor_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {vendor.total_spm} SPM
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">
                      {new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                        notation: "compact",
                        maximumFractionDigits: 1,
                      }).format(vendor.total_nilai)}
                    </p>
                  </div>
                </div>
                <Progress
                  value={(vendor.total_nilai / maxValue) * 100}
                  className="h-2"
                />
              </div>
            ))
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
