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
import PanduanManual from "./pages/panduan/PanduanManual";
import PanduanManualAdmin from "./pages/panduan/PanduanManualAdmin";

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
            <Route path="/initial-setup" element={<InitialSetup />} />
            <Route path="/tentang" element={<About />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            
            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            
            {/* Input SPM Routes */}
            <Route
              path="/input-spm"
              element={
                <RoleProtectedRoute allowedRoles={['bendahara_opd', 'administrator']}>
                  <InputSpmList />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/input-spm/buat"
              element={
                <RoleProtectedRoute allowedRoles={['bendahara_opd', 'administrator']}>
                  <InputSpmForm />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/input-spm/edit/:id"
              element={
                <RoleProtectedRoute allowedRoles={['bendahara_opd', 'administrator']}>
                  <InputSpmForm />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/input-spm/detail/:id"
              element={
                <RoleProtectedRoute allowedRoles={['bendahara_opd', 'administrator']}>
                  <InputSpmDetail />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/verifikasi-resepsionis"
              element={
                <RoleProtectedRoute allowedRoles={['resepsionis', 'administrator']}>
                  <VerifikasiResepsionis />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/verifikasi-pbmd"
              element={
                <RoleProtectedRoute allowedRoles={['pbmd', 'administrator']}>
                  <VerifikasiPbmd />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/verifikasi-akuntansi"
              element={
                <RoleProtectedRoute allowedRoles={['akuntansi', 'administrator']}>
                  <VerifikasiAkuntansi />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/verifikasi-perbendaharaan"
              element={
                <RoleProtectedRoute allowedRoles={['perbendaharaan', 'administrator']}>
                  <VerifikasiPerbendaharaan />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/approval-kepala-bkad"
              element={
                <RoleProtectedRoute allowedRoles={['kepala_bkad', 'administrator']}>
                  <ApprovalKepalaBkad />
                </RoleProtectedRoute>
              }
            />

            {/* User Management Routes */}
            <Route
              path="/users"
              element={
                <RoleProtectedRoute allowedRoles={['administrator']}>
                  <UserList />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/users/create"
              element={
                <RoleProtectedRoute allowedRoles={['administrator']}>
                  <UserForm />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/users/:id"
              element={
                <RoleProtectedRoute allowedRoles={['administrator']}>
                  <UserDetail />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/users/:id/edit"
              element={
                <RoleProtectedRoute allowedRoles={['administrator']}>
                  <UserForm />
                </RoleProtectedRoute>
              }
            />

            {/* Master Data Routes */}
            <Route path="/masterdata" element={<RoleProtectedRoute allowedRoles={['administrator']}><MasterDataIndex /></RoleProtectedRoute>} />
            <Route path="/masterdata/opd" element={<RoleProtectedRoute allowedRoles={['administrator']}><OpdList /></RoleProtectedRoute>} />
            <Route path="/masterdata/opd/new" element={<RoleProtectedRoute allowedRoles={['administrator']}><OpdForm /></RoleProtectedRoute>} />
            <Route path="/masterdata/opd/:id" element={<RoleProtectedRoute allowedRoles={['administrator']}><OpdForm /></RoleProtectedRoute>} />
            <Route path="/masterdata/vendor" element={<RoleProtectedRoute allowedRoles={['administrator']}><VendorList /></RoleProtectedRoute>} />
            <Route path="/masterdata/vendor/create" element={<RoleProtectedRoute allowedRoles={['administrator']}><VendorForm /></RoleProtectedRoute>} />
            <Route path="/masterdata/vendor/:id/edit" element={<RoleProtectedRoute allowedRoles={['administrator']}><VendorForm /></RoleProtectedRoute>} />
            <Route path="/masterdata/program" element={<RoleProtectedRoute allowedRoles={['administrator']}><ProgramList /></RoleProtectedRoute>} />
            <Route path="/masterdata/program/new" element={<RoleProtectedRoute allowedRoles={['administrator']}><ProgramForm /></RoleProtectedRoute>} />
            <Route path="/masterdata/program/:id" element={<RoleProtectedRoute allowedRoles={['administrator']}><ProgramForm /></RoleProtectedRoute>} />
            <Route path="/masterdata/kegiatan" element={<RoleProtectedRoute allowedRoles={['administrator']}><KegiatanList /></RoleProtectedRoute>} />
            <Route path="/masterdata/kegiatan/new" element={<RoleProtectedRoute allowedRoles={['administrator']}><KegiatanForm /></RoleProtectedRoute>} />
            <Route path="/masterdata/kegiatan/:id" element={<RoleProtectedRoute allowedRoles={['administrator']}><KegiatanForm /></RoleProtectedRoute>} />
            <Route path="/masterdata/subkegiatan" element={<RoleProtectedRoute allowedRoles={['administrator']}><SubkegiatanList /></RoleProtectedRoute>} />
            <Route path="/masterdata/subkegiatan/new" element={<RoleProtectedRoute allowedRoles={['administrator']}><SubkegiatanForm /></RoleProtectedRoute>} />
            <Route path="/masterdata/subkegiatan/:id" element={<RoleProtectedRoute allowedRoles={['administrator']}><SubkegiatanForm /></RoleProtectedRoute>} />
            <Route path="/masterdata/pejabat" element={<RoleProtectedRoute allowedRoles={['administrator']}><PejabatList /></RoleProtectedRoute>} />
            <Route path="/masterdata/pejabat/new" element={<RoleProtectedRoute allowedRoles={['administrator']}><PejabatForm /></RoleProtectedRoute>} />
            <Route path="/masterdata/pejabat/:id" element={<RoleProtectedRoute allowedRoles={['administrator']}><PejabatDetail /></RoleProtectedRoute>} />
            <Route path="/masterdata/pejabat/:id/edit" element={<RoleProtectedRoute allowedRoles={['administrator']}><PejabatForm /></RoleProtectedRoute>} />
            
            {/* SP2D Routes */}
            <Route path="/sp2d" element={<RoleProtectedRoute allowedRoles={['kuasa_bud', 'kepala_bkad', 'administrator']}><Sp2dList /></RoleProtectedRoute>} />
            <Route path="/sp2d/buat" element={<RoleProtectedRoute allowedRoles={['kuasa_bud', 'administrator']}><Sp2dForm /></RoleProtectedRoute>} />
            <Route path="/sp2d/:id" element={<RoleProtectedRoute allowedRoles={['kuasa_bud', 'kepala_bkad', 'administrator']}><Sp2dDetail /></RoleProtectedRoute>} />
            
          {/* Laporan Routes - Accessible by all authenticated users */}
          <Route path="/laporan" element={<ProtectedRoute><LaporanIndex /></ProtectedRoute>} />
          <Route path="/laporan/spm" element={<ProtectedRoute><LaporanSpm /></ProtectedRoute>} />
          <Route path="/laporan/sp2d" element={<ProtectedRoute><LaporanSp2d /></ProtectedRoute>} />
          <Route path="/laporan/verifikasi" element={<ProtectedRoute><LaporanVerifikasi /></ProtectedRoute>} />
          <Route path="/laporan/keuangan" element={<ProtectedRoute><LaporanKeuangan /></ProtectedRoute>} />

          {/* Surat Routes - Admin only */}
          <Route path="/surat" element={<RoleProtectedRoute allowedRoles={["administrator", "kepala_bkad"]}><SuratIndex /></RoleProtectedRoute>} />
          <Route path="/surat/pejabat" element={<RoleProtectedRoute allowedRoles={["administrator", "kepala_bkad"]}><PejabatList /></RoleProtectedRoute>} />
          <Route path="/surat/pejabat/buat" element={<RoleProtectedRoute allowedRoles={["administrator"]}><PejabatForm /></RoleProtectedRoute>} />
          <Route path="/surat/pejabat/:id" element={<RoleProtectedRoute allowedRoles={["administrator", "kepala_bkad"]}><PejabatDetail /></RoleProtectedRoute>} />
          <Route path="/surat/pejabat/:id/edit" element={<RoleProtectedRoute allowedRoles={["administrator"]}><PejabatForm /></RoleProtectedRoute>} />
          <Route path="/surat/template" element={<RoleProtectedRoute allowedRoles={["administrator", "kepala_bkad"]}><TemplateSuratList /></RoleProtectedRoute>} />
          <Route path="/surat/template/buat" element={<RoleProtectedRoute allowedRoles={["administrator"]}><TemplateSuratForm /></RoleProtectedRoute>} />
          <Route path="/surat/template/:id" element={<RoleProtectedRoute allowedRoles={["administrator", "kepala_bkad"]}><TemplateSuratDetail /></RoleProtectedRoute>} />
          <Route path="/surat/template/:id/edit" element={<RoleProtectedRoute allowedRoles={["administrator"]}><TemplateSuratForm /></RoleProtectedRoute>} />
          <Route path="/surat/generate" element={<RoleProtectedRoute allowedRoles={["administrator", "kepala_bkad"]}><GenerateSurat /></RoleProtectedRoute>} />

          {/* Pengaturan Routes - Super Administrator only */}
          <Route path="/pengaturan" element={<RoleProtectedRoute allowedRoles={["super_admin"]}><PengaturanIndex /></RoleProtectedRoute>} />
          <Route path="/pengaturan/config" element={<RoleProtectedRoute allowedRoles={["super_admin"]}><ConfigList /></RoleProtectedRoute>} />
          <Route path="/pengaturan/format-nomor" element={<RoleProtectedRoute allowedRoles={["super_admin"]}><FormatNomorList /></RoleProtectedRoute>} />
          <Route path="/pengaturan/format-nomor/:id/edit" element={<RoleProtectedRoute allowedRoles={["super_admin"]}><FormatNomorForm /></RoleProtectedRoute>} />
          <Route path="/pengaturan/wa-gateway" element={<RoleProtectedRoute allowedRoles={["super_admin"]}><WaGatewayConfig /></RoleProtectedRoute>} />
          <Route path="/pengaturan/email" element={<RoleProtectedRoute allowedRoles={["super_admin"]}><EmailConfig /></RoleProtectedRoute>} />
          <Route path="/pengaturan/permissions" element={<RoleProtectedRoute allowedRoles={["super_admin"]}><PermissionsList /></RoleProtectedRoute>} />
          <Route path="/pengaturan/audit-trail" element={<RoleProtectedRoute allowedRoles={["super_admin", "kepala_bkad"]}><AuditTrail /></RoleProtectedRoute>} />

          {/* Panduan Manual Routes */}
          <Route path="/panduan-manual" element={<ProtectedRoute><PanduanManual /></ProtectedRoute>} />
          <Route path="/panduan-manual/admin" element={<RoleProtectedRoute allowedRoles={["administrator"]}><PanduanManualAdmin /></RoleProtectedRoute>} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
