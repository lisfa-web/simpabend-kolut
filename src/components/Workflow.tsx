import { Card, CardContent } from "@/components/ui/card";

const steps = [
  {
    number: 1,
    title: "Pengajuan SPM",
    description: "Bendahara OPD mengajukan SPM dengan dokumen lengkap",
  },
  {
    number: 2,
    title: "Verifikasi Dokumen",
    description: "Resepsionis memeriksa kelengkapan dan memberikan nomor berkas",
  },
  {
    number: 3,
    title: "Validasi Multi-Tahap",
    description: "Proses verifikasi oleh PBMD, Akuntansi, dan Perbendaharaan",
  },
  {
    number: 4,
    title: "Persetujuan Kepala",
    description: "Kepala BKAD memberikan persetujuan akhir",
  },
  {
    number: 5,
    title: "Penerbitan SP2D",
    description: "SP2D/DD diterbitkan dengan verifikasi PIN/OTP",
  },
  {
    number: 6,
    title: "Pencairan Dana",
    description: "Proses pencairan melalui bank dan konfirmasi",
  },
];

const Workflow = () => {
  return (
    <section className="container py-20">
      <div className="text-center mb-16">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
          Alur Kerja Sistem
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Proses yang terstruktur dan efisien untuk pertanggungjawaban keuangan
        </p>
      </div>
      <div className="max-w-4xl mx-auto space-y-4">
        {steps.map((step, index) => (
          <Card
            key={index}
            className="border-l-4 border-l-primary hover:shadow-md transition-all duration-300"
          >
            <CardContent className="flex items-start gap-4 p-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg">
                {step.number}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
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
