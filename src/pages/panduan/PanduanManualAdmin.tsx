import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePanduanManual } from "@/hooks/usePanduanManual";
import { useState } from "react";
import { Plus, Edit, Trash2, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { getRoleDisplayName } from "@/lib/auth";

const AVAILABLE_ROLES = [
  "administrator",
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
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">⚙️ Kelola Panduan Manual</h1>
            <p className="text-muted-foreground mt-2">
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
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingPanduan?.id ? "Edit Panduan" : "Tambah Panduan Baru"}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label>Role Target</Label>
                  <Select
                    value={editingPanduan?.role}
                    onValueChange={(v) =>
                      setEditingPanduan({ ...editingPanduan, role: v })
                    }
                  >
                    <SelectTrigger>
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
                  <Label>Judul</Label>
                  <Input
                    value={editingPanduan?.judul || ""}
                    onChange={(e) =>
                      setEditingPanduan({
                        ...editingPanduan,
                        judul: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <Label>Urutan</Label>
                  <Input
                    type="number"
                    value={editingPanduan?.urutan || 0}
                    onChange={(e) =>
                      setEditingPanduan({
                        ...editingPanduan,
                        urutan: parseInt(e.target.value),
                      })
                    }
                  />
                </div>

                <div>
                  <Label>Konten (HTML)</Label>
                  <Textarea
                    rows={12}
                    value={editingPanduan?.konten || ""}
                    onChange={(e) =>
                      setEditingPanduan({
                        ...editingPanduan,
                        konten: e.target.value,
                      })
                    }
                    className="font-mono text-sm"
                    placeholder="<h2>Judul</h2><p>Paragraf...</p><ul><li>Item</li></ul>"
                  />
                </div>

                <Button onClick={handleSave} className="w-full" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    "Simpan"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* List panduan */}
        <div className="grid gap-4">
          {allPanduan.map((panduan: any) => (
            <Card key={panduan.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>{panduan.judul}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Role: {getRoleDisplayName(panduan.role)} | Urutan:{" "}
                    {panduan.urutan}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingPanduan(panduan);
                      setIsDialogOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
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
                    <Trash2 className="h-4 w-4" />
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
