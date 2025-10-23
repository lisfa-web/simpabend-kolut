import { useState } from "react";
import { Edit2, Loader2, Search } from "lucide-react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useConfigSistem, useConfigMutation } from "@/hooks/useConfigSistem";
import { Database } from "@/integrations/supabase/types";

type ConfigRow = Database["public"]["Tables"]["config_sistem"]["Row"];

const ConfigList = () => {
  const { data: configs, isLoading } = useConfigSistem();
  const { updateConfig } = useConfigMutation();
  const [search, setSearch] = useState("");
  const [editDialog, setEditDialog] = useState<{ open: boolean; config?: ConfigRow }>({
    open: false,
  });
  const [editValue, setEditValue] = useState("");

  const filteredConfigs = configs?.filter(
    (c) =>
      c.key.toLowerCase().includes(search.toLowerCase()) ||
      c.description?.toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (config: ConfigRow) => {
    setEditDialog({ open: true, config });
    setEditValue(config.value);
  };

  const handleSave = () => {
    if (editDialog.config) {
      updateConfig.mutate(
        { key: editDialog.config.key, value: editValue },
        {
          onSuccess: () => {
            setEditDialog({ open: false });
            setEditValue("");
          },
        }
      );
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Konfigurasi Sistem</h1>
          <p className="text-muted-foreground mt-2">
            Kelola pengaturan umum aplikasi
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Daftar Konfigurasi</CardTitle>
                <CardDescription>Ubah nilai konfigurasi sistem</CardDescription>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari konfigurasi..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredConfigs && filteredConfigs.length > 0 ? (
              <div className="space-y-4">
                {filteredConfigs.map((config) => (
                  <div
                    key={config.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-foreground">{config.key}</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {config.description || "Tidak ada deskripsi"}
                      </div>
                      <div className="text-sm font-mono text-primary mt-2">
                        {config.value}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(config)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Tidak ada konfigurasi ditemukan
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={editDialog.open} onOpenChange={(open) => setEditDialog({ open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Konfigurasi</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Key</Label>
              <Input value={editDialog.config?.key || ""} disabled />
            </div>
            <div className="space-y-2">
              <Label>Deskripsi</Label>
              <Input value={editDialog.config?.description || "-"} disabled />
            </div>
            <div className="space-y-2">
              <Label>Value</Label>
              <Input
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                placeholder="Masukkan nilai"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog({ open: false })}>
              Batal
            </Button>
            <Button onClick={handleSave} disabled={updateConfig.isPending}>
              {updateConfig.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default ConfigList;
