-- Update generate_document_number function to support ddMMyy format
CREATE OR REPLACE FUNCTION public.generate_document_number(_jenis_dokumen text, _tanggal timestamp with time zone DEFAULT now())
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _format text;
  _counter integer;
  _tahun integer;
  _bulan integer;
  _tanggal_str text;
  _nomor_final text;
  _counter_str text;
BEGIN
  -- Extract year and month from date
  _tahun := EXTRACT(YEAR FROM _tanggal);
  _bulan := EXTRACT(MONTH FROM _tanggal);
  
  -- Format date as ddMMyy
  _tanggal_str := to_char(_tanggal, 'DDMMYY');
  
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
  _nomor_final := REPLACE(_nomor_final, '{tanggal}', _tanggal_str);
  
  RETURN _nomor_final;
END;
$function$;

-- Update format for antrian_spm to use new format
UPDATE format_nomor 
SET format = '{nomor}-{tanggal}'
WHERE jenis_dokumen = 'antrian_spm' AND tahun = 2025;