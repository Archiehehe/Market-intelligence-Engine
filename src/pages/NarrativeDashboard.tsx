import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity,
  AlertTriangle,
  Search,
  Filter,
  Grid3X3,
  List
} from 'lucide-react';
import { mockNarratives, mockMarketOverview } from '@/data/mockNarratives';
import { Narrative } from '@/types/narrative';
import { NarrativeCard } from '@/components/narratives/NarrativeCard';
import { NarrativeDetailSheet } from '@/components/narratives/NarrativeDetailSheet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function NarrativeDashboard() {
  const [selectedNarrative, setSelectedNarrative] = useState<Narrative | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTag, setFilterTag] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Get all unique tags
  const allTags = Array.from(new Set(mockNarratives.flatMap(n => n.tags)));

  // Filter narratives
  const filteredNarratives = mockNarratives.filter(narrative => {
    const matchesSearch = narrative.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          narrative.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = filterTag === 'all' || narrative.tags.includes(filterTag);
    return matchesSearch && matchesTag;
  });

  const handleNarrativeClick = (narrative: Narrative) => {
    setSelectedNarrative(narrative);
    setSheetOpen(true);
  };

  // Stats
  const avgConfidence = Math.round(
    mockNarratives.reduce((sum, n) => sum + n.confidence.score, 0) / mockNarratives.length
  );
  const risingCount = mockNarratives.filter(n => n.confidence.trend === 'up').length;
  const fadingCount = mockNarratives.filter(n => n.confidence.trend === 'down').length;
  const highFragilityCount = mockNarratives.filter(
    n => n.assumptions.some(a => a.fragilityScore > 50)
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Narrative Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          What the market believes, why, and how exposed you are
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Narratives</p>
                  <p className="text-2xl font-bold">{mockNarratives.length}</p>
                </div>
                <Activity className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Rising / Fading</p>
                  <p className="text-2xl font-bold">
                    <span className="text-green-500">{risingCount}</span>
                    <span className="text-muted-foreground mx-1">/</span>
                    <span className="text-red-500">{fadingCount}</span>
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  <TrendingDown className="h-5 w-5 text-red-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">High Fragility</p>
                  <p className="text-2xl font-bold">{highFragilityCount}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Market Sentiment Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Market Psychology</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="default" className="bg-green-500">
                    {mockMarketOverview.marketSentiment.toUpperCase()}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {mockMarketOverview.dominantNarratives.length} dominant narratives driving sentiment
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Key Tension</p>
                <p className="text-sm font-medium">
                  AI Growth vs. Valuation Concerns
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

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
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Narrative Cards */}
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
            transition={{ delay: 0.1 * index }}
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

      {/* Detail Sheet */}
      <NarrativeDetailSheet
        narrative={selectedNarrative}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </div>
  );
}
