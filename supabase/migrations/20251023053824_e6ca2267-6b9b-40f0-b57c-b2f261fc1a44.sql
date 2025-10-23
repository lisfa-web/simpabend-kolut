-- Function to convert month to Roman numerals
CREATE OR REPLACE FUNCTION public.month_to_roman(month_num integer)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  RETURN CASE month_num
    WHEN 1 THEN 'I'
    WHEN 2 THEN 'II'
    WHEN 3 THEN 'III'
    WHEN 4 THEN 'IV'
    WHEN 5 THEN 'V'
    WHEN 6 THEN 'VI'
    WHEN 7 THEN 'VII'
    WHEN 8 THEN 'VIII'
    WHEN 9 THEN 'IX'
    WHEN 10 THEN 'X'
    WHEN 11 THEN 'XI'
    WHEN 12 THEN 'XII'
    ELSE 'I'
  END;
END;
$$;

-- Function to generate document number based on format
CREATE OR REPLACE FUNCTION public.generate_document_number(
  _jenis_dokumen text,
  _tanggal timestamptz DEFAULT now()
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _format text;
  _counter integer;
  _tahun integer;
  _bulan integer;
  _nomor_final text;
  _counter_str text;
BEGIN
  -- Extract year and month from date
  _tahun := EXTRACT(YEAR FROM _tanggal);
  _bulan := EXTRACT(MONTH FROM _tanggal);
  
  -- Lock and get format_nomor row for this document type and year
  SELECT format, counter + 1
  INTO _format, _counter
  FROM format_nomor
  WHERE jenis_dokumen = _jenis_dokumen 
    AND tahun = _tahun
  FOR UPDATE;
  
  -- If no format exists, raise error
  IF _format IS NULL THEN
    RAISE EXCEPTION 'Format nomor untuk % tahun % belum dikonfigurasi', _jenis_dokumen, _tahun;
  END IF;
  
  -- Update counter
  UPDATE format_nomor
  SET counter = _counter, updated_at = now()
  WHERE jenis_dokumen = _jenis_dokumen 
    AND tahun = _tahun;
  
  -- Build the number string with zero padding (3 digits)
  _counter_str := LPAD(_counter::text, 3, '0');
  
  -- Replace placeholders in format
  _nomor_final := _format;
  _nomor_final := REPLACE(_nomor_final, '{nomor}', _counter_str);
  _nomor_final := REPLACE(_nomor_final, '{tahun}', _tahun::text);
  _nomor_final := REPLACE(_nomor_final, '{bulan}', LPAD(_bulan::text, 2, '0'));
  _nomor_final := REPLACE(_nomor_final, '{romawi_bulan}', month_to_roman(_bulan));
  
  RETURN _nomor_final;
END;
$$;

-- Trigger function to assign SPM number when status changes to 'diajukan'
CREATE OR REPLACE FUNCTION public.assign_spm_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only assign number if status is 'diajukan' and nomor_spm is NULL
  IF NEW.status = 'diajukan' AND NEW.nomor_spm IS NULL THEN
    NEW.nomor_spm := generate_document_number('spm', COALESCE(NEW.tanggal_ajuan, now()));
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create triggers for automatic SPM numbering
DROP TRIGGER IF EXISTS trigger_assign_spm_number_insert ON public.spm;
CREATE TRIGGER trigger_assign_spm_number_insert
  BEFORE INSERT ON public.spm
  FOR EACH ROW
  EXECUTE FUNCTION assign_spm_number();

DROP TRIGGER IF EXISTS trigger_assign_spm_number_update ON public.spm;
CREATE TRIGGER trigger_assign_spm_number_update
  BEFORE UPDATE OF status ON public.spm
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION assign_spm_number();

-- Backfill: Assign numbers to existing non-draft SPM without nomor_spm
UPDATE public.spm
SET nomor_spm = generate_document_number('spm', COALESCE(tanggal_ajuan, now()))
WHERE nomor_spm IS NULL
  AND status IN ('diajukan', 'resepsionis_verifikasi', 'pbmd_verifikasi', 'akuntansi_validasi', 
                 'perbendaharaan_verifikasi', 'kepala_bkad_review', 'disetujui');