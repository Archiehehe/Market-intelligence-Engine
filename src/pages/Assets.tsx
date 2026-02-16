import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Sparkles, Upload, FileSpreadsheet, X, TrendingUp } from 'lucide-react';
import { usePortfolio } from '@/context/PortfolioContext';
import { useNarratives } from '@/hooks/useNarratives';
import { useAIExplain } from '@/hooks/useAIExplain';
import { InfoTooltip } from '@/components/InfoTooltip';
import ReactMarkdown from 'react-markdown';

export default function Assets() {
  const { holdings, portfolioName, parseFile, clearPortfolio, error } = usePortfolio();
  const { data: narratives = [] } = useNarratives();
  const { explanation, isLoading: aiLoading, explain, reset } = useAIExplain();
  const [explainTicker, setExplainTicker] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) parseFile(file);
  }, [parseFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) parseFile(file);
  }, [parseFile]);

  const handleExplainTicker = (ticker: string, name: string) => {
    if (explainTicker === ticker) { reset(); setExplainTicker(null); return; }
    setExplainTicker(ticker);
    // Find all narrative connections
    const connections = narratives
      .filter(n => n.affectedAssets.some(a => a.ticker === ticker))
      .map(n => {
        const asset = n.affectedAssets.find(a => a.ticker === ticker);
        return `${n.name} (${Math.round((asset?.exposureWeight || 0) * 100)}% exposure, ${n.confidence.score}% confidence)`;
      })
      .join(', ');

    explain({
      type: 'portfolio_analysis',
      assetTicker: ticker,
      assetName: name,
      context: `Known narrative connections: ${connections || 'None found in tracked narratives'}`,
    });
  };

  // Get narrative exposure per holding
  const holdingsWithNarratives = holdings.map(h => {
    const matchingNarratives = narratives
      .filter(n => n.affectedAssets.some(a => a.ticker === h.ticker))
      .map(n => ({
        name: n.name,
        id: n.id,
        confidence: n.confidence.score,
        exposure: n.affectedAssets.find(a => a.ticker === h.ticker)?.exposureWeight || 0,
        direction: (n.affectedAssets.find(a => a.ticker === h.ticker)?.exposureWeight || 0) > 0 ? 'bullish' as const : 'bearish' as const,
      }));
    return { ...h, narratives: matchingNarratives };
  });

  if (holdings.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            Asset Lens
            <InfoTooltip content="Upload your portfolio to see which market narratives each of your positions is exposed to. Click any position for an AI-powered detailed analysis." />
          </h1>
          <p className="text-muted-foreground">Upload your portfolio to see narrative exposure per position</p>
        </div>

        <Card
          className={`border-2 border-dashed transition-colors ${dragOver ? 'border-primary bg-primary/5' : 'border-border'}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <CardContent className="py-16 flex flex-col items-center justify-center text-center">
            <Upload className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Import Your Portfolio</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              Drag & drop a CSV or Excel file with your holdings to see which narratives each position is exposed to.
            </p>
            <Button asChild>
              <label className="cursor-pointer">
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Browse Files
                <input type="file" accept=".csv,.xlsx,.xls" onChange={handleFileSelect} className="hidden" />
              </label>
            </Button>
            <p className="text-xs text-muted-foreground mt-4">Expected: Ticker, Name (optional), Weight/Allocation</p>
            {error && (
              <div className="mt-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            Asset Lens
            <InfoTooltip content="Each position shows its narrative exposure. Click the sparkle icon for a detailed AI analysis of why this position is affected by specific narratives." />
          </h1>
          <p className="text-muted-foreground">{portfolioName} — {holdings.length} positions, narrative exposure view</p>
        </div>
        <Button variant="outline" size="sm" onClick={clearPortfolio}>
          <X className="h-4 w-4 mr-2" /> Clear
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {holdingsWithNarratives.map(h => (
          <Card key={h.ticker} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="font-mono">{h.ticker}</CardTitle>
                  <p className="text-sm text-muted-foreground">{h.name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{Math.round(h.weight * 100)}%</Badge>
                  <button onClick={() => handleExplainTicker(h.ticker, h.name)} className="hover:bg-accent rounded p-1 transition-colors">
                    <Sparkles className="h-4 w-4 text-primary" />
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {h.narratives.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Narrative Exposure</p>
                  {h.narratives.map(n => (
                    <div key={n.id} className="flex justify-between items-center text-sm">
                      <span className="truncate mr-2">{n.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-muted-foreground">{n.confidence}%</span>
                        <Badge variant={n.direction === 'bullish' ? 'default' : 'destructive'} className="text-xs">
                          {n.direction === 'bullish' ? '+' : ''}{Math.round(n.exposure * 100)}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic">No tracked narrative exposure</p>
              )}

              {explainTicker === h.ticker && (aiLoading || explanation) && (
                <div className="mt-2 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                  {aiLoading && !explanation && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" /> Analyzing {h.ticker}...
                    </div>
                  )}
                  {explanation && (
                    <div className="prose prose-sm prose-invert max-w-none text-xs">
                      <ReactMarkdown>{explanation}</ReactMarkdown>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
