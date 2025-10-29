import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "@/components/ui/use-toast";
import { Database } from "@/integrations/supabase/types";

type StatusSpm = Database["public"]["Enums"]["status_spm"];

interface VerificationData {
  spmId: string;
  action: "approve" | "revise";
  catatan?: string;
  nomorAntrian?: string;
  nomorBerkas?: string;
  pin?: string;
}

export const useSpmVerification = (role: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const getNextStatus = (currentStatus: StatusSpm, action: string): StatusSpm => {
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

      // Check emergency mode
      const { data: emergencyMode } = await supabase
        .from('config_sistem')
        .select('value')
        .eq('key', 'emergency_mode_enabled')
        .single();

      const isEmergencyMode = emergencyMode?.value === 'true';

      // Validasi PIN untuk kepala_bkad (skip jika emergency mode)
      if (role === "kepala_bkad" && data.action === "approve" && !isEmergencyMode) {
        if (!data.pin) {
          throw new Error("PIN harus diisi");
        }

        // Validate PIN from database
        const { data: pinData, error: pinError } = await supabase
          .from("pin_otp")
          .select("*")
          .eq("user_id", user.id)
          .eq("kode_hash", data.pin)
          .eq("jenis", "approval_pin")
          .eq("is_used", false)
          .gt("expires_at", new Date().toISOString())
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (pinError || !pinData) {
          throw new Error("PIN tidak valid atau sudah kadaluarsa. Silakan minta PIN baru.");
        }

        // Mark PIN as used
        await supabase
          .from("pin_otp")
          .update({ is_used: true })
          .eq("id", pinData.id);
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
          
          // Auto-generate nomor antrian dan nomor berkas jika approve
          if (data.action === "approve") {
            // Get current year and month for nomor antrian
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, "0");
            
            // Generate nomor antrian
            const antrianPrefix = `ANTRIAN/${year}/${month}/`;
            const { data: existingAntrian } = await supabase
              .from("spm")
              .select("nomor_antrian")
              .like("nomor_antrian", `${antrianPrefix}%`)
              .order("nomor_antrian", { ascending: false })
              .limit(1)
              .maybeSingle();

            let nextAntrianNumber = 1;
            if (existingAntrian?.nomor_antrian) {
              const lastNumber = parseInt(existingAntrian.nomor_antrian.split("/").pop() || "0");
              nextAntrianNumber = lastNumber + 1;
            }
            updateData.nomor_antrian = `${antrianPrefix}${String(nextAntrianNumber).padStart(3, "0")}`;
            
            // Generate nomor berkas
            const berkasPrefix = `BERKAS/${year}/`;
            const { data: existingBerkas } = await supabase
              .from("spm")
              .select("nomor_berkas")
              .like("nomor_berkas", `${berkasPrefix}%`)
              .order("nomor_berkas", { ascending: false })
              .limit(1)
              .maybeSingle();

            let nextBerkasNumber = 1;
            if (existingBerkas?.nomor_berkas) {
              const lastBerkasNumber = parseInt(existingBerkas.nomor_berkas.split("/").pop() || "0");
              nextBerkasNumber = lastBerkasNumber + 1;
            }
            updateData.nomor_berkas = `${berkasPrefix}${String(nextBerkasNumber).padStart(4, "0")}`;
          }
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

      // Get emergency mode reason if active
      let emergencyReason = null;
      if (isEmergencyMode) {
        const { data: reasonData } = await supabase
          .from('config_sistem')
          .select('value')
          .eq('key', 'emergency_mode_reason')
          .single();
        emergencyReason = reasonData?.value || 'Emergency mode active';
        console.log(`[EMERGENCY MODE] SPM verification bypassed PIN check - ${emergencyReason}`);
      }

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

        // Send workflow notification (async, no await)
        supabase.functions.invoke("send-workflow-notification", {
          body: {
            type: 'spm',
            documentId: data.spmId,
            action: data.action === "approve" && role === "kepala_bkad" && nextStatus === "disetujui" 
              ? "approved" 
              : data.action === "revise"
              ? "revised"
              : "verified",
            stage: role,
            verifiedBy: user?.id,
            notes: data.catatan || "",
          },
        }).then(({ data: notifData, error: notifError }) => {
          if (notifError) {
            console.error("Workflow notification error:", notifError);
          } else {
            console.log("Workflow notification sent:", notifData);
          }
        });

        // For kepala_bkad approval or revise, send email notification
        if (role === "kepala_bkad" && (data.action === "approve" || data.action === "revise")) {
          supabase.functions.invoke("send-approval-notification", {
            body: {
              spmId: data.spmId,
              action: data.action,
              role: role,
            },
          }).then(({ data: notifData, error: notifError }) => {
            if (notifError) {
              console.error("Approval notification error:", notifError);
            } else {
              console.log("Approval notification sent:", notifData);
            }
          });
        }
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
