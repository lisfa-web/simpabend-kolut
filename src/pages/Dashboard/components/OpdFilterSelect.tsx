import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface OpdFilterSelectProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const OpdFilterSelect = ({ value, onChange, className }: OpdFilterSelectProps) => {
  const { data: opdList } = useQuery({
    queryKey: ["opd-list-filter"],
    queryFn: async () => {
      const { data } = await supabase
        .from("opd")
        .select("id, nama_opd, kode_opd")
        .eq("is_active", true)
        .order("nama_opd");
      return data || [];
    },
  });

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={className || "w-[200px]"}>
        <Building2 className="h-4 w-4 mr-2 text-muted-foreground" />
        <SelectValue placeholder="Semua OPD" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Semua OPD</SelectItem>
        {opdList?.map((opd) => (
          <SelectItem key={opd.id} value={opd.id}>
            {opd.nama_opd}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
