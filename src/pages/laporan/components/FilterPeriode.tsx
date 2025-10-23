import { Calendar } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface FilterPeriodeProps {
  tanggalDari: string;
  tanggalSampai: string;
  onTanggalDariChange: (value: string) => void;
  onTanggalSampaiChange: (value: string) => void;
}

export const FilterPeriode = ({
  tanggalDari,
  tanggalSampai,
  onTanggalDariChange,
  onTanggalSampaiChange,
}: FilterPeriodeProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="tanggal-dari">
          <Calendar className="h-4 w-4 inline mr-2" />
          Dari Tanggal
        </Label>
        <Input
          id="tanggal-dari"
          type="date"
          value={tanggalDari}
          onChange={(e) => onTanggalDariChange(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="tanggal-sampai">
          <Calendar className="h-4 w-4 inline mr-2" />
          Sampai Tanggal
        </Label>
        <Input
          id="tanggal-sampai"
          type="date"
          value={tanggalSampai}
          onChange={(e) => onTanggalSampaiChange(e.target.value)}
        />
      </div>
    </div>
  );
};
