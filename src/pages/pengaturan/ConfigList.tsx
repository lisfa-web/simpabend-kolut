import { useState } from "react";
import { Edit2, Loader2, Search, Upload, Image as ImageIcon } from "lucide-react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useConfigSistem, useConfigMutation } from "@/hooks/useConfigSistem";
import { Database } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type ConfigRow = Database["public"]["Tables"]["config_sistem"]["Row"];

const ConfigList = () => {
  const { data: configs, isLoading } = useConfigSistem();
  const { updateConfig } = useConfigMutation();
  const [search, setSearch] = useState("");
  const [editDialog, setEditDialog] = useState<{ open: boolean; config?: ConfigRow }>({
    open: false,
  });
  const [editValue, setEditValue] = useState("");
  const [uploading, setUploading] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string>("");

  const filteredConfigs = configs?.filter(
    (c) =>
      c.key.toLowerCase().includes(search.toLowerCase()) ||
      c.description?.toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (config: ConfigRow) => {
    setEditDialog({ open: true, config });
    setEditValue(config.value);
    if (config.key === 'logo_bkad_url' && config.value) {
      setLogoPreview(config.value);
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!['image/png', 'image/jpeg', 'image/jpg', 'image/webp'].includes(file.type)) {
      toast.error("Format file harus PNG, JPG, atau WEBP");
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2097152) {
      toast.error("Ukuran file maksimal 2MB");
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `logo-bkad-${Date.now()}.${fileExt}`;
      const filePath = fileName;

      // Delete old logo if exists
      if (editValue) {
        const oldPath = editValue.split('/').pop();
        if (oldPath) {
          await supabase.storage.from('system-logos').remove([oldPath]);
        }
      }

      // Upload new logo
      const { error: uploadError, data } = await supabase.storage
        .from('system-logos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('system-logos')
        .getPublicUrl(filePath);

      setEditValue(publicUrl);
      setLogoPreview(publicUrl);
      toast.success("Logo berhasil diupload");
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Gagal upload logo");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = () => {
    if (editDialog.config) {
      updateConfig.mutate(
        { key: editDialog.config.key, value: editValue },
        {
          onSuccess: () => {
            setEditDialog({ open: false });
            setEditValue("");
            setLogoPreview("");
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
              {editDialog.config?.key === 'logo_bkad_url' ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={uploading}
                      onClick={() => document.getElementById('logo-upload')?.click()}
                    >
                      {uploading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="mr-2 h-4 w-4" />
                      )}
                      Upload Logo
                    </Button>
                    <input
                      id="logo-upload"
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                    <span className="text-xs text-muted-foreground">
                      PNG, JPG, WEBP (Max 2MB)
                    </span>
                  </div>
                  {logoPreview && (
                    <div className="border rounded-lg p-4 bg-muted/50">
                      <Label className="mb-2 block">Preview Logo:</Label>
                      <img
                        src={logoPreview}
                        alt="Logo Preview"
                        className="h-20 object-contain"
                      />
                    </div>
                  )}
                  <Input
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    placeholder="URL logo (otomatis terisi setelah upload)"
                    disabled
                  />
                </div>
              ) : (
                <Input
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  placeholder="Masukkan nilai"
                />
              )}
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
