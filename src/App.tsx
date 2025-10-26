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
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/tentang" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
