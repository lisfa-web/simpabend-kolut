import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface PeriodFilterProps {
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
}

const periodLabels: Record<string, string> = {
  today: "Hari ini",
  week: "Minggu ini",
  month: "Bulan ini",
  year: "Tahun ini",
};

export const PeriodFilter = ({ selectedPeriod, onPeriodChange }: PeriodFilterProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Calendar className="h-4 w-4" />
          <span>{periodLabels[selectedPeriod]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {Object.entries(periodLabels).map(([key, label]) => (
          <DropdownMenuItem
            key={key}
            onClick={() => onPeriodChange(key)}
            className="cursor-pointer"
          >
            {label}
            {key === selectedPeriod && (
              <Badge variant="default" className="ml-auto text-xs">
                Aktif
              </Badge>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
