import { supabase } from "@/integrations/supabase/client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

interface GenerateNomorAntrianParams {
  spmId: string;
}

export const useGenerateNomorAntrian = () => {
  return useMutation({
    mutationFn: async ({ spmId }: GenerateNomorAntrianParams) => {
      // Get current year and month
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      
      // Get the highest nomor_antrian for current year/month
      const prefix = `ANTRIAN/${year}/${month}/`;
      
      const { data: existingSpm, error: queryError } = await supabase
        .from("spm")
        .select("nomor_antrian")
        .like("nomor_antrian", `${prefix}%`)
        .order("nomor_antrian", { ascending: false })
        .limit(1)
        .single();

      if (queryError && queryError.code !== "PGRST116") {
        throw queryError;
      }

      // Calculate next number
      let nextNumber = 1;
      if (existingSpm?.nomor_antrian) {
        const lastNumber = parseInt(existingSpm.nomor_antrian.split("/").pop() || "0");
        nextNumber = lastNumber + 1;
      }

      const nomorAntrian = `${prefix}${String(nextNumber).padStart(3, "0")}`;
      
      // Get the highest nomor_berkas for current year
      const berkasPrefix = `BERKAS/${year}/`;
      
      const { data: existingBerkas, error: berkasQueryError } = await supabase
        .from("spm")
        .select("nomor_berkas")
        .like("nomor_berkas", `${berkasPrefix}%`)
        .order("nomor_berkas", { ascending: false })
        .limit(1)
        .single();

      if (berkasQueryError && berkasQueryError.code !== "PGRST116") {
        throw berkasQueryError;
      }

      // Calculate next nomor_berkas
      let nextBerkasNumber = 1;
      if (existingBerkas?.nomor_berkas) {
        const lastBerkasNumber = parseInt(existingBerkas.nomor_berkas.split("/").pop() || "0");
        nextBerkasNumber = lastBerkasNumber + 1;
      }

      const nomorBerkas = `${berkasPrefix}${String(nextBerkasNumber).padStart(4, "0")}`;

      return { nomorAntrian, nomorBerkas };
    },
    onError: (error: any) => {
      console.error("Error generating nomor:", error);
      toast.error("Gagal generate nomor antrian");
    },
  });
};
