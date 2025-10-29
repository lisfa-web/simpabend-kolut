import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Clock, XCircle, FileCheck } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { Skeleton } from "@/components/ui/skeleton";

interface Sp2dStatsSectionProps {
  totalSp2d: number;
  totalValue: number;
  issuedSp2d: number;
  issuedValue: number;
  testingBankSp2d: number;
  testingBankValue: number;
  disbursedSp2d: number;
  disbursedValue: number;
  isLoading: boolean;
}

export const Sp2dStatsSection = ({ 
  totalSp2d, 
  totalValue, 
  issuedSp2d, 
  issuedValue, 
  testingBankSp2d, 
  testingBankValue,
  disbursedSp2d,
  disbursedValue,
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card variant="interactive">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total SP2D</CardTitle>
            <div className="p-2 rounded-full bg-blue-50 group-hover:bg-blue-100 transition-colors">
              <FileCheck className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-2xl font-bold group-hover:text-blue-600 transition-colors">{totalSp2d}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(totalValue)}
            </p>
          </CardContent>
        </Card>

        <Card variant="interactive">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SP2D Terbit</CardTitle>
            <div className="p-2 rounded-full bg-green-50 group-hover:bg-green-100 transition-colors">
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-2xl font-bold text-green-600">{issuedSp2d}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(issuedValue)}
            </p>
            
            {/* Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium text-green-600">
                  {totalSp2d > 0 ? Math.round((issuedSp2d / totalSp2d) * 100) : 0}%
                </span>
              </div>
              <div className="h-2 bg-green-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${totalSp2d > 0 ? (issuedSp2d / totalSp2d) * 100 : 0}%` 
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="interactive">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Diuji Bank</CardTitle>
            <div className="p-2 rounded-full bg-purple-50 group-hover:bg-purple-100 transition-colors">
              <Clock className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-2xl font-bold text-purple-600">{testingBankSp2d}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(testingBankValue)}
            </p>

            {/* Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium text-purple-600">
                  {totalSp2d > 0 ? Math.round((testingBankSp2d / totalSp2d) * 100) : 0}%
                </span>
              </div>
              <div className="h-2 bg-purple-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-violet-500 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${totalSp2d > 0 ? (testingBankSp2d / totalSp2d) * 100 : 0}%` 
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="interactive">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dana Cair</CardTitle>
            <div className="p-2 rounded-full bg-emerald-50 group-hover:bg-emerald-100 transition-colors">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-2xl font-bold text-emerald-600">{disbursedSp2d}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(disbursedValue)}
            </p>

            {/* Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium text-emerald-600">
                  {totalSp2d > 0 ? Math.round((disbursedSp2d / totalSp2d) * 100) : 0}%
                </span>
              </div>
              <div className="h-2 bg-emerald-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${totalSp2d > 0 ? (disbursedSp2d / totalSp2d) * 100 : 0}%` 
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
