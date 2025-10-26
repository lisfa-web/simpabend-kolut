import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { RoleProtectedRoute } from "@/components/auth/RoleProtectedRoute";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import Login from "./pages/auth/Login";
import Unauthorized from "./pages/auth/Unauthorized";
import InitialSetup from "./pages/auth/InitialSetup";
import InputSpmList from "./pages/spm/InputSpmList";
import InputSpmForm from "./pages/spm/InputSpmForm";
import InputSpmDetail from "./pages/spm/InputSpmDetail";
import VerifikasiResepsionis from "./pages/spm/VerifikasiResepsionis";
import VerifikasiPbmd from "./pages/spm/VerifikasiPbmd";
import VerifikasiAkuntansi from "./pages/spm/VerifikasiAkuntansi";
import VerifikasiPerbendaharaan from "./pages/spm/VerifikasiPerbendaharaan";
import ApprovalKepalaBkad from "./pages/spm/ApprovalKepalaBkad";
import UserList from "./pages/users/UserList";
import UserForm from "./pages/users/UserForm";
import UserDetail from "./pages/users/UserDetail";
import MasterDataIndex from "./pages/masterdata/MasterDataIndex";
import OpdList from "./pages/masterdata/OpdList";
import OpdForm from "./pages/masterdata/OpdForm";
import VendorForm from "./pages/masterdata/VendorForm";
import VendorList from "./pages/masterdata/VendorList";
import ProgramList from "./pages/masterdata/ProgramList";
import ProgramForm from "./pages/masterdata/ProgramForm";
import KegiatanList from "./pages/masterdata/KegiatanList";
import KegiatanForm from "./pages/masterdata/KegiatanForm";
import SubkegiatanList from "./pages/masterdata/SubkegiatanList";
import SubkegiatanForm from "./pages/masterdata/SubkegiatanForm";
import Sp2dList from "./pages/spm/Sp2dList";
import Sp2dForm from "./pages/spm/Sp2dForm";
import Sp2dDetail from "./pages/spm/Sp2dDetail";
import SpmTimelineDetail from "./pages/spm/SpmTimelineDetail";
import LaporanIndex from "./pages/laporan/LaporanIndex";
import LaporanSpm from "./pages/laporan/LaporanSpm";
import LaporanSp2d from "./pages/laporan/LaporanSp2d";
import LaporanVerifikasi from "./pages/laporan/LaporanVerifikasi";
import LaporanKeuangan from "./pages/laporan/LaporanKeuangan";
import SuratIndex from "./pages/surat/SuratIndex";
import PejabatList from "./pages/surat/PejabatList";
import PejabatForm from "./pages/surat/PejabatForm";
import PejabatDetail from "./pages/surat/PejabatDetail";
import TemplateSuratList from "./pages/surat/TemplateSuratList";
import TemplateSuratForm from "./pages/surat/TemplateSuratForm";
import TemplateSuratDetail from "./pages/surat/TemplateSuratDetail";
import GenerateSurat from "./pages/surat/GenerateSurat";
import PengaturanIndex from "./pages/pengaturan/PengaturanIndex";
import ConfigList from "./pages/pengaturan/ConfigList";
import FormatNomorList from "./pages/pengaturan/FormatNomorList";
import FormatNomorForm from "./pages/pengaturan/FormatNomorForm";
import WaGatewayConfig from "./pages/pengaturan/WaGatewayConfig";
import EmailConfig from "./pages/pengaturan/EmailConfig";
import PermissionsList from "./pages/pengaturan/PermissionsList";
import AuditTrail from "./pages/pengaturan/AuditTrail";
import EmergencyMode from "./pages/pengaturan/EmergencyMode";
import SidebarTemplate from "./pages/pengaturan/SidebarTemplate";
import PanduanManual from "./pages/panduan/PanduanManual";
import PanduanManualAdmin from "./pages/panduan/PanduanManualAdmin";
import ProfilePage from "./pages/profile/ProfilePage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
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
            
            <Route path="/spm/verifikasi/resepsionis" element={<ProtectedRoute><VerifikasiResepsionis /></ProtectedRoute>} />
            <Route path="/spm/verifikasi/pbmd" element={<ProtectedRoute><VerifikasiPbmd /></ProtectedRoute>} />
            <Route path="/spm/verifikasi/akuntansi" element={<ProtectedRoute><VerifikasiAkuntansi /></ProtectedRoute>} />
            <Route path="/spm/verifikasi/perbendaharaan" element={<ProtectedRoute><VerifikasiPerbendaharaan /></ProtectedRoute>} />
            <Route path="/spm/approval/kepala-bkad" element={<ProtectedRoute><ApprovalKepalaBkad /></ProtectedRoute>} />
            
            {/* SP2D Routes */}
            <Route path="/sp2d" element={<ProtectedRoute><Sp2dList /></ProtectedRoute>} />
            <Route path="/sp2d/new" element={<ProtectedRoute><Sp2dForm /></ProtectedRoute>} />
            <Route path="/sp2d/buat" element={<ProtectedRoute><Sp2dForm /></ProtectedRoute>} />
            <Route path="/sp2d/:id" element={<ProtectedRoute><Sp2dDetail /></ProtectedRoute>} />
            <Route path="/sp2d/:id/edit" element={<ProtectedRoute><Sp2dForm /></ProtectedRoute>} />
            
            {/* User Management Routes */}
            <Route path="/users" element={<RoleProtectedRoute allowedRoles={["administrator", "super_admin"]}><UserList /></RoleProtectedRoute>} />
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
            
            <Route path="/masterdata/program" element={<ProtectedRoute><ProgramList /></ProtectedRoute>} />
            <Route path="/masterdata/program/new" element={<ProtectedRoute><ProgramForm /></ProtectedRoute>} />
            <Route path="/masterdata/program/:id" element={<ProtectedRoute><ProgramForm /></ProtectedRoute>} />
            <Route path="/masterdata/program/:id/edit" element={<ProtectedRoute><ProgramForm /></ProtectedRoute>} />
            
            <Route path="/masterdata/kegiatan" element={<ProtectedRoute><KegiatanList /></ProtectedRoute>} />
            <Route path="/masterdata/kegiatan/new" element={<ProtectedRoute><KegiatanForm /></ProtectedRoute>} />
            <Route path="/masterdata/kegiatan/:id" element={<ProtectedRoute><KegiatanForm /></ProtectedRoute>} />
            <Route path="/masterdata/kegiatan/:id/edit" element={<ProtectedRoute><KegiatanForm /></ProtectedRoute>} />
            
            <Route path="/masterdata/subkegiatan" element={<ProtectedRoute><SubkegiatanList /></ProtectedRoute>} />
            <Route path="/masterdata/subkegiatan/new" element={<ProtectedRoute><SubkegiatanForm /></ProtectedRoute>} />
            <Route path="/masterdata/subkegiatan/:id" element={<ProtectedRoute><SubkegiatanForm /></ProtectedRoute>} />
            <Route path="/masterdata/subkegiatan/:id/edit" element={<ProtectedRoute><SubkegiatanForm /></ProtectedRoute>} />
            
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
            <Route path="/pengaturan/wa-gateway" element={<RoleProtectedRoute allowedRoles={["administrator", "super_admin"]}><WaGatewayConfig /></RoleProtectedRoute>} />
            <Route path="/pengaturan/email" element={<RoleProtectedRoute allowedRoles={["administrator", "super_admin"]}><EmailConfig /></RoleProtectedRoute>} />
            <Route path="/pengaturan/permissions" element={<RoleProtectedRoute allowedRoles={["administrator", "super_admin"]}><PermissionsList /></RoleProtectedRoute>} />
            <Route path="/pengaturan/audit-trail" element={<RoleProtectedRoute allowedRoles={["administrator", "super_admin"]}><AuditTrail /></RoleProtectedRoute>} />
            <Route path="/pengaturan/emergency-mode" element={<RoleProtectedRoute allowedRoles={["administrator", "super_admin"]}><EmergencyMode /></RoleProtectedRoute>} />
            <Route path="/pengaturan/sidebar-template" element={<RoleProtectedRoute allowedRoles={["administrator", "super_admin"]}><SidebarTemplate /></RoleProtectedRoute>} />
            
            {/* Panduan Routes */}
            <Route path="/panduan" element={<ProtectedRoute><PanduanManual /></ProtectedRoute>} />
            <Route path="/panduan/admin" element={<RoleProtectedRoute allowedRoles={["administrator", "super_admin"]}><PanduanManualAdmin /></RoleProtectedRoute>} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
