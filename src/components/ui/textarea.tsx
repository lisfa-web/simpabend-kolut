import * as React from "react";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
  success?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, success, ...props }, ref) => {
    return (
      <div className="relative">
        <textarea
          className={cn(
            "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
            error && "border-destructive focus-visible:ring-destructive pr-10",
            success && "border-green-500 focus-visible:ring-green-500 pr-10",
            className,
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <AlertCircle className="absolute right-3 top-3 h-4 w-4 text-destructive animate-fade-in" />
        )}
        {success && !error && (
          <CheckCircle2 className="absolute right-3 top-3 h-4 w-4 text-green-500 animate-fade-in" />
        )}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
