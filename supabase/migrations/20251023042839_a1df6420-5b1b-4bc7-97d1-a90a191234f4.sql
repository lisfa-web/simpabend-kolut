-- Create email_config table for Gmail SMTP configuration
CREATE TABLE email_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  smtp_host text NOT NULL DEFAULT 'smtp.gmail.com',
  smtp_port integer NOT NULL DEFAULT 587,
  smtp_user text NOT NULL,
  smtp_password text NOT NULL,
  from_email text NOT NULL,
  from_name text NOT NULL,
  is_active boolean DEFAULT false,
  last_test_at timestamptz,
  test_status text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE email_config ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Only admins can manage email config
CREATE POLICY "Admins can manage email config"
  ON email_config FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()));

-- Trigger for updated_at
CREATE TRIGGER update_email_config_updated_at
  BEFORE UPDATE ON email_config
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();