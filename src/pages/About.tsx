import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Zap, Users, BarChart3, FileCheck, Lock, Target, Eye, Lightbulb, UserCheck, ClipboardCheck, FileText, CheckCircle, TrendingUp, Clock, ArrowRight, Code, Database, Server, Smartphone } from "lucide-react";
import { Link } from "react-router-dom";
const About = () => {
  return <div className="min-h-screen">
      <SEOHead 
        title="Tentang Kami"
        description="Pelajari lebih lanjut tentang SIMPA BEND BKADKU - Sistem Informasi Manajemen Pertanggungjawaban Bendahara Kabupaten Kolaka Utara. Platform digital untuk transparansi keuangan daerah."
        keywords="SIMPA BEND, BKAD Kolaka Utara, SPM, SP2D, Bendahara, tentang kami"
        canonicalPath="/tentang"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "AboutPage",
          "name": "Tentang SIMPA BEND BKADKU",
          "description": "Informasi tentang sistem manajemen pertanggungjawaban bendahara"
        }}
      />
      <Header />
      <main>
        {/* Hero Section */}
        <section className="relative container py-20 md:py-32">
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 to-transparent" />

          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-primary/10 border border-primary/20">
              <span className="inline-flex rounded-full h-2 w-2 bg-primary" />
              <span className="text-sm font-medium">Sistem Terpercaya & Aman</span>
            </div>

            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl mb-6">
              Tentang
              <span className="block mt-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                SIMPA BEND BKADKU
              </span>
            </h1>
            
            <p className="text-lg text-muted-foreground mb-10 max-w-3xl mx-auto">
              Sistem Informasi Manajemen Pertanggungjawaban Bendahara adalah platform digital
              modern yang dirancang khusus untuk meningkatkan transparansi, efisiensi, dan
              akuntabilitas dalam pengelolaan keuangan daerah di BKAD Kolaka Utara.
            </p>
          </div>
        </section>

        {/* Visi & Misi Section */}
        <section className="container py-16">
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border">
              <CardHeader>
                <div className="inline-flex p-3 rounded-xl bg-primary/10 mb-4 w-fit">
                  <Eye className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-2xl">Visi</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Menjadi sistem informasi terdepan dalam pengelolaan pertanggungjawaban bendahara
                  yang transparan, akuntabel, dan efisien untuk mendukung tata kelola keuangan
                  daerah yang profesional di Kolaka Utara.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border">
              <CardHeader>
                <div className="inline-flex p-3 rounded-xl bg-primary/10 mb-4 w-fit">
                  <Target className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle className="text-2xl">Misi</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                    <span>Digitalisasi proses pertanggungjawaban bendahara</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                    <span>Meningkatkan transparansi dan akuntabilitas</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                    <span>Mempercepat proses verifikasi dan approval</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                    <span>Menyediakan audit trail yang lengkap</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Key Benefits */}
        <section className="container py-16 bg-muted/30">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              Manfaat Utama
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Keunggulan yang membuat SIMPA BEND BKADKU menjadi pilihan terbaik
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
            {[{
            icon: Shield,
            title: "Keamanan Terjamin",
            description: "Sistem keamanan berlapis dengan enkripsi data dan kontrol akses berbasis role",
            gradient: "from-blue-500/10 to-cyan-500/10",
            iconColor: "text-blue-600"
          }, {
            icon: Zap,
            title: "Proses Cepat",
            description: "Digitalisasi mengurangi waktu pemrosesan dari berminggu-minggu menjadi hitungan hari",
            gradient: "from-purple-500/10 to-pink-500/10",
            iconColor: "text-purple-600"
          }, {
            icon: Users,
            title: "Kolaborasi Mudah",
            description: "Platform terpusat memudahkan koordinasi dalam satu sistem terintegrasi",
            gradient: "from-green-500/10 to-emerald-500/10",
            iconColor: "text-green-600"
          }, {
            icon: BarChart3,
            title: "Analisis Real-time",
            description: "Dashboard analytics untuk insight dan pengambilan keputusan yang lebih baik",
            gradient: "from-orange-500/10 to-amber-500/10",
            iconColor: "text-orange-600"
          }, {
            icon: FileCheck,
            title: "Dokumentasi Lengkap",
            description: "Semua dokumen tersimpan rapi, terorganisir, dan mudah diakses kapan saja",
            gradient: "from-rose-500/10 to-red-500/10",
            iconColor: "text-rose-600"
          }, {
            icon: Lock,
            title: "Audit Trail",
            description: "Setiap aktivitas tercatat otomatis untuk transparansi dan kemudahan audit",
            gradient: "from-indigo-500/10 to-violet-500/10",
            iconColor: "text-indigo-600"
          }].map((benefit, index) => <Card key={index} className={`bg-gradient-to-br ${benefit.gradient} border`}>
                <CardHeader>
                  <div className="inline-flex p-3 rounded-xl bg-primary/10 mb-3 w-fit">
                    <benefit.icon className={`h-6 w-6 ${benefit.iconColor}`} />
                  </div>
                  <CardTitle className="text-lg">{benefit.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>)}
          </div>
        </section>

        {/* User Roles / Stakeholders */}
        <section className="container py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              Pengguna Sistem
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Berbagai peran yang terlibat dalam sistem SIMPA BEND
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[{
            icon: FileText,
            role: "Bendahara OPD",
            description: "Mengajukan SPM dan melengkapi dokumen pertanggungjawaban",
            gradient: "from-blue-500/10 to-cyan-500/10",
            iconColor: "text-blue-600"
          }, {
            icon: ClipboardCheck,
            role: "Verifikator",
            description: "Resepsionis, PBMD, Akuntansi, Perbendaharaan melakukan verifikasi",
            gradient: "from-green-500/10 to-emerald-500/10",
            iconColor: "text-green-600"
          }, {
            icon: UserCheck,
            role: "Kepala BKAD",
            description: "Memberikan persetujuan akhir sebelum penerbitan SP2D",
            gradient: "from-purple-500/10 to-pink-500/10",
            iconColor: "text-purple-600"
          }, {
            icon: BarChart3,
            role: "Administrator",
            description: "Mengelola sistem, user, dan monitoring keseluruhan proses",
            gradient: "from-orange-500/10 to-amber-500/10",
            iconColor: "text-orange-600"
          }].map((user, index) => <Card key={index} className={`bg-gradient-to-br ${user.gradient} border`}>
                <CardContent className="pt-6 text-center">
                  <div className="inline-flex p-4 rounded-full bg-primary/10 mb-4">
                    <user.icon className={`h-8 w-8 ${user.iconColor}`} />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{user.role}</h3>
                  <p className="text-sm text-muted-foreground">{user.description}</p>
                </CardContent>
              </Card>)}
          </div>
        </section>

        {/* Technology Stack */}
        <section className="container py-16 bg-muted/30">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              Teknologi Modern
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Dibangun dengan teknologi terkini untuk performa dan keamanan optimal
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card className="border">
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Code className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold">Frontend</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="bg-primary/10">React</Badge>
                      <Badge variant="secondary" className="bg-primary/10">TypeScript</Badge>
                      <Badge variant="secondary" className="bg-primary/10">Tailwind CSS</Badge>
                      <Badge variant="secondary" className="bg-primary/10">Vite</Badge>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Database className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold">Backend</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="bg-accent/10"> Node JS</Badge>
                      <Badge variant="secondary" className="bg-accent/10">PostgreSQL</Badge>
                      <Badge variant="secondary" className="bg-accent/10">Edge Functions</Badge>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Server className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold">Infrastructure</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="bg-purple-500/10">Authentication</Badge>
                      <Badge variant="secondary" className="bg-purple-500/10">Row Level Security</Badge>
                      <Badge variant="secondary" className="bg-purple-500/10">Real-time</Badge>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Smartphone className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold">Features</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="bg-green-500/10">Responsive</Badge>
                      <Badge variant="secondary" className="bg-green-500/10">PWA Ready</Badge>
                      <Badge variant="secondary" className="bg-green-500/10">Dark Mode</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="container py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              Pertanyaan Umum
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Jawaban untuk pertanyaan yang sering diajukan
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem value="item-1" className="border rounded-lg px-6 bg-card">
                <AccordionTrigger className="text-left hover:no-underline">
                  Apa itu SIMPA BEND BKADKU?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  SIMPA BEND BKADKU adalah Sistem Informasi Manajemen Pertanggungjawaban Bendahara
                  yang dikembangkan khusus untuk BKAD Kolaka Utara. Sistem ini memfasilitasi proses
                  pengajuan, verifikasi, dan pencairan SPM/SP2D secara digital dan terintegrasi.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" className="border rounded-lg px-6 bg-card">
                <AccordionTrigger className="text-left hover:no-underline">
                  Siapa saja yang dapat menggunakan sistem ini?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Sistem dapat digunakan oleh Bendahara OPD, Verifikator (Resepsionis, PBMD, Akuntansi,
                  Perbendaharaan), Kepala BKAD, dan Administrator. Setiap pengguna memiliki akses dan
                  fitur sesuai dengan peran mereka.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3" className="border rounded-lg px-6 bg-card">
                <AccordionTrigger className="text-left hover:no-underline">
                  Bagaimana keamanan data dalam sistem?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Sistem menggunakan enkripsi data end-to-end, kontrol akses berbasis role (RLS),
                  verifikasi PIN/OTP untuk transaksi penting, dan audit trail lengkap untuk setiap aktivitas.
                  Semua data disimpan dalam database terenkripsi dengan backup berkala.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4" className="border rounded-lg px-6 bg-card">
                <AccordionTrigger className="text-left hover:no-underline">
                  Berapa lama proses verifikasi SPM?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Dengan digitalisasi, proses verifikasi dapat diselesaikan dalam hitungan hari
                  dibandingkan berminggu-minggu dengan cara manual. Waktu aktual tergantung pada
                  kelengkapan dokumen dan kompleksitas verifikasi yang diperlukan.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5" className="border rounded-lg px-6 bg-card">
                <AccordionTrigger className="text-left hover:no-underline">
                  Apakah sistem dapat diakses dari perangkat mobile?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Ya, sistem sepenuhnya responsif dan dapat diakses dari berbagai perangkat termasuk
                  smartphone, tablet, dan desktop. Antarmuka otomatis menyesuaikan dengan ukuran layar
                  untuk pengalaman pengguna yang optimal.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6" className="border rounded-lg px-6 bg-card">
                <AccordionTrigger className="text-left hover:no-underline">
                  Bagaimana cara mendapatkan akses ke sistem?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Untuk mendapatkan akses, hubungi Administrator sistem di BKAD Kolaka Utara.
                  Administrator akan membuat akun dan memberikan kredensial sesuai dengan peran Anda
                  dalam proses pertanggungjawaban bendahara.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>

        {/* Statistics Impact */}
        <section className="container py-16 bg-muted/30">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              Dampak & Pencapaian
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[{
            icon: TrendingUp,
            value: "1250+",
            label: "SPM Diproses",
            gradient: "from-blue-500/10 to-cyan-500/10",
            iconColor: "text-blue-600"
          }, {
            icon: Users,
            value: "50+",
            label: "OPD Terhubung",
            gradient: "from-green-500/10 to-emerald-500/10",
            iconColor: "text-green-600"
          }, {
            icon: Clock,
            value: "70%",
            label: "Lebih Cepat",
            gradient: "from-purple-500/10 to-pink-500/10",
            iconColor: "text-purple-600"
          }, {
            icon: CheckCircle,
            value: "98%",
            label: "Tingkat Approval",
            gradient: "from-orange-500/10 to-amber-500/10",
            iconColor: "text-orange-600"
          }].map((stat, index) => <Card key={index} className={`bg-gradient-to-br ${stat.gradient} border`}>
                <CardContent className="pt-6 text-center">
                  <div className="inline-flex p-3 rounded-xl bg-primary/10 mb-3">
                    <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
                  </div>
                  <div className="text-3xl font-bold mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>)}
          </div>
        </section>

        {/* CTA Section */}
        <section className="container py-20">
          <div className="mx-auto max-w-3xl rounded-3xl border px-8 py-16 text-center bg-gradient-to-br from-primary/10 to-accent/5">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">Efisiensi & Transparansi</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Tingkatkan efisiensi dan transparansi pengelolaan keuangan daerah Anda
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="font-semibold" asChild>
                <Link to="/dashboard">
                  Akses Sistem
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="font-semibold" asChild>
                <Link to="/panduan">Lihat Panduan</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <ScrollToTop />
    </div>;
};
export default About;