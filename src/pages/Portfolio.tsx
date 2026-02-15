import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, PieChart, TrendingUp, Upload, FileSpreadsheet, X } from 'lucide-react';
import { mockNarratives } from '@/data/mockNarratives';
import * as XLSX from 'xlsx';

interface Holding {
  ticker: string;
  name: string;
  weight: number;
}

export default function Portfolio() {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [portfolioName, setPortfolioName] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parseFile = useCallback((file: File) => {
    setError(null);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        let rows: string[][] = [];

        if (file.name.endsWith('.csv')) {
          const text = data as string;
          rows = text.split('\n').map(row => row.split(',').map(c => c.trim().replace(/"/g, '')));
        } else {
          const workbook = XLSX.read(data, { type: 'array' });
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          rows = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1 });
        }

        // Find header row - look for ticker/symbol and weight/allocation columns
        const headerRow = rows.findIndex(row =>
          row.some(cell => /ticker|symbol/i.test(String(cell))) &&
          row.some(cell => /weight|allocation|%|percent/i.test(String(cell)))
        );

        if (headerRow === -1) {
          // Try simpler format: just ticker, name, weight columns
          const parsed: Holding[] = [];
          for (const row of rows.slice(1)) {
            if (row.length >= 2) {
              const ticker = String(row[0]).trim().toUpperCase();
              const name = row.length >= 3 ? String(row[1]).trim() : ticker;
              const weightStr = String(row[row.length >= 3 ? 2 : 1]).replace('%', '').trim();
              const weight = parseFloat(weightStr);
              if (ticker && !isNaN(weight) && weight > 0) {
                parsed.push({ ticker, name, weight: weight > 1 ? weight / 100 : weight });
              }
            }
          }
          if (parsed.length > 0) {
            setHoldings(parsed);
            setPortfolioName(file.name.replace(/\.(csv|xlsx|xls)$/i, ''));
            return;
          }
          setError('Could not parse file. Expected columns: Ticker/Symbol, Name (optional), Weight/Allocation');
          return;
        }

        const headers = rows[headerRow].map(h => String(h).toLowerCase());
        const tickerIdx = headers.findIndex(h => /ticker|symbol/i.test(h));
        const nameIdx = headers.findIndex(h => /name|company|description/i.test(h));
        const weightIdx = headers.findIndex(h => /weight|allocation|%|percent/i.test(h));

        const parsed: Holding[] = [];
        for (const row of rows.slice(headerRow + 1)) {
          const ticker = String(row[tickerIdx] || '').trim().toUpperCase();
          const name = nameIdx >= 0 ? String(row[nameIdx] || '').trim() : ticker;
          const weightStr = String(row[weightIdx] || '').replace('%', '').trim();
          const weight = parseFloat(weightStr);
          if (ticker && !isNaN(weight) && weight > 0) {
            parsed.push({ ticker, name, weight: weight > 1 ? weight / 100 : weight });
          }
        }

        if (parsed.length === 0) {
          setError('No valid holdings found in file');
          return;
        }

        setHoldings(parsed);
        setPortfolioName(file.name.replace(/\.(csv|xlsx|xls)$/i, ''));
      } catch {
        setError('Failed to parse file. Please check the format.');
      }
    };

    if (file.name.endsWith('.csv')) {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  }, []);

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

  // Calculate narrative exposure from imported holdings
  const exposures = mockNarratives.map(narrative => {
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
          <h1 className="text-3xl font-bold">Portfolio Intelligence</h1>
          <p className="text-muted-foreground">Import your holdings to analyze narrative exposure</p>
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
              Drag & drop a CSV or Excel file with your holdings. Expected columns: Ticker/Symbol, Name (optional), Weight/Allocation.
            </p>
            <div className="flex gap-3">
              <Button asChild>
                <label className="cursor-pointer">
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Browse Files
                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-4">Supports CSV, XLSX, XLS</p>
            {error && (
              <div className="mt-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                {error}
              </div>
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
          <h1 className="text-3xl font-bold">Portfolio Intelligence</h1>
          <p className="text-muted-foreground">
            {portfolioName || 'Your portfolio'} — {holdings.length} holdings analyzed
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => { setHoldings([]); setPortfolioName(''); }}>
          <X className="h-4 w-4 mr-2" /> Clear Portfolio
        </Button>
      </div>

      {exposures.length > 0 && (
        <Card className="border-yellow-500/50 bg-yellow-500/5">
          <CardContent className="py-4 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
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
              <p className="text-muted-foreground text-sm">No narrative matches found for your holdings. Try adding tickers that match tracked narratives.</p>
            ) : (
              exposures.slice(0, 5).map(({ narrative, exposure, raw }) => (
                <div key={narrative.id} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{narrative.name}</span>
                    <span className={raw > 0 ? 'text-green-500' : 'text-red-500'}>
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
