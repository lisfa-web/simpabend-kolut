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
import { useBendaharaPengeluaranList } from "@/hooks/useBendaharaPengeluaranList";
import { useBendaharaPengeluaranMutation } from "@/hooks/useBendaharaPengeluaranMutation";
import { usePihakKetigaList } from "@/hooks/usePihakKetigaList";
import { usePihakKetigaMutation } from "@/hooks/usePihakKetigaMutation";
import { usePejabatList } from "@/hooks/usePejabatList";
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
  
  const [newItem, setNewItem] = useState({
    nama: "",
    npwp: "",
    alamat: "",
    telepon: "",
    email: "",
    nama_bank: "",
    nomor_rekening: "",
    nama_rekening: "",
  });

  // Fetch data based on recipient type
  const { data: vendorList, isLoading: vendorLoading } = useVendorList({ 
    is_active: true,
    enabled: tipePenerima === "vendor" 
  });
  const { data: pihakKetigaList, isLoading: pihakKetigaLoading } = usePihakKetigaList({ 
    is_active: true,
    enabled: tipePenerima === "pihak_ketiga" 
  });
  const { data: bendaharaPengeluaranList, isLoading: bendaharaPengeluaranLoading } = useBendaharaPengeluaranList({ 
    is_active: true,
    enabled: tipePenerima === "bendahara_pengeluaran" 
  });

  const { createVendor } = useVendorMutation();
  const { createPihakKetiga } = usePihakKetigaMutation();
  const { createBendaharaPengeluaran } = useBendaharaPengeluaranMutation();

  const isLoading = vendorLoading || pihakKetigaLoading || bendaharaPengeluaranLoading;

  // Get the appropriate list based on recipient type
  const getListData = () => {
    if (tipePenerima === "vendor") return vendorList || [];
    if (tipePenerima === "pihak_ketiga") return pihakKetigaList || [];
    if (tipePenerima === "bendahara_pengeluaran") return bendaharaPengeluaranList || [];
    return [];
  };

  const listData = getListData();

  // Get display name based on recipient type
  const getDisplayName = (item: any) => {
    if (tipePenerima === "vendor") return item.nama_vendor;
    if (tipePenerima === "pihak_ketiga") return item.nama_pihak_ketiga;
    if (tipePenerima === "bendahara_pengeluaran") return item.nama_bendahara;
    return "";
  };

  // Get placeholder text based on recipient type
  const getPlaceholder = () => {
    if (tipePenerima === "vendor") return "Pilih atau cari vendor...";
    if (tipePenerima === "pihak_ketiga") return "Pilih atau cari pihak ketiga...";
    if (tipePenerima === "bendahara_pengeluaran") return "Pilih bendahara pengeluaran...";
    return "Pilih penerima...";
  };

  const getSearchPlaceholder = () => {
    if (tipePenerima === "vendor") return "Cari vendor...";
    if (tipePenerima === "pihak_ketiga") return "Cari pihak ketiga...";
    if (tipePenerima === "bendahara_pengeluaran") return "Cari bendahara...";
    return "Cari...";
  };

  const getEmptyText = () => {
    if (tipePenerima === "vendor") return "Vendor tidak ditemukan";
    if (tipePenerima === "pihak_ketiga") return "Pihak ketiga tidak ditemukan";
    if (tipePenerima === "bendahara_pengeluaran") return "Bendahara tidak ditemukan";
    return "Data tidak ditemukan";
  };

  const getDialogTitle = () => {
    if (tipePenerima === "vendor") return "Tambah Vendor Baru";
    if (tipePenerima === "pihak_ketiga") return "Tambah Pihak Ketiga Baru";
    if (tipePenerima === "bendahara_pengeluaran") return "Tambah Bendahara Pengeluaran Baru";
    return "Tambah Data Baru";
  };

  const handleCreate = async () => {
    if (!newItem.nama.trim()) {
      toast.error("Nama harus diisi");
      return;
    }

    try {
      if (tipePenerima === "vendor") {
        await createVendor.mutateAsync({
          nama_vendor: newItem.nama,
          npwp: newItem.npwp || undefined,
          alamat: newItem.alamat || undefined,
          telepon: newItem.telepon || undefined,
          email: newItem.email || undefined,
          nama_bank: newItem.nama_bank || undefined,
          nomor_rekening: newItem.nomor_rekening || undefined,
          nama_rekening: newItem.nama_rekening || undefined,
        });
      } else if (tipePenerima === "pihak_ketiga") {
        await createPihakKetiga.mutateAsync({
          nama_pihak_ketiga: newItem.nama,
          npwp: newItem.npwp || undefined,
          alamat: newItem.alamat || undefined,
          telepon: newItem.telepon || undefined,
          email: newItem.email || undefined,
          nama_bank: newItem.nama_bank || undefined,
          nomor_rekening: newItem.nomor_rekening || undefined,
          nama_rekening: newItem.nama_rekening || undefined,
        });
      } else if (tipePenerima === "bendahara_pengeluaran") {
        await createBendaharaPengeluaran.mutateAsync({
          nama_bendahara: newItem.nama,
          nip: newItem.npwp || undefined,
          alamat: newItem.alamat || undefined,
          telepon: newItem.telepon || undefined,
          email: newItem.email || undefined,
          nama_bank: newItem.nama_bank || undefined,
          nomor_rekening: newItem.nomor_rekening || undefined,
          nama_rekening: newItem.nama_rekening || undefined,
        });
      }
      
      onChange(newItem.nama);
      setDialogOpen(false);
      setNewItem({
        nama: "",
        npwp: "",
        alamat: "",
        telepon: "",
        email: "",
        nama_bank: "",
        nomor_rekening: "",
        nama_rekening: "",
      });
      
      const entityType = tipePenerima === "vendor" ? "Vendor" : tipePenerima === "pihak_ketiga" ? "Pihak ketiga" : "Bendahara pengeluaran";
      toast.success(`${entityType} berhasil ditambahkan`);
    } catch (error) {
      const entityType = tipePenerima === "vendor" ? "vendor" : tipePenerima === "pihak_ketiga" ? "pihak ketiga" : "bendahara pengeluaran";
      toast.error(`Gagal menambahkan ${entityType}`);
    }
  };

  const canAddNew = tipePenerima === "vendor" || tipePenerima === "pihak_ketiga" || tipePenerima === "bendahara_pengeluaran";

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
              {value || getPlaceholder()}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[400px] p-0">
            <Command>
              <CommandInput 
                placeholder={getSearchPlaceholder()}
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
                          {getEmptyText()}
                        </p>
                        {canAddNew && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setDialogOpen(true);
                              setNewItem({ ...newItem, nama: searchValue });
                              setOpen(false);
                            }}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Tambah "{searchValue}"
                          </Button>
                        )}
                      </div>
                    </CommandEmpty>
                    <CommandGroup>
                      {listData.map((item: any) => {
                        const displayName = getDisplayName(item);
                        return (
                          <CommandItem
                            key={item.id}
                            value={displayName}
                            onSelect={(currentValue) => {
                              onChange(currentValue === value ? "" : currentValue);
                              setOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                value === displayName ? "opacity-100" : "opacity-0"
                              )}
                            />
                            <div className="flex flex-col">
                              <span>{displayName}</span>
                              {item.npwp && (
                                <span className="text-xs text-muted-foreground">
                                  NPWP: {item.npwp}
                                </span>
                              )}
                              {item.nip && (
                                <span className="text-xs text-muted-foreground">
                                  NIP: {item.nip}
                                </span>
                              )}
                            </div>
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  </>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        
        {canAddNew && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setDialogOpen(true)}
            title={`Tambah ${tipePenerima === "vendor" ? "vendor" : tipePenerima === "pihak_ketiga" ? "pihak ketiga" : "bendahara pengeluaran"} baru`}
          >
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </div>

      {canAddNew && (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{getDialogTitle()}</DialogTitle>
              <DialogDescription>
                Masukkan informasi {tipePenerima === "vendor" ? "vendor" : tipePenerima === "pihak_ketiga" ? "pihak ketiga" : "bendahara pengeluaran"} baru. Field yang wajib diisi ditandai dengan *.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="nama">
                  Nama {tipePenerima === "vendor" ? "Vendor" : tipePenerima === "pihak_ketiga" ? "Pihak Ketiga" : "Bendahara Pengeluaran"} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="nama"
                  value={newItem.nama}
                  onChange={(e) =>
                    setNewItem({ ...newItem, nama: e.target.value })
                  }
                  placeholder={`Nama ${tipePenerima === "vendor" ? "vendor" : tipePenerima === "pihak_ketiga" ? "pihak ketiga" : "bendahara pengeluaran"}`}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="npwp">{tipePenerima === "bendahara_pengeluaran" ? "NIP" : "NPWP"}</Label>
                <Input
                  id="npwp"
                  value={newItem.npwp}
                  onChange={(e) =>
                    setNewItem({ ...newItem, npwp: e.target.value })
                  }
                  placeholder={tipePenerima === "bendahara_pengeluaran" ? "NIP bendahara" : "XX.XXX.XXX.X-XXX.XXX"}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="alamat">Alamat</Label>
                <Input
                  id="alamat"
                  value={newItem.alamat}
                  onChange={(e) =>
                    setNewItem({ ...newItem, alamat: e.target.value })
                  }
                  placeholder="Alamat lengkap"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="telepon">Telepon</Label>
                  <Input
                    id="telepon"
                    value={newItem.telepon}
                    onChange={(e) =>
                      setNewItem({ ...newItem, telepon: e.target.value })
                    }
                    placeholder="08xx-xxxx-xxxx"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newItem.email}
                    onChange={(e) =>
                      setNewItem({ ...newItem, email: e.target.value })
                    }
                    placeholder="email@example.com"
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
                      value={newItem.nama_bank}
                      onChange={(e) =>
                        setNewItem({ ...newItem, nama_bank: e.target.value })
                      }
                      placeholder="Contoh: Bank Mandiri"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="nomor_rekening">Nomor Rekening</Label>
                    <Input
                      id="nomor_rekening"
                      value={newItem.nomor_rekening}
                      onChange={(e) =>
                        setNewItem({ ...newItem, nomor_rekening: e.target.value })
                      }
                      placeholder="1234567890"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="nama_rekening">Nama Pemilik Rekening</Label>
                    <Input
                      id="nama_rekening"
                      value={newItem.nama_rekening}
                      onChange={(e) =>
                        setNewItem({ ...newItem, nama_rekening: e.target.value })
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
                  setNewItem({
                    nama: "",
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
                onClick={handleCreate}
                disabled={createVendor.isPending || createPihakKetiga.isPending || createBendaharaPengeluaran.isPending}
              >
                {(createVendor.isPending || createPihakKetiga.isPending || createBendaharaPengeluaran.isPending) ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  `Simpan ${tipePenerima === "vendor" ? "Vendor" : tipePenerima === "pihak_ketiga" ? "Pihak Ketiga" : "Bendahara Pengeluaran"}`
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};
