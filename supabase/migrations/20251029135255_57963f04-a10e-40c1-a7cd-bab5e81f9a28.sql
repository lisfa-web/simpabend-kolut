-- Update existing nomor_antrian to new format (nomor-ddMMyy)
UPDATE spm
SET nomor_antrian = CONCAT(
  -- Extract numeric part from existing nomor_antrian (e.g., "A-014" -> "014")
  LPAD(
    REGEXP_REPLACE(
      COALESCE(nomor_antrian, '000'),
      '[^0-9]',
      '',
      'g'
    )::integer::text,
    3,
    '0'
  ),
  '-',
  -- Format tanggal_resepsionis as ddMMyy
  to_char(COALESCE(tanggal_resepsionis, tanggal_ajuan, created_at), 'DDMMYY')
)
WHERE nomor_antrian IS NOT NULL
  AND nomor_antrian NOT LIKE '%-%-%'; -- Only update old format (avoid re-updating)