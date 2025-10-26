-- Add sidebar template configuration
INSERT INTO config_sistem (key, value, description) 
VALUES (
  'sidebar_template', 
  'blue-gradient', 
  'Template/tema sidebar yang digunakan. Pilihan: blue-gradient, emerald-clean, slate-elegant'
)
ON CONFLICT (key) DO NOTHING;