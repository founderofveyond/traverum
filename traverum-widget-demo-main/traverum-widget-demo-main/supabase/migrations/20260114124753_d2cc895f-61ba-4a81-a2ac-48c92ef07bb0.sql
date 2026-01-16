-- Enable RLS on partners and users tables (they already have policies)
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;