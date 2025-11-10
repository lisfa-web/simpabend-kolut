import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { CheckCircle2, Clock, FileCheck, Banknote, Building2, Wallet, Send, XCircle } from "lucide-react";

interface Sp2dTimelineProps {
  sp2d: any;
}

export const Sp2dTimeline = ({ sp2d }: Sp2dTimelineProps) => {
  const steps = [
    {
      id: "pending",
      label: "SP2D Dibuat (Pending)",
      date: sp2d.created_at,
      icon: FileCheck,
      description: "SP2D dibuat oleh Kuasa BUD, menunggu verifikasi OTP",
      isCompleted: true, // Always completed since we have the record
      isCurrent: sp2d.status === "pending",
    },
    {
      id: "diterbitkan",
      label: "SP2D Diterbitkan (OTP Verified)",
      date: sp2d.otp_verified_at || sp2d.tanggal_sp2d,
      icon: CheckCircle2,
      description: "SP2D telah diverifikasi dengan OTP dan diterbitkan",
      isCompleted: ["diterbitkan", "diuji_bank", "cair"].includes(sp2d.status),
      isCurrent: sp2d.status === "diterbitkan",
    },
    {
      id: "diuji_bank",
      label: "Dikirim ke Bank Sultra",
      date: sp2d.tanggal_kirim_bank,
      icon: Building2,
      description: "SP2D dikirim ke Bank Sultra untuk diproses pemindahbukuan",
      isCompleted: ["diuji_bank", "cair"].includes(sp2d.status),
      isCurrent: sp2d.status === "diuji_bank" && !sp2d.tanggal_konfirmasi_bank,
    },
    {
      id: "konfirmasi_bank",
      label: "Konfirmasi Pemindahbukuan dari Bank",
      date: sp2d.tanggal_konfirmasi_bank,
      icon: Send,
      description: sp2d.tanggal_konfirmasi_bank 
        ? `Bank telah mengkonfirmasi pemindahbukuan${sp2d.nomor_referensi_bank ? ` (Ref: ${sp2d.nomor_referensi_bank})` : ''}`
        : "Menunggu konfirmasi dari Bank Sultra",
      isCompleted: !!sp2d.tanggal_konfirmasi_bank || sp2d.status === "cair",
      isCurrent: sp2d.status === "diuji_bank" && !!sp2d.tanggal_konfirmasi_bank && !sp2d.tanggal_cair,
    },
    {
      id: "cair",
      label: "Dana Dicairkan",
      date: sp2d.tanggal_cair,
      icon: Wallet,
      description: "Dana telah dicairkan ke rekening penerima",
      isCompleted: sp2d.status === "cair",
      isCurrent: sp2d.status === "cair",
    },
  ];

  // Add gagal status if applicable
  if (sp2d.status === "gagal") {
    steps.push({
      id: "gagal",
      label: "SP2D Gagal",
      date: sp2d.updated_at,
      icon: XCircle,
      description: sp2d.catatan || "SP2D ditolak atau gagal diproses",
      isCompleted: true,
      isCurrent: true,
    });
  }

  return (
    <div className="space-y-4">
      {steps.map((step, index) => {
        const Icon = step.icon;
        const isGagal = step.id === "gagal";
        return (
          <div key={step.id} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div
                className={`rounded-full p-2 ${
                  isGagal
                    ? "bg-destructive text-destructive-foreground"
                    : step.isCompleted
                    ? "bg-primary text-primary-foreground"
                    : step.isCurrent
                    ? "bg-primary/20 text-primary border-2 border-primary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <Icon className="h-5 w-5" />
              </div>
              {index < steps.length - 1 && (
                <div className={`w-0.5 h-12 ${
                  isGagal
                    ? "bg-destructive"
                    : step.isCompleted
                    ? "bg-primary"
                    : "bg-muted"
                }`} />
              )}
            </div>
            <div className="flex-1 pb-8">
              <div className="flex items-center gap-2 mb-1">
                <h4 className={`font-semibold ${
                  isGagal
                    ? "text-destructive"
                    : step.isCompleted
                    ? "text-foreground"
                    : step.isCurrent
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}>
                  {step.label}
                </h4>
                {step.isCurrent && !step.isCompleted && !isGagal && (
                  <Clock className="h-4 w-4 text-primary animate-pulse" />
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-2">{step.description}</p>
              {step.date && (
                <p className="text-xs text-muted-foreground">
                  {format(new Date(step.date), "dd MMMM yyyy, HH:mm", {
                    locale: localeId,
                  })}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
