import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

interface AuditDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: any;
}

export const AuditDetailModal = ({
  open,
  onOpenChange,
  data,
}: AuditDetailModalProps) => {
  if (!data) return null;

  const getActionBadgeVariant = (action: string) => {
    switch (action) {
      case "create":
        return "default";
      case "update":
        return "secondary";
      case "delete":
        return "destructive";
      default:
        return "outline";
    }
  };

  const renderJsonDiff = (oldData: any, newData: any) => {
    if (!oldData && !newData) return null;

    const oldKeys = oldData ? Object.keys(oldData) : [];
    const newKeys = newData ? Object.keys(newData) : [];
    const allKeys = [...new Set([...oldKeys, ...newKeys])];

    return (
      <div className="space-y-4">
        {allKeys.map((key) => {
          const oldValue = oldData?.[key];
          const newValue = newData?.[key];
          const hasChanged =
            JSON.stringify(oldValue) !== JSON.stringify(newValue);

          if (!hasChanged && data.action === "update") return null;

          return (
            <div key={key} className="grid grid-cols-3 gap-4 p-3 bg-muted rounded-lg">
              <div className="font-medium text-sm">{key}</div>
              <div className="text-sm">
                <div className="text-muted-foreground mb-1">Lama:</div>
                <div className={hasChanged ? "text-red-600" : ""}>
                  {oldValue !== undefined && oldValue !== null
                    ? String(oldValue)
                    : "-"}
                </div>
              </div>
              <div className="text-sm">
                <div className="text-muted-foreground mb-1">Baru:</div>
                <div className={hasChanged ? "text-green-600" : ""}>
                  {newValue !== undefined && newValue !== null
                    ? String(newValue)
                    : "-"}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detail Audit Log</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Waktu</div>
              <div className="font-medium">
                {format(new Date(data.created_at), "dd MMMM yyyy HH:mm:ss", {
                  locale: localeId,
                })}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">User</div>
              <div className="font-medium">
                {data.user?.full_name || "-"}
                <div className="text-sm text-muted-foreground">
                  {data.user?.email || "-"}
                </div>
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Aksi</div>
              <Badge variant={getActionBadgeVariant(data.action)}>
                {data.action}
              </Badge>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Resource</div>
              <div className="font-medium">{data.resource}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Resource ID</div>
              <div className="font-mono text-xs">{data.resource_id}</div>
            </div>
            {data.ip_address && (
              <div>
                <div className="text-sm text-muted-foreground">IP Address</div>
                <div className="font-mono text-xs">{data.ip_address}</div>
              </div>
            )}
          </div>

          {/* Data Changes */}
          {(data.old_data || data.new_data) && (
            <div>
              <h3 className="font-semibold mb-3">Perubahan Data</h3>
              {renderJsonDiff(data.old_data, data.new_data)}
            </div>
          )}

          {/* User Agent */}
          {data.user_agent && (
            <div>
              <div className="text-sm text-muted-foreground">User Agent</div>
              <div className="text-xs font-mono bg-muted p-2 rounded mt-1">
                {data.user_agent}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
