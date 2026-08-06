-- Add missing RLS policy for conversation_participants so users can see who is in their conversations
-- Run this in Supabase SQL Editor after supabase-schema.sql

CREATE POLICY IF NOT EXISTS "Users can view own conversation participants"
  ON public.conversation_participants
  FOR SELECT USING (auth.uid() = user_id);
