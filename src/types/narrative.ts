// Core Domain Types for Narrative-Centric Market Intelligence System
// Based on the Product Vision Document

export type NarrativeId = string;
export type AssetId = string;
export type PortfolioId = string;

// Confidence trend indicators
export type ConfidenceTrend = 'up' | 'down' | 'flat';

// Belief relationship types
export type BeliefRelationship = 'reinforces' | 'conflicts' | 'depends_on';

// Assumption within a narrative
export interface Assumption {
  id: string;
  text: string;
  fragilityScore: number; // 0-100, higher = more fragile
}

// Evidence supporting or contradicting a narrative
export interface Evidence {
  id: string;
  source: string;
  description: string;
  timestamp: Date;
  weight: number; // 0-1, importance of this evidence
}

// Asset exposure to a narrative
export interface AssetExposure {
  ticker: string;
  name: string;
  exposureWeight: number; // -1 to 1, negative = inverse correlation
}

// Narrative confidence state
export interface NarrativeConfidence {
  score: number; // 0-100
  trend: ConfidenceTrend;
  lastUpdated: Date;
}

// Narrative decay configuration
export interface NarrativeDecay {
  halfLifeDays: number;
  lastReinforced: Date;
}

// Historical snapshot of a narrative
export interface NarrativeSnapshot {
  timestamp: Date;
  confidenceScore: number;
  summary: string;
}

// Core Narrative object - the spine of the entire system
export interface Narrative {
  id: NarrativeId;
  name: string;
  summary: string;
  confidence: NarrativeConfidence;
  assumptions: Assumption[];
  supportingEvidence: Evidence[];
  contradictingEvidence: Evidence[];
  decay: NarrativeDecay;
  relatedNarratives: {
    reinforces: NarrativeId[];
    conflicts: NarrativeId[];
    overlaps: NarrativeId[];
  };
  affectedAssets: AssetExposure[];
  history: NarrativeSnapshot[];
  createdAt: Date;
  tags: string[];
}

// Belief Edge for the belief graph
export interface BeliefEdge {
  id: string;
  fromNarrativeId: NarrativeId;
  toNarrativeId: NarrativeId;
  relationship: BeliefRelationship;
  strength: number; // 0-1
}

// Portfolio holding
export interface Holding {
  ticker: string;
  name: string;
  weight: number; // 0-1, percentage of portfolio
  shares?: number;
  currentPrice?: number;
}

// Portfolio with narrative exposure
export interface Portfolio {
  id: PortfolioId;
  name: string;
  holdings: Holding[];
  createdAt: Date;
  updatedAt: Date;
}

// Portfolio narrative exposure analysis
export interface PortfolioNarrativeExposure {
  narrativeId: NarrativeId;
  narrativeName: string;
  portfolioExposure: number; // Aggregated exposure
  narrativeConfidence: number;
  confidenceAdjustedExposure: number;
}

// Portfolio fragility analysis
export interface FragilityAnalysis {
  totalFragility: number;
  topFragileNarratives: Array<{
    narrativeId: NarrativeId;
    narrativeName: string;
    exposure: number;
    confidence: number;
    fragility: number;
  }>;
  concentrationWarnings: string[];
  assumptionOverlaps: Array<{
    assumption: string;
    narratives: string[];
    combinedExposure: number;
  }>;
}

// Narrative drift detection
export interface NarrativeDrift {
  narrativeId: NarrativeId;
  narrativeName: string;
  previousConfidence: number;
  currentConfidence: number;
  confidenceChange: number;
  exposureImpact: number;
  explanation: string;
}

// Asset with narrative context
export interface Asset {
  ticker: string;
  name: string;
  sector: string;
  currentPrice: number;
  priceChange24h: number;
  narrativeDrivers: Array<{
    narrativeId: NarrativeId;
    narrativeName: string;
    exposure: number;
    direction: 'bullish' | 'bearish' | 'neutral';
  }>;
  conflictingForces: Array<{
    bullNarrative: string;
    bearNarrative: string;
    netEffect: number;
  }>;
}

// Chat message for AI interface
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  relatedNarratives?: NarrativeId[];
  relatedAssets?: string[];
}

// Market overview summary
export interface MarketOverview {
  dominantNarratives: Narrative[];
  risingNarratives: Narrative[];
  fadingNarratives: Narrative[];
  conflictClusters: Array<{
    narratives: Narrative[];
    tension: number;
  }>;
  marketSentiment: 'bullish' | 'bearish' | 'neutral' | 'uncertain';
}
