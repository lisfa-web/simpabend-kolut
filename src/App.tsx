import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { RoleProtectedRoute } from "@/components/auth/RoleProtectedRoute";
import { lazy, Suspense } from "react";

// Lazy load all pages
const Index = lazy(() => import("./pages/Index"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const About = lazy(() => import("./pages/About"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Login = lazy(() => import("./pages/auth/Login"));
const Unauthorized = lazy(() => import("./pages/auth/Unauthorized"));
const InitialSetup = lazy(() => import("./pages/auth/InitialSetup"));
const InputSpmList = lazy(() => import("./pages/spm/InputSpmList"));
const InputSpmForm = lazy(() => import("./pages/spm/InputSpmForm"));
const InputSpmDetail = lazy(() => import("./pages/spm/InputSpmDetail"));
const VerifikasiResepsionis = lazy(() => import("./pages/spm/VerifikasiResepsionis"));
const VerifikasiPbmd = lazy(() => import("./pages/spm/VerifikasiPbmd"));
const VerifikasiAkuntansi = lazy(() => import("./pages/spm/VerifikasiAkuntansi"));
const VerifikasiPerbendaharaan = lazy(() => import("./pages/spm/VerifikasiPerbendaharaan"));
const ApprovalKepalaBkad = lazy(() => import("./pages/spm/ApprovalKepalaBkad"));
const UserList = lazy(() => import("./pages/users/UserList"));
const UserForm = lazy(() => import("./pages/users/UserForm"));
const UserDetail = lazy(() => import("./pages/users/UserDetail"));
const MasterDataIndex = lazy(() => import("./pages/masterdata/MasterDataIndex"));
const OpdList = lazy(() => import("./pages/masterdata/OpdList"));
const OpdForm = lazy(() => import("./pages/masterdata/OpdForm"));
const VendorForm = lazy(() => import("./pages/masterdata/VendorForm"));
const VendorList = lazy(() => import("./pages/masterdata/VendorList"));
const BendaharaPengeluaranList = lazy(() => import("./pages/masterdata/BendaharaPengeluaranList"));
const BendaharaPengeluaranForm = lazy(() => import("./pages/masterdata/BendaharaPengeluaranForm"));
const JenisSpmList = lazy(() => import("./pages/masterdata/JenisSpmList"));
const JenisSpmForm = lazy(() => import("./pages/masterdata/JenisSpmForm"));
const MasterPajakList = lazy(() => import("./pages/masterdata/MasterPajakList"));
const MasterPajakForm = lazy(() => import("./pages/masterdata/MasterPajakForm"));
const PajakPerJenisSpmList = lazy(() => import("./pages/masterdata/PajakPerJenisSpmList"));
const PajakPerJenisSpmForm = lazy(() => import("./pages/masterdata/PajakPerJenisSpmForm"));
const Sp2dList = lazy(() => import("./pages/spm/Sp2dList"));
const Sp2dForm = lazy(() => import("./pages/spm/Sp2dForm"));
const Sp2dDetail = lazy(() => import("./pages/spm/Sp2dDetail"));
const Sp2dTimelineDetail = lazy(() => import("./pages/spm/Sp2dTimelineDetail"));
const SpmTimelineDetail = lazy(() => import("./pages/spm/SpmTimelineDetail"));
const LaporanIndex = lazy(() => import("./pages/laporan/LaporanIndex"));
const LaporanSpm = lazy(() => import("./pages/laporan/LaporanSpm"));
const LaporanSp2d = lazy(() => import("./pages/laporan/LaporanSp2d"));
const LaporanVerifikasi = lazy(() => import("./pages/laporan/LaporanVerifikasi"));
const LaporanKeuangan = lazy(() => import("./pages/laporan/LaporanKeuangan"));
const SuratIndex = lazy(() => import("./pages/surat/SuratIndex"));
const PejabatList = lazy(() => import("./pages/surat/PejabatList"));
const PejabatForm = lazy(() => import("./pages/surat/PejabatForm"));
const PejabatDetail = lazy(() => import("./pages/surat/PejabatDetail"));
const TemplateSuratList = lazy(() => import("./pages/surat/TemplateSuratList"));
const TemplateSuratForm = lazy(() => import("./pages/surat/TemplateSuratForm"));
const TemplateSuratDetail = lazy(() => import("./pages/surat/TemplateSuratDetail"));
const GenerateSurat = lazy(() => import("./pages/surat/GenerateSurat"));
const PengaturanIndex = lazy(() => import("./pages/pengaturan/PengaturanIndex"));
const ConfigList = lazy(() => import("./pages/pengaturan/ConfigList"));
const FormatNomorList = lazy(() => import("./pages/pengaturan/FormatNomorList"));
const FormatNomorForm = lazy(() => import("./pages/pengaturan/FormatNomorForm"));
const WaGatewayConfig = lazy(() => import("./pages/pengaturan/WaGatewayConfig"));
const EmailConfig = lazy(() => import("./pages/pengaturan/EmailConfig"));
const PermissionsList = lazy(() => import("./pages/pengaturan/PermissionsList"));
const AuditTrail = lazy(() => import("./pages/pengaturan/AuditTrail"));
const EmergencyMode = lazy(() => import("./pages/pengaturan/EmergencyMode"));
const SidebarTemplate = lazy(() => import("./pages/pengaturan/SidebarTemplate"));
const DatabaseBackup = lazy(() => import("./pages/pengaturan/DatabaseBackup"));
const SecuritySettings = lazy(() => import("./pages/pengaturan/SecuritySettings"));
const AccessControl = lazy(() => import("./pages/pengaturan/AccessControl"));
const FileManager = lazy(() => import("./pages/pengaturan/FileManager"));
const PanduanManual = lazy(() => import("./pages/panduan/PanduanManual"));
const PanduanManualAdmin = lazy(() => import("./pages/panduan/PanduanManualAdmin"));
const ProfilePage = lazy(() => import("./pages/profile/ProfilePage"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/tentang" element={<About />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              <Route path="/initial-setup" element={<InitialSetup />} />
              
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              
              {/* SPM Routes - Standardized under /input-spm */}
              <Route path="/input-spm" element={<ProtectedRoute><InputSpmList /></ProtectedRoute>} />
              <Route path="/input-spm/buat" element={<ProtectedRoute><InputSpmForm /></ProtectedRoute>} />
              <Route path="/input-spm/detail/:id" element={<ProtectedRoute><InputSpmDetail /></ProtectedRoute>} />
              <Route path="/input-spm/edit/:id" element={<ProtectedRoute><InputSpmForm /></ProtectedRoute>} />
              <Route path="/input-spm/timeline/:id" element={<ProtectedRoute><SpmTimelineDetail /></ProtectedRoute>} />
              
              {/* Backward compatibility redirects for old /spm/input paths */}
              <Route path="/spm/input" element={<Navigate to="/input-spm" replace />} />
              <Route path="/spm/input/new" element={<Navigate to="/input-spm/buat" replace />} />
              <Route path="/spm/input/detail/:id" element={<Navigate to="/input-spm/detail/:id" replace />} />
              <Route path="/spm/input/:id/edit" element={<Navigate to="/input-spm/edit/:id" replace />} />
              <Route path="/spm/timeline/:id" element={<Navigate to="/input-spm/timeline/:id" replace />} />
              
              <Route path="/spm/verifikasi/resepsionis" element={<ProtectedRoute><VerifikasiResepsionis /></ProtectedRoute>} />
              <Route path="/spm/verifikasi/pbmd" element={<ProtectedRoute><VerifikasiPbmd /></ProtectedRoute>} />
              <Route path="/spm/verifikasi/akuntansi" element={<ProtectedRoute><VerifikasiAkuntansi /></ProtectedRoute>} />
              <Route path="/spm/verifikasi/perbendaharaan" element={<ProtectedRoute><VerifikasiPerbendaharaan /></ProtectedRoute>} />
              <Route path="/spm/approval/kepala-bkad" element={<ProtectedRoute><ApprovalKepalaBkad /></ProtectedRoute>} />
              
              {/* SP2D Routes */}
              <Route path="/sp2d" element={
                <RoleProtectedRoute allowedRoles={["kuasa_bud", "kepala_bkad", "administrator", "super_admin", "bendahara_opd"]}>
                  <Sp2dList />
                </RoleProtectedRoute>
              } />
              <Route path="/sp2d/new" element={
                <RoleProtectedRoute allowedRoles={["kuasa_bud", "administrator", "super_admin"]}>
                  <Sp2dForm />
                </RoleProtectedRoute>
              } />
              <Route path="/sp2d/buat" element={
                <RoleProtectedRoute allowedRoles={["kuasa_bud", "administrator", "super_admin"]}>
                  <Sp2dForm />
                </RoleProtectedRoute>
              } />
              <Route path="/sp2d/detail/:id" element={
                <RoleProtectedRoute allowedRoles={["kuasa_bud", "kepala_bkad", "administrator", "super_admin", "bendahara_opd"]}>
                  <Sp2dDetail />
                </RoleProtectedRoute>
              } />
              <Route path="/sp2d/timeline/:id" element={
                <RoleProtectedRoute allowedRoles={["kuasa_bud", "kepala_bkad", "administrator", "super_admin", "bendahara_opd"]}>
                  <Sp2dTimelineDetail />
                </RoleProtectedRoute>
              } />
              <Route path="/sp2d/:id" element={
                <RoleProtectedRoute allowedRoles={["kuasa_bud", "kepala_bkad", "administrator", "super_admin", "bendahara_opd"]}>
                  <Sp2dDetail />
                </RoleProtectedRoute>
              } />
              <Route path="/sp2d/:id/edit" element={
                <RoleProtectedRoute allowedRoles={["kuasa_bud", "administrator", "super_admin"]}>
                  <Sp2dForm />
                </RoleProtectedRoute>
              } />
              
              {/* User Management Routes */}
              <Route path="/users" element={<RoleProtectedRoute allowedRoles={["administrator", "super_admin"]}><UserList /></RoleProtectedRoute>} />
              {/* SECURITY: Both admin and super_admin can manage users (with restrictions in form) */}
              <Route path="/users/new" element={<RoleProtectedRoute allowedRoles={["administrator", "super_admin"]}><UserForm /></RoleProtectedRoute>} />
              <Route path="/users/create" element={<RoleProtectedRoute allowedRoles={["administrator", "super_admin"]}><UserForm /></RoleProtectedRoute>} />
              <Route path="/users/:id" element={<RoleProtectedRoute allowedRoles={["administrator", "super_admin"]}><UserDetail /></RoleProtectedRoute>} />
              <Route path="/users/:id/edit" element={<RoleProtectedRoute allowedRoles={["administrator", "super_admin"]}><UserForm /></RoleProtectedRoute>} />
              
              {/* Master Data Routes */}
              <Route path="/masterdata" element={<ProtectedRoute><MasterDataIndex /></ProtectedRoute>} />
              
              <Route path="/masterdata/opd" element={<ProtectedRoute><OpdList /></ProtectedRoute>} />
              <Route path="/masterdata/opd/new" element={<ProtectedRoute><OpdForm /></ProtectedRoute>} />
              <Route path="/masterdata/opd/create" element={<ProtectedRoute><OpdForm /></ProtectedRoute>} />
              <Route path="/masterdata/opd/:id/edit" element={<ProtectedRoute><OpdForm /></ProtectedRoute>} />
              
              <Route path="/masterdata/vendor" element={<ProtectedRoute><VendorList /></ProtectedRoute>} />
              <Route path="/masterdata/vendor/new" element={<ProtectedRoute><VendorForm /></ProtectedRoute>} />
              <Route path="/masterdata/vendor/create" element={<ProtectedRoute><VendorForm /></ProtectedRoute>} />
              <Route path="/masterdata/vendor/:id/edit" element={<ProtectedRoute><VendorForm /></ProtectedRoute>} />
              
              <Route path="/masterdata/bendahara-pengeluaran" element={<ProtectedRoute><BendaharaPengeluaranList /></ProtectedRoute>} />
              <Route path="/masterdata/bendahara-pengeluaran/tambah" element={<ProtectedRoute><BendaharaPengeluaranForm /></ProtectedRoute>} />
              <Route path="/masterdata/bendahara-pengeluaran/edit/:id" element={<ProtectedRoute><BendaharaPengeluaranForm /></ProtectedRoute>} />
              
              <Route path="/masterdata/jenis-spm" element={<ProtectedRoute><JenisSpmList /></ProtectedRoute>} />
              <Route path="/masterdata/jenis-spm/tambah" element={<ProtectedRoute><JenisSpmForm /></ProtectedRoute>} />
              <Route path="/masterdata/jenis-spm/edit/:id" element={<ProtectedRoute><JenisSpmForm /></ProtectedRoute>} />
              
              <Route path="/masterdata/pajak" element={<ProtectedRoute><MasterPajakList /></ProtectedRoute>} />
              <Route path="/masterdata/pajak/tambah" element={<ProtectedRoute><MasterPajakForm /></ProtectedRoute>} />
              <Route path="/masterdata/pajak/edit/:id" element={<ProtectedRoute><MasterPajakForm /></ProtectedRoute>} />
              <Route path="/masterdata/pajak/mapping" element={<ProtectedRoute><PajakPerJenisSpmList /></ProtectedRoute>} />
              <Route path="/masterdata/pajak/mapping/tambah" element={<ProtectedRoute><PajakPerJenisSpmForm /></ProtectedRoute>} />
              <Route path="/masterdata/pajak/mapping/edit/:id" element={<ProtectedRoute><PajakPerJenisSpmForm /></ProtectedRoute>} />
              
              {/* Laporan Routes */}
              <Route path="/laporan" element={<ProtectedRoute><LaporanIndex /></ProtectedRoute>} />
              <Route path="/laporan/spm" element={<ProtectedRoute><LaporanSpm /></ProtectedRoute>} />
              <Route path="/laporan/sp2d" element={<ProtectedRoute><LaporanSp2d /></ProtectedRoute>} />
              <Route path="/laporan/verifikasi" element={<ProtectedRoute><LaporanVerifikasi /></ProtectedRoute>} />
              <Route path="/laporan/keuangan" element={<ProtectedRoute><LaporanKeuangan /></ProtectedRoute>} />
              
              {/* Surat Routes */}
              <Route path="/surat" element={<ProtectedRoute><SuratIndex /></ProtectedRoute>} />
              <Route path="/surat/pejabat" element={<ProtectedRoute><PejabatList /></ProtectedRoute>} />
              <Route path="/surat/pejabat/new" element={<ProtectedRoute><PejabatForm /></ProtectedRoute>} />
              <Route path="/surat/pejabat/buat" element={<ProtectedRoute><PejabatForm /></ProtectedRoute>} />
              <Route path="/surat/pejabat/:id" element={<ProtectedRoute><PejabatDetail /></ProtectedRoute>} />
              <Route path="/surat/pejabat/:id/edit" element={<ProtectedRoute><PejabatForm /></ProtectedRoute>} />
              <Route path="/surat/template" element={<ProtectedRoute><TemplateSuratList /></ProtectedRoute>} />
              <Route path="/surat/template/new" element={<ProtectedRoute><TemplateSuratForm /></ProtectedRoute>} />
              <Route path="/surat/template/buat" element={<ProtectedRoute><TemplateSuratForm /></ProtectedRoute>} />
              <Route path="/surat/template/:id" element={<ProtectedRoute><TemplateSuratDetail /></ProtectedRoute>} />
              <Route path="/surat/template/:id/edit" element={<ProtectedRoute><TemplateSuratForm /></ProtectedRoute>} />
              <Route path="/surat/generate" element={<ProtectedRoute><GenerateSurat /></ProtectedRoute>} />
              
              {/* Pengaturan Routes */}
              <Route path="/pengaturan" element={<RoleProtectedRoute allowedRoles={["administrator", "super_admin"]}><PengaturanIndex /></RoleProtectedRoute>} />
              <Route path="/pengaturan/config" element={<RoleProtectedRoute allowedRoles={["administrator", "super_admin"]}><ConfigList /></RoleProtectedRoute>} />
              <Route path="/pengaturan/format-nomor" element={<RoleProtectedRoute allowedRoles={["administrator", "super_admin"]}><FormatNomorList /></RoleProtectedRoute>} />
              <Route path="/pengaturan/format-nomor/new" element={<RoleProtectedRoute allowedRoles={["administrator", "super_admin"]}><FormatNomorForm /></RoleProtectedRoute>} />
              <Route path="/pengaturan/format-nomor/:id/edit" element={<RoleProtectedRoute allowedRoles={["administrator", "super_admin"]}><FormatNomorForm /></RoleProtectedRoute>} />
              <Route path="/pengaturan/wa-gateway" element={<RoleProtectedRoute allowedRoles={["super_admin"]}><WaGatewayConfig /></RoleProtectedRoute>} />
              <Route path="/pengaturan/email" element={<RoleProtectedRoute allowedRoles={["super_admin"]}><EmailConfig /></RoleProtectedRoute>} />
              <Route path="/pengaturan/permissions" element={<RoleProtectedRoute allowedRoles={["administrator", "super_admin"]}><PermissionsList /></RoleProtectedRoute>} />
              <Route path="/pengaturan/audit-trail" element={<RoleProtectedRoute allowedRoles={["administrator", "super_admin"]}><AuditTrail /></RoleProtectedRoute>} />
              <Route path="/pengaturan/emergency-mode" element={<RoleProtectedRoute allowedRoles={["administrator", "super_admin"]}><EmergencyMode /></RoleProtectedRoute>} />
              <Route path="/pengaturan/sidebar-template" element={<RoleProtectedRoute allowedRoles={["super_admin"]}><SidebarTemplate /></RoleProtectedRoute>} />
              <Route path="/pengaturan/database-backup" element={<RoleProtectedRoute allowedRoles={["super_admin"]}><DatabaseBackup /></RoleProtectedRoute>} />
              <Route path="/pengaturan/security" element={<RoleProtectedRoute allowedRoles={["administrator", "super_admin"]}><SecuritySettings /></RoleProtectedRoute>} />
              <Route path="/pengaturan/access-control" element={<RoleProtectedRoute allowedRoles={["super_admin"]}><AccessControl /></RoleProtectedRoute>} />
              <Route path="/pengaturan/file-manager" element={<RoleProtectedRoute allowedRoles={["administrator", "super_admin"]}><FileManager /></RoleProtectedRoute>} />
              
              {/* Panduan Routes */}
              <Route path="/panduan" element={<ProtectedRoute><PanduanManual /></ProtectedRoute>} />
              <Route path="/panduan-manual" element={<ProtectedRoute><PanduanManual /></ProtectedRoute>} />
              <Route path="/panduan/admin" element={<RoleProtectedRoute allowedRoles={["administrator", "super_admin"]}><PanduanManualAdmin /></RoleProtectedRoute>} />
              <Route path="/panduan-manual/admin" element={<RoleProtectedRoute allowedRoles={["administrator", "super_admin"]}><PanduanManualAdmin /></RoleProtectedRoute>} />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
