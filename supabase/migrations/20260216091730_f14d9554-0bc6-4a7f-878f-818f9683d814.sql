
-- Narratives table
CREATE TABLE public.narratives (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  summary TEXT NOT NULL,
  confidence_score INTEGER NOT NULL DEFAULT 50,
  confidence_trend TEXT NOT NULL DEFAULT 'flat' CHECK (confidence_trend IN ('up', 'down', 'flat')),
  confidence_last_updated TIMESTAMPTZ NOT NULL DEFAULT now(),
  assumptions JSONB NOT NULL DEFAULT '[]',
  supporting_evidence JSONB NOT NULL DEFAULT '[]',
  contradicting_evidence JSONB NOT NULL DEFAULT '[]',
  decay_half_life_days INTEGER NOT NULL DEFAULT 30,
  decay_last_reinforced TIMESTAMPTZ NOT NULL DEFAULT now(),
  related_reinforces TEXT[] NOT NULL DEFAULT '{}',
  related_conflicts TEXT[] NOT NULL DEFAULT '{}',
  related_overlaps TEXT[] NOT NULL DEFAULT '{}',
  affected_assets JSONB NOT NULL DEFAULT '[]',
  history JSONB NOT NULL DEFAULT '[]',
  tags TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Belief edges table
CREATE TABLE public.belief_edges (
  id TEXT PRIMARY KEY,
  from_narrative_id TEXT NOT NULL REFERENCES public.narratives(id) ON DELETE CASCADE,
  to_narrative_id TEXT NOT NULL REFERENCES public.narratives(id) ON DELETE CASCADE,
  relationship TEXT NOT NULL CHECK (relationship IN ('reinforces', 'conflicts', 'depends_on')),
  strength REAL NOT NULL DEFAULT 0.5
);

-- Enable RLS
ALTER TABLE public.narratives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.belief_edges ENABLE ROW LEVEL SECURITY;

-- Public read access (narratives are public data)
CREATE POLICY "Anyone can read narratives" ON public.narratives FOR SELECT USING (true);
CREATE POLICY "Anyone can read belief edges" ON public.belief_edges FOR SELECT USING (true);

-- Service role can insert/update/delete (for edge functions)
CREATE POLICY "Service role can manage narratives" ON public.narratives FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role can manage belief edges" ON public.belief_edges FOR ALL USING (true) WITH CHECK (true);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_narratives_updated_at
  BEFORE UPDATE ON public.narratives
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
