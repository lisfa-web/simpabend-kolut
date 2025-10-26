import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import ProfileHeader from "./components/ProfileHeader";
import ProfileStats from "./components/ProfileStats";
import MySpmTable from "./components/MySpmTable";
import MySp2dTable from "./components/MySp2dTable";
import { useAuth } from "@/hooks/useAuth";

const ProfilePage = () => {
  const { hasRole } = useAuth();
  
  const showSp2d = hasRole("kuasa_bud") || hasRole("kepala_bkad") || hasRole("bendahara_opd");

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Profil Saya</h1>
          <p className="text-muted-foreground">
            Lihat informasi akun dan aktivitas pekerjaan Anda
          </p>
        </div>

        <ProfileHeader />

        <Tabs defaultValue="ringkasan" className="space-y-4">
          <TabsList>
            <TabsTrigger value="ringkasan">Ringkasan</TabsTrigger>
            <TabsTrigger value="spm">SPM Saya</TabsTrigger>
            {showSp2d && <TabsTrigger value="sp2d">SP2D Saya</TabsTrigger>}
          </TabsList>

          <TabsContent value="ringkasan" className="space-y-4">
            <ProfileStats />
          </TabsContent>

          <TabsContent value="spm">
            <MySpmTable />
          </TabsContent>

          {showSp2d && (
            <TabsContent value="sp2d">
              <MySp2dTable />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;
