import { useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, PieChart, TrendingUp, Upload, FileSpreadsheet, X } from 'lucide-react';
import { usePortfolio } from '@/context/PortfolioContext';
import { useNarratives } from '@/hooks/useNarratives';
import { InfoTooltip } from '@/components/InfoTooltip';

export default function Portfolio() {
  const { holdings, portfolioName, parseFile, clearPortfolio, error } = usePortfolio();
  const { data: narratives = [] } = useNarratives();
  const [dragOver, setDragOver] = [false, () => {}] as any;

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) parseFile(file);
  }, [parseFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) parseFile(file);
  }, [parseFile]);

  // Calculate narrative exposure from imported holdings
  const exposures = narratives.map(narrative => {
    const exposure = holdings.reduce((sum, holding) => {
      const asset = narrative.affectedAssets.find(a => a.ticker === holding.ticker);
      return sum + (asset ? holding.weight * asset.exposureWeight : 0);
    }, 0);
    return { narrative, exposure: Math.abs(exposure), raw: exposure };
  }).filter(e => e.exposure > 0.01).sort((a, b) => b.exposure - a.exposure);

  const topExposure = exposures[0];
  const concentration = exposures.slice(0, 3).reduce((s, e) => s + e.exposure, 0);

  if (holdings.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            Portfolio Intelligence
            <InfoTooltip content="Import your portfolio CSV/XLSX to see which market narratives your holdings are most exposed to. The system maps your tickers against tracked narratives." />
          </h1>
          <p className="text-muted-foreground">Import your holdings to analyze narrative exposure</p>
        </div>

        <Card
          className="border-2 border-dashed transition-colors border-border"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          <CardContent className="py-16 flex flex-col items-center justify-center text-center">
            <Upload className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Import Your Portfolio</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              Drag & drop a CSV or Excel file with your holdings. Expected columns: Ticker/Symbol, Name (optional), Weight/Allocation.
            </p>
            <Button asChild>
              <label className="cursor-pointer">
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Browse Files
                <input type="file" accept=".csv,.xlsx,.xls" onChange={handleFileSelect} className="hidden" />
              </label>
            </Button>
            <p className="text-xs text-muted-foreground mt-4">Supports CSV, XLSX, XLS</p>
            {error && (
              <div className="mt-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-muted/50">
          <CardContent className="py-6">
            <h3 className="font-medium mb-2">Example CSV Format</h3>
            <pre className="text-xs text-muted-foreground font-mono bg-background rounded p-3">
{`Ticker,Name,Weight
NVDA,NVIDIA,20%
MSFT,Microsoft,15%
GOOGL,Alphabet,12%
AAPL,Apple,10%`}
            </pre>
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
            Portfolio Intelligence
            <InfoTooltip content="Your portfolio mapped against active market narratives. The exposure percentages show how much of your portfolio depends on each narrative being true." />
          </h1>
          <p className="text-muted-foreground">{portfolioName || 'Your portfolio'} — {holdings.length} holdings analyzed</p>
        </div>
        <Button variant="outline" size="sm" onClick={clearPortfolio}>
          <X className="h-4 w-4 mr-2" /> Clear Portfolio
        </Button>
      </div>

      {exposures.length > 0 && (
        <Card className="border-yellow-500/50 bg-yellow-500/5">
          <CardContent className="py-4 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5" style={{ color: 'hsl(var(--confidence-medium))' }} />
            <div>
              <p className="font-medium">Belief Concentration Warning</p>
              <p className="text-sm text-muted-foreground">
                {Math.round(concentration * 100)}% of your portfolio depends on {exposures.slice(0, 3).length} narratives
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><PieChart className="h-5 w-5" /> Holdings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {holdings.map(h => (
              <div key={h.ticker} className="flex justify-between items-center">
                <div>
                  <span className="font-mono font-medium">{h.ticker}</span>{' '}
                  <span className="text-muted-foreground text-sm">{h.name}</span>
                </div>
                <Badge variant="outline">{Math.round(h.weight * 100)}%</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" /> Narrative Exposure</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {exposures.length === 0 ? (
              <p className="text-muted-foreground text-sm">No narrative matches found for your holdings.</p>
            ) : (
              exposures.slice(0, 8).map(({ narrative, exposure, raw }) => (
                <div key={narrative.id} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{narrative.name}</span>
                    <span style={{ color: raw > 0 ? 'hsl(var(--confidence-high))' : 'hsl(var(--confidence-low))' }}>
                      {raw > 0 ? '+' : ''}{Math.round(raw * 100)}%
                    </span>
                  </div>
                  <Progress value={exposure * 100} className="h-2" />
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {topExposure && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="py-6">
            <p className="text-lg font-medium">
              "Your portfolio assumes <span className="text-primary">{topExposure.narrative.name}</span> holds true."
            </p>
            <p className="text-muted-foreground mt-2">
              {Math.round(topExposure.exposure * 100)}% exposure to this {topExposure.narrative.confidence.score}% confidence narrative.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
