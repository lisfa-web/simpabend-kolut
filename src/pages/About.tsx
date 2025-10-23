import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Zap, Users, BarChart3, FileCheck, Lock } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <section className="container py-16">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h1 className="text-4xl font-bold mb-6">Tentang SIMPA BEND BKADKU</h1>
            <p className="text-lg text-muted-foreground">
              Sistem Informasi Manajemen Pertanggungjawaban Bendahara adalah platform digital
              modern yang dirancang khusus untuk meningkatkan transparansi, efisiensi, dan
              akuntabilitas dalam pengelolaan keuangan daerah di BKAD Kolaka Utara.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-16">
            <Card>
              <CardHeader>
                <Shield className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Keamanan Terjamin</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Sistem keamanan berlapis dengan enkripsi data dan kontrol akses berbasis role
                  untuk melindungi informasi keuangan sensitif.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Zap className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Proses Cepat</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Digitalisasi proses pertanggungjawaban mengurangi waktu pemrosesan dari
                  berminggu-minggu menjadi hitungan hari.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Kolaborasi Mudah</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Platform terpusat memudahkan koordinasi antara Bendahara, Validator, dan
                  Pengawas dalam satu sistem terintegrasi.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <BarChart3 className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Analisis Real-time</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Dashboard analytics memberikan insight dan laporan real-time untuk pengambilan
                  keputusan yang lebih baik.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <FileCheck className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Dokumentasi Lengkap</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Semua dokumen SPJ dan pendukungnya tersimpan rapi, terorganisir, dan mudah
                  diakses kapan saja diperlukan.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Lock className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Audit Trail</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Setiap aktivitas tercatat secara otomatis untuk transparansi dan kemudahan
                  audit di masa mendatang.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="max-w-3xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Cara Kerja Sistem</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Upload Dokumen</h3>
                    <p className="text-muted-foreground">
                      Bendahara mengupload SPJ dan dokumen pendukung melalui sistem digital
                      dengan form yang terstandarisasi.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Verifikasi Otomatis</h3>
                    <p className="text-muted-foreground">
                      Sistem melakukan validasi awal terhadap kelengkapan dokumen dan
                      kesesuaian format secara otomatis.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Review & Validasi</h3>
                    <p className="text-muted-foreground">
                      Validator melakukan pemeriksaan substansi dokumen dan memberikan
                      persetujuan atau catatan perbaikan.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                    4
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Monitoring & Laporan</h3>
                    <p className="text-muted-foreground">
                      Sistem menghasilkan laporan berkala dan dashboard untuk monitoring
                      progress pertanggungjawaban.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default About;
