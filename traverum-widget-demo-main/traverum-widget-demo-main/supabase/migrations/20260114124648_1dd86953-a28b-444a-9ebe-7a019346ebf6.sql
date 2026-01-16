-- Enable RLS on tables that have policies but RLS disabled
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.distributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hotel_configs ENABLE ROW LEVEL SECURITY;

-- Add public read policy for hotel_configs (needed for widget branding)
CREATE POLICY "Public can view active hotel configs" 
  ON hotel_configs 
  FOR SELECT 
  USING (is_active = true);

-- Add public read policy for distributions (needed to show experiences for specific hotels)
CREATE POLICY "Public can view active distributions" 
  ON distributions 
  FOR SELECT 
  USING (is_active = true);