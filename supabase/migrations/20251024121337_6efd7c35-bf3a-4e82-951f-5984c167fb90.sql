-- Insert file size configuration entries
INSERT INTO public.config_sistem (key, description, value) VALUES
  ('max_file_size_dokumen_spm', 'Ukuran maksimal file Dokumen SPM (dalam MB)', '5'),
  ('max_file_size_tbk', 'Ukuran maksimal file TBK (dalam MB)', '5'),
  ('max_file_size_spj', 'Ukuran maksimal file SPJ (dalam MB)', '5'),
  ('max_file_size_lainnya', 'Ukuran maksimal file Lampiran Lainnya (dalam MB)', '10')
ON CONFLICT (key) DO NOTHING;