import { AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormFieldErrorProps {
  error?: string;
  success?: boolean;
  className?: string;
}

export function FormFieldError({ error, success, className }: FormFieldErrorProps) {
  if (!error && !success) return null;

  return (
    <div
      className={cn(
        "flex items-center gap-2 text-xs mt-1 animate-fade-in",
        error && "text-destructive",
        success && "text-green-600",
        className
      )}
    >
      {error && (
        <>
          <AlertCircle className="h-3 w-3 flex-shrink-0" />
          <span>{error}</span>
        </>
      )}
      {success && (
        <>
          <CheckCircle2 className="h-3 w-3 flex-shrink-0" />
          <span>Valid</span>
        </>
      )}
    </div>
  );
}
