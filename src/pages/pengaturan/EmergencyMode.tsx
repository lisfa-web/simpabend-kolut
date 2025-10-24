import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useEmergencyMode, useToggleEmergencyMode } from "@/hooks/useEmergencyMode";
import { useUserProfile } from "@/hooks/useUserProfile";
import { AlertTriangle, Shield, Clock, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";

const EmergencyMode = () => {
  const { data: emergencyStatus, isLoading } = useEmergencyMode();
  const { data: profile } = useUserProfile();
  const toggleEmergency = useToggleEmergencyMode();
  
  const [showDialog, setShowDialog] = useState(false);
  const [reason, setReason] = useState("");
  const [timeRemaining, setTimeRemaining] = useState("");

  useEffect(() => {
    if (emergencyStatus?.enabled && emergencyStatus?.activatedAt) {
      const interval = setInterval(() => {
        const activatedTime = new Date(emergencyStatus.activatedAt).getTime();
        const now = Date.now();
        const elapsed = now - activatedTime;
        const remaining = 24 * 60 * 60 * 1000 - elapsed; // 24 hours in ms

        if (remaining > 0) {
          const hours = Math.floor(remaining / (60 * 60 * 1000));
          const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
          setTimeRemaining(`${hours} jam ${minutes} menit`);
        } else {
          setTimeRemaining("Akan dinonaktifkan otomatis");
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [emergencyStatus]);

  const handleToggle = (enable: boolean) => {
    if (enable) {
      setShowDialog(true);
    } else {
      toggleEmergency.mutate({ enabled: false, reason: "" });
    }
  };

  const handleConfirmEnable = () => {
    if (reason.trim().length < 10) {
      return;
    }
    toggleEmergency.mutate({ enabled: true, reason });
    setShowDialog(false);
    setReason("");
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Mode Emergency</h1>
          <p className="text-muted-foreground mt-2">
            Bypass verifikasi OTP/PIN untuk situasi darurat (HP hilang, gateway down)
          </p>
        </div>

        {emergencyStatus?.enabled && (
          <Alert variant="destructive">
            <AlertTriangle className="h-5 w-5" />
            <AlertTitle className="text-lg font-bold">Mode Emergency Aktif</AlertTitle>
            <AlertDescription className="mt-2 space-y-2">
              <p>
                Verifikasi OTP/PIN telah di-bypass. Semua approval akan tercatat sebagai emergency approval.
              </p>
              <div className="flex items-center gap-2 mt-3">
                <Clock className="h-4 w-4" />
                <span className="text-sm font-medium">Sisa waktu: {timeRemaining}</span>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Status Mode Emergency
                </CardTitle>
                <CardDescription>
                  Mode emergency akan otomatis dinonaktifkan setelah 24 jam
                </CardDescription>
              </div>
              <Badge variant={emergencyStatus?.enabled ? "destructive" : "secondary"} className="text-sm">
                {emergencyStatus?.enabled ? "AKTIF" : "NONAKTIF"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {emergencyStatus?.enabled && (
              <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                <div className="flex items-start gap-3">
                  <User className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Diaktifkan oleh</p>
                    <p className="text-sm text-muted-foreground">
                      {profile?.full_name || "System"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Waktu aktivasi</p>
                    <p className="text-sm text-muted-foreground">
                      {emergencyStatus.activatedAt
                        ? formatDistanceToNow(new Date(emergencyStatus.activatedAt), {
                            addSuffix: true,
                            locale: id,
                          })
                        : "-"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Alasan</p>
                    <p className="text-sm text-muted-foreground">
                      {emergencyStatus.reason || "-"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              {!emergencyStatus?.enabled ? (
                <Button
                  variant="destructive"
                  onClick={() => handleToggle(true)}
                  disabled={toggleEmergency.isPending}
                  className="w-full"
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Aktifkan Mode Emergency
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => handleToggle(false)}
                  disabled={toggleEmergency.isPending}
                  className="w-full"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Nonaktifkan Mode Emergency
                </Button>
              )}
            </div>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Peringatan Keamanan</AlertTitle>
              <AlertDescription className="text-sm space-y-2 mt-2">
                <ul className="list-disc list-inside space-y-1">
                  <li>Mode emergency hanya untuk situasi darurat (HP hilang, gateway down)</li>
                  <li>Semua approval akan tercatat dalam audit log sebagai emergency</li>
                  <li>Notifikasi akan dikirim ke semua admin saat mode diaktifkan</li>
                  <li>Mode akan otomatis dinonaktifkan setelah 24 jam</li>
                  <li>Gunakan dengan bijak dan bertanggung jawab</li>
                </ul>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Aktifkan Mode Emergency?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <p>
                Mode emergency akan menonaktifkan verifikasi OTP/PIN untuk semua approval SPM dan SP2D.
                Semua tindakan akan tercatat dalam audit log.
              </p>
              <div className="space-y-2">
                <Label htmlFor="reason">Alasan Aktivasi (minimal 10 karakter) *</Label>
                <Textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Contoh: HP Kepala BKAD hilang, WhatsApp gateway down sejak pagi..."
                  rows={4}
                  className="resize-none"
                />
                {reason.length > 0 && reason.length < 10 && (
                  <p className="text-sm text-destructive">
                    Alasan minimal 10 karakter ({reason.length}/10)
                  </p>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmEnable}
              disabled={reason.trim().length < 10 || toggleEmergency.isPending}
              className="bg-destructive hover:bg-destructive/90"
            >
              Ya, Aktifkan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default EmergencyMode;
