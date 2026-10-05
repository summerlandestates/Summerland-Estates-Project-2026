-- Recognition nominations require the nominee (employee) to approve before featuring.
ALTER TABLE public.recognitions
  ADD COLUMN IF NOT EXISTS nominee_email text,
  ADD COLUMN IF NOT EXISTS nominee_status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS nominee_responded_at timestamptz;

-- Nominees can see and respond to nominations addressed to their account email
DROP POLICY IF EXISTS "recognitions_nominee_select" ON public.recognitions;
CREATE POLICY "recognitions_nominee_select" ON public.recognitions
  FOR SELECT TO authenticated
  USING (
    nominee_email = (SELECT email FROM public.profiles WHERE id = auth.uid())
    OR nominee_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "recognitions_nominee_update" ON public.recognitions;
CREATE POLICY "recognitions_nominee_update" ON public.recognitions
  FOR UPDATE TO authenticated
  USING (
    nominee_email = (SELECT email FROM public.profiles WHERE id = auth.uid())
    OR nominee_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
  WITH CHECK (
    nominee_email = (SELECT email FROM public.profiles WHERE id = auth.uid())
    OR nominee_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );
