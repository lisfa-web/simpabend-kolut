import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Lock, AlertCircle } from "lucide-react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { useSettingAccessControl, useSettingAccessControlMutation } from "@/hooks/useSettingAccessControl";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

const AccessControl = () => {
  const { data: settings, isLoading } = useSettingAccessControl();
  const { updateAccessControl } = useSettingAccessControlMutation();

  const handleToggle = (setting_key: string, currentValue: boolean) => {
    updateAccessControl.mutate({
      setting_key,
      superadmin_only: !currentValue
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Kontrol Akses Pengaturan</h1>
          <p className="text-muted-foreground mt-2">
            Tentukan pengaturan mana yang hanya bisa diakses oleh superadmin
          </p>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Pengaturan yang dicentang hanya akan terlihat oleh pengguna dengan role <strong>super_admin</strong>. 
            Administrator biasa tidak akan melihat menu tersebut.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-purple-600" />
              Daftar Pengaturan
            </CardTitle>
            <CardDescription>
              Pilih pengaturan yang hanya bisa diakses oleh superadmin
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-3">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-48" />
                </div>
              ))
            ) : (
              settings?.map((setting) => (
                <div key={setting.setting_key} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id={setting.setting_key}
                      checked={setting.superadmin_only}
                      disabled={!setting.is_configurable}
                      onCheckedChange={() => handleToggle(setting.setting_key, setting.superadmin_only)}
                    />
                    <Label 
                      htmlFor={setting.setting_key}
                      className={`text-base cursor-pointer ${!setting.is_configurable ? 'opacity-60' : ''}`}
                    >
                      {setting.setting_title}
                    </Label>
                  </div>
                  
                  {!setting.is_configurable && (
                    <Badge variant="secondary" className="ml-2">
                      Tidak dapat diubah
                    </Badge>
                  )}
                  
                  {setting.superadmin_only && setting.is_configurable && (
                    <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                      Superadmin Only
                    </Badge>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AccessControl;
