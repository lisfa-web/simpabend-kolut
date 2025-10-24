-- Add test mode configuration for OTP
INSERT INTO config_sistem (key, value, description)
VALUES 
  ('otp_test_mode', 'true', 'Enable static OTP for testing phase'),
  ('otp_test_code', '123456', 'Static OTP code for testing phase')
ON CONFLICT (key) DO UPDATE
SET value = EXCLUDED.value, description = EXCLUDED.description;