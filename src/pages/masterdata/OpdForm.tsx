import { useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";
import { useOpdMutation } from "@/hooks/useOpdMutation";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const opdSchema = z.object({
  kode_opd: z.string().min(1, "Kode OPD wajib diisi"),
  nama_opd: z.string().min(1, "Nama OPD wajib diisi"),
  alamat: z.string().optional(),
  telepon: z.string().optional(),
  email: z.string().email("Email tidak valid").optional().or(z.literal("")),
  nama_bendahara: z.string().optional(),
  nomor_rekening_bendahara: z.string().optional(),
  is_active: z.boolean().optional(),
});

type OpdFormData = z.infer<typeof opdSchema>;

const OpdForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const { data: opdData } = useQuery({
    queryKey: ["opd", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("opd")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: isEdit,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<OpdFormData>({
    resolver: zodResolver(opdSchema),
  });

  const { createOpd, updateOpd } = useOpdMutation();

  useEffect(() => {
    if (opdData) {
      setValue("kode_opd", opdData.kode_opd);
      setValue("nama_opd", opdData.nama_opd);
      setValue("alamat", opdData.alamat || "");
      setValue("telepon", opdData.telepon || "");
      setValue("email", opdData.email || "");
      setValue("nama_bendahara", opdData.nama_bendahara || "");
      setValue("nomor_rekening_bendahara", opdData.nomor_rekening_bendahara || "");
      setValue("is_active", opdData.is_active);
    }
  }, [opdData, setValue]);

  const onSubmit = (data: OpdFormData) => {
    const opdData = {
      kode_opd: data.kode_opd,
      nama_opd: data.nama_opd,
      alamat: data.alamat || undefined,
      telepon: data.telepon || undefined,
      email: data.email || undefined,
      nama_bendahara: data.nama_bendahara || undefined,
      nomor_rekening_bendahara: data.nomor_rekening_bendahara || undefined,
      is_active: data.is_active ?? true,
    };

    if (isEdit) {
      updateOpd.mutate(
        { id: id!, data: opdData },
        {
          onSuccess: () => navigate("/masterdata/opd"),
        }
      );
    } else {
      createOpd.mutate(opdData, {
        onSuccess: () => navigate("/masterdata/opd"),
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/masterdata/opd")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {isEdit ? "Edit OPD" : "Tambah OPD Baru"}
            </h1>
            <p className="text-muted-foreground">
              {isEdit ? "Ubah informasi OPD" : "Buat OPD baru"}
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informasi OPD</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="kode_opd">
                    Kode OPD <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="kode_opd"
                    {...register("kode_opd")}
                    placeholder="Contoh: 1.01.01"
                  />
                  {errors.kode_opd && (
                    <p className="text-sm text-destructive">
                      {errors.kode_opd.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nama_opd">
                    Nama OPD <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="nama_opd"
                    {...register("nama_opd")}
                    placeholder="Masukkan nama OPD"
                  />
                  {errors.nama_opd && (
                    <p className="text-sm text-destructive">
                      {errors.nama_opd.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="alamat">Alamat</Label>
                  <Textarea
                    id="alamat"
                    {...register("alamat")}
                    placeholder="Masukkan alamat OPD"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telepon">Telepon</Label>
                  <Input
                    id="telepon"
                    {...register("telepon")}
                    placeholder="08xxxxxxxxxx"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register("email")}
                    placeholder="email@example.com"
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nama_bendahara">Nama Bendahara Pengeluaran</Label>
                  <Input
                    id="nama_bendahara"
                    {...register("nama_bendahara")}
                    placeholder="Masukkan nama bendahara"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nomor_rekening_bendahara">Nomor Rekening Bendahara</Label>
                  <Input
                    id="nomor_rekening_bendahara"
                    {...register("nomor_rekening_bendahara")}
                    placeholder="Masukkan nomor rekening"
                  />
                </div>

                {isEdit && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="is_active">Status Aktif</Label>
                      <Switch
                        id="is_active"
                        onCheckedChange={(checked) => setValue("is_active", checked)}
                        defaultChecked={opdData?.is_active}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/masterdata/opd")}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={createOpd.isPending || updateOpd.isPending}
                >
                  {isEdit ? "Simpan Perubahan" : "Tambah OPD"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default OpdForm;
