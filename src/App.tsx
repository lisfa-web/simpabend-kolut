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
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
