-- Insert format nomor untuk SP2D
INSERT INTO format_nomor (jenis_dokumen, format, tahun, counter)
VALUES ('SP2D', '{COUNTER}/SP2D-BKAD/{BULAN_ROMAWI}/{TAHUN}', EXTRACT(YEAR FROM CURRENT_DATE)::integer, 0)
ON CONFLICT DO NOTHING;