import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "@/components/ui/use-toast";
import { Database } from "@/integrations/supabase/types";

type StatusSpm = Database["public"]["Enums"]["status_spm"];

interface VerificationData {
  spmId: string;
  action: "approve" | "reject" | "revise";
  catatan?: string;
  nomorAntrian?: string;
  nomorBerkas?: string;
  pin?: string;
}

export const useSpmVerification = (role: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const getNextStatus = (currentStatus: StatusSpm, action: string): StatusSpm => {
    if (action === "reject") return "ditolak";
    if (action === "revise") return "perlu_revisi";

    const statusFlow: Record<string, StatusSpm> = {
      diajukan: "resepsionis_verifikasi",
      resepsionis_verifikasi: "pbmd_verifikasi",
      pbmd_verifikasi: "akuntansi_validasi",
      akuntansi_validasi: "perbendaharaan_verifikasi",
      perbendaharaan_verifikasi: "kepala_bkad_review",
      kepala_bkad_review: "disetujui",
    };

    return statusFlow[currentStatus] || currentStatus;
  };

  const verifySpm = useMutation({
    mutationFn: async (data: VerificationData) => {
      if (!user?.id) throw new Error("User not authenticated");

      // Validasi PIN untuk kepala_bkad
      if (role === "kepala_bkad" && data.action === "approve") {
        if (!data.pin || data.pin !== "123456") {
          throw new Error("PIN tidak valid. Silakan coba lagi.");
        }
      }

      // Get current SPM data
      const { data: spm, error: fetchError } = await supabase
        .from("spm")
        .select("status")
        .eq("id", data.spmId)
        .single();

      if (fetchError) throw fetchError;

      const nextStatus = getNextStatus(spm.status, data.action);

      // Prepare update object based on role
      const updateData: any = {
        status: nextStatus,
      };

      // Add role-specific fields and verified_by tracking
      switch (role) {
        case "resepsionis":
          updateData.catatan_resepsionis = data.catatan;
          updateData.tanggal_resepsionis = new Date().toISOString();
          updateData.verified_by_resepsionis = user.id;
          if (data.nomorAntrian) updateData.nomor_antrian = data.nomorAntrian;
          if (data.nomorBerkas) updateData.nomor_berkas = data.nomorBerkas;
          break;
        case "pbmd":
          updateData.catatan_pbmd = data.catatan;
          updateData.tanggal_pbmd = new Date().toISOString();
          updateData.verified_by_pbmd = user.id;
          break;
        case "akuntansi":
          updateData.catatan_akuntansi = data.catatan;
          updateData.tanggal_akuntansi = new Date().toISOString();
          updateData.verified_by_akuntansi = user.id;
          break;
        case "perbendaharaan":
          updateData.catatan_perbendaharaan = data.catatan;
          updateData.tanggal_perbendaharaan = new Date().toISOString();
          updateData.verified_by_perbendaharaan = user.id;
          break;
        case "kepala_bkad":
          updateData.catatan_kepala_bkad = data.catatan;
          updateData.tanggal_kepala_bkad = new Date().toISOString();
          updateData.verified_by_kepala_bkad = user.id;
          if (data.action === "approve" && data.pin) {
            updateData.pin_verified_at = new Date().toISOString();
          }
          updateData.tanggal_disetujui = data.action === "approve" ? new Date().toISOString() : null;
          break;
      }

      // Update SPM
      const { error: updateError } = await supabase
        .from("spm")
        .update(updateData)
        .eq("id", data.spmId);

      if (updateError) throw updateError;

      // Create notification for bendahara
      const { data: spmData } = await supabase
        .from("spm")
        .select("bendahara_id, nomor_spm")
        .eq("id", data.spmId)
        .single();

      if (spmData) {
        let notifMessage = "";
        if (data.action === "approve") {
          notifMessage = `SPM ${spmData.nomor_spm || "Anda"} telah diverifikasi oleh ${role}`;
        } else if (data.action === "reject") {
          notifMessage = `SPM ${spmData.nomor_spm || "Anda"} ditolak oleh ${role}`;
        } else if (data.action === "revise") {
          notifMessage = `SPM ${spmData.nomor_spm || "Anda"} perlu revisi dari ${role}`;
        }

        await supabase.from("notifikasi").insert({
          user_id: spmData.bendahara_id,
          spm_id: data.spmId,
          jenis: "spm_diajukan" as any,
          judul: `Status SPM Updated`,
          pesan: notifMessage,
        });

        // Send Email & WhatsApp notification (async, no await)
        supabase.functions.invoke("send-approval-notification", {
          body: {
            spmId: data.spmId,
            action: data.action,
            role: role,
          },
        }).then(({ data: notifData, error: notifError }) => {
          if (notifError) {
            console.error("Notification error:", notifError);
          } else {
            console.log("Notification sent:", notifData);
          }
        });
      }

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["spm-list"] });
      queryClient.invalidateQueries({ queryKey: ["spm-detail"] });
      
      toast({
        title: "Berhasil",
        description: "Verifikasi SPM berhasil disimpan",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return { verifySpm };
};
