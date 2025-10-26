import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, CheckCircle, Clock, AlertCircle, TrendingUp, Sparkles, Calendar } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useUserProfile } from "@/hooks/useUserProfile";
import { formatCurrency } from "@/lib/currency";
import { Skeleton } from "@/components/ui/skeleton";
import { ActionItemsWidget } from "./Dashboard/components/ActionItemsWidget";
import { OpdBreakdownChart } from "./Dashboard/components/OpdBreakdownChart";
import { Sp2dStatsSection } from "./Dashboard/components/Sp2dStatsSection";
import { RecentActivityWidget } from "./Dashboard/components/RecentActivityWidget";
import { FinancialBreakdownChart } from "./Dashboard/components/FinancialBreakdownChart";
import { AlertWidget } from "./Dashboard/components/AlertWidget";
import { TopVendorsWidget } from "./Dashboard/components/TopVendorsWidget";
import { ProcessTimelineWidget } from "./Dashboard/components/ProcessTimelineWidget";
import { SuccessRateWidget } from "./Dashboard/components/SuccessRateWidget";
import { SubmissionTrendWidget } from "./Dashboard/components/SubmissionTrendWidget";
import { cn } from "@/lib/utils";
import { Sparkline } from "@/components/Sparkline";
import { CommandPalette } from "@/components/CommandPalette";

const Dashboard = () => {
  const { data: profile } = useUserProfile();
  const { data: stats, isLoading } = useDashboardStats();

  // Generate sparkline data from monthly trend
  const generateSparklineData = (type: 'diajukan' | 'disetujui' | 'ditolak') => {
    if (!stats?.monthlyTrend) return [0, 0, 0, 0, 0];
    return stats.monthlyTrend.map(m => m[type]);
  };

  return (
    <DashboardLayout>
      <CommandPalette />
      <div className="space-y-6">
        {/* Enhanced Header */}
        <div className="flex items-center justify-between pb-6 border-b">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
              Dashboard Monitoring SPM
            </h1>
            <p className="text-base text-muted-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500" />
              Selamat datang, <span className="font-semibold text-foreground">{profile?.full_name || "User"}</span>
            </p>
          </div>
          
          <Badge variant="outline" className="px-4 py-2">
            <Calendar className="h-3 w-3 mr-2" />
            {new Date().toLocaleDateString('id-ID', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Badge>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card variant="interactive">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total SPM</CardTitle>
              <div className="p-2 rounded-full bg-blue-50 group-hover:bg-blue-100 transition-colors">
                <FileText className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="animate-pulse">
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-32 mb-2" />
                  <div className="h-4 bg-gradient-to-r from-transparent via-muted to-transparent" />
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-2xl font-bold group-hover:text-blue-600 transition-colors">
                        {stats?.totalSpm || 0}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatCurrency(stats?.totalSpmValue || 0)}
                      </p>
                    </div>
                    <Sparkline 
                      data={generateSparklineData('diajukan')} 
                      color="#3b82f6"
                      className="h-8 w-20"
                    />
                  </div>
                  <div className="flex items-center gap-1 mt-2 text-xs text-green-600">
                    <TrendingUp className="h-3 w-3" />
                    <span>Trend 5 bulan</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card variant="interactive">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Disetujui</CardTitle>
              <div className="p-2 rounded-full bg-green-50 group-hover:bg-green-100 transition-colors">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="animate-pulse">
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-32 mb-2" />
                  <div className="h-4 bg-gradient-to-r from-transparent via-muted to-transparent" />
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-2xl font-bold text-green-600 group-hover:scale-105 transition-transform">
                        {stats?.approvedSpm || 0}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatCurrency(stats?.approvedSpmValue || 0)}
                      </p>
                    </div>
                    <Sparkline 
                      data={generateSparklineData('disetujui')} 
                      color="#22c55e"
                      className="h-8 w-20"
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card variant="interactive">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Dalam Proses</CardTitle>
              <div className="p-2 rounded-full bg-orange-50 group-hover:bg-orange-100 transition-colors">
                <Clock className="h-4 w-4 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="animate-pulse">
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-32 mb-2" />
                  <div className="h-4 bg-gradient-to-r from-transparent via-muted to-transparent" />
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-2xl font-bold text-orange-600 group-hover:scale-105 transition-transform">
                        {stats?.inProgressSpm || 0}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatCurrency(stats?.inProgressSpmValue || 0)}
                      </p>
                    </div>
                    <Sparkline 
                      data={[
                        stats?.inProgressSpm || 0,
                        Math.max(0, (stats?.inProgressSpm || 0) - 2),
                        Math.max(0, (stats?.inProgressSpm || 0) + 1),
                        Math.max(0, (stats?.inProgressSpm || 0) - 1),
                        stats?.inProgressSpm || 0
                      ]} 
                      color="#ea580c"
                      className="h-8 w-20"
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card variant="interactive">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Perlu Revisi</CardTitle>
              <div className="p-2 rounded-full bg-amber-50 group-hover:bg-amber-100 transition-colors">
                <AlertCircle className="h-4 w-4 text-amber-600" />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="animate-pulse">
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-32 mb-2" />
                  <div className="h-4 bg-gradient-to-r from-transparent via-muted to-transparent" />
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-2xl font-bold text-amber-600 group-hover:scale-105 transition-transform">
                        {stats?.revisionSpm || 0}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatCurrency(stats?.revisionSpmValue || 0)}
                      </p>
                    </div>
                    <Sparkline 
                      data={generateSparklineData('ditolak')} 
                      color="#f59e0b"
                      className="h-8 w-20"
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Additional Stats Row */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card variant="interactive">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ditolak</CardTitle>
              <div className="p-2 rounded-full bg-red-50 group-hover:bg-red-100 transition-colors">
                <AlertCircle className="h-4 w-4 text-red-600" />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="animate-pulse">
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-32 mb-2" />
                  <div className="h-4 bg-gradient-to-r from-transparent via-muted to-transparent" />
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold text-red-600 group-hover:scale-105 transition-transform">
                    {stats?.rejectedSpm || 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatCurrency(stats?.rejectedSpmValue || 0)}
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card variant="interactive">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Disetujui Kepala BKAD</CardTitle>
              <div className="p-2 rounded-full bg-emerald-50 group-hover:bg-emerald-100 transition-colors">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="animate-pulse">
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-32 mb-2" />
                  <div className="h-4 bg-gradient-to-r from-transparent via-muted to-transparent" />
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold text-emerald-600 group-hover:scale-105 transition-transform">
                    {stats?.approvedByKepalaBkad || 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatCurrency(stats?.approvedByKepalaBkadValue || 0)}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Performance Metrics Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight">Performance Metrics</h2>
            <Badge variant="outline">Real-time Analytics</Badge>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <SuccessRateWidget data={stats?.successMetrics} isLoading={isLoading} />
            <ProcessTimelineWidget data={stats?.processTimeline} isLoading={isLoading} />
            <SubmissionTrendWidget data={stats?.dailySubmissions} isLoading={isLoading} />
          </div>
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

        {/* Financial Breakdown & Recent Activity */}
        <div className="grid gap-6 md:grid-cols-2">
          <FinancialBreakdownChart data={stats?.financialBreakdown} isLoading={isLoading} />
          <RecentActivityWidget />
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

        {/* OPD Breakdown & Top Vendors */}
        <div className="grid gap-6 md:grid-cols-2">
          <OpdBreakdownChart data={stats?.opdBreakdown || []} isLoading={isLoading} />
          <TopVendorsWidget data={stats?.topVendors} isLoading={isLoading} />
        </div>

        {/* Alert & Peringatan */}
        <AlertWidget data={stats?.alerts} isLoading={isLoading} />

        {/* Action Items Widget */}
        <ActionItemsWidget />
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
