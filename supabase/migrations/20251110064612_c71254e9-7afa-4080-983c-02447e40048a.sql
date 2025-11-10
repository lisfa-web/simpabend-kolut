-- Add nomor_referensi_bank column to sp2d table
ALTER TABLE sp2d 
ADD COLUMN IF NOT EXISTS nomor_referensi_bank character varying;