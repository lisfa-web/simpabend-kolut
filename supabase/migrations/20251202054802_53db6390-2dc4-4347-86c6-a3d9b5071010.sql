-- Create SEO configuration table
CREATE TABLE public.seo_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key VARCHAR(100) NOT NULL UNIQUE,
  value TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.seo_config ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can read SEO config" 
ON public.seo_config 
FOR SELECT 
USING (true);

CREATE POLICY "Only admins can modify SEO config" 
ON public.seo_config 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('administrator', 'super_admin')
  )
);

-- Insert default SEO configurations
INSERT INTO public.seo_config (key, value, description) VALUES
('site_title', 'SIMPA BEND BKADKU - Sistem Informasi Manajemen Pertanggungjawaban Bendahara', 'Judul utama website'),
('site_description', 'Platform digital untuk memonitor, mengontrol, mendokumentasi, dan memvalidasi proses SPM SP2D pertanggungjawaban Bendahara Kabupaten Kolaka Utara', 'Deskripsi meta untuk SEO'),
('site_keywords', 'SIMPA BEND, BKAD, Kolaka Utara, SPM, SP2D, Bendahara, Keuangan Daerah, Pertanggungjawaban', 'Keywords untuk SEO'),
('og_image', '/og-image.png', 'Open Graph image URL'),
('twitter_handle', '@bkadkolut', 'Twitter handle'),
('google_verification', '', 'Google Search Console verification code'),
('bing_verification', '', 'Bing Webmaster verification code'),
('robots_txt', 'User-agent: *
Allow: /
Sitemap: https://simpa-bend.lovable.app/sitemap.xml', 'Robots.txt content'),
('canonical_url', 'https://simpa-bend.lovable.app', 'Canonical base URL'),
('structured_data_org', '{"@context":"https://schema.org","@type":"GovernmentOrganization","name":"BKAD Kabupaten Kolaka Utara","url":"https://simpa-bend.lovable.app","logo":"https://simpa-bend.lovable.app/logo.png","address":{"@type":"PostalAddress","addressLocality":"Kolaka Utara","addressRegion":"Sulawesi Tenggara","addressCountry":"ID"}}', 'Organization structured data JSON-LD');

-- Create trigger for updated_at
CREATE TRIGGER update_seo_config_updated_at
BEFORE UPDATE ON public.seo_config
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();