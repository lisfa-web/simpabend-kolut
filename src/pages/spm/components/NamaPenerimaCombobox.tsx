import { useState } from "react";
import { Check, ChevronsUpDown, Plus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useVendorList } from "@/hooks/useVendorList";
import { useVendorMutation } from "@/hooks/useVendorMutation";
import { toast } from "sonner";

interface NamaPenerimaComboboxProps {
  value?: string;
  onChange: (value: string) => void;
  tipePenerima?: string;
}

export const NamaPenerimaCombobox = ({
  value,
  onChange,
  tipePenerima,
}: NamaPenerimaComboboxProps) => {
  const [open, setOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  
  const [newVendor, setNewVendor] = useState({
    nama_vendor: "",
    npwp: "",
    alamat: "",
    telepon: "",
    email: "",
    nama_bank: "",
    nomor_rekening: "",
    nama_rekening: "",
  });

  const { data: vendorList, isLoading } = useVendorList({ 
    is_active: true,
    enabled: tipePenerima === "vendor" 
  });
  const { createVendor } = useVendorMutation();

  const handleCreateVendor = async () => {
    if (!newVendor.nama_vendor.trim()) {
      toast.error("Nama vendor harus diisi");
      return;
    }

    try {
      await createVendor.mutateAsync(newVendor);
      onChange(newVendor.nama_vendor);
      setDialogOpen(false);
      setNewVendor({
        nama_vendor: "",
        npwp: "",
        alamat: "",
        telepon: "",
        email: "",
        nama_bank: "",
        nomor_rekening: "",
        nama_rekening: "",
      });
      toast.success("Vendor berhasil ditambahkan");
    } catch (error) {
      toast.error("Gagal menambahkan vendor");
    }
  };

  // Show regular input for non-vendor recipient types
  if (tipePenerima !== "vendor") {
    return (
      <Input
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Masukkan nama penerima"
      />
    );
  }

  // Show combobox with vendor list for vendor type
  return (
    <>
      <div className="flex gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="flex-1 justify-between"
            >
              {value || "Pilih atau cari vendor..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[400px] p-0">
            <Command>
              <CommandInput 
                placeholder="Cari vendor..." 
                value={searchValue}
                onValueChange={setSearchValue}
              />
              <CommandList>
                {isLoading ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                ) : (
                  <>
                    <CommandEmpty>
                      <div className="text-center py-6">
                        <p className="text-sm text-muted-foreground mb-2">
                          Vendor tidak ditemukan
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setDialogOpen(true);
                            setNewVendor({ ...newVendor, nama_vendor: searchValue });
                            setOpen(false);
                          }}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Tambah "{searchValue}"
                        </Button>
                      </div>
                    </CommandEmpty>
                    <CommandGroup>
                      {vendorList?.map((vendor) => (
                        <CommandItem
                          key={vendor.id}
                          value={vendor.nama_vendor}
                          onSelect={(currentValue) => {
                            onChange(currentValue === value ? "" : currentValue);
                            setOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              value === vendor.nama_vendor ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <div className="flex flex-col">
                            <span>{vendor.nama_vendor}</span>
                            {vendor.npwp && (
                              <span className="text-xs text-muted-foreground">
                                NPWP: {vendor.npwp}
                              </span>
                            )}
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => setDialogOpen(true)}
          title="Tambah vendor baru"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tambah Vendor Baru</DialogTitle>
            <DialogDescription>
              Masukkan informasi vendor baru. Field yang wajib diisi ditandai dengan *.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="nama_vendor">
                Nama Vendor <span className="text-destructive">*</span>
              </Label>
              <Input
                id="nama_vendor"
                value={newVendor.nama_vendor}
                onChange={(e) =>
                  setNewVendor({ ...newVendor, nama_vendor: e.target.value })
                }
                placeholder="Nama vendor"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="npwp">NPWP</Label>
              <Input
                id="npwp"
                value={newVendor.npwp}
                onChange={(e) =>
                  setNewVendor({ ...newVendor, npwp: e.target.value })
                }
                placeholder="XX.XXX.XXX.X-XXX.XXX"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="alamat">Alamat</Label>
              <Input
                id="alamat"
                value={newVendor.alamat}
                onChange={(e) =>
                  setNewVendor({ ...newVendor, alamat: e.target.value })
                }
                placeholder="Alamat lengkap vendor"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="telepon">Telepon</Label>
                <Input
                  id="telepon"
                  value={newVendor.telepon}
                  onChange={(e) =>
                    setNewVendor({ ...newVendor, telepon: e.target.value })
                  }
                  placeholder="08xx-xxxx-xxxx"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newVendor.email}
                  onChange={(e) =>
                    setNewVendor({ ...newVendor, email: e.target.value })
                  }
                  placeholder="email@vendor.com"
                />
              </div>
            </div>

            <div className="border-t pt-4 mt-2">
              <h4 className="text-sm font-medium mb-3">Informasi Rekening</h4>
              
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="nama_bank">Nama Bank</Label>
                  <Input
                    id="nama_bank"
                    value={newVendor.nama_bank}
                    onChange={(e) =>
                      setNewVendor({ ...newVendor, nama_bank: e.target.value })
                    }
                    placeholder="Contoh: Bank Mandiri"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="nomor_rekening">Nomor Rekening</Label>
                  <Input
                    id="nomor_rekening"
                    value={newVendor.nomor_rekening}
                    onChange={(e) =>
                      setNewVendor({ ...newVendor, nomor_rekening: e.target.value })
                    }
                    placeholder="1234567890"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="nama_rekening">Nama Pemilik Rekening</Label>
                  <Input
                    id="nama_rekening"
                    value={newVendor.nama_rekening}
                    onChange={(e) =>
                      setNewVendor({ ...newVendor, nama_rekening: e.target.value })
                    }
                    placeholder="Nama sesuai rekening"
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setDialogOpen(false);
                setNewVendor({
                  nama_vendor: "",
                  npwp: "",
                  alamat: "",
                  telepon: "",
                  email: "",
                  nama_bank: "",
                  nomor_rekening: "",
                  nama_rekening: "",
                });
              }}
            >
              Batal
            </Button>
            <Button
              type="button"
              onClick={handleCreateVendor}
              disabled={createVendor.isPending}
            >
              {createVendor.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                "Simpan Vendor"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
