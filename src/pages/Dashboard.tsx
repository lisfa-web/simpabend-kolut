import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Users, CheckCircle, TrendingUp } from "lucide-react";

const Dashboard = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard SIMPA BEND BKADKU</h1>
          <p className="text-muted-foreground">
            Selamat datang di Sistem Informasi Manajemen Pertanggungjawaban Bendahara
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Dokumen</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">248</div>
              <p className="text-xs text-muted-foreground">+12% dari bulan lalu</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bendahara Aktif</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">32</div>
              <p className="text-xs text-muted-foreground">Dari 35 total</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tervalidasi</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">196</div>
              <p className="text-xs text-muted-foreground">79% dari total</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tingkat Efisiensi</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">94%</div>
              <p className="text-xs text-muted-foreground">+2% dari target</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Menu Utama</CardTitle>
              <CardDescription>Akses cepat ke fitur-fitur utama sistem</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors">
                <FileText className="h-8 w-8 text-primary mr-4" />
                <div>
                  <h3 className="font-semibold">Upload Dokumen</h3>
                  <p className="text-sm text-muted-foreground">Upload SPJ dan dokumen pendukung</p>
                </div>
              </div>
              <div className="flex items-center p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors">
                <CheckCircle className="h-8 w-8 text-primary mr-4" />
                <div>
                  <h3 className="font-semibold">Validasi Dokumen</h3>
                  <p className="text-sm text-muted-foreground">Verifikasi dan validasi SPJ</p>
                </div>
              </div>
              <div className="flex items-center p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors">
                <TrendingUp className="h-8 w-8 text-primary mr-4" />
                <div>
                  <h3 className="font-semibold">Laporan</h3>
                  <p className="text-sm text-muted-foreground">Lihat laporan dan statistik</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Aktivitas Terbaru</CardTitle>
              <CardDescription>Riwayat aktivitas sistem</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">Dokumen SPJ-001 divalidasi</p>
                    <p className="text-xs text-muted-foreground">2 jam yang lalu</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">Upload dokumen baru dari Bendahara A</p>
                    <p className="text-xs text-muted-foreground">5 jam yang lalu</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">Laporan bulanan dihasilkan</p>
                    <p className="text-xs text-muted-foreground">1 hari yang lalu</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
