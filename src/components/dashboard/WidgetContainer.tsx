import { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { GripVertical, EyeOff } from "lucide-react";

interface WidgetContainerProps {
  children: ReactNode;
  title?: string;
  isEditMode: boolean;
  isHidden?: boolean;
  className?: string;
}

export const WidgetContainer = ({
  children,
  title,
  isEditMode,
  isHidden,
  className,
}: WidgetContainerProps) => {
  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all h-full flex flex-col",
        isEditMode && "ring-2 ring-primary/20 cursor-move",
        isHidden && "opacity-50",
        className
      )}
    >
      {isEditMode && (
        <div className="absolute top-2 left-2 z-10 flex items-center gap-2 bg-background/80 backdrop-blur-sm px-2 py-1 rounded">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
          {isHidden && <EyeOff className="h-4 w-4 text-muted-foreground" />}
          {title && <span className="text-xs font-medium">{title}</span>}
        </div>
      )}
      <div className={cn("flex-1", isEditMode && "pt-8")}>{children}</div>
    </Card>
  );
};
