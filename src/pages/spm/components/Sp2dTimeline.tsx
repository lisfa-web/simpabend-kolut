import { CheckCircle2, Circle, Clock, Banknote } from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

interface Sp2dTimelineProps {
  createdAt: string;
  tanggalKirimBank?: string | null;
  tanggalKonfirmasiBank?: string | null;
  tanggalCair?: string | null;
  status: string;
}

export const Sp2dTimeline = ({
  createdAt,
  tanggalKirimBank,
  tanggalKonfirmasiBank,
  tanggalCair,
  status,
}: Sp2dTimelineProps) => {
  const steps = [
    {
      label: "SP2D Dibuat & Diterbitkan",
      timestamp: createdAt,
      completed: true,
    },
    {
      label: "Dikirim ke Bank Sultra",
      timestamp: tanggalKirimBank,
      completed: !!tanggalKirimBank,
      showIcon: true,
    },
    {
      label: "Konfirmasi Pemindahbukuan dari Bank",
      timestamp: tanggalKonfirmasiBank,
      completed: !!tanggalKonfirmasiBank,
    },
    {
      label: "Dana Dicairkan",
      timestamp: tanggalCair,
      completed: status === "cair",
    },
  ];

  return (
    <div className="space-y-4">
      {steps.map((step, index) => (
        <div key={index} className="flex gap-4">
          <div className="flex flex-col items-center">
            {(step as any).showIcon && step.completed ? (
              <Banknote className="h-6 w-6 text-warning" />
            ) : step.completed ? (
              <CheckCircle2 className="h-6 w-6 text-success" />
            ) : (
              <Circle className="h-6 w-6 text-muted-foreground" />
            )}
            {index < steps.length - 1 && (
              <div
                className={`w-0.5 h-12 ${
                  step.completed ? "bg-success" : "bg-muted"
                }`}
              />
            )}
          </div>
          <div className="flex-1 pb-8">
            <p className={`font-medium ${step.completed ? "text-foreground" : "text-muted-foreground"}`}>
              {step.label}
            </p>
            {step.timestamp ? (
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {format(new Date(step.timestamp), "dd MMMM yyyy, HH:mm", {
                  locale: localeId,
                })}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">Belum dilakukan</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
