import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
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
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Mail, Key, CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const emailSchema = z.object({
  email: z.string().email("Format email tidak valid"),
});

const otpSchema = z.object({
  otp: z.string().length(6, "OTP harus 6 digit"),
});

const passwordSchema = z.object({
  password: z.string().min(6, "Password minimal 6 karakter"),
  confirmPassword: z.string().min(6, "Konfirmasi password minimal 6 karakter"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Password tidak cocok",
  path: ["confirmPassword"],
});

type Step = "email" | "otp" | "password" | "success";

const ForgotPasswordDialog = () => {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("email");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });

  const otpForm = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: "" },
  });

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const resetState = () => {
    setStep("email");
    setEmail("");
    setError("");
    emailForm.reset();
    otpForm.reset();
    passwordForm.reset();
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      resetState();
    }
  };

  // Step 1: Kirim OTP ke email/WhatsApp
  const handleSendOtp = async (data: z.infer<typeof emailSchema>) => {
    setLoading(true);
    setError("");

    try {
      // Cari user berdasarkan email via edge function (bypass RLS)
      const { data: checkResult, error: checkError } = await supabase.functions.invoke("check-email-for-reset", {
        body: { email: data.email.trim() },
      });

      if (checkError) {
        console.error("Check email error:", checkError);
        setError("Terjadi kesalahan saat mencari email");
        setLoading(false);
        return;
      }

      if (!checkResult?.success) {
        setError(checkResult?.error || "Email tidak terdaftar dalam sistem");
        setLoading(false);
        return;
      }

      // Kirim OTP via edge function
      const { data: otpData, error: otpError } = await supabase.functions.invoke("send-pin", {
        body: {
          userId: checkResult.userId,
          jenis: "reset_password",
        },
      });

      if (otpError) {
        console.error("OTP send error:", otpError);
        setError("Gagal mengirim kode verifikasi. Silakan coba lagi.");
        setLoading(false);
        return;
      }

      // Cek hasil pengiriman
      if (otpData && !otpData.success) {
        setError(otpData.message || "Gagal mengirim kode verifikasi");
        setLoading(false);
        return;
      }

      setEmail(checkResult.email); // Gunakan email dari database
      setStep("otp");
      
      // Info ke user tentang channel pengiriman
      const channels = [];
      if (otpData?.notifications?.whatsapp === "success") channels.push("WhatsApp");
      if (otpData?.notifications?.email === "success") channels.push("Email");
      
      if (channels.length > 0) {
        toast.success(`Kode verifikasi telah dikirim via ${channels.join(" dan ")}`);
      } else {
        toast.success("Kode verifikasi telah dibuat. Hubungi admin jika tidak menerima.");
      }
    } catch (err: any) {
      console.error("handleSendOtp error:", err);
      setError(err.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verifikasi OTP
  const handleVerifyOtp = async (data: z.infer<typeof otpSchema>) => {
    setLoading(true);
    setError("");

    try {
      // Verifikasi OTP via edge function (bypass RLS)
      const { data: verifyResult, error: verifyError } = await supabase.functions.invoke("verify-reset-otp", {
        body: {
          email: email.trim(),
          otp: data.otp,
        },
      });

      if (verifyError) {
        console.error("Verify OTP error:", verifyError);
        setError("Terjadi kesalahan saat verifikasi");
        setLoading(false);
        return;
      }

      if (!verifyResult?.success) {
        setError(verifyResult?.error || "Kode verifikasi tidak valid atau sudah kadaluarsa");
        setLoading(false);
        return;
      }

      setStep("password");
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset password
  const handleResetPassword = async (data: z.infer<typeof passwordSchema>) => {
    setLoading(true);
    setError("");

    try {
      // Reset password via edge function - public reset tanpa auth
      const { data: resetData, error: resetError } = await supabase.functions.invoke("reset-user-password", {
        body: {
          newPassword: data.password,
          isPublicReset: true,
          email: email,
        },
      });

      if (resetError) {
        console.error("Reset password error:", resetError);
        setError("Gagal mengubah password. Silakan coba lagi.");
        setLoading(false);
        return;
      }

      if (resetData && !resetData.success) {
        setError(resetData.error || "Gagal mengubah password");
        setLoading(false);
        return;
      }

      setStep("success");
      toast.success("Password berhasil diubah");
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
        >
          Lupa Password?
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {step === "email" && "Lupa Password"}
            {step === "otp" && "Verifikasi Kode"}
            {step === "password" && "Buat Password Baru"}
            {step === "success" && "Berhasil"}
          </DialogTitle>
          <DialogDescription>
            {step === "email" && "Masukkan email terdaftar untuk menerima kode verifikasi"}
            {step === "otp" && "Masukkan kode verifikasi yang dikirim ke WhatsApp Anda"}
            {step === "password" && "Buat password baru untuk akun Anda"}
            {step === "success" && "Password Anda telah berhasil diubah"}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Step 1: Email */}
        {step === "email" && (
          <Form {...emailForm}>
            <form onSubmit={emailForm.handleSubmit(handleSendOtp)} className="space-y-4">
              <FormField
                control={emailForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          {...field}
                          type="email"
                          placeholder="nama@email.com"
                          className="pl-10"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Mengirim...
                  </>
                ) : (
                  "Kirim Kode Verifikasi"
                )}
              </Button>
            </form>
          </Form>
        )}

        {/* Step 2: OTP */}
        {step === "otp" && (
          <Form {...otpForm}>
            <form onSubmit={otpForm.handleSubmit(handleVerifyOtp)} className="space-y-4">
              <FormField
                control={otpForm.control}
                name="otp"
                render={({ field }) => (
                  <FormItem className="flex flex-col items-center">
                    <FormLabel>Kode Verifikasi (6 digit)</FormLabel>
                    <FormControl>
                      <InputOTP maxLength={6} {...field}>
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <p className="text-sm text-center text-muted-foreground">
                Kode dikirim ke WhatsApp yang terdaftar dengan email: {email}
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep("email")}
                  disabled={loading}
                >
                  Kembali
                </Button>
                <Button type="submit" className="flex-1" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Memverifikasi...
                    </>
                  ) : (
                    "Verifikasi"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        )}

        {/* Step 3: New Password */}
        {step === "password" && (
          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(handleResetPassword)} className="space-y-4">
              <FormField
                control={passwordForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password Baru</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          {...field}
                          type="password"
                          placeholder="••••••••"
                          className="pl-10"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Konfirmasi Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          {...field}
                          type="password"
                          placeholder="••••••••"
                          className="pl-10"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Mengubah Password...
                  </>
                ) : (
                  "Ubah Password"
                )}
              </Button>
            </form>
          </Form>
        )}

        {/* Step 4: Success */}
        {step === "success" && (
          <div className="flex flex-col items-center space-y-4 py-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-center text-sm text-muted-foreground">
              Silakan login dengan password baru Anda
            </p>
            <Button onClick={() => handleOpenChange(false)} className="w-full">
              Tutup
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ForgotPasswordDialog;
