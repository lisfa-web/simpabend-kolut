import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useSp2dDetail = (sp2dId: string | undefined) => {
  return useQuery({
    queryKey: ["sp2d-detail", sp2dId],
    queryFn: async () => {
      if (!sp2dId) return null;

      const { data, error } = await supabase
        .from("sp2d")
        .select(`
          *,
          spm:spm_id(
            *,
            opd:opd_id(nama_opd, kode_opd),
            program:program_id(nama_program, kode_program),
            kegiatan:kegiatan_id(nama_kegiatan, kode_kegiatan),
            subkegiatan:subkegiatan_id(nama_subkegiatan, kode_subkegiatan),
            vendor:vendor_id(nama_vendor, npwp, nama_bank, nomor_rekening, nama_rekening),
            bendahara:profiles!spm_bendahara_id_fkey(full_name, email)
          )
        `)
        .eq("id", sp2dId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!sp2dId,
  });
};
