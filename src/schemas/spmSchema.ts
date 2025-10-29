import { z } from 'zod';

export const spmDataSchema = z.object({
  opd_id: z.string().uuid('OPD harus dipilih'),
  jenis_spm_id: z.string().uuid('Jenis SPM harus dipilih'),
  nilai_spm: z.number().min(1000, 'Nilai minimal Rp 1.000'),
  uraian: z.string().min(10, 'Uraian minimal 10 karakter'),
  tanggal_ajuan: z.date(),
  vendor_id: z.string().uuid().optional(),
  nama_bank: z.string().optional(),
  nomor_rekening: z.string().optional(),
  nama_rekening: z.string().optional(),
  is_aset: z.boolean().optional(),
  nomor_spm: z.string().optional(),
});

export type SpmDataFormValues = z.infer<typeof spmDataSchema>;
