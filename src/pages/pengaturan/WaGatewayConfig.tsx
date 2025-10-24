import { useForm } from "react-hook-form";
import { Loader2, MessageSquare, CheckCircle2, XCircle, Send } from "lucide-react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useWaGateway, useWaGatewayMutation } from "@/hooks/useWaGateway";
import { useTestWaGateway } from "@/hooks/useTestWaGateway";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

interface FormData {
  api_key: string;
  sender_id: string;
  is_active: boolean;
}

const WaGatewayConfig = () => {
  const { data: gateway, isLoading } = useWaGateway();
  const { upsertGateway } = useWaGatewayMutation();
  const testWaGateway = useTestWaGateway();
  const [testPhone, setTestPhone] = useState("");

  const { register, handleSubmit, watch, setValue } = useForm<FormData>({
    values: gateway
      ? {
          api_key: gateway.api_key,
          sender_id: gateway.sender_id,
          is_active: gateway.is_active || false,
        }
      : {
          api_key: "",
          sender_id: "",
          is_active: false,
        },
  });

  const isActive = watch("is_active");

  const onSubmit = (data: FormData) => {
    upsertGateway.mutate(data);
  };

  const handleTestConnection = () => {
    if (!testPhone) {
      return;
    }
    testWaGateway.mutate(testPhone);
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
          <h1 className="text-3xl font-bold text-foreground">WhatsApp Gateway</h1>
          <p className="text-muted-foreground mt-2">
            Konfigurasi integrasi WhatsApp untuk notifikasi otomatis
          </p>
        </div>

        <Alert>
          <MessageSquare className="h-4 w-4" />
          <AlertDescription>
            <p className="font-medium mb-2">Integrasi WhatsApp Gateway</p>
            <p className="text-sm">
              Sistem ini mendukung integrasi dengan layanan WhatsApp Gateway seperti
              Fonnte, WABLAS, atau provider lainnya. Pastikan Anda memiliki API Key
              dan Sender ID yang valid.
            </p>
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Konfigurasi Gateway</CardTitle>
                  <CardDescription>
                    Masukkan kredensial WhatsApp Gateway
                  </CardDescription>
                </div>
                {gateway?.last_test_at && (
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">
                      Test terakhir:{" "}
                      {new Date(gateway.last_test_at).toLocaleString("id-ID")}
                    </div>
                    {gateway.test_status && (
                      <Badge
                        variant={
                          gateway.test_status === "success" ? "default" : "destructive"
                        }
                        className="mt-1"
                      >
                        {gateway.test_status === "success" ? (
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
              <div className="space-y-2">
                <Label htmlFor="api_key">
                  API Key <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="api_key"
                  type="password"
                  {...register("api_key", { required: true })}
                  placeholder="Masukkan API Key"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sender_id">
                  Sender ID <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="sender_id"
                  {...register("sender_id", { required: true })}
                  placeholder="Contoh: 628123456789"
                />
                <p className="text-xs text-muted-foreground">
                  Nomor WhatsApp yang digunakan untuk mengirim pesan
                </p>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-0.5">
                  <Label htmlFor="is_active">Status Gateway</Label>
                  <p className="text-sm text-muted-foreground">
                    Aktifkan untuk menggunakan notifikasi WhatsApp
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
                Kirim pesan WhatsApp test untuk memastikan konfigurasi bekerja dengan baik
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  type="tel"
                  placeholder="Nomor WhatsApp (contoh: 628123456789)"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleTestConnection}
                  disabled={testWaGateway.isPending || !testPhone}
                >
                  {testWaGateway.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  <Send className="mr-2 h-4 w-4" />
                  Test Koneksi
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button type="submit" disabled={upsertGateway.isPending}>
              {upsertGateway.isPending && (
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

export default WaGatewayConfig;
