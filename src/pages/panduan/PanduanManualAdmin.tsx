import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePanduanManual } from "@/hooks/usePanduanManual";
import { useState } from "react";
import { Plus, Edit, Trash2, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { getRoleDisplayName } from "@/lib/auth";
import { RichTextEditorSimple } from "@/components/surat/RichTextEditorSimple";

const AVAILABLE_ROLES = [
  "administrator",
  "super_admin",
  "bendahara_opd",
  "resepsionis",
  "pbmd",
  "akuntansi",
  "perbendaharaan",
  "kepala_bkad",
  "kuasa_bud",
];

const PanduanManualAdmin = () => {
  const { allPanduan, savePanduan, deletePanduan, isSaving } = usePanduanManual();
  const [editingPanduan, setEditingPanduan] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSave = () => {
    if (!editingPanduan?.role || !editingPanduan?.judul || !editingPanduan?.konten) {
      return;
    }
    savePanduan(editingPanduan);
    setIsDialogOpen(false);
    setEditingPanduan(null);
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">⚙️ Kelola Panduan Manual</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Tambah dan edit panduan manual untuk setiap role
            </p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() =>
                  setEditingPanduan({ urutan: 0, is_active: true })
                }
              >
                <Plus className="mr-2 h-4 w-4" />
                Tambah Panduan
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-lg">
                  {editingPanduan?.id ? "Edit Panduan" : "Tambah Panduan Baru"}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm">Role Target</Label>
                    <Select
                      value={editingPanduan?.role}
                      onValueChange={(v) =>
                        setEditingPanduan({ ...editingPanduan, role: v })
                      }
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Pilih role" />
                      </SelectTrigger>
                      <SelectContent>
                        {AVAILABLE_ROLES.map((role) => (
                          <SelectItem key={role} value={role}>
                            {getRoleDisplayName(role as any)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm">Urutan</Label>
                    <Input
                      type="number"
                      className="h-9"
                      value={editingPanduan?.urutan || 0}
                      onChange={(e) =>
                        setEditingPanduan({
                          ...editingPanduan,
                          urutan: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm">Judul Panduan</Label>
                  <Input
                    className="h-9"
                    value={editingPanduan?.judul || ""}
                    onChange={(e) =>
                      setEditingPanduan({
                        ...editingPanduan,
                        judul: e.target.value,
                      })
                    }
                    placeholder="Contoh: Cara Input SPM"
                  />
                </div>

                <div>
                  <Label className="text-sm">Konten Panduan</Label>
                  <div className="mt-1">
                    <RichTextEditorSimple
                      value={editingPanduan?.konten || ""}
                      onChange={(html) =>
                        setEditingPanduan({
                          ...editingPanduan,
                          konten: html,
                        })
                      }
                    />
                  </div>
                </div>

                <Button onClick={handleSave} className="w-full h-9" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    "Simpan Panduan"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* List panduan */}
        <div className="grid gap-3">
          {allPanduan.map((panduan: any) => (
            <Card key={panduan.id}>
              <CardHeader className="flex flex-row items-center justify-between py-3 px-4">
                <div className="flex-1">
                  <CardTitle className="text-base">{panduan.judul}</CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Role: {getRoleDisplayName(panduan.role)} • Urutan: {panduan.urutan}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8"
                    onClick={() => {
                      setEditingPanduan(panduan);
                      setIsDialogOpen(true);
                    }}
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="h-8"
                    onClick={() => {
                      if (
                        confirm(
                          "Yakin ingin menghapus panduan ini?"
                        )
                      ) {
                        deletePanduan(panduan.id);
                      }
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PanduanManualAdmin;
