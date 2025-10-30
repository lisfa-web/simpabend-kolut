import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, CheckCircle, Clock, AlertCircle, TrendingUp, Sparkles, Calendar, RefreshCw, ArrowUpRight, Edit, Save, Settings } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useUserProfile } from "@/hooks/useUserProfile";
import { formatCurrency } from "@/lib/currency";
import { Skeleton } from "@/components/ui/skeleton";
import { ActionItemsWidget } from "./Dashboard/components/ActionItemsWidget";
import { OpdBreakdownChart } from "./Dashboard/components/OpdBreakdownChart";
import { Sp2dStatsSection } from "./Dashboard/components/Sp2dStatsSection";
import { RecentActivityWidget } from "./Dashboard/components/RecentActivityWidget";
import { RecentSp2dActivityWidget } from "./Dashboard/components/RecentSp2dActivityWidget";
import { FinancialBreakdownChart } from "./Dashboard/components/FinancialBreakdownChart";
import { AlertWidget } from "./Dashboard/components/AlertWidget";
import { TopVendorsWidget } from "./Dashboard/components/TopVendorsWidget";
import { ProcessTimelineWidget } from "./Dashboard/components/ProcessTimelineWidget";
import { SuccessRateWidget } from "./Dashboard/components/SuccessRateWidget";
import { SubmissionTrendWidget } from "./Dashboard/components/SubmissionTrendWidget";
import { BottleneckAnalysisWidget } from "./Dashboard/components/BottleneckAnalysisWidget";
import { PeriodComparisonWidget } from "./Dashboard/components/PeriodComparisonWidget";
import { RejectionAnalysisWidget } from "./Dashboard/components/RejectionAnalysisWidget";
import { QuickActions } from "./Dashboard/components/QuickActions";
import { PeriodFilter } from "./Dashboard/components/PeriodFilter";
import { SpmSp2dTableWidget } from "./Dashboard/components/SpmSp2dTableWidget";
import { cn } from "@/lib/utils";
import { Sparkline } from "@/components/Sparkline";
import { CommandPalette } from "@/components/CommandPalette";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import GridLayout from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { useDashboardLayout } from "@/hooks/useDashboardLayout";
import { WidgetContainer } from "@/components/dashboard/WidgetContainer";
import { LayoutSettingsDialog } from "@/components/dashboard/LayoutSettingsDialog";
import { useUserRole } from "@/hooks/useUserRole";
const WIDGET_LABELS = [{
  id: "stats",
  label: "Statistik Utama"
}, {
  id: "quick-actions",
  label: "Quick Actions & Filters"
}, {
  id: "performance",
  label: "Performance Metrics"
}, {
  id: "charts",
  label: "Grafik SPM"
}, {
  id: "analytics",
  label: "Advanced Analytics"
}, {
  id: "financial",
  label: "Financial Breakdown"
}, {
  id: "activity",
  label: "Recent Activity"
}, {
  id: "sp2d-activity",
  label: "Aktivitas SP2D Terbaru"
}, {
  id: "sp2d-stats",
  label: "Statistik SP2D"
}, {
  id: "opd-breakdown",
  label: "OPD Breakdown"
}, {
  id: "vendors",
  label: "Top Vendors"
}, {
  id: "alerts",
  label: "Alerts & Peringatan"
}, {
  id: "action-items",
  label: "Action Items"
}, {
  id: "spm-sp2d-table",
  label: "Tabel SPM & SP2D"
}];
const Dashboard = () => {
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const {
    data: profile
  } = useUserProfile();
  const {
    data: stats,
    isLoading,
    refetch
  } = useDashboardStats();
  const {
    isAdmin: checkIsAdmin
  } = useUserRole();
  const isAdmin = checkIsAdmin();
  const {
    currentLayout,
    hiddenWidgets,
    isEditMode,
    setIsEditMode,
    handleLayoutChange,
    handleSaveLayout,
    handleResetLayout,
    toggleWidget,
    isSaving
  } = useDashboardLayout();
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Period filter state
  const [selectedPeriod, setSelectedPeriod] = useState("month");

  // Auto-refresh state
  const [lastRefresh, setLastRefresh] = useState(Date.now());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
      setLastRefresh(Date.now());
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [refetch]);

  // Manual refresh handler
  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setLastRefresh(Date.now());
    setIsRefreshing(false);
    toast({
      title: "Data diperbarui",
      description: "Dashboard telah diperbarui dengan data terbaru"
    });
  };

  // Calculate time since last refresh
  const getTimeSinceRefresh = () => {
    const seconds = Math.floor((Date.now() - lastRefresh) / 1000);
    if (seconds < 60) return `${seconds} detik yang lalu`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes} menit yang lalu`;
  };

  // Generate sparkline data from monthly trend
  const generateSparklineData = (type: 'diajukan' | 'disetujui' | 'ditolak') => {
    if (!stats?.monthlyTrend) return [0, 0, 0, 0, 0];
    return stats.monthlyTrend.map(m => m[type]);
  };

  // Card click handlers
  const handleCardClick = (type: string) => {
    const routes: Record<string, string> = {
      total: "/spm/list",
      approved: "/spm/list?status=disetujui",
      inProgress: "/spm/list?status=dalam_proses",
      revision: "/spm/list?status=revisi",
      rejected: "/spm/list?status=ditolak"
    };
    navigate(routes[type] || "/spm/list");
  };
  const isWidgetHidden = (widgetId: string) => hiddenWidgets.includes(widgetId);
  return <DashboardLayout>
      <CommandPalette />
      <div className="space-y-6">
        {/* Enhanced Header with Actions */}
        <div className="space-y-4 pb-6 border-b">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">Monitoring SPM &amp; SP2D</h1>
              <p className="text-base text-muted-foreground flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-500" />
                Selamat datang, <span className="font-semibold text-foreground">{profile?.full_name || "User"}</span>
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="px-4 py-2">
                <Calendar className="h-3 w-3 mr-2" />
                {new Date().toLocaleDateString('id-ID', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
              </Badge>
              
              {isAdmin && <div className="flex gap-2">
                  {isEditMode ? <>
                      <Button variant="outline" size="sm" onClick={() => setIsEditMode(false)}>
                        Batal
                      </Button>
                      <Button variant="default" size="sm" onClick={handleSaveLayout} disabled={isSaving} className="gap-2">
                        <Save className="h-4 w-4" />
                        {isSaving ? "Menyimpan..." : "Simpan Layout"}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setSettingsOpen(true)}>
                        <Settings className="h-4 w-4" />
                      </Button>
                    </> : <Button variant="outline" size="sm" onClick={() => setIsEditMode(true)} className="gap-2">
                      <Edit className="h-4 w-4" />
                      Edit Layout
                    </Button>}
                </div>}
            </div>
          </div>

          {/* Quick Actions & Filters Bar */}
          {!isWidgetHidden("quick-actions") && <WidgetContainer isEditMode={isEditMode} isHidden={isWidgetHidden("quick-actions")} title="Quick Actions">
              <div className="flex items-center justify-between bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 rounded-lg p-4 glass">
                <QuickActions />
                
                <div className="flex items-center gap-3">
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    Diperbarui {getTimeSinceRefresh()}
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleManualRefresh} disabled={isRefreshing} className="gap-2">
                    <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
                    Refresh
                  </Button>
                  <PeriodFilter selectedPeriod={selectedPeriod} onPeriodChange={setSelectedPeriod} />
                </div>
              </div>
            </WidgetContainer>}
        </div>

        {/* Drag & Drop Grid Layout */}
        <GridLayout className="layout" layout={currentLayout} cols={12} rowHeight={80} width={1200} onLayoutChange={handleLayoutChange} isDraggable={isEditMode} isResizable={isEditMode} compactType="vertical" preventCollision={false}>
          {/* Stats Cards Widget */}
          {!isWidgetHidden("stats") && <div key="stats">
              <WidgetContainer isEditMode={isEditMode} title="Statistik Utama">
                <div className="grid gap-4 grid-cols-1 md:grid-cols-3 lg:grid-cols-5 p-4">
                  <Card variant="interactive" className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-l-4 border-l-blue-500" onClick={() => handleCardClick("total")}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total SPM</CardTitle>
                      <div className="p-2 rounded-full bg-blue-50 group-hover:bg-blue-100 transition-colors">
                        <FileText className="h-4 w-4 text-blue-600" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      {isLoading ? <div className="animate-pulse">
                          <Skeleton className="h-8 w-16 mb-2" />
                          <Skeleton className="h-3 w-32 mb-2" />
                          <div className="h-4 bg-gradient-to-r from-transparent via-muted to-transparent" />
                        </div> : <>
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="text-2xl font-bold group-hover:text-blue-600 transition-colors">
                                {stats?.totalSpm || 0}
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                {formatCurrency(stats?.totalSpmValue || 0)}
                              </p>
                            </div>
                            <Sparkline data={generateSparklineData('diajukan')} color="#3b82f6" className="h-8 w-20" />
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-1 text-xs text-green-600">
                              <TrendingUp className="h-3 w-3" />
                              <span>+12% vs bulan lalu</span>
                            </div>
                            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </>}
                    </CardContent>
                  </Card>

                  <Card variant="interactive" className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-l-4 border-l-green-500" onClick={() => handleCardClick("approved")}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Disetujui</CardTitle>
                      <div className="p-2 rounded-full bg-green-50 group-hover:bg-green-100 transition-colors">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      {isLoading ? <div className="animate-pulse">
                          <Skeleton className="h-8 w-16 mb-2" />
                          <Skeleton className="h-3 w-32 mb-2" />
                          <div className="h-4 bg-gradient-to-r from-transparent via-muted to-transparent" />
                        </div> : <>
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="text-2xl font-bold text-green-600 group-hover:scale-105 transition-transform">
                                {stats?.approvedSpm || 0}
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                {formatCurrency(stats?.approvedSpmValue || 0)}
                              </p>
                            </div>
                            <Sparkline data={generateSparklineData('disetujui')} color="#22c55e" className="h-8 w-20" />
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <Badge variant="secondary" className="text-xs bg-green-50 text-green-700 border-green-200">
                              +8% vs bulan lalu
                            </Badge>
                            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </>}
                    </CardContent>
                  </Card>

                  <Card variant="interactive" className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-l-4 border-l-orange-500" onClick={() => handleCardClick("inProgress")}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Dalam Proses</CardTitle>
                      <div className="p-2 rounded-full bg-orange-50 group-hover:bg-orange-100 transition-colors">
                        <Clock className="h-4 w-4 text-orange-600" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      {isLoading ? <div className="animate-pulse">
                          <Skeleton className="h-8 w-16 mb-2" />
                          <Skeleton className="h-3 w-32 mb-2" />
                          <div className="h-4 bg-gradient-to-r from-transparent via-muted to-transparent" />
                        </div> : <>
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="text-2xl font-bold text-orange-600 group-hover:scale-105 transition-transform">
                                {stats?.inProgressSpm || 0}
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                {formatCurrency(stats?.inProgressSpmValue || 0)}
                              </p>
                            </div>
                            <Sparkline data={[stats?.inProgressSpm || 0, Math.max(0, (stats?.inProgressSpm || 0) - 2), Math.max(0, (stats?.inProgressSpm || 0) + 1), Math.max(0, (stats?.inProgressSpm || 0) - 1), stats?.inProgressSpm || 0]} color="#ea580c" className="h-8 w-20" />
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <Badge variant="secondary" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
                              Sedang diproses
                            </Badge>
                            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </>}
                    </CardContent>
                  </Card>

                  <Card variant="interactive" className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-l-4 border-l-amber-500" onClick={() => handleCardClick("revision")}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Perlu Revisi</CardTitle>
                      <div className="p-2 rounded-full bg-amber-50 group-hover:bg-amber-100 transition-colors">
                        <AlertCircle className="h-4 w-4 text-amber-600" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      {isLoading ? <div className="animate-pulse">
                          <Skeleton className="h-8 w-16 mb-2" />
                          <Skeleton className="h-3 w-32 mb-2" />
                          <div className="h-4 bg-gradient-to-r from-transparent via-muted to-transparent" />
                        </div> : <>
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="text-2xl font-bold text-amber-600 group-hover:scale-105 transition-transform">
                                {stats?.revisionSpm || 0}
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                {formatCurrency(stats?.revisionSpmValue || 0)}
                              </p>
                            </div>
                            <Sparkline data={generateSparklineData('ditolak')} color="#f59e0b" className="h-8 w-20" />
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <Badge variant="secondary" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
                              Perlu tindakan
                            </Badge>
                            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </>}
                    </CardContent>
                  </Card>

                  <Card variant="interactive" className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-l-4 border-l-emerald-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Disetujui Kepala BKAD</CardTitle>
                      <div className="p-2 rounded-full bg-emerald-50 group-hover:bg-emerald-100 transition-colors">
                        <CheckCircle className="h-4 w-4 text-emerald-600" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      {isLoading ? <div className="animate-pulse">
                          <Skeleton className="h-8 w-16 mb-2" />
                          <Skeleton className="h-3 w-32 mb-2" />
                          <div className="h-4 bg-gradient-to-r from-transparent via-muted to-transparent" />
                        </div> : <>
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="text-2xl font-bold text-emerald-600 group-hover:scale-105 transition-transform">
                                {stats?.approvedByKepalaBkad || 0}
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                {formatCurrency(stats?.approvedByKepalaBkadValue || 0)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <Badge variant="secondary" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
                              Final approval
                            </Badge>
                            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </>}
                    </CardContent>
                  </Card>
                </div>
              </WidgetContainer>
            </div>}

          {/* Performance Metrics Widget */}
          {!isWidgetHidden("performance") && <div key="performance">
              <WidgetContainer isEditMode={isEditMode} title="Performance Metrics">
                <div className="p-4">
                  <div className="grid gap-6 md:grid-cols-3">
                    <SuccessRateWidget data={stats?.successMetrics} isLoading={isLoading} />
                    <ProcessTimelineWidget data={stats?.processTimeline} isLoading={isLoading} />
                    <SubmissionTrendWidget data={stats?.dailySubmissions} isLoading={isLoading} />
                  </div>
                </div>
              </WidgetContainer>
            </div>}

          {/* Charts Widget */}
          {!isWidgetHidden("charts") && <div key="charts">
              <WidgetContainer isEditMode={isEditMode} title="Grafik SPM">
                <div className="grid gap-6 md:grid-cols-3 p-4">
                  <Card className="md:col-span-2">
                    <CardHeader>
                      <CardTitle>Statistik SPM (5 Bulan Terakhir)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isLoading ? <Skeleton className="h-[300px] w-full" /> : <ResponsiveContainer width="100%" height={300}>
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
                        </ResponsiveContainer>}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Status SPM Terkini</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {isLoading ? <>
                          <Skeleton className="h-20 w-full" />
                          <Skeleton className="h-20 w-full" />
                        </> : <>
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
                              {stats?.avgProcessDays && stats.avgProcessDays <= 4 ? "Sesuai target" : "Perlu dipercepat"}
                            </p>
                          </div>
                        </>}
                    </CardContent>
                  </Card>
                </div>
              </WidgetContainer>
            </div>}

          {/* Advanced Analytics Widget */}
          {!isWidgetHidden("analytics") && <div key="analytics">
              <WidgetContainer isEditMode={isEditMode} title="Advanced Analytics">
                <div className="p-4 space-y-4">
                  <div className="grid gap-6 lg:grid-cols-2">
                    <BottleneckAnalysisWidget data={stats?.bottleneckAnalysis} isLoading={isLoading} />
                    <PeriodComparisonWidget weeklyData={stats?.periodComparison.weekly} monthlyData={stats?.periodComparison.monthly} isLoading={isLoading} />
                  </div>
                  <RejectionAnalysisWidget data={stats?.rejectionAnalysis} isLoading={isLoading} />
                </div>
              </WidgetContainer>
            </div>}

          {/* Financial Breakdown Widget */}
          {!isWidgetHidden("financial") && <div key="financial" className="h-full">
              <WidgetContainer isEditMode={isEditMode} title="Financial Breakdown">
                <div className="p-4 h-full">
                  <FinancialBreakdownChart data={stats?.financialBreakdown} isLoading={isLoading} />
                </div>
              </WidgetContainer>
            </div>}

          {/* Recent Activity Widget */}
          {!isWidgetHidden("activity") && <div key="activity" className="h-full">
              <WidgetContainer isEditMode={isEditMode} title="Recent Activity">
                <div className="p-4 h-full">
                  <RecentActivityWidget />
                </div>
              </WidgetContainer>
            </div>}

          {/* Recent SP2D Activity Widget */}
          {!isWidgetHidden("sp2d-activity") && <div key="sp2d-activity" className="h-full">
              <WidgetContainer isEditMode={isEditMode} title="Aktivitas SP2D Terbaru">
                <div className="p-4 h-full">
                  <RecentSp2dActivityWidget />
                </div>
              </WidgetContainer>
            </div>}

          {/* SP2D Stats Widget */}
          {!isWidgetHidden("sp2d-stats") && <div key="sp2d-stats">
              <WidgetContainer isEditMode={isEditMode} title="Statistik SP2D">
                <div className="p-4">
                  <Sp2dStatsSection totalSp2d={stats?.totalSp2d || 0} totalValue={stats?.totalSp2dValue || 0} issuedSp2d={stats?.issuedSp2d || 0} issuedValue={stats?.issuedSp2dValue || 0} testingBankSp2d={stats?.testingBankSp2d || 0} testingBankValue={stats?.testingBankValue || 0} disbursedSp2d={stats?.disbursedSp2d || 0} disbursedValue={stats?.disbursedValue || 0} isLoading={isLoading} />
                </div>
              </WidgetContainer>
            </div>}

          {/* OPD Breakdown Widget */}
          {!isWidgetHidden("opd-breakdown") && <div key="opd-breakdown">
              <WidgetContainer isEditMode={isEditMode} title="OPD Breakdown">
                <div className="p-4">
                  <OpdBreakdownChart data={stats?.opdBreakdown || []} isLoading={isLoading} />
                </div>
              </WidgetContainer>
            </div>}

          {/* Top Vendors Widget */}
          {!isWidgetHidden("vendors") && <div key="vendors">
              <WidgetContainer isEditMode={isEditMode} title="Top Vendors">
                <div className="p-4">
                  <TopVendorsWidget data={stats?.topVendors} isLoading={isLoading} />
                </div>
              </WidgetContainer>
            </div>}

          {/* Alerts Widget */}
          {!isWidgetHidden("alerts") && <div key="alerts">
              <WidgetContainer isEditMode={isEditMode} title="Alerts & Peringatan">
                <div className="p-4">
                  <AlertWidget data={stats?.alerts} isLoading={isLoading} />
                </div>
              </WidgetContainer>
            </div>}

          {/* Action Items Widget */}
          {!isWidgetHidden("action-items") && <div key="action-items">
              <WidgetContainer isEditMode={isEditMode} title="Action Items">
                <div className="p-4">
                  <ActionItemsWidget />
                </div>
              </WidgetContainer>
            </div>}

          {/* SPM & SP2D Table Widget */}
          {!isWidgetHidden("spm-sp2d-table") && <div key="spm-sp2d-table">
              <WidgetContainer isEditMode={isEditMode} title="Tabel SPM & SP2D">
                <SpmSp2dTableWidget />
              </WidgetContainer>
            </div>}
        </GridLayout>
      </div>

      {/* Layout Settings Dialog */}
      <LayoutSettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} widgets={WIDGET_LABELS} hiddenWidgets={hiddenWidgets} onToggleWidget={toggleWidget} onReset={handleResetLayout} />
    </DashboardLayout>;
};
export default Dashboard;