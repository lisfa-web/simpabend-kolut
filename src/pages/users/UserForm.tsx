import { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Eye, EyeOff, AlertCircle, CheckCircle2, Mail } from "lucide-react";
import { useUserMutation } from "@/hooks/useUserMutation";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UserRoleSelect } from "./components/UserRoleSelect";
import { Database } from "@/integrations/supabase/types";
import { useAuth } from "@/hooks/useAuth";
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

type AppRole = Database["public"]["Enums"]["app_role"];

const userSchema = z.object({
  email: z.string()
    .trim()
    .email("Email tidak valid")
    .max(255, "Email maksimal 255 karakter")
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Format email tidak valid")
    .optional(),
  password: z.string()
    .min(8, "Password minimal 8 karakter")
    .max(128, "Password maksimal 128 karakter")
    .optional(),
  confirmPassword: z.string().optional(),
  full_name: z.string()
    .trim()
    .min(1, "Nama lengkap wajib diisi")
    .max(100, "Nama maksimal 100 karakter"),
  phone: z.string()
    .trim()
    .regex(/^(\+62|62|0)[0-9]{9,12}$/, "Format nomor telepon tidak valid (contoh: 081234567890)")
    .optional()
    .or(z.literal("")),
  is_active: z.boolean().optional(),
  roles: z.array(z.object({
    role: z.string(),
    opd_id: z.string().optional().nullable(),
  })).min(1, "Minimal 1 role harus dipilih"),
}).refine(
  (data) => {
    // Only validate password match when creating new user
    if (data.password && data.confirmPassword) {
      return data.password === data.confirmPassword;
    }
    return true;
  },
  {
    message: "Password tidak cocok",
    path: ["confirmPassword"],
  }
);

type UserFormData = z.infer<typeof userSchema>;

const UserForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const { isSuperAdmin } = useAuth();

  const [roles, setRoles] = useState<{ role: AppRole; opd_id?: string }[]>([]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [newEmail, setNewEmail] = useState("");

  const { data: userData } = useQuery({
    queryKey: ["user", id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("role, opd_id")
        .eq("user_id", id);

      if (rolesError) throw rolesError;

      return {
        ...profile,
        user_roles: roles || [],
      };
    },
    enabled: isEdit,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    clearErrors,
    control,
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      full_name: "",
      phone: "",
      is_active: true,
      roles: [],
    },
  });

  const { createUser, updateUser, updateEmail } = useUserMutation();

  // Password strength calculator
  const passwordStrength = useMemo(() => {
    if (!password) return { score: 0, label: "", color: "" };
    
    let score = 0;
    
    // Length check
    if (password.length >= 8) score += 25;
    if (password.length >= 12) score += 15;
    
    // Has lowercase
    if (/[a-z]/.test(password)) score += 15;
    
    // Has uppercase
    if (/[A-Z]/.test(password)) score += 15;
    
    // Has numbers
    if (/\d/.test(password)) score += 15;
    
    // Has special characters
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 15;
    
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
  }, [password]);

  // Register 'roles' field since it's managed outside of RHF inputs
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    register("roles" as any);
  }, [register]);

  // Populate form with fetched user data (only runs when userData changes)
  useEffect(() => {
    if (userData) {
      // FIX: Convert opd_id properly - use null instead of undefined to prevent object conversion
      let userRoles = userData.user_roles?.map((ur: any) => ({
        role: ur.role,
        opd_id: ur.opd_id || null,
      })).filter((r: any) => r !== null) || [];
      
      // SECURITY: Filter out super_admin and demo_admin roles if current user is not super admin
      // This prevents privilege escalation attacks where regular admins might see or modify super admin roles
      if (!isSuperAdmin()) {
        userRoles = userRoles.filter((r: any) => 
          r.role !== 'demo_admin' && r.role !== 'super_admin'
        );
      }
      
      setRoles(userRoles);

      reset({
        full_name: userData.full_name,
        phone: userData.phone || "",
        is_active: userData.is_active ?? true,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        roles: userRoles as any,
      });
      clearErrors(["roles"]);
    }
  }, [userData, reset, clearErrors, isSuperAdmin]);

  // Sync roles with RHF when changed via UserRoleSelect
  // This ensures form validation stays in sync with the role selection component
  // IMPORTANT: Only sync when roles state changes (not when userData changes)
  // to prevent overriding user's manual role changes
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setValue("roles" as any, roles as any, { shouldValidate: true });
    if (roles.length > 0) clearErrors(["roles"]);
  }, [roles, setValue, clearErrors]);

  const onSubmit = (data: UserFormData) => {
    console.log("Form submitted with data:", data);
    console.log("Current roles:", roles);
    console.log("is_active value:", data.is_active);
    
    // BUG FIX: Use data.roles from form instead of state roles
    // to ensure we get the validated and current form values
    const submittedRoles = (data as any).roles || roles;
    
    if (isEdit) {
      updateUser.mutate(
        {
          id: id!,
          full_name: data.full_name,
          phone: data.phone,
          is_active: data.is_active ?? true,
          roles: submittedRoles,
        },
        {
          onSuccess: () => {
            console.log("Update successful");
            // Wait for toast to show before navigating
            setTimeout(() => navigate("/users"), 1500);
          },
          onError: (error) => {
            console.error("Update failed:", error);
          },
        }
      );
    } else {
      if (!data.email || !data.password) {
        return;
      }
      createUser.mutate(
        {
          email: data.email,
          password: data.password,
          full_name: data.full_name,
          phone: data.phone,
          roles: submittedRoles,
        },
        {
          onSuccess: () => {
            // Wait for toast to show before navigating
            setTimeout(() => navigate("/users"), 1500);
          },
        }
      );
    }
  };

  const handleUpdateEmail = () => {
    if (!newEmail || !id) return;
    
    updateEmail.mutate(
      { userId: id, newEmail },
      {
        onSuccess: () => {
          setShowEmailDialog(false);
          setNewEmail("");
        },
      }
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/users")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {isEdit ? "Edit User" : "Tambah User Baru"}
            </h1>
            <p className="text-muted-foreground">
              {isEdit ? "Ubah informasi user" : "Buat user baru untuk sistem"}
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informasi User</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit, (validationErrors) => {
              console.log("Form validation errors:", validationErrors);
            })} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="full_name">
                    Nama Lengkap <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="full_name"
                    {...register("full_name")}
                    placeholder="Masukkan nama lengkap"
                  />
                  {errors.full_name && (
                    <p className="text-sm text-destructive">{errors.full_name.message}</p>
                  )}
                </div>

                {isEdit ? (
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="flex gap-2">
                      <Input
                        id="email"
                        type="email"
                        value={userData?.email || ""}
                        disabled
                        className="bg-muted cursor-not-allowed flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setShowEmailDialog(true)}
                        title="Edit Email"
                      >
                        <Mail className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Klik ikon untuk mengubah email
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="email">
                      Email <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      {...register("email")}
                      placeholder="user@example.com"
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive">{errors.email.message}</p>
                    )}
                  </div>
                )}

                {!isEdit && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="password">
                        Password <span className="text-destructive">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            setValue("password", e.target.value, { shouldValidate: true });
                          }}
                          placeholder="Minimal 8 karakter"
                          error={!!errors.password}
                          success={password.length >= 8 && passwordStrength.score >= 60}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                      
                      {/* Password Strength Indicator */}
                      {password && (
                        <div className="space-y-2 animate-fade-in">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Kekuatan Password:</span>
                            <span className={`font-medium ${passwordStrength.color}`}>
                              {passwordStrength.label}
                            </span>
                          </div>
                          <Progress value={passwordStrength.score} className="h-2" />
                          <ul className="text-xs text-muted-foreground space-y-1">
                            <li className={password.length >= 8 ? "text-green-600" : ""}>
                              {password.length >= 8 ? "✓" : "○"} Minimal 8 karakter
                            </li>
                            <li className={/[A-Z]/.test(password) ? "text-green-600" : ""}>
                              {/[A-Z]/.test(password) ? "✓" : "○"} Huruf besar (A-Z)
                            </li>
                            <li className={/[a-z]/.test(password) ? "text-green-600" : ""}>
                              {/[a-z]/.test(password) ? "✓" : "○"} Huruf kecil (a-z)
                            </li>
                            <li className={/\d/.test(password) ? "text-green-600" : ""}>
                              {/\d/.test(password) ? "✓" : "○"} Angka (0-9)
                            </li>
                            <li className={/[!@#$%^&*(),.?":{}|<>]/.test(password) ? "text-green-600" : ""}>
                              {/[!@#$%^&*(),.?":{}|<>]/.test(password) ? "✓" : "○"} Karakter spesial (!@#$%...)
                            </li>
                          </ul>
                        </div>
                      )}
                      
                      {errors.password && (
                        <p className="text-sm text-destructive flex items-center gap-2">
                          <AlertCircle className="h-3 w-3" />
                          {errors.password.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">
                        Konfirmasi Password <span className="text-destructive">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => {
                            setConfirmPassword(e.target.value);
                            setValue("confirmPassword", e.target.value, { shouldValidate: true });
                          }}
                          placeholder="Ulangi password"
                          error={!!errors.confirmPassword}
                          success={confirmPassword && password === confirmPassword}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                      
                      {/* Match Indicator */}
                      {confirmPassword && (
                        <div className={`text-xs flex items-center gap-2 animate-fade-in ${
                          password === confirmPassword ? "text-green-600" : "text-amber-600"
                        }`}>
                          {password === confirmPassword ? (
                            <>
                              <CheckCircle2 className="h-3 w-3" />
                              <span>Password cocok</span>
                            </>
                          ) : (
                            <>
                              <AlertCircle className="h-3 w-3" />
                              <span>Password belum cocok</span>
                            </>
                          )}
                        </div>
                      )}
                      
                      {errors.confirmPassword && (
                        <p className="text-sm text-destructive flex items-center gap-2">
                          <AlertCircle className="h-3 w-3" />
                          {errors.confirmPassword.message}
                        </p>
                      )}
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="phone">Telepon</Label>
                  <Controller
                    name="phone"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="phone"
                        value={field.value || ""}
                        onChange={(e) => {
                          let value = e.target.value;
                          // Auto-convert 0 prefix to 62
                          if (value.startsWith("0")) {
                            value = "62" + value.slice(1);
                          }
                          field.onChange(value);
                        }}
                        placeholder="62812xxxxxxxx"
                      />
                    )}
                  />
                  {errors.phone && (
                    <p className="text-sm text-destructive">{errors.phone.message}</p>
                  )}
                </div>

                {isEdit && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="is_active">Status Aktif</Label>
                      <Controller
                        name="is_active"
                        control={control}
                        render={({ field }) => (
                          <Switch
                            id="is_active"
                            checked={!!field.value}
                            onCheckedChange={(checked) => {
                              console.log("Switch changed to:", checked);
                              field.onChange(checked);
                              setValue("is_active", checked, { 
                                shouldDirty: true, 
                                shouldValidate: true 
                              });
                            }}
                          />
                        )}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>
                  Role <span className="text-destructive">*</span>
                </Label>
                <UserRoleSelect
                  value={roles}
                  onChange={(newRoles) => {
                    console.log('[UserForm] Roles changed', newRoles);
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    setRoles(newRoles as any);
                    setValue("roles" as any, newRoles as any, { shouldValidate: true, shouldDirty: true });
                    clearErrors(["roles"]);
                  }}
                  isSuperAdmin={isSuperAdmin()}
                />
                {errors.roles && (
                  <p className="text-sm text-destructive">{errors.roles.message}</p>
                )}
              </div>

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/users")}
                  disabled={createUser.isPending || updateUser.isPending}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={createUser.isPending || updateUser.isPending}
                >
                  {createUser.isPending || updateUser.isPending
                    ? "Menyimpan..."
                    : isEdit
                    ? "Simpan Perubahan"
                    : "Buat User"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Email Update Dialog */}
      <AlertDialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ubah Email User</AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm">Email saat ini: <span className="font-semibold">{userData?.email}</span></p>
                <div className="space-y-2">
                  <Label htmlFor="new-email">Email Baru</Label>
                  <Input
                    id="new-email"
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="email.baru@example.com"
                  />
                </div>
              </div>
              
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md p-4 space-y-2">
                <p className="text-sm font-semibold text-amber-800 dark:text-amber-200 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Peringatan Penting
                </p>
                <ul className="text-xs text-amber-700 dark:text-amber-300 space-y-1 list-disc list-inside">
                  <li>User akan otomatis logout dari sistem</li>
                  <li>User harus login dengan email baru</li>
                  <li>Pastikan email baru sudah benar sebelum menyimpan</li>
                  <li>Perubahan ini akan dicatat di audit log</li>
                </ul>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowEmailDialog(false);
              setNewEmail("");
            }}>
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleUpdateEmail}
              disabled={!newEmail || updateEmail.isPending}
            >
              {updateEmail.isPending ? "Mengubah..." : "Ubah Email"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default UserForm;
