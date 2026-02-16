
-- Drop overly permissive policies
DROP POLICY "Service role can manage narratives" ON public.narratives;
DROP POLICY "Service role can manage belief edges" ON public.belief_edges;

-- Narratives: only service_role can write (edge functions use service role key)
CREATE POLICY "Service role inserts narratives" ON public.narratives FOR INSERT WITH CHECK (
  (SELECT current_setting('request.jwt.claims', true)::jsonb ->> 'role') = 'service_role'
);
CREATE POLICY "Service role updates narratives" ON public.narratives FOR UPDATE USING (
  (SELECT current_setting('request.jwt.claims', true)::jsonb ->> 'role') = 'service_role'
);
CREATE POLICY "Service role deletes narratives" ON public.narratives FOR DELETE USING (
  (SELECT current_setting('request.jwt.claims', true)::jsonb ->> 'role') = 'service_role'
);

CREATE POLICY "Service role inserts belief edges" ON public.belief_edges FOR INSERT WITH CHECK (
  (SELECT current_setting('request.jwt.claims', true)::jsonb ->> 'role') = 'service_role'
);
CREATE POLICY "Service role updates belief edges" ON public.belief_edges FOR UPDATE USING (
  (SELECT current_setting('request.jwt.claims', true)::jsonb ->> 'role') = 'service_role'
);
CREATE POLICY "Service role deletes belief edges" ON public.belief_edges FOR DELETE USING (
  (SELECT current_setting('request.jwt.claims', true)::jsonb ->> 'role') = 'service_role'
);
