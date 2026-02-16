import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Narrative, BeliefEdge } from '@/types/narrative';

interface DBNarrative {
  id: string;
  name: string;
  summary: string;
  confidence_score: number;
  confidence_trend: string;
  confidence_last_updated: string;
  assumptions: any;
  supporting_evidence: any;
  contradicting_evidence: any;
  decay_half_life_days: number;
  decay_last_reinforced: string;
  related_reinforces: string[];
  related_conflicts: string[];
  related_overlaps: string[];
  affected_assets: any;
  history: any;
  tags: string[];
  created_at: string;
  updated_at: string;
}

interface DBEdge {
  id: string;
  from_narrative_id: string;
  to_narrative_id: string;
  relationship: string;
  strength: number;
}

function mapDBNarrative(row: DBNarrative): Narrative {
  const assumptions = (Array.isArray(row.assumptions) ? row.assumptions : []).map((a: any) => ({
    id: a.id || '',
    text: a.text || '',
    fragilityScore: a.fragilityScore ?? a.fragility_score ?? 50,
  }));

  const mapEvidence = (arr: any) => (Array.isArray(arr) ? arr : []).map((e: any) => ({
    id: e.id || '',
    source: e.source || '',
    description: e.description || '',
    timestamp: new Date(e.timestamp || Date.now()),
    weight: e.weight ?? 0.5,
  }));

  const affectedAssets = (Array.isArray(row.affected_assets) ? row.affected_assets : []).map((a: any) => ({
    ticker: a.ticker || '',
    name: a.name || '',
    exposureWeight: a.exposureWeight ?? a.exposure_weight ?? 0,
  }));

  const history = (Array.isArray(row.history) ? row.history : []).map((h: any) => ({
    timestamp: new Date(h.timestamp || Date.now()),
    confidenceScore: h.confidenceScore ?? h.confidence_score ?? 50,
    summary: h.summary || '',
  }));

  return {
    id: row.id,
    name: row.name,
    summary: row.summary,
    confidence: {
      score: row.confidence_score,
      trend: row.confidence_trend as 'up' | 'down' | 'flat',
      lastUpdated: new Date(row.confidence_last_updated),
    },
    assumptions,
    supportingEvidence: mapEvidence(row.supporting_evidence),
    contradictingEvidence: mapEvidence(row.contradicting_evidence),
    decay: {
      halfLifeDays: row.decay_half_life_days,
      lastReinforced: new Date(row.decay_last_reinforced),
    },
    relatedNarratives: {
      reinforces: row.related_reinforces || [],
      conflicts: row.related_conflicts || [],
      overlaps: row.related_overlaps || [],
    },
    affectedAssets,
    history,
    createdAt: new Date(row.created_at),
    tags: row.tags || [],
  };
}

function mapDBEdge(row: DBEdge): BeliefEdge {
  return {
    id: row.id,
    fromNarrativeId: row.from_narrative_id,
    toNarrativeId: row.to_narrative_id,
    relationship: row.relationship as 'reinforces' | 'conflicts' | 'depends_on',
    strength: row.strength,
  };
}

export function useNarratives() {
  return useQuery({
    queryKey: ['narratives'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('narratives')
        .select('*')
        .order('confidence_score', { ascending: false });
      if (error) throw error;
      return (data as DBNarrative[]).map(mapDBNarrative);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useBeliefEdges() {
  return useQuery({
    queryKey: ['belief_edges'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('belief_edges')
        .select('*');
      if (error) throw error;
      return (data as DBEdge[]).map(mapDBEdge);
    },
    staleTime: 5 * 60 * 1000,
  });
}
