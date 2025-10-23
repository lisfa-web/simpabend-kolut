import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft } from "lucide-react";
import { useUserMutation } from "@/hooks/useUserMutation";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UserRoleSelect } from "./components/UserRoleSelect";
import { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

const userSchema = z.object({
  email: z.string().email("Email tidak valid").optional(),
  password: z.string().min(6, "Password minimal 6 karakter").optional(),
  full_name: z.string().min(1, "Nama lengkap wajib diisi"),
  phone: z.string().optional(),
  is_active: z.boolean().optional(),
  roles: z.array(z.object({
    role: z.string(),
    opd_id: z.string().optional(),
  })).min(1, "Minimal 1 role harus dipilih"),
});

type UserFormData = z.infer<typeof userSchema>;

const UserForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [roles, setRoles] = useState<{ role: AppRole; opd_id?: string }[]>([]);

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
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
  });

  const { createUser, updateUser } = useUserMutation();

  useEffect(() => {
    if (userData) {
      setValue("full_name", userData.full_name);
      setValue("phone", userData.phone || "");
      if (isEdit) {
        setValue("is_active", userData.is_active);
      }
      
      const userRoles = userData.user_roles?.map((ur: any) => ({
        role: ur.role,
        opd_id: ur.opd_id,
      })) || [];
      setRoles(userRoles);
    }
  }, [userData, setValue, isEdit]);

  const onSubmit = (data: UserFormData) => {
    if (isEdit) {
      updateUser.mutate(
        {
          id: id!,
          full_name: data.full_name,
          phone: data.phone,
          is_active: data.is_active ?? true,
          roles,
        },
        {
          onSuccess: () => navigate("/users"),
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
          roles,
        },
        {
          onSuccess: () => navigate("/users"),
        }
      );
    }
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
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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

                {!isEdit && (
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

                <div className="space-y-2">
                  <Label htmlFor="phone">Telepon</Label>
                  <Input
                    id="phone"
                    {...register("phone")}
                    placeholder="08xxxxxxxxxx"
                  />
                  {errors.phone && (
                    <p className="text-sm text-destructive">{errors.phone.message}</p>
                  )}
                </div>

                {!isEdit && (
                  <div className="space-y-2">
                    <Label htmlFor="password">
                      Password <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      {...register("password")}
                      placeholder="Minimal 6 karakter"
                    />
                    {errors.password && (
                      <p className="text-sm text-destructive">{errors.password.message}</p>
                    )}
                  </div>
                )}

                {isEdit && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="is_active">Status Aktif</Label>
                      <Switch
                        id="is_active"
                        onCheckedChange={(checked) => setValue("is_active", checked)}
                        defaultChecked={userData?.is_active}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>
                  Role <span className="text-destructive">*</span>
                </Label>
                <UserRoleSelect value={roles} onChange={setRoles} />
                {errors.roles && (
                  <p className="text-sm text-destructive">{errors.roles.message}</p>
                )}
              </div>

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/users")}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={createUser.isPending || updateUser.isPending}
                >
                  {isEdit ? "Simpan Perubahan" : "Buat User"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default UserForm;
