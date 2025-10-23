import { Card, CardContent } from "@/components/ui/card";
import { FileText, CheckCircle2, Shield, Activity, Database, FileCheck } from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "Manajemen SPM/SP2D",
    description:
      "Pengelolaan Surat Perintah Membayar dan Surat Perintah Pencairan Dana secara digital dan terteknologi",
    color: "text-blue-500",
    bgColor: "bg-blue-50",
  },
  {
    icon: CheckCircle2,
    title: "Verifikasi Multi-Tahap",
    description:
      "Proses verifikasi bertahap oleh Resepsionis, PBMD, Akuntansi, Perbendaharaan hingga Kepala BKAD",
    color: "text-green-500",
    bgColor: "bg-green-50",
  },
  {
    icon: Shield,
    title: "Keamanan Terjamin",
    description:
      "Verifikasi PIN/OTP melalui WhatsApp dan Email untuk setiap transaksi penting",
    color: "text-purple-500",
    bgColor: "bg-purple-50",
  },
  {
    icon: Activity,
    title: "Real-Time Monitoring",
    description:
      "Pantau status dokumen secara real-time dengan notifikasi otomatis di setiap perubahan status",
    color: "text-orange-500",
    bgColor: "bg-orange-50",
  },
  {
    icon: Database,
    title: "Audit Trail Lengkap",
    description:
      "Pencatatan lengkap setiap aktivitas untuk transparansi dan akuntabilitas maksimal",
    color: "text-indigo-500",
    bgColor: "bg-indigo-50",
  },
  {
    icon: FileCheck,
    title: "Validasi Publik",
    description:
      "Masyarakat dapat memvalidasi dokumen melalui sistem pengumuman publik untuk transparansi",
    color: "text-teal-500",
    bgColor: "bg-teal-50",
  },
];

const Features = () => {
  return (
    <section className="container py-20 bg-muted/30">
      <div className="text-center mb-16">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
          Fitur Unggulan Sistem
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {features.map((feature, index) => (
          <Card
            key={index}
            className="border-2 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
          >
            <CardContent className="pt-6">
              <div className={`inline-flex p-3 rounded-xl ${feature.bgColor} mb-4`}>
                <feature.icon className={`h-6 w-6 ${feature.color}`} />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default Features;
