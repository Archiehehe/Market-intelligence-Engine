import { mockPortfolio, mockNarratives } from '@/data/mockNarratives';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, PieChart, TrendingUp } from 'lucide-react';

export default function Portfolio() {
  // Calculate narrative exposure
  const exposures = mockNarratives.map(narrative => {
    const exposure = mockPortfolio.holdings.reduce((sum, holding) => {
      const asset = narrative.affectedAssets.find(a => a.ticker === holding.ticker);
      return sum + (asset ? holding.weight * asset.exposureWeight : 0);
    }, 0);
    return { narrative, exposure: Math.abs(exposure), raw: exposure };
  }).filter(e => e.exposure > 0.01).sort((a, b) => b.exposure - a.exposure);

  const topExposure = exposures[0];
  const concentration = exposures.slice(0, 3).reduce((s, e) => s + e.exposure, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Portfolio Intelligence</h1>
        <p className="text-muted-foreground">Your holdings analyzed through narrative exposure</p>
      </div>

      {/* Warnings */}
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

      <div className="grid md:grid-cols-2 gap-6">
        {/* Holdings */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><PieChart className="h-5 w-5" /> Holdings</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {mockPortfolio.holdings.map(h => (
              <div key={h.ticker} className="flex justify-between items-center">
                <div><span className="font-mono font-medium">{h.ticker}</span> <span className="text-muted-foreground text-sm">{h.name}</span></div>
                <Badge variant="outline">{Math.round(h.weight * 100)}%</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Narrative Exposure */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" /> Narrative Exposure</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {exposures.slice(0, 5).map(({ narrative, exposure, raw }) => (
              <div key={narrative.id} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{narrative.name}</span>
                  <span className={raw > 0 ? 'text-green-500' : 'text-red-500'}>
                    {raw > 0 ? '+' : ''}{Math.round(raw * 100)}%
                  </span>
                </div>
                <Progress value={exposure * 100} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Insight */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="py-6">
          <p className="text-lg font-medium">"Your portfolio assumes <span className="text-primary">{topExposure?.narrative.name}</span> holds true."</p>
          <p className="text-muted-foreground mt-2">
            {Math.round(topExposure?.exposure * 100)}% exposure to this {topExposure?.narrative.confidence.score}% confidence narrative.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
