CREATE TABLE IF NOT EXISTS public.sent_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  "to" TEXT NOT NULL,
  subject TEXT,
  body TEXT,
  status TEXT DEFAULT 'sent',
  error_message TEXT
);

ALTER TABLE public.sent_emails ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert sent_emails" ON public.sent_emails;
CREATE POLICY "Anyone can insert sent_emails" ON public.sent_emails
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated can view sent_emails" ON public.sent_emails;
CREATE POLICY "Authenticated can view sent_emails" ON public.sent_emails
  FOR SELECT TO authenticated USING (true);
