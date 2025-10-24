import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, CheckCircle, Clock, AlertCircle, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useUserProfile } from "@/hooks/useUserProfile";
import { formatCurrency } from "@/lib/currency";
import { Skeleton } from "@/components/ui/skeleton";
import { ActionItemsWidget } from "./Dashboard/components/ActionItemsWidget";
import { OpdBreakdownChart } from "./Dashboard/components/OpdBreakdownChart";
import { Sp2dStatsSection } from "./Dashboard/components/Sp2dStatsSection";

const Dashboard = () => {
  const { data: profile } = useUserProfile();
  const { data: stats, isLoading } = useDashboardStats();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard Monitoring SPM</h1>
            <p className="text-muted-foreground">
              Selamat datang, {profile?.full_name || "User"}
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total SPM</CardTitle>
              <FileText className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <>
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-32" />
                </>
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats?.totalSpm || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatCurrency(stats?.totalSpmValue || 0)}
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Disetujui</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <>
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-32" />
                </>
              ) : (
                <>
                  <div className="text-2xl font-bold text-green-600">{stats?.approvedSpm || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatCurrency(stats?.approvedSpmValue || 0)}
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Dalam Proses</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <>
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-32" />
                </>
              ) : (
                <>
                  <div className="text-2xl font-bold text-orange-600">{stats?.inProgressSpm || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatCurrency(stats?.inProgressSpmValue || 0)}
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Perlu Revisi</CardTitle>
              <AlertCircle className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <>
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-32" />
                </>
              ) : (
                <>
                  <div className="text-2xl font-bold text-amber-600">{stats?.revisionSpm || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatCurrency(stats?.revisionSpmValue || 0)}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Additional Stats Row */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ditolak</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <>
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-32" />
                </>
              ) : (
                <>
                  <div className="text-2xl font-bold text-red-600">{stats?.rejectedSpm || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatCurrency(stats?.rejectedSpmValue || 0)}
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Disetujui Kepala BKAD</CardTitle>
              <CheckCircle className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <>
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-32" />
                </>
              ) : (
                <>
                  <div className="text-2xl font-bold text-emerald-600">{stats?.approvedByKepalaBkad || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatCurrency(stats?.approvedByKepalaBkadValue || 0)}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Statistik SPM (5 Bulan Terakhir)</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats?.monthlyTrend || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="diajukan" fill="#3b82f6" name="Diajukan" />
                    <Bar dataKey="disetujui" fill="#22c55e" name="Disetujui" />
                    <Bar dataKey="ditolak" fill="#ef4444" name="Ditolak/Revisi" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status SPM Terkini</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <>
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Total SPM Bulan Ini</span>
                    </div>
                    <div className="text-3xl font-bold text-primary">{stats?.totalSpm || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(stats?.totalSpmValue || 0)}
                    </p>
                  </div>

                  <div className="border-t pt-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Rata-rata Waktu Proses</span>
                    </div>
                    <div className="text-3xl font-bold text-orange-600">
                      {stats?.avgProcessDays ? stats.avgProcessDays.toFixed(1) : "0"} hari
                    </div>
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {stats?.avgProcessDays && stats.avgProcessDays <= 4 
                        ? "Sesuai target" 
                        : "Perlu dipercepat"}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* SP2D Statistics Section */}
        <Sp2dStatsSection
          totalSp2d={stats?.totalSp2d || 0}
          totalValue={stats?.totalSp2dValue || 0}
          issuedSp2d={stats?.issuedSp2d || 0}
          issuedValue={stats?.issuedSp2dValue || 0}
          pendingSp2d={stats?.pendingSp2d || 0}
          failedSp2d={stats?.failedSp2d || 0}
          isLoading={isLoading}
        />

        {/* OPD Breakdown */}
        <OpdBreakdownChart data={stats?.opdBreakdown || []} isLoading={isLoading} />

        {/* Action Items Widget */}
        <ActionItemsWidget />
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
