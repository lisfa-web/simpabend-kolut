-- Create dashboard_layout table for storing widget configurations
CREATE TABLE public.dashboard_layout (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  layout_config JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.dashboard_layout ENABLE ROW LEVEL SECURITY;

-- Only admins can manage dashboard layouts
CREATE POLICY "Admins can manage dashboard layouts"
ON public.dashboard_layout
FOR ALL
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Create trigger for updated_at
CREATE TRIGGER update_dashboard_layout_updated_at
BEFORE UPDATE ON public.dashboard_layout
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();