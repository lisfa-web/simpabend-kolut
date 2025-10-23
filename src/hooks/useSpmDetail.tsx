import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useSpmDetail = (spmId: string | undefined) => {
  return useQuery({
    queryKey: ["spm-detail", spmId],
    queryFn: async () => {
      if (!spmId) return null;

      const { data, error } = await supabase
        .from("spm")
        .select(`
          *,
          opd:opd_id(nama_opd, kode_opd),
          program:program_id(nama_program, kode_program),
          kegiatan:kegiatan_id(nama_kegiatan, kode_kegiatan),
          subkegiatan:subkegiatan_id(nama_subkegiatan, kode_subkegiatan),
          vendor:vendor_id(nama_vendor, nama_bank, nomor_rekening, nama_rekening),
          bendahara:profiles!spm_bendahara_id_fkey(full_name, email),
          lampiran_spm(*)
        `)
        .eq("id", spmId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!spmId,
  });
};
