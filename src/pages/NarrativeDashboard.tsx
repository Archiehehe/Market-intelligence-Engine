import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  AlertTriangle,
  Search,
  Filter,
  Grid3X3,
  List,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { Narrative } from '@/types/narrative';
import { NarrativeCard } from '@/components/narratives/NarrativeCard';
import { NarrativeDetailSheet } from '@/components/narratives/NarrativeDetailSheet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { InfoTooltip } from '@/components/InfoTooltip';
import { useNarratives } from '@/hooks/useNarratives';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function NarrativeDashboard() {
  const { data: narratives = [], isLoading, refetch } = useNarratives();
  const [selectedNarrative, setSelectedNarrative] = useState<Narrative | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTag, setFilterTag] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [seeding, setSeeding] = useState(false);

  // Auto-seed if DB is empty
  useEffect(() => {
    if (!isLoading && narratives.length === 0 && !seeding) {
      seedNarratives();
    }
  }, [isLoading, narratives.length]);

  const seedNarratives = async () => {
    setSeeding(true);
    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/update-narratives`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({}),
      });
      if (resp.ok) {
        setTimeout(() => refetch(), 2000);
      }
    } catch (e) {
      console.error('Seed error:', e);
    } finally {
      setSeeding(false);
    }
  };

  const allTags = Array.from(new Set(narratives.flatMap(n => n.tags)));

  const filteredNarratives = narratives.filter(narrative => {
    const matchesSearch = narrative.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          narrative.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = filterTag === 'all' || narrative.tags.includes(filterTag);
    return matchesSearch && matchesTag;
  });

  const handleNarrativeClick = (narrative: Narrative) => {
    setSelectedNarrative(narrative);
    setSheetOpen(true);
  };

  const avgConfidence = narratives.length > 0
    ? Math.round(narratives.reduce((sum, n) => sum + n.confidence.score, 0) / narratives.length)
    : 0;
  const risingCount = narratives.filter(n => n.confidence.trend === 'up').length;
  const fadingCount = narratives.filter(n => n.confidence.trend === 'down').length;
  const highFragilityCount = narratives.filter(
    n => n.assumptions.some(a => a.fragilityScore > 50)
  ).length;

  if (isLoading || seeding) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            Narrative Dashboard
            {seeding && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
          </h1>
          <p className="text-muted-foreground mt-1">
            {seeding ? 'AI is generating narratives from current market conditions...' : 'Loading narratives...'}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-64 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            Narrative Dashboard
            <InfoTooltip content="Market narratives are collective beliefs that drive asset prices. Each card shows confidence levels, key assumptions, and affected tickers. Click any narrative for detailed AI analysis." />
          </h1>
          <p className="text-muted-foreground mt-1">
            What the market believes, why, and how exposed you are
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={seedNarratives} disabled={seeding}>
          <RefreshCw className={`h-4 w-4 mr-2 ${seeding ? 'animate-spin' : ''}`} />
          Refresh with AI
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Narratives</p>
                  <p className="text-2xl font-bold">{narratives.length}</p>
                </div>
                <Activity className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Confidence</p>
                  <p className="text-2xl font-bold">{avgConfidence}%</p>
                </div>
                <div
                  className="h-8 w-8 rounded-full flex items-center justify-center"
                  style={{
                    backgroundColor: `hsl(var(--confidence-${avgConfidence >= 70 ? 'high' : avgConfidence >= 40 ? 'medium' : 'low'}) / 0.1)`,
                    color: `hsl(var(--confidence-${avgConfidence >= 70 ? 'high' : avgConfidence >= 40 ? 'medium' : 'low'}))`
                  }}
                >
                  <span className="text-sm font-bold">%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Rising / Fading</p>
                  <p className="text-2xl font-bold">
                    <span style={{ color: 'hsl(var(--confidence-high))' }}>{risingCount}</span>
                    <span className="text-muted-foreground mx-1">/</span>
                    <span style={{ color: 'hsl(var(--confidence-low))' }}>{fadingCount}</span>
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-5 w-5" style={{ color: 'hsl(var(--confidence-high))' }} />
                  <TrendingDown className="h-5 w-5" style={{ color: 'hsl(var(--confidence-low))' }} />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">High Fragility</p>
                  <p className="text-2xl font-bold">{highFragilityCount}</p>
                </div>
                <AlertTriangle className="h-8 w-8" style={{ color: 'hsl(var(--confidence-medium))' }} />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search narratives..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Select value={filterTag} onValueChange={setFilterTag}>
            <SelectTrigger className="w-[140px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tags</SelectItem>
              {allTags.map(tag => (
                <SelectItem key={tag} value={tag}>{tag}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex border rounded-md">
            <Button variant={viewMode === 'grid' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('grid')}>
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button variant={viewMode === 'list' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('list')}>
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className={
        viewMode === 'grid'
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          : "space-y-4"
      }>
        {filteredNarratives.map((narrative, index) => (
          <motion.div
            key={narrative.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * index }}
          >
            <NarrativeCard
              narrative={narrative}
              onClick={() => handleNarrativeClick(narrative)}
              compact={viewMode === 'list'}
            />
          </motion.div>
        ))}
      </div>

      {filteredNarratives.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No narratives match your search</p>
        </div>
      )}

      <NarrativeDetailSheet
        narrative={selectedNarrative}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </div>
  );
}
