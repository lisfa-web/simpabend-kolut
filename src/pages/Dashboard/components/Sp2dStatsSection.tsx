import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Clock, XCircle, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { Skeleton } from "@/components/ui/skeleton";

interface Sp2dStatsSectionProps {
  totalSp2d: number;
  totalValue: number;
  pendingSp2d: number;
  isLoading: boolean;
}

export const Sp2dStatsSection = ({ totalSp2d, totalValue, pendingSp2d, isLoading }: Sp2dStatsSectionProps) => {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-3 w-40" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const issuedSp2d = totalSp2d - pendingSp2d;
  const failedSp2d = 0; // You can calculate this from actual failed status

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Statistik SP2D</h3>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total SP2D</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSp2d}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total Nilai: {formatCurrency(totalValue)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SP2D Diterbitkan</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{issuedSp2d}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalSp2d > 0 ? Math.round((issuedSp2d / totalSp2d) * 100) : 0}% dari total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SP2D Pending</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{pendingSp2d}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Menunggu verifikasi
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
