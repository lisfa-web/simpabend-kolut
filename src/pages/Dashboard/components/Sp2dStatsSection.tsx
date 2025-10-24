import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Clock, XCircle, FileCheck } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { Skeleton } from "@/components/ui/skeleton";

interface Sp2dStatsSectionProps {
  totalSp2d: number;
  totalValue: number;
  issuedSp2d: number;
  issuedValue: number;
  pendingSp2d: number;
  failedSp2d: number;
  isLoading: boolean;
}

export const Sp2dStatsSection = ({ 
  totalSp2d, 
  totalValue, 
  issuedSp2d, 
  issuedValue, 
  pendingSp2d, 
  failedSp2d, 
  isLoading 
}: Sp2dStatsSectionProps) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-40" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
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
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Statistik SP2D</h3>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total SP2D</CardTitle>
            <FileCheck className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSp2d}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {formatCurrency(totalValue)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SP2D Terbit</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{issuedSp2d}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {formatCurrency(issuedValue)}
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
              Menunggu Verifikasi
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SP2D Gagal</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{failedSp2d}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Tidak Diterbitkan
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
