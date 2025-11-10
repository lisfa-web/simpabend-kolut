import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { useConfigSistem, useConfigMutation } from "@/hooks/useConfigSistem";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

const SecuritySettings = () => {
  const navigate = useNavigate();
  const { isSuperAdmin, isAdmin } = useAuth();
  const { data: configs, isLoading } = useConfigSistem();
  const { updateConfig } = useConfigMutation();

  // Local state for form
  const [inactivityTimeout, setInactivityTimeout] = useState("");
  const [absoluteTimeout, setAbsoluteTimeout] = useState("");
  const [requireReauthAfterSleep, setRequireReauthAfterSleep] = useState(true);
  const [sleepThreshold, setSleepThreshold] = useState("");
  const [rememberMeEnabled, setRememberMeEnabled] = useState(true);
  const [rememberMeDuration, setRememberMeDuration] = useState("");

  // Initialize form values from configs
  useEffect(() => {
    if (configs) {
      const inactivityConfig = configs.find(c => c.key === 'session_inactivity_timeout');
      const absoluteConfig = configs.find(c => c.key === 'session_absolute_timeout');
      const reauthConfig = configs.find(c => c.key === 'session_require_reauth_after_sleep');
      const sleepConfig = configs.find(c => c.key === 'session_sleep_threshold');
      const rememberConfig = configs.find(c => c.key === 'session_remember_me_enabled');
      const rememberDurationConfig = configs.find(c => c.key === 'session_remember_me_duration');

      if (inactivityConfig) setInactivityTimeout(inactivityConfig.value || '30');
      if (absoluteConfig) setAbsoluteTimeout(absoluteConfig.value || '480');
      if (reauthConfig) setRequireReauthAfterSleep(reauthConfig.value === 'true');
      if (sleepConfig) setSleepThreshold(sleepConfig.value || '30');
      if (rememberConfig) setRememberMeEnabled(rememberConfig.value === 'true');
      if (rememberDurationConfig) setRememberMeDuration(rememberDurationConfig.value || '10080');
    }
  }, [configs]);

  if (!isAdmin() && !isSuperAdmin()) {
    return <Navigate to="/unauthorized" replace />;
  }

  const handleSave = async () => {
    try {
      await Promise.all([
        updateConfig.mutateAsync({
          key: 'session_inactivity_timeout',
          value: inactivityTimeout,
        }),
        updateConfig.mutateAsync({
          key: 'session_absolute_timeout',
          value: absoluteTimeout,
        }),
        updateConfig.mutateAsync({
          key: 'session_require_reauth_after_sleep',
          value: requireReauthAfterSleep ? 'true' : 'false',
        }),
        updateConfig.mutateAsync({
          key: 'session_sleep_threshold',
          value: sleepThreshold,
        }),
        updateConfig.mutateAsync({
          key: 'session_remember_me_enabled',
          value: rememberMeEnabled ? 'true' : 'false',
        }),
        updateConfig.mutateAsync({
          key: 'session_remember_me_duration',
          value: rememberMeDuration,
        }),
      ]);

      toast.success("Pengaturan keamanan berhasil disimpan");
    } catch (error) {
      console.error('Error saving security settings:', error);
      toast.error("Gagal menyimpan pengaturan keamanan");
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Memuat pengaturan...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/pengaturan")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Shield className="h-8 w-8" />
              Pengaturan Keamanan Session
            </h1>
            <p className="text-muted-foreground mt-2">
              Kelola timeout session dan keamanan autentikasi sistem
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Timeout Aktivitas</CardTitle>
            <CardDescription>
              Atur durasi timeout otomatis berdasarkan aktivitas pengguna
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="inactivity">
                Timeout Inaktivitas (menit)
              </Label>
              <Input
                id="inactivity"
                type="number"
                min="0"
                value={inactivityTimeout}
                onChange={(e) => setInactivityTimeout(e.target.value)}
                placeholder="30"
              />
              <p className="text-sm text-muted-foreground">
                Auto logout setelah tidak ada aktivitas. Set 0 untuk disable. (Default: 30 menit)
              </p>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="absolute">
                Timeout Maksimal Session (menit)
              </Label>
              <Input
                id="absolute"
                type="number"
                min="0"
                value={absoluteTimeout}
                onChange={(e) => setAbsoluteTimeout(e.target.value)}
                placeholder="480"
              />
              <p className="text-sm text-muted-foreground">
                Durasi maksimal session sebelum harus login ulang. Set 0 untuk disable. (Default: 480 menit / 8 jam)
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Deteksi Sleep/Hibernate</CardTitle>
            <CardDescription>
              Re-authentication setelah laptop sleep atau hibernate
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5 flex-1">
                <Label htmlFor="reauth-sleep">
                  Require Re-authentication Setelah Sleep
                </Label>
                <p className="text-sm text-muted-foreground">
                  Minta user login ulang jika laptop sleep/hibernate
                </p>
              </div>
              <Switch
                id="reauth-sleep"
                checked={requireReauthAfterSleep}
                onCheckedChange={setRequireReauthAfterSleep}
              />
            </div>

            {requireReauthAfterSleep && (
              <>
                <Separator />
                <div className="space-y-2">
                  <Label htmlFor="sleep-threshold">
                    Threshold Sleep (menit)
                  </Label>
                  <Input
                    id="sleep-threshold"
                    type="number"
                    min="1"
                    value={sleepThreshold}
                    onChange={(e) => setSleepThreshold(e.target.value)}
                    placeholder="30"
                  />
                  <p className="text-sm text-muted-foreground">
                    Durasi minimum sleep/hibernate sebelum require re-auth. (Default: 30 menit)
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Opsi "Remember Me"</CardTitle>
            <CardDescription>
              Izinkan pengguna memilih durasi session yang lebih panjang
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5 flex-1">
                <Label htmlFor="remember-me">
                  Enable Remember Me
                </Label>
                <p className="text-sm text-muted-foreground">
                  Tampilkan checkbox "Remember Me" di halaman login
                </p>
              </div>
              <Switch
                id="remember-me"
                checked={rememberMeEnabled}
                onCheckedChange={setRememberMeEnabled}
              />
            </div>

            {rememberMeEnabled && (
              <>
                <Separator />
                <div className="space-y-2">
                  <Label htmlFor="remember-duration">
                    Durasi Remember Me (menit)
                  </Label>
                  <Input
                    id="remember-duration"
                    type="number"
                    min="60"
                    value={rememberMeDuration}
                    onChange={(e) => setRememberMeDuration(e.target.value)}
                    placeholder="10080"
                  />
                  <p className="text-sm text-muted-foreground">
                    Durasi session jika "Remember Me" diaktifkan. (Default: 10080 menit / 7 hari)
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button
            variant="outline"
            onClick={() => navigate("/pengaturan")}
          >
            Batal
          </Button>
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Simpan Pengaturan
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SecuritySettings;
