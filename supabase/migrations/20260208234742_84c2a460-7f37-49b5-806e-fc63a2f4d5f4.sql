-- Add RLS policy to allow video deletion via service role (from edge functions)
-- The edge function uses service_role_key which bypasses RLS, but we also need to allow
-- the system to delete videos linked to user projects

CREATE POLICY "System can delete videos from user projects"
ON public.videos
FOR DELETE
USING (EXISTS (
  SELECT 1 FROM projects
  WHERE projects.id = videos.project_id
  AND projects.user_id = auth.uid()
));