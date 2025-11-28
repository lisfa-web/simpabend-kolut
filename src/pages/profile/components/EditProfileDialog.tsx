import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Pencil, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

// Validasi format WhatsApp Indonesia
const phoneRegex = /^(\+62|62)[0-9]{9,12}$/;

const editProfileSchema = z.object({
  full_name: z.string().min(2, "Nama minimal 2 karakter").max(100, "Nama maksimal 100 karakter"),
  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || phoneRegex.test(val.replace(/[\s-]/g, "")),
      "Format nomor WhatsApp harus dimulai dengan 62 atau +62 (contoh: 6281234567890)"
    ),
  email: z.string().email("Format email tidak valid"),
});

type EditProfileFormData = z.infer<typeof editProfileSchema>;

const EditProfileDialog = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { data: profile, refetch } = useUserProfile();
  const queryClient = useQueryClient();

  const form = useForm<EditProfileFormData>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      full_name: "",
      phone: "",
      email: "",
    },
  });

  // Update form when profile data changes
  useEffect(() => {
    if (profile) {
      form.reset({
        full_name: profile.full_name || "",
        phone: profile.phone || "",
        email: profile.email || "",
      });
    }
  }, [profile, form]);

  const onSubmit = async (data: EditProfileFormData) => {
    if (!user?.id) return;

    setLoading(true);
    try {
      // Normalize phone number (hapus spasi dan strip)
      const normalizedPhone = data.phone?.replace(/[\s-]/g, "") || null;

      // Update profile table
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: data.full_name.trim(),
          phone: normalizedPhone,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (profileError) throw profileError;

      // Update email jika berubah
      if (data.email !== profile?.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: data.email,
        });

        if (emailError) {
          toast.error("Gagal mengubah email: " + emailError.message);
        } else {
          // Update email di profiles juga
          await supabase
            .from("profiles")
            .update({ email: data.email })
            .eq("id", user.id);
          
          toast.info("Email konfirmasi telah dikirim ke alamat email baru");
        }
      }

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      refetch();

      toast.success("Profil berhasil diperbarui");
      setOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Gagal memperbarui profil");
    } finally {
      setLoading(false);
    }
  };

  // Format phone number untuk display
  const formatPhoneForInput = (value: string) => {
    // Hapus semua karakter non-digit kecuali +
    let cleaned = value.replace(/[^\d+]/g, "");
    
    // Pastikan dimulai dengan 62 atau +62
    if (cleaned.startsWith("0")) {
      cleaned = "62" + cleaned.substring(1);
    } else if (!cleaned.startsWith("62") && !cleaned.startsWith("+62")) {
      if (cleaned.length > 0 && !cleaned.startsWith("+")) {
        cleaned = "62" + cleaned;
      }
    }
    
    return cleaned;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Pencil className="h-4 w-4" />
          Edit Profil
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Profil</DialogTitle>
          <DialogDescription>
            Perbarui informasi profil Anda
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Lengkap *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Masukkan nama lengkap" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email *</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" placeholder="nama@email.com" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nomor WhatsApp</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="6281234567890"
                      onChange={(e) => {
                        const formatted = formatPhoneForInput(e.target.value);
                        field.onChange(formatted);
                      }}
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    Format: 62 atau +62 diikuti nomor (contoh: 6281234567890)
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Batal
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  "Simpan"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileDialog;
