import { mockAssets } from '@/data/mockNarratives';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function Assets() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Asset Lens</h1>
        <p className="text-muted-foreground">Individual assets through narrative context</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockAssets.map(asset => (
          <Card key={asset.ticker} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="font-mono">{asset.ticker}</CardTitle>
                  <p className="text-sm text-muted-foreground">{asset.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">${asset.currentPrice}</p>
                  <p className={`text-sm flex items-center gap-1 ${asset.priceChange24h > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {asset.priceChange24h > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {asset.priceChange24h > 0 ? '+' : ''}{asset.priceChange24h}%
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground mb-2">Narrative Drivers</p>
                <div className="space-y-2">
                  {asset.narrativeDrivers.map(d => (
                    <div key={d.narrativeId} className="flex justify-between items-center text-sm">
                      <span className="truncate mr-2">{d.narrativeName}</span>
                      <Badge variant={d.direction === 'bullish' ? 'default' : d.direction === 'bearish' ? 'destructive' : 'secondary'}>
                        {d.direction}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
              {asset.conflictingForces.length > 0 && (
                <div className="pt-2 border-t text-xs text-muted-foreground">
                  ⚡ Conflicting narratives: Net effect {asset.conflictingForces[0].netEffect > 0 ? 'bullish' : 'bearish'}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
