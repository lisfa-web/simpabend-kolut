import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RotateCcw } from "lucide-react";

interface LayoutSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  widgets: Array<{ id: string; label: string }>;
  hiddenWidgets: string[];
  onToggleWidget: (widgetId: string) => void;
  onReset: () => void;
}

export const LayoutSettingsDialog = ({
  open,
  onOpenChange,
  widgets,
  hiddenWidgets,
  onToggleWidget,
  onReset,
}: LayoutSettingsDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Pengaturan Widget</DialogTitle>
          <DialogDescription>
            Pilih widget yang ingin ditampilkan di dashboard
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {widgets.map((widget) => (
            <div
              key={widget.id}
              className="flex items-center justify-between space-x-2"
            >
              <Label htmlFor={widget.id} className="flex-1 cursor-pointer">
                {widget.label}
              </Label>
              <Switch
                id={widget.id}
                checked={!hiddenWidgets.includes(widget.id)}
                onCheckedChange={() => onToggleWidget(widget.id)}
              />
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onReset}
            className="w-full"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset ke Default
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
