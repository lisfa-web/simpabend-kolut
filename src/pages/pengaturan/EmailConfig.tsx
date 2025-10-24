import { useForm } from "react-hook-form";
import { Loader2, Mail, CheckCircle2, XCircle, Info } from "lucide-react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useEmailConfig, useEmailConfigMutation } from "@/hooks/useEmailConfig";
import { useTestEmail } from "@/hooks/useTestEmail";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";

interface FormData {
  smtp_host: string;
  smtp_port: number;
  smtp_user: string;
  smtp_password: string;
  from_email: string;
  from_name: string;
  is_active: boolean;
}

const EmailConfig = () => {
  const { data: config, isLoading } = useEmailConfig();
  const { upsertConfig } = useEmailConfigMutation();
  const testEmail = useTestEmail();
  const [testEmailAddress, setTestEmailAddress] = useState("");

  const { register, handleSubmit, watch, setValue } = useForm<FormData>({
    values: config
      ? {
          smtp_host: config.smtp_host,
          smtp_port: config.smtp_port,
          smtp_user: config.smtp_user,
          smtp_password: config.smtp_password,
          from_email: config.from_email,
          from_name: config.from_name,
          is_active: config.is_active || false,
        }
      : {
          smtp_host: "smtp.gmail.com",
          smtp_port: 587,
          smtp_user: "",
          smtp_password: "",
          from_email: "",
          from_name: "",
          is_active: false,
        },
  });

  const isActive = watch("is_active");

  useEffect(() => {
    if (config) {
      setValue("smtp_host", config.smtp_host || "smtp.gmail.com");
      setValue("smtp_port", config.smtp_port || 587);
      setValue("smtp_user", config.smtp_user || "");
      setValue("smtp_password", config.smtp_password || "");
      setValue("from_email", config.from_email || "");
      setValue("from_name", config.from_name || "");
      setValue("is_active", config.is_active || false);
    }
  }, [config, setValue]);

  const onSubmit = (data: FormData) => {
    upsertConfig.mutate(data);
  };

  const handleTestEmail = () => {
    if (!testEmailAddress) {
      return;
    }
    testEmail.mutate(testEmailAddress);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Email Configuration</h1>
          <p className="text-muted-foreground mt-2">
            Konfigurasi Gmail SMTP untuk pengiriman email otomatis
          </p>
        </div>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <p className="font-medium mb-2">Setup Gmail SMTP</p>
            <ol className="text-sm space-y-1 list-decimal list-inside">
              <li>Aktifkan 2-Factor Authentication di akun Gmail Anda</li>
              <li>
                Generate App Password di:{" "}
                <a
                  href="https://myaccount.google.com/apppasswords"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Google App Passwords
                </a>
              </li>
              <li>Gunakan App Password sebagai password SMTP</li>
            </ol>
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Konfigurasi SMTP</CardTitle>
                  <CardDescription>
                    Masukkan kredensial Gmail untuk SMTP
                  </CardDescription>
                </div>
                {config?.last_test_at && (
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">
                      Test terakhir:{" "}
                      {new Date(config.last_test_at).toLocaleString("id-ID")}
                    </div>
                    {config.test_status && (
                      <Badge
                        variant={
                          config.test_status === "success" ? "default" : "destructive"
                        }
                        className="mt-1"
                      >
                        {config.test_status === "success" ? (
                          <>
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Berhasil
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3 mr-1" />
                            Gagal
                          </>
                        )}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtp_host">SMTP Host</Label>
                  <Input
                    id="smtp_host"
                    {...register("smtp_host", { required: true })}
                    placeholder="smtp.gmail.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="smtp_port">SMTP Port</Label>
                  <Input
                    id="smtp_port"
                    type="number"
                    {...register("smtp_port", { required: true, valueAsNumber: true })}
                    placeholder="587"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="smtp_user">
                  Email Address <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="smtp_user"
                  type="email"
                  {...register("smtp_user", { required: true })}
                  placeholder="your-email@gmail.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="smtp_password">
                  App Password <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="smtp_password"
                  type="password"
                  {...register("smtp_password", { required: true })}
                  placeholder="Masukkan App Password (bukan password Gmail biasa)"
                />
                <p className="text-xs text-muted-foreground">
                  Gunakan App Password yang di-generate dari Google Account
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="from_email">From Email</Label>
                <Input
                  id="from_email"
                  type="email"
                  {...register("from_email", { required: true })}
                  placeholder="noreply@bkad.go.id"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="from_name">From Name</Label>
                <Input
                  id="from_name"
                  {...register("from_name", { required: true })}
                  placeholder="BKAD System"
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-0.5">
                  <Label htmlFor="is_active">Status Email</Label>
                  <p className="text-sm text-muted-foreground">
                    Aktifkan untuk menggunakan notifikasi email
                  </p>
                </div>
                <Switch
                  id="is_active"
                  checked={isActive}
                  onCheckedChange={(checked) => setValue("is_active", checked)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Test Koneksi</CardTitle>
              <CardDescription>
                Kirim email test untuk memastikan konfigurasi bekerja dengan baik
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Email tujuan untuk test"
                  value={testEmailAddress}
                  onChange={(e) => setTestEmailAddress(e.target.value)}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleTestEmail}
                  disabled={testEmail.isPending || !testEmailAddress}
                >
                  {testEmail.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  <Mail className="mr-2 h-4 w-4" />
                  Test Koneksi
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button type="submit" disabled={upsertConfig.isPending}>
              {upsertConfig.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Simpan Konfigurasi
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default EmailConfig;
