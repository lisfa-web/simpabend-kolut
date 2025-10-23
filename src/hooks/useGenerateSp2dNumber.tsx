import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const romanMonths = [
  "I", "II", "III", "IV", "V", "VI", 
  "VII", "VIII", "IX", "X", "XI", "XII"
];

export const useGenerateSp2dNumber = () => {
  return useQuery({
    queryKey: ["generate-sp2d-number"],
    queryFn: async () => {
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth();
      const bulanRomawi = romanMonths[currentMonth];

      // Get format nomor untuk SP2D
      const { data: formatData, error: formatError } = await supabase
        .from("format_nomor")
        .select("*")
        .eq("jenis_dokumen", "SP2D")
        .eq("tahun", currentYear)
        .single();

      if (formatError) {
        // Jika belum ada format, gunakan default
        const counter = 1;
        return `${String(counter).padStart(3, "0")}/SP2D-BKAD/${bulanRomawi}/${currentYear}`;
      }

      // Increment counter
      const newCounter = (formatData.counter || 0) + 1;

      // Update counter di database
      await supabase
        .from("format_nomor")
        .update({ counter: newCounter })
        .eq("id", formatData.id);

      // Generate nomor berdasarkan format
      let nomorSp2d = formatData.format
        .replace("{COUNTER}", String(newCounter).padStart(3, "0"))
        .replace("{BULAN_ROMAWI}", bulanRomawi)
        .replace("{TAHUN}", String(currentYear));

      return nomorSp2d;
    },
    retry: false,
    staleTime: 0,
    gcTime: 0,
  });
};
