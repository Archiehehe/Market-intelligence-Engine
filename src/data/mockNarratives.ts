import { Narrative, BeliefEdge, Portfolio, Asset, MarketOverview } from '@/types/narrative';

// Helper to create dates relative to now
const daysAgo = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000);

// Core market narratives - the beliefs driving the market
export const mockNarratives: Narrative[] = [
  {
    id: 'ai-capex-supercycle',
    name: 'AI Capex Supercycle',
    summary: 'Massive capital expenditure cycle driven by AI infrastructure buildout. Hyperscalers spending unprecedented amounts on GPUs, data centers, and AI infrastructure. Similar to previous tech infrastructure cycles but potentially larger in scale.',
    confidence: {
      score: 78,
      trend: 'up',
      lastUpdated: daysAgo(1),
    },
    assumptions: [
      { id: 'a1', text: 'AI model scaling continues to yield improvements', fragilityScore: 35 },
      { id: 'a2', text: 'Enterprise AI adoption accelerates', fragilityScore: 25 },
      { id: 'a3', text: 'GPU supply constraints persist', fragilityScore: 45 },
      { id: 'a4', text: 'No major AI regulation impacts spending', fragilityScore: 55 },
    ],
    supportingEvidence: [
      { id: 'e1', source: 'NVIDIA Earnings', description: 'Data center revenue up 400% YoY', timestamp: daysAgo(14), weight: 0.9 },
      { id: 'e2', source: 'Microsoft Capex', description: 'Azure AI spending guidance raised 30%', timestamp: daysAgo(7), weight: 0.85 },
      { id: 'e3', source: 'Meta AI Plans', description: 'Zuckerberg commits to $40B AI infrastructure', timestamp: daysAgo(21), weight: 0.8 },
    ],
    contradictingEvidence: [
      { id: 'c1', source: 'Goldman Research', description: 'Questions ROI on AI spending at current levels', timestamp: daysAgo(5), weight: 0.4 },
    ],
    decay: {
      halfLifeDays: 30,
      lastReinforced: daysAgo(1),
    },
    relatedNarratives: {
      reinforces: ['semiconductor-shortage', 'cloud-growth-reacceleration'],
      conflicts: ['tech-valuation-bubble'],
      overlaps: ['energy-demand-surge'],
    },
    affectedAssets: [
      { ticker: 'NVDA', name: 'NVIDIA', exposureWeight: 0.95 },
      { ticker: 'AMD', name: 'AMD', exposureWeight: 0.75 },
      { ticker: 'MSFT', name: 'Microsoft', exposureWeight: 0.6 },
      { ticker: 'GOOGL', name: 'Alphabet', exposureWeight: 0.55 },
      { ticker: 'AVGO', name: 'Broadcom', exposureWeight: 0.7 },
    ],
    history: [
      { timestamp: daysAgo(30), confidenceScore: 65, summary: 'Early signs of sustained AI investment' },
      { timestamp: daysAgo(14), confidenceScore: 72, summary: 'Q4 earnings confirm thesis' },
    ],
    createdAt: daysAgo(90),
    tags: ['technology', 'AI', 'infrastructure', 'semiconductors'],
  },
  {
    id: 'us-soft-landing',
    name: 'US Soft Landing',
    summary: 'The Federal Reserve successfully navigates inflation back to target without causing a recession. Employment remains strong, consumer spending resilient, and inflation gradually moderates.',
    confidence: {
      score: 62,
      trend: 'flat',
      lastUpdated: daysAgo(2),
    },
    assumptions: [
      { id: 'a1', text: 'Inflation continues gradual decline', fragilityScore: 40 },
      { id: 'a2', text: 'Labor market remains resilient', fragilityScore: 35 },
      { id: 'a3', text: 'No external shocks (geopolitical, energy)', fragilityScore: 60 },
      { id: 'a4', text: 'Fed executes rate cuts appropriately', fragilityScore: 45 },
    ],
    supportingEvidence: [
      { id: 'e1', source: 'BLS Employment', description: 'Unemployment steady at 3.7%', timestamp: daysAgo(10), weight: 0.7 },
      { id: 'e2', source: 'CPI Report', description: 'Core inflation at 3.2%, continuing downtrend', timestamp: daysAgo(15), weight: 0.75 },
    ],
    contradictingEvidence: [
      { id: 'c1', source: 'Regional Fed Survey', description: 'Manufacturing weakness spreading', timestamp: daysAgo(8), weight: 0.35 },
      { id: 'c2', source: 'Credit Card Data', description: 'Delinquencies rising among lower income', timestamp: daysAgo(12), weight: 0.4 },
    ],
    decay: {
      halfLifeDays: 14,
      lastReinforced: daysAgo(2),
    },
    relatedNarratives: {
      reinforces: ['consumer-resilience'],
      conflicts: ['recession-imminent', 'inflation-sticky'],
      overlaps: ['fed-rate-cuts'],
    },
    affectedAssets: [
      { ticker: 'SPY', name: 'S&P 500 ETF', exposureWeight: 0.6 },
      { ticker: 'XLY', name: 'Consumer Discretionary', exposureWeight: 0.7 },
      { ticker: 'XLF', name: 'Financials', exposureWeight: 0.5 },
    ],
    history: [
      { timestamp: daysAgo(60), confidenceScore: 55, summary: 'Uncertainty about inflation path' },
      { timestamp: daysAgo(30), confidenceScore: 60, summary: 'Improving economic data' },
    ],
    createdAt: daysAgo(180),
    tags: ['macro', 'fed', 'economy', 'inflation'],
  },
  {
    id: 'tech-valuation-bubble',
    name: 'Tech Valuation Bubble',
    summary: 'Current technology valuations, particularly in AI-related names, are disconnected from fundamentals. Echoes of dot-com bubble with excessive optimism and speculative positioning.',
    confidence: {
      score: 45,
      trend: 'down',
      lastUpdated: daysAgo(3),
    },
    assumptions: [
      { id: 'a1', text: 'Valuation multiples are historically extreme', fragilityScore: 30 },
      { id: 'a2', text: 'AI revenue growth will disappoint vs expectations', fragilityScore: 65 },
      { id: 'a3', text: 'Rate normalization will compress multiples', fragilityScore: 50 },
    ],
    supportingEvidence: [
      { id: 'e1', source: 'Shiller PE', description: 'CAPE ratio at 95th percentile', timestamp: daysAgo(30), weight: 0.6 },
      { id: 'e2', source: 'IPO Market', description: 'Unprofitable tech IPOs at elevated valuations', timestamp: daysAgo(45), weight: 0.4 },
    ],
    contradictingEvidence: [
      { id: 'c1', source: 'Earnings Growth', description: 'Mag 7 delivering 25%+ earnings growth', timestamp: daysAgo(14), weight: 0.7 },
      { id: 'c2', source: 'Cash Flow', description: 'Big tech generating record free cash flow', timestamp: daysAgo(20), weight: 0.65 },
    ],
    decay: {
      halfLifeDays: 21,
      lastReinforced: daysAgo(10),
    },
    relatedNarratives: {
      reinforces: ['rotation-to-value'],
      conflicts: ['ai-capex-supercycle', 'tech-earnings-strength'],
      overlaps: [],
    },
    affectedAssets: [
      { ticker: 'QQQ', name: 'Nasdaq 100 ETF', exposureWeight: -0.7 },
      { ticker: 'NVDA', name: 'NVIDIA', exposureWeight: -0.85 },
      { ticker: 'TSLA', name: 'Tesla', exposureWeight: -0.8 },
    ],
    history: [
      { timestamp: daysAgo(90), confidenceScore: 55, summary: 'Concerns about mega-cap concentration' },
      { timestamp: daysAgo(45), confidenceScore: 50, summary: 'Strong earnings reducing bubble concerns' },
    ],
    createdAt: daysAgo(120),
    tags: ['valuation', 'risk', 'technology', 'bubble'],
  },
  {
    id: 'energy-demand-surge',
    name: 'Energy Demand Surge',
    summary: 'AI data centers and electrification are driving unprecedented electricity demand growth. Utility capex cycles accelerating, with implications for power generation, grid infrastructure, and energy prices.',
    confidence: {
      score: 71,
      trend: 'up',
      lastUpdated: daysAgo(2),
    },
    assumptions: [
      { id: 'a1', text: 'AI data centers consume massive power', fragilityScore: 20 },
      { id: 'a2', text: 'Grid infrastructure requires major upgrades', fragilityScore: 25 },
      { id: 'a3', text: 'Renewable transition continues', fragilityScore: 40 },
    ],
    supportingEvidence: [
      { id: 'e1', source: 'EIA Report', description: 'Data center electricity demand up 30% YoY', timestamp: daysAgo(20), weight: 0.8 },
      { id: 'e2', source: 'Utility Guidance', description: 'Major utilities raising capex forecasts', timestamp: daysAgo(14), weight: 0.75 },
    ],
    contradictingEvidence: [
      { id: 'c1', source: 'Efficiency Gains', description: 'New GPU architectures more power efficient', timestamp: daysAgo(30), weight: 0.3 },
    ],
    decay: {
      halfLifeDays: 45,
      lastReinforced: daysAgo(2),
    },
    relatedNarratives: {
      reinforces: ['ai-capex-supercycle'],
      conflicts: [],
      overlaps: ['clean-energy-transition'],
    },
    affectedAssets: [
      { ticker: 'VST', name: 'Vistra', exposureWeight: 0.85 },
      { ticker: 'CEG', name: 'Constellation Energy', exposureWeight: 0.8 },
      { ticker: 'NEE', name: 'NextEra Energy', exposureWeight: 0.6 },
    ],
    history: [],
    createdAt: daysAgo(60),
    tags: ['energy', 'utilities', 'AI', 'infrastructure'],
  },
  {
    id: 'fed-rate-cuts',
    name: 'Fed Rate Cuts 2025',
    summary: 'The Federal Reserve will cut rates multiple times in 2025 as inflation normalizes, shifting from restrictive to neutral policy stance. Market pricing 3-4 cuts.',
    confidence: {
      score: 58,
      trend: 'down',
      lastUpdated: daysAgo(1),
    },
    assumptions: [
      { id: 'a1', text: 'Inflation reaches 2% target', fragilityScore: 50 },
      { id: 'a2', text: 'No reacceleration in economy', fragilityScore: 45 },
      { id: 'a3', text: 'Fed follows data, not politics', fragilityScore: 35 },
    ],
    supportingEvidence: [
      { id: 'e1', source: 'Fed Dot Plot', description: 'Median forecast shows 75bps cuts', timestamp: daysAgo(30), weight: 0.7 },
      { id: 'e2', source: 'Fed Speakers', description: 'Dovish pivot in December communications', timestamp: daysAgo(25), weight: 0.6 },
    ],
    contradictingEvidence: [
      { id: 'c1', source: 'January CPI', description: 'Hot inflation print raises doubts', timestamp: daysAgo(5), weight: 0.55 },
      { id: 'c2', source: 'Jobs Report', description: 'Strong payrolls suggest no urgency to cut', timestamp: daysAgo(10), weight: 0.5 },
    ],
    decay: {
      halfLifeDays: 14,
      lastReinforced: daysAgo(5),
    },
    relatedNarratives: {
      reinforces: ['us-soft-landing'],
      conflicts: ['inflation-sticky'],
      overlaps: [],
    },
    affectedAssets: [
      { ticker: 'TLT', name: 'Long-Term Treasury ETF', exposureWeight: 0.9 },
      { ticker: 'XLF', name: 'Financials', exposureWeight: -0.4 },
      { ticker: 'XLU', name: 'Utilities', exposureWeight: 0.5 },
    ],
    history: [],
    createdAt: daysAgo(45),
    tags: ['macro', 'fed', 'rates', 'bonds'],
  },
  {
    id: 'china-stimulus',
    name: 'China Stimulus Pivot',
    summary: 'Chinese authorities are shifting to aggressive stimulus to combat deflation and property crisis. Policy pivot could reignite global growth and commodity demand.',
    confidence: {
      score: 52,
      trend: 'up',
      lastUpdated: daysAgo(3),
    },
    assumptions: [
      { id: 'a1', text: 'CCP prioritizes growth over deleveraging', fragilityScore: 40 },
      { id: 'a2', text: 'Stimulus transmission works effectively', fragilityScore: 55 },
      { id: 'a3', text: 'Property sector stabilizes', fragilityScore: 65 },
    ],
    supportingEvidence: [
      { id: 'e1', source: 'PBOC Policy', description: 'Rate cuts and RRR reductions announced', timestamp: daysAgo(10), weight: 0.7 },
      { id: 'e2', source: 'Fiscal Policy', description: 'Local government debt swap program expanded', timestamp: daysAgo(15), weight: 0.6 },
    ],
    contradictingEvidence: [
      { id: 'c1', source: 'Property Data', description: 'Home sales still declining 20% YoY', timestamp: daysAgo(8), weight: 0.5 },
      { id: 'c2', source: 'Deflation Print', description: 'CPI negative for 4th straight month', timestamp: daysAgo(12), weight: 0.45 },
    ],
    decay: {
      halfLifeDays: 21,
      lastReinforced: daysAgo(3),
    },
    relatedNarratives: {
      reinforces: ['commodity-supercycle'],
      conflicts: ['china-structural-decline'],
      overlaps: [],
    },
    affectedAssets: [
      { ticker: 'FXI', name: 'China Large Cap ETF', exposureWeight: 0.9 },
      { ticker: 'BABA', name: 'Alibaba', exposureWeight: 0.8 },
      { ticker: 'FCX', name: 'Freeport McMoran', exposureWeight: 0.6 },
    ],
    history: [],
    createdAt: daysAgo(30),
    tags: ['china', 'stimulus', 'macro', 'commodities'],
  },
];

// Belief edges connecting narratives
export const mockBeliefEdges: BeliefEdge[] = [
  { id: 'e1', fromNarrativeId: 'ai-capex-supercycle', toNarrativeId: 'energy-demand-surge', relationship: 'reinforces', strength: 0.85 },
  { id: 'e2', fromNarrativeId: 'ai-capex-supercycle', toNarrativeId: 'tech-valuation-bubble', relationship: 'conflicts', strength: 0.6 },
  { id: 'e3', fromNarrativeId: 'us-soft-landing', toNarrativeId: 'fed-rate-cuts', relationship: 'reinforces', strength: 0.7 },
  { id: 'e4', fromNarrativeId: 'fed-rate-cuts', toNarrativeId: 'tech-valuation-bubble', relationship: 'conflicts', strength: 0.5 },
  { id: 'e5', fromNarrativeId: 'china-stimulus', toNarrativeId: 'us-soft-landing', relationship: 'reinforces', strength: 0.4 },
  { id: 'e6', fromNarrativeId: 'energy-demand-surge', toNarrativeId: 'fed-rate-cuts', relationship: 'conflicts', strength: 0.35 },
];

// Sample portfolio
export const mockPortfolio: Portfolio = {
  id: 'portfolio-1',
  name: 'Growth & Tech Focus',
  holdings: [
    { ticker: 'NVDA', name: 'NVIDIA', weight: 0.20 },
    { ticker: 'MSFT', name: 'Microsoft', weight: 0.15 },
    { ticker: 'GOOGL', name: 'Alphabet', weight: 0.12 },
    { ticker: 'AMD', name: 'AMD', weight: 0.08 },
    { ticker: 'AVGO', name: 'Broadcom', weight: 0.08 },
    { ticker: 'VST', name: 'Vistra', weight: 0.07 },
    { ticker: 'CEG', name: 'Constellation Energy', weight: 0.06 },
    { ticker: 'SPY', name: 'S&P 500 ETF', weight: 0.10 },
    { ticker: 'TLT', name: 'Long-Term Treasury', weight: 0.08 },
    { ticker: 'BABA', name: 'Alibaba', weight: 0.06 },
  ],
  createdAt: daysAgo(90),
  updatedAt: daysAgo(1),
};

// Sample assets with narrative context
export const mockAssets: Asset[] = [
  {
    ticker: 'NVDA',
    name: 'NVIDIA Corporation',
    sector: 'Technology',
    currentPrice: 875.35,
    priceChange24h: 2.4,
    narrativeDrivers: [
      { narrativeId: 'ai-capex-supercycle', narrativeName: 'AI Capex Supercycle', exposure: 0.95, direction: 'bullish' },
      { narrativeId: 'tech-valuation-bubble', narrativeName: 'Tech Valuation Bubble', exposure: 0.85, direction: 'bearish' },
      { narrativeId: 'china-stimulus', narrativeName: 'China Stimulus Pivot', exposure: 0.3, direction: 'bullish' },
    ],
    conflictingForces: [
      { bullNarrative: 'AI Capex Supercycle', bearNarrative: 'Tech Valuation Bubble', netEffect: 0.33 },
    ],
  },
  {
    ticker: 'VST',
    name: 'Vistra Corp',
    sector: 'Utilities',
    currentPrice: 142.80,
    priceChange24h: 1.8,
    narrativeDrivers: [
      { narrativeId: 'energy-demand-surge', narrativeName: 'Energy Demand Surge', exposure: 0.85, direction: 'bullish' },
      { narrativeId: 'ai-capex-supercycle', narrativeName: 'AI Capex Supercycle', exposure: 0.4, direction: 'bullish' },
    ],
    conflictingForces: [],
  },
  {
    ticker: 'TLT',
    name: 'iShares 20+ Year Treasury Bond ETF',
    sector: 'Fixed Income',
    currentPrice: 92.45,
    priceChange24h: -0.3,
    narrativeDrivers: [
      { narrativeId: 'fed-rate-cuts', narrativeName: 'Fed Rate Cuts 2025', exposure: 0.9, direction: 'bullish' },
      { narrativeId: 'us-soft-landing', narrativeName: 'US Soft Landing', exposure: 0.5, direction: 'neutral' },
    ],
    conflictingForces: [],
  },
];

// Market overview
export const mockMarketOverview: MarketOverview = {
  dominantNarratives: mockNarratives.filter(n => n.confidence.score >= 70),
  risingNarratives: mockNarratives.filter(n => n.confidence.trend === 'up'),
  fadingNarratives: mockNarratives.filter(n => n.confidence.trend === 'down'),
  conflictClusters: [
    {
      narratives: mockNarratives.filter(n => 
        n.id === 'ai-capex-supercycle' || n.id === 'tech-valuation-bubble'
      ),
      tension: 0.65,
    },
  ],
  marketSentiment: 'bullish',
};
