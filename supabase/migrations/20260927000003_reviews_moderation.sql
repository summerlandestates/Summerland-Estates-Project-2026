-- Real review system: persistence, edit/delete by author, owner responses,
-- flagging for admin moderation. The reviews table already exists as a
-- child of listings; this migration adds the missing columns and policies.
--
-- Run in the Supabase SQL Editor after 20260927000002_applications_bids.sql.

ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS reviewer_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS response text,
  ADD COLUMN IF NOT EXISTS response_at timestamptz,
  ADD COLUMN IF NOT EXISTS flagged boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS flag_reason text,
  ADD COLUMN IF NOT EXISTS removed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can read reviews that haven't been removed by moderation
DROP POLICY IF EXISTS "reviews_select_public" ON public.reviews;
CREATE POLICY "reviews_select_public" ON public.reviews
  FOR SELECT
  USING (removed = false);

-- Admins can still see removed reviews
DROP POLICY IF EXISTS "reviews_select_admin" ON public.reviews;
CREATE POLICY "reviews_select_admin" ON public.reviews
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- Any authenticated user can leave a review as themselves
DROP POLICY IF EXISTS "reviews_insert_auth" ON public.reviews;
CREATE POLICY "reviews_insert_auth" ON public.reviews
  FOR INSERT TO authenticated
  WITH CHECK (reviewer_id = auth.uid());

-- Reviewers can edit or delete their own reviews
DROP POLICY IF EXISTS "reviews_update_own" ON public.reviews;
CREATE POLICY "reviews_update_own" ON public.reviews
  FOR UPDATE TO authenticated
  USING (reviewer_id = auth.uid())
  WITH CHECK (reviewer_id = auth.uid());

DROP POLICY IF EXISTS "reviews_delete_own" ON public.reviews;
CREATE POLICY "reviews_delete_own" ON public.reviews
  FOR DELETE TO authenticated
  USING (reviewer_id = auth.uid());

-- The profile owner can update a review to add their response.
-- listings.user_id is the profile owner's auth id.
DROP POLICY IF EXISTS "reviews_update_owner_response" ON public.reviews;
CREATE POLICY "reviews_update_owner_response" ON public.reviews
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id = reviews.listing_id
        AND l.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id = reviews.listing_id
        AND l.user_id = auth.uid()
    )
  );

-- Prevent the owner-response policy above from being abused: when the updater
-- is NOT the reviewer and NOT an admin (i.e. the profile owner responding),
-- only response/response_at/updated_at may change — rating, comment, flags,
-- reviewer identity, etc. stay pinned to their previous values.
CREATE OR REPLACE FUNCTION public.reviews_guard_owner_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NOT NULL
     AND NEW.reviewer_id IS DISTINCT FROM auth.uid()
     AND NOT EXISTS (
       SELECT 1 FROM public.profiles p
       WHERE p.id = auth.uid() AND p.role = 'admin'
     )
  THEN
    NEW.reviewer_id   := OLD.reviewer_id;
    NEW.reviewer_name := OLD.reviewer_name;
    NEW.reviewer_role := OLD.reviewer_role;
    NEW.rating        := OLD.rating;
    NEW.comment       := OLD.comment;
    NEW.verified      := OLD.verified;
    NEW.flagged       := OLD.flagged;
    NEW.flag_reason   := OLD.flag_reason;
    NEW.removed       := OLD.removed;
    NEW.listing_id    := OLD.listing_id;
    NEW.created_at    := OLD.created_at;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS reviews_guard_owner_update ON public.reviews;
CREATE TRIGGER reviews_guard_owner_update
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.reviews_guard_owner_update();

-- Moderation: admins can update or delete any review
DROP POLICY IF EXISTS "reviews_update_admin" ON public.reviews;
CREATE POLICY "reviews_update_admin" ON public.reviews
  FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

DROP POLICY IF EXISTS "reviews_delete_admin" ON public.reviews;
CREATE POLICY "reviews_delete_admin" ON public.reviews
  FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- Allow reviews (and events/articles) to be reported through the reports table
ALTER TABLE public.reports DROP CONSTRAINT IF EXISTS reports_target_type_check;
ALTER TABLE public.reports
  ADD CONSTRAINT reports_target_type_check
  CHECK (target_type IN ('profile', 'job', 'message', 'service_request', 'review', 'event', 'article', 'post'));

CREATE INDEX IF NOT EXISTS idx_reviews_listing_id ON public.reviews(listing_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_id ON public.reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_flagged ON public.reviews(flagged) WHERE flagged = true;

-- Admins can update report status (resolve/dismiss) and remove reviews
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS resolved_at timestamptz;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS resolved_by uuid REFERENCES auth.users(id);

DROP POLICY IF EXISTS "reports_update_admin" ON public.reports;
CREATE POLICY "reports_update_admin" ON public.reports
  FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );
