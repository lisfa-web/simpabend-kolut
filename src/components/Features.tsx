import { Card, CardContent } from "@/components/ui/card";
import { FileText, CheckCircle2, Shield, Activity, Database, FileCheck } from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "Manajemen SPM/SP2D",
    description:
      "Pengelolaan Surat Perintah Membayar dan Surat Perintah Pencairan Dana secara digital dan terteknologi",
    gradient: "from-blue-500/10 to-cyan-500/10",
    iconColor: "text-blue-600",
  },
  {
    icon: CheckCircle2,
    title: "Verifikasi Multi-Tahap",
    description:
      "Proses verifikasi bertahap oleh Resepsionis, PBMD, Akuntansi, Perbendaharaan hingga Kepala BKAD",
    gradient: "from-green-500/10 to-emerald-500/10",
    iconColor: "text-green-600",
  },
  {
    icon: Shield,
    title: "Keamanan Terjamin",
    description:
      "Verifikasi PIN/OTP melalui WhatsApp dan Email untuk setiap transaksi penting",
    gradient: "from-purple-500/10 to-pink-500/10",
    iconColor: "text-purple-600",
  },
  {
    icon: Activity,
    title: "Real-Time Monitoring",
    description:
      "Pantau status dokumen secara real-time dengan notifikasi otomatis di setiap perubahan status",
    gradient: "from-orange-500/10 to-amber-500/10",
    iconColor: "text-orange-600",
  },
  {
    icon: Database,
    title: "Audit Trail Lengkap",
    description:
      "Pencatatan lengkap setiap aktivitas untuk transparansi dan akuntabilitas maksimal",
    gradient: "from-indigo-500/10 to-violet-500/10",
    iconColor: "text-indigo-600",
  },
  {
    icon: FileCheck,
    title: "Validasi Publik",
    description:
      "Masyarakat dapat memvalidasi dokumen melalui sistem pengumuman publik untuk transparansi",
    gradient: "from-teal-500/10 to-cyan-500/10",
    iconColor: "text-teal-600",
  },
];

const Features = () => {
  return (
    <section className="container py-20 bg-muted/30">
      <div className="text-center mb-16">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Fitur Unggulan Sistem
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Solusi lengkap untuk manajemen keuangan daerah yang modern dan efisien
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {features.map((feature, index) => (
          <Card
            key={index}
            className={`group relative overflow-hidden bg-gradient-to-br ${feature.gradient} border-2 hover:border-primary/20 transition-all duration-200`}
          >
            <CardContent className="pt-6">
              <div className={`inline-flex p-4 rounded-2xl bg-primary/10 mb-4`}>
                <feature.icon className={`h-8 w-8 ${feature.iconColor}`} />
              </div>
              <h3 className="text-xl font-semibold mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default Features;
