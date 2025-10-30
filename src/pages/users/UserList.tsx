import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { usePagination } from "@/hooks/usePagination";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Eye, Edit, Key, Power } from "lucide-react";
import { useUserList } from "@/hooks/useUserList";
import { useUserMutation } from "@/hooks/useUserMutation";
import { useAuth } from "@/hooks/useAuth";
import { UserStatusBadge } from "./components/UserStatusBadge";
import { getRoleDisplayName } from "@/lib/auth";
import { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

const UserList = () => {
  const navigate = useNavigate();
  const { isSuperAdmin, isDemoAdmin, canWrite } = useAuth();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const pagination = usePagination(10);
  
  const isSuperAdminUser = isSuperAdmin();
  const isDemoUser = isDemoAdmin && isDemoAdmin();
  const canWriteData = canWrite && canWrite();
  const [resetPasswordDialog, setResetPasswordDialog] = useState<{
    open: boolean;
    userId: string;
    userName: string;
  }>({ open: false, userId: "", userName: "" });
  const [toggleStatusDialog, setToggleStatusDialog] = useState<{
    open: boolean;
    userId: string;
    userName: string;
    currentStatus: boolean;
  }>({ open: false, userId: "", userName: "", currentStatus: true });
  const [newPassword, setNewPassword] = useState("");

  // Calculate password strength
  const passwordStrength = useMemo(() => {
    if (!newPassword) return { score: 0, label: "", color: "" };
    
    let score = 0;
    
    // Length check
    if (newPassword.length >= 8) score += 25;
    if (newPassword.length >= 12) score += 15;
    
    // Has lowercase
    if (/[a-z]/.test(newPassword)) score += 15;
    
    // Has uppercase
    if (/[A-Z]/.test(newPassword)) score += 15;
    
    // Has numbers
    if (/\d/.test(newPassword)) score += 15;
    
    // Has special characters
    if (/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) score += 15;
    
    let label = "";
    let color = "";
    
    if (score < 30) {
      label = "Lemah";
      color = "text-red-600";
    } else if (score < 60) {
      label = "Sedang";
      color = "text-yellow-600";
    } else if (score < 80) {
      label = "Kuat";
      color = "text-blue-600";
    } else {
      label = "Sangat Kuat";
      color = "text-green-600";
    }
    
    return { score, label, color };
  }, [newPassword]);

  const { data: users, isLoading } = useUserList({
    search,
    role: roleFilter === "all" ? undefined : roleFilter,
    is_active: statusFilter === "all" ? undefined : statusFilter === "active",
  });

  const { resetPassword, toggleUserStatus } = useUserMutation();

  // SECURITY: Filter out super admin and demo admin users for regular admins
  // This prevents regular administrators from viewing, editing, or managing super admin/demo admin accounts
  // EDGE CASE: Super admins can see all users including other super admins and demo admins
  const filteredUsers = users?.filter((user: any) => {
    if (isSuperAdminUser) return true; // Super admin sees all users
    
    // Regular admins don't see super_admin or demo_admin users
    return !user.user_roles?.some((ur: any) => 
      ur.role === "super_admin" || ur.role === "demo_admin"
    );
  });

  const handleResetPassword = () => {
    // INPUT VALIDATION: Enforce 8 character minimum for security
    // This matches the password validation in UserForm and database schema
    if (!newPassword || newPassword.length < 8) {
      return;
    }
    resetPassword.mutate(
      {
        userId: resetPasswordDialog.userId,
        newPassword,
      },
      {
        onSuccess: () => {
          setResetPasswordDialog({ open: false, userId: "", userName: "" });
          setNewPassword("");
        },
      }
    );
  };

  const handleToggleStatus = (userId: string, currentStatus: boolean) => {
    // UX: Close confirmation dialog immediately after action to prevent double-submission
    // AUDIT: All status changes are logged in audit_log table via mutation hook
    toggleUserStatus.mutate({
      userId,
      isActive: !currentStatus,
    });
    setToggleStatusDialog({ open: false, userId: "", userName: "", currentStatus: true });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Manajemen User</h1>
            <p className="text-muted-foreground">
              Kelola user dan role akses sistem
            </p>
          </div>
          <Button onClick={() => navigate("/users/create")} disabled={isDemoUser}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah User
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Cari nama atau email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filter Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Role</SelectItem>
              <SelectItem value="administrator">Administrator</SelectItem>
              <SelectItem value="bendahara_opd">Bendahara OPD</SelectItem>
              <SelectItem value="resepsionis">Resepsionis</SelectItem>
              <SelectItem value="pbmd">PBMD</SelectItem>
              <SelectItem value="akuntansi">Akuntansi</SelectItem>
              <SelectItem value="perbendaharaan">Perbendaharaan</SelectItem>
              <SelectItem value="kepala_bkad">Kepala BKAD</SelectItem>
              <SelectItem value="kuasa_bud">Kuasa BUD</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="active">Aktif</SelectItem>
              <SelectItem value="inactive">Nonaktif</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Telepon</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Memuat data...
                  </TableCell>
                </TableRow>
              ) : filteredUsers && filteredUsers.length > 0 ? (
                pagination.paginateData(filteredUsers).map((user: any) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.full_name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone || "-"}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.user_roles?.map((ur: any) => (
                          <Badge key={ur.role} variant="outline" className="text-xs">
                            {getRoleDisplayName(ur.role)}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <UserStatusBadge isActive={user.is_active} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => navigate(`/users/${user.id}`)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Lihat Detail</p>
                            </TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => navigate(`/users/${user.id}/edit`)}
                                disabled={isDemoUser}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Edit User</p>
                            </TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  setResetPasswordDialog({
                                    open: true,
                                    userId: user.id,
                                    userName: user.full_name,
                                  })
                                }
                                disabled={isDemoUser || resetPassword.isPending}
                              >
                                <Key className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Reset Password</p>
                            </TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  setToggleStatusDialog({
                                    open: true,
                                    userId: user.id,
                                    userName: user.full_name,
                                    currentStatus: user.is_active,
                                  })
                                }
                                disabled={isDemoUser || toggleUserStatus.isPending}
                              >
                                <Power
                                  className={`h-4 w-4 ${
                                    user.is_active ? "text-green-600" : "text-gray-400"
                                  }`}
                                />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{user.is_active ? "Nonaktifkan User" : "Aktifkan User"}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Tidak ada data user
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          {filteredUsers && filteredUsers.length > 0 && (
            <DataTablePagination
              pageIndex={pagination.pagination.pageIndex}
              pageSize={pagination.pagination.pageSize}
              pageCount={pagination.getPageCount(filteredUsers.length)}
              totalItems={filteredUsers.length}
              onPageChange={pagination.goToPage}
              onPageSizeChange={pagination.setPageSize}
            />
          )}
        </div>
      </div>

      <AlertDialog
        open={resetPasswordDialog.open}
        onOpenChange={(open) =>
          !open && setResetPasswordDialog({ open: false, userId: "", userName: "" })
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Password</AlertDialogTitle>
            <AlertDialogDescription>
              Reset password untuk user: <strong>{resetPasswordDialog.userName}</strong>
              <br />
              <span className="text-xs text-muted-foreground">
                Notifikasi akan dikirim via WhatsApp jika nomor telepon tersedia.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <Input
                type="password"
                placeholder="Password baru (min. 8 karakter)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            {newPassword && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Kekuatan Password:</span>
                  <span className={`font-medium ${passwordStrength.color}`}>
                    {passwordStrength.label}
                  </span>
                </div>
                <Progress value={passwordStrength.score} className="h-2" />
                <ul className="text-xs text-muted-foreground space-y-1 mt-2">
                  <li className={newPassword.length >= 8 ? "text-green-600" : ""}>
                    ✓ Minimal 8 karakter
                  </li>
                  <li className={/[A-Z]/.test(newPassword) ? "text-green-600" : ""}>
                    ✓ Huruf besar (A-Z)
                  </li>
                  <li className={/[a-z]/.test(newPassword) ? "text-green-600" : ""}>
                    ✓ Huruf kecil (a-z)
                  </li>
                  <li className={/\d/.test(newPassword) ? "text-green-600" : ""}>
                    ✓ Angka (0-9)
                  </li>
                  <li className={/[!@#$%^&*(),.?":{}|<>]/.test(newPassword) ? "text-green-600" : ""}>
                    ✓ Karakter spesial (!@#$%...)
                  </li>
                </ul>
              </div>
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleResetPassword}
              disabled={!newPassword || newPassword.length < 8 || resetPassword.isPending}
            >
              {resetPassword.isPending ? "Mereset..." : "Reset Password"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Toggle Status Confirmation Dialog */}
      <AlertDialog
        open={toggleStatusDialog.open}
        onOpenChange={(open) =>
          !open && setToggleStatusDialog({ open: false, userId: "", userName: "", currentStatus: true })
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {toggleStatusDialog.currentStatus ? "Nonaktifkan User?" : "Aktifkan User?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Anda akan{" "}
              <strong>
                {toggleStatusDialog.currentStatus ? "menonaktifkan" : "mengaktifkan"}
              </strong>{" "}
              user: <strong>{toggleStatusDialog.userName}</strong>
              <br />
              <br />
              {toggleStatusDialog.currentStatus ? (
                <span className="text-sm text-amber-600 dark:text-amber-400">
                  ⚠️ User tidak akan bisa login ke sistem setelah dinonaktifkan.
                </span>
              ) : (
                <span className="text-sm text-green-600 dark:text-green-400">
                  ✓ User akan dapat login kembali ke sistem.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleToggleStatus(toggleStatusDialog.userId, toggleStatusDialog.currentStatus)}
              disabled={toggleUserStatus.isPending}
            >
              {toggleUserStatus.isPending 
                ? "Memproses..." 
                : toggleStatusDialog.currentStatus 
                  ? "Nonaktifkan" 
                  : "Aktifkan"
              }
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default UserList;
