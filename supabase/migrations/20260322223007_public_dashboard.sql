-- Make surveys readable by public
DROP POLICY IF EXISTS "Surveys are viewable by authenticated users." ON public.surveys;
DROP POLICY IF EXISTS "Surveys are viewable by everyone." ON public.surveys;
CREATE POLICY "Surveys are viewable by everyone." ON public.surveys
  FOR SELECT USING (true);

-- Make audit logs readable by public (to prevent fetch errors for unauthenticated users on dashboard)
DROP POLICY IF EXISTS "Audit logs are viewable by authenticated users." ON public.audit_logs;
DROP POLICY IF EXISTS "Audit logs are viewable by everyone." ON public.audit_logs;
CREATE POLICY "Audit logs are viewable by everyone." ON public.audit_logs
  FOR SELECT USING (true);

-- Make profiles readable by public (already present in schema, but making sure)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles
  FOR SELECT USING (true);
