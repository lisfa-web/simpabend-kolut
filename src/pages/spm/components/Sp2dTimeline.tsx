import { CheckCircle2, Circle, Clock, Banknote } from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

interface Sp2dTimelineProps {
  sp2d: any;
}

export const Sp2dTimeline = ({ sp2d }: Sp2dTimelineProps) => {
  const steps = [
    {
      label: "SP2D Dibuat & Diterbitkan",
      timestamp: sp2d.created_at,
      completed: true,
      icon: <CheckCircle2 className="h-6 w-6 text-green-600" />,
    },
    {
      label: "Dikirim ke Bank Sultra",
      timestamp: sp2d.tanggal_kirim_bank,
      completed: !!sp2d.tanggal_kirim_bank,
      icon: sp2d.tanggal_kirim_bank ? (
        <Banknote className="h-6 w-6 text-blue-600" />
      ) : (
        <Circle className="h-6 w-6 text-muted-foreground" />
      ),
    },
    {
      label: "Konfirmasi Pemindahbukuan dari Bank",
      timestamp: sp2d.tanggal_konfirmasi_bank,
      completed: !!sp2d.tanggal_konfirmasi_bank,
      icon: sp2d.tanggal_konfirmasi_bank ? (
        <CheckCircle2 className="h-6 w-6 text-orange-600" />
      ) : (
        <Circle className="h-6 w-6 text-muted-foreground" />
      ),
    },
    {
      label: "Dana Dicairkan",
      timestamp: sp2d.tanggal_cair,
      completed: sp2d.status === "cair",
      icon: sp2d.status === "cair" ? (
        <CheckCircle2 className="h-6 w-6 text-green-600" />
      ) : (
        <Circle className="h-6 w-6 text-muted-foreground" />
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {steps.map((step, index) => (
        <div key={index} className="flex gap-4">
          <div className="flex flex-col items-center">
            {step.icon}
            {index < steps.length - 1 && (
              <div
                className={`w-0.5 h-12 ${
                  step.completed ? "bg-primary" : "bg-muted"
                }`}
              />
            )}
          </div>
          <div className="flex-1 pb-8">
            <p className={`font-medium ${step.completed ? "text-foreground" : "text-muted-foreground"}`}>
              {step.label}
            </p>
            {step.timestamp ? (
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                <Clock className="h-3 w-3" />
                {format(new Date(step.timestamp), "dd MMMM yyyy, HH:mm", {
                  locale: localeId,
                })}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground mt-1">Belum dilakukan</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
