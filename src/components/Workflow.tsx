import { Card, CardContent } from "@/components/ui/card";
import { FileText, ClipboardCheck, CheckCircle, UserCheck, FileCheck2, Banknote } from "lucide-react";

const steps = [
  {
    number: 1,
    icon: FileText,
    title: "Pengajuan SPM",
    description: "Bendahara OPD mengajukan SPM dengan dokumen lengkap",
    gradient: "from-blue-500/10 to-cyan-500/10",
    iconColor: "text-blue-600",
  },
  {
    number: 2,
    icon: ClipboardCheck,
    title: "Verifikasi Dokumen",
    description: "Resepsionis memeriksa kelengkapan dan memberikan nomor berkas",
    gradient: "from-purple-500/10 to-pink-500/10",
    iconColor: "text-purple-600",
  },
  {
    number: 3,
    icon: CheckCircle,
    title: "Validasi Multi-Tahap",
    description: "Proses verifikasi oleh PBMD, Akuntansi, dan Perbendaharaan",
    gradient: "from-green-500/10 to-emerald-500/10",
    iconColor: "text-green-600",
  },
  {
    number: 4,
    icon: UserCheck,
    title: "Persetujuan Kepala",
    description: "Kepala BKAD memberikan persetujuan akhir",
    gradient: "from-orange-500/10 to-amber-500/10",
    iconColor: "text-orange-600",
  },
  {
    number: 5,
    icon: FileCheck2,
    title: "Penerbitan SP2D",
    description: "SP2D/DD diterbitkan dengan verifikasi PIN/OTP",
    gradient: "from-indigo-500/10 to-violet-500/10",
    iconColor: "text-indigo-600",
  },
  {
    number: 6,
    icon: Banknote,
    title: "Pencairan Dana",
    description: "Proses pencairan melalui bank dan konfirmasi",
    gradient: "from-teal-500/10 to-cyan-500/10",
    iconColor: "text-teal-600",
  },
];

const Workflow = () => {
  return (
    <section className="container py-20 relative">
      {/* Background elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="text-center mb-16 animate-fade-in">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Alur Kerja Sistem
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Proses yang terstruktur dan efisien untuk pertanggungjawaban keuangan
        </p>
      </div>

      {/* Horizontal Timeline for larger screens */}
      <div className="hidden lg:block max-w-7xl mx-auto">
        <div className="relative">
          {/* Progress Line */}
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 -translate-y-1/2" />
          <div className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-primary to-accent -translate-y-1/2 w-full animate-pulse" style={{ width: "100%" }} />

          <div className="grid grid-cols-6 gap-4">
            {steps.map((step, index) => (
              <div key={index} className="relative animate-fade-in" style={{ animationDelay: `${index * 150}ms` }}>
                <Card className={`group relative overflow-hidden bg-gradient-to-br ${step.gradient} border-2 hover:border-primary/30 hover:shadow-xl transition-all duration-300 hover:-translate-y-2`}>
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/20 to-transparent rounded-full blur-xl -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
                  
                  <CardContent className="p-4 relative z-10">
                    <div className="flex flex-col items-center text-center space-y-3">
                      <div className={`p-3 rounded-xl bg-white/50 backdrop-blur-sm group-hover:scale-110 transition-transform duration-300`}>
                        <step.icon className={`h-6 w-6 ${step.iconColor}`} />
                      </div>
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm">
                        {step.number}
                      </div>
                      <h3 className="text-sm font-semibold leading-tight">{step.title}</h3>
                      <p className="text-xs text-muted-foreground leading-snug">{step.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Vertical Timeline for mobile/tablet */}
      <div className="lg:hidden max-w-2xl mx-auto space-y-4">
        {steps.map((step, index) => (
          <Card
            key={index}
            className={`group relative overflow-hidden bg-gradient-to-br ${step.gradient} border-l-4 border-l-primary hover:shadow-xl transition-all duration-300 hover:-translate-x-2`}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/20 to-transparent rounded-full blur-2xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
            
            <CardContent className="flex items-start gap-4 p-6 relative z-10">
              <div className={`p-3 rounded-xl bg-white/50 backdrop-blur-sm shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                <step.icon className={`h-6 w-6 ${step.iconColor}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm">
                    {step.number}
                  </div>
                  <h3 className="text-lg font-semibold">{step.title}</h3>
                </div>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default Workflow;
