import { z } from 'zod';

export const spmDataSchema = z.object({
  opd_id: z.string().uuid('OPD harus dipilih'),
  jenis_spm_id: z.string().uuid('Jenis SPM harus dipilih'),
  nilai_spm: z.number().min(1000, 'Nilai minimal Rp 1.000'),
  uraian: z.string().min(10, 'Uraian minimal 10 karakter'),
  tanggal_ajuan: z.date({
    required_error: "Tanggal ajuan harus diisi",
    invalid_type_error: "Format tanggal tidak valid",
  }),
  tipe_penerima: z.enum(['bendahara_pengeluaran', 'vendor', 'pihak_ketiga']).optional(),
  nama_penerima: z.string().min(1, 'Nama penerima harus diisi').optional(),
  nama_bank: z.string().optional(),
  nomor_rekening: z.string().optional(),
  nama_rekening: z.string().optional(),
  is_aset: z.boolean().optional(),
  nomor_spm: z.string().optional(),
});

export type SpmDataFormValues = z.infer<typeof spmDataSchema>;
