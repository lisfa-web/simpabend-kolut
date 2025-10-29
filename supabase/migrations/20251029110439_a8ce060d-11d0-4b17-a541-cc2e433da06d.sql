-- Update default status SP2D dari pending ke diterbitkan
-- Karena tidak ada lagi tahap verifikasi OTP
ALTER TABLE sp2d 
ALTER COLUMN status SET DEFAULT 'diterbitkan'::status_sp2d;

-- Update SP2D yang masih pending menjadi diterbitkan
UPDATE sp2d 
SET status = 'diterbitkan'::status_sp2d,
    updated_at = now()
WHERE status = 'pending'::status_sp2d;