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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useVendorList } from "@/hooks/useVendorList";
import { useVendorMutation } from "@/hooks/useVendorMutation";
import { usePihakKetigaList } from "@/hooks/usePihakKetigaList";
import { usePihakKetigaMutation } from "@/hooks/usePihakKetigaMutation";
import { useMasterBankList } from "@/hooks/useMasterBankList";
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
    bank_id: "",
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
  const { data: bankList, isLoading: bankLoading } = useMasterBankList({ 
    is_active: true 
  });

  const { createVendor } = useVendorMutation();
  const { createPihakKetiga } = usePihakKetigaMutation();

  const isLoading = vendorLoading || pihakKetigaLoading;

  // Get the appropriate list based on recipient type
  const getListData = () => {
    if (tipePenerima === "vendor") return vendorList || [];
    if (tipePenerima === "pihak_ketiga") return pihakKetigaList || [];
    return [];
  };

  const listData = getListData();

  // Get display name based on recipient type
  const getDisplayName = (item: any) => {
    if (tipePenerima === "vendor") return item.nama_vendor;
    if (tipePenerima === "pihak_ketiga") return item.nama_pihak_ketiga;
    return "";
  };

  // Get placeholder text based on recipient type
  const getPlaceholder = () => {
    if (tipePenerima === "vendor") return "Pilih atau cari vendor...";
    if (tipePenerima === "pihak_ketiga") return "Pilih atau cari pihak ketiga...";
    return "Pilih penerima...";
  };

  const getSearchPlaceholder = () => {
    if (tipePenerima === "vendor") return "Cari vendor...";
    if (tipePenerima === "pihak_ketiga") return "Cari pihak ketiga...";
    return "Cari...";
  };

  const getEmptyText = () => {
    if (tipePenerima === "vendor") return "Vendor tidak ditemukan";
    if (tipePenerima === "pihak_ketiga") return "Pihak ketiga tidak ditemukan";
    return "Data tidak ditemukan";
  };

  const getDialogTitle = () => {
    if (tipePenerima === "vendor") return "Tambah Vendor Baru";
    if (tipePenerima === "pihak_ketiga") return "Tambah Pihak Ketiga Baru";
    return "Tambah Data Baru";
  };

  const handleCreate = async () => {
    if (!newItem.nama.trim()) {
      toast.error("Nama harus diisi");
      return;
    }

    // Check for duplicate
    const isDuplicate = listData.some((item: any) => {
      const displayName = getDisplayName(item);
      return displayName.toLowerCase() === newItem.nama.toLowerCase().trim();
    });

    if (isDuplicate) {
      toast.error(`${tipePenerima === "vendor" ? "Vendor" : "Pihak ketiga"} dengan nama tersebut sudah ada`);
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
          bank_id: newItem.bank_id || undefined,
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
          bank_id: newItem.bank_id || undefined,
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
        bank_id: "",
        nomor_rekening: "",
        nama_rekening: "",
      });
      
      const entityType = tipePenerima === "vendor" ? "Vendor" : "Pihak ketiga";
      toast.success(`${entityType} berhasil ditambahkan`);
    } catch (error) {
      const entityType = tipePenerima === "vendor" ? "vendor" : "pihak ketiga";
      toast.error(`Gagal menambahkan ${entityType}`);
    }
  };

  const canAddNew = tipePenerima === "vendor" || tipePenerima === "pihak_ketiga";

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
            title={`Tambah ${tipePenerima === "vendor" ? "vendor" : "pihak ketiga"} baru`}
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
              Masukkan informasi {tipePenerima === "vendor" ? "vendor" : "pihak ketiga"} baru. Field yang wajib diisi ditandai dengan *.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="nama">
                Nama {tipePenerima === "vendor" ? "Vendor" : "Pihak Ketiga"} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="nama"
                value={newItem.nama}
                onChange={(e) =>
                  setNewItem({ ...newItem, nama: e.target.value })
                }
                placeholder={`Nama ${tipePenerima === "vendor" ? "vendor" : "pihak ketiga"}`}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="npwp">NPWP</Label>
              <Input
                id="npwp"
                value={newItem.npwp}
                onChange={(e) =>
                  setNewItem({ ...newItem, npwp: e.target.value })
                }
                placeholder="XX.XXX.XXX.X-XXX.XXX"
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
                    <Label htmlFor="bank_id">Bank</Label>
                    <Select
                      value={newItem.bank_id}
                      onValueChange={(value) =>
                        setNewItem({ ...newItem, bank_id: value })
                      }
                      disabled={bankLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih bank" />
                      </SelectTrigger>
                      <SelectContent>
                        {bankList?.map((bank) => (
                          <SelectItem key={bank.id} value={bank.id}>
                            {bank.nama_bank}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                    bank_id: "",
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
                disabled={createVendor.isPending || createPihakKetiga.isPending}
              >
                {(createVendor.isPending || createPihakKetiga.isPending) ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  `Simpan ${tipePenerima === "vendor" ? "Vendor" : "Pihak Ketiga"}`
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};
