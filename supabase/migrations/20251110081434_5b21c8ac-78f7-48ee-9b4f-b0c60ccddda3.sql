-- Add security configuration settings to config_sistem
INSERT INTO config_sistem (key, value, description) VALUES
  ('session_inactivity_timeout', '30', 'Timeout otomatis setelah tidak ada aktivitas (menit). Set 0 untuk disable.'),
  ('session_absolute_timeout', '480', 'Durasi maksimal session sebelum harus login ulang (menit). Set 0 untuk disable.'),
  ('session_require_reauth_after_sleep', 'true', 'Require re-authentication jika laptop sleep/hibernate lebih dari waktu yang ditentukan.'),
  ('session_sleep_threshold', '30', 'Durasi minimum sleep/hibernate sebelum require re-auth (menit).'),
  ('session_remember_me_enabled', 'true', 'Enable opsi "Remember Me" di halaman login untuk session yang lebih panjang.'),
  ('session_remember_me_duration', '10080', 'Durasi session jika "Remember Me" diaktifkan (menit, default 7 hari).')
ON CONFLICT (key) DO NOTHING;