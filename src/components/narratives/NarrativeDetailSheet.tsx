import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Clock, 
  ThumbsUp, 
  ThumbsDown,
  Link2,
  AlertTriangle,
  BarChart3,
  History
} from 'lucide-react';
import { Narrative } from '@/types/narrative';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow, format } from 'date-fns';

interface NarrativeDetailSheetProps {
  narrative: Narrative | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NarrativeDetailSheet({ narrative, open, onOpenChange }: NarrativeDetailSheetProps) {
  if (!narrative) return null;

  const confidenceColor = 
    narrative.confidence.score >= 70 ? 'hsl(var(--confidence-high))' :
    narrative.confidence.score >= 40 ? 'hsl(var(--confidence-medium))' :
    'hsl(var(--confidence-low))';

  const TrendIcon = 
    narrative.confidence.trend === 'up' ? TrendingUp :
    narrative.confidence.trend === 'down' ? TrendingDown :
    Minus;

  const trendColor = 
    narrative.confidence.trend === 'up' ? 'text-green-500' :
    narrative.confidence.trend === 'down' ? 'text-red-500' :
    'text-muted-foreground';

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-hidden">
        <SheetHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div>
              <SheetTitle className="text-xl">{narrative.name}</SheetTitle>
              <div className="flex flex-wrap gap-1 mt-2">
                {narrative.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2">
                <span 
                  className="text-3xl font-bold font-mono"
                  style={{ color: confidenceColor }}
                >
                  {narrative.confidence.score}
                </span>
                <TrendIcon className={cn("h-6 w-6", trendColor)} />
              </div>
              <span className="text-xs text-muted-foreground">confidence score</span>
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-140px)] pr-4">
          <div className="space-y-6">
            {/* Summary */}
            <section>
              <p className="text-muted-foreground">{narrative.summary}</p>
            </section>

            <Separator />

            {/* Confidence & Decay */}
            <section className="space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Confidence Analysis
              </h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">Last Updated</div>
                  <div className="font-medium">
                    {formatDistanceToNow(narrative.confidence.lastUpdated, { addSuffix: true })}
                  </div>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">Decay Half-Life</div>
                  <div className="font-medium">{narrative.decay.halfLifeDays} days</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Time Since Reinforced
                  </span>
                  <span>{formatDistanceToNow(narrative.decay.lastReinforced)}</span>
                </div>
                <Progress 
                  value={Math.min(100, (Date.now() - narrative.decay.lastReinforced.getTime()) / (narrative.decay.halfLifeDays * 24 * 60 * 60 * 1000) * 100)} 
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground">
                  Confidence decays without reinforcing evidence
                </p>
              </div>
            </section>

            <Separator />

            {/* Supporting Evidence */}
            <section className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2 text-green-600">
                <ThumbsUp className="h-4 w-4" />
                Supporting Evidence ({narrative.supportingEvidence.length})
              </h4>
              <div className="space-y-2">
                {narrative.supportingEvidence.map(evidence => (
                  <div 
                    key={evidence.id}
                    className="p-3 border border-green-500/20 bg-green-500/5 rounded-lg"
                  >
                    <div className="flex items-start justify-between mb-1">
                      <span className="font-medium text-sm">{evidence.source}</span>
                      <Badge variant="outline" className="text-xs">
                        {Math.round(evidence.weight * 100)}% weight
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{evidence.description}</p>
                    <div className="text-xs text-muted-foreground mt-2">
                      {formatDistanceToNow(evidence.timestamp, { addSuffix: true })}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Contradicting Evidence */}
            <section className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2 text-red-500">
                <ThumbsDown className="h-4 w-4" />
                Contradicting Evidence ({narrative.contradictingEvidence.length})
              </h4>
              {narrative.contradictingEvidence.length > 0 ? (
                <div className="space-y-2">
                  {narrative.contradictingEvidence.map(evidence => (
                    <div 
                      key={evidence.id}
                      className="p-3 border border-red-500/20 bg-red-500/5 rounded-lg"
                    >
                      <div className="flex items-start justify-between mb-1">
                        <span className="font-medium text-sm">{evidence.source}</span>
                        <Badge variant="outline" className="text-xs">
                          {Math.round(evidence.weight * 100)}% weight
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{evidence.description}</p>
                      <div className="text-xs text-muted-foreground mt-2">
                        {formatDistanceToNow(evidence.timestamp, { addSuffix: true })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  No contradicting evidence recorded
                </p>
              )}
            </section>

            <Separator />

            {/* Key Assumptions */}
            <section className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                Key Assumptions
              </h4>
              <p className="text-xs text-muted-foreground">
                What must be true for this narrative to hold
              </p>
              <div className="space-y-2">
                {narrative.assumptions.map(assumption => (
                  <div 
                    key={assumption.id}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg"
                  >
                    <span className="text-sm flex-1 mr-2">{assumption.text}</span>
                    <div className="flex items-center gap-2">
                      <Progress 
                        value={assumption.fragilityScore} 
                        className="w-16 h-2"
                      />
                      <Badge 
                        variant={assumption.fragilityScore > 50 ? "destructive" : "secondary"}
                        className="text-xs shrink-0"
                      >
                        {assumption.fragilityScore}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <Separator />

            {/* Related Narratives */}
            <section className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <Link2 className="h-4 w-4" />
                Related Narratives
              </h4>
              <div className="space-y-2">
                {narrative.relatedNarratives.reinforces.length > 0 && (
                  <div>
                    <span className="text-xs text-green-600 font-medium">Reinforces:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {narrative.relatedNarratives.reinforces.map(id => (
                        <Badge key={id} variant="outline" className="text-green-600 border-green-600/30">
                          {id}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {narrative.relatedNarratives.conflicts.length > 0 && (
                  <div>
                    <span className="text-xs text-red-500 font-medium">Conflicts:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {narrative.relatedNarratives.conflicts.map(id => (
                        <Badge key={id} variant="outline" className="text-red-500 border-red-500/30">
                          {id}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>

            <Separator />

            {/* Affected Assets */}
            <section className="space-y-3">
              <h4 className="font-semibold">Affected Assets</h4>
              <div className="grid grid-cols-2 gap-2">
                {narrative.affectedAssets.map(asset => (
                  <div 
                    key={asset.ticker}
                    className="flex items-center justify-between p-2 bg-muted rounded-lg"
                  >
                    <div>
                      <span className="font-mono font-medium">{asset.ticker}</span>
                      <span className="text-xs text-muted-foreground ml-1">{asset.name}</span>
                    </div>
                    <Badge variant={asset.exposureWeight > 0 ? "default" : "destructive"}>
                      {asset.exposureWeight > 0 ? '+' : ''}{Math.round(asset.exposureWeight * 100)}%
                    </Badge>
                  </div>
                ))}
              </div>
            </section>

            {/* History */}
            {narrative.history.length > 0 && (
              <>
                <Separator />
                <section className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <History className="h-4 w-4" />
                    History
                  </h4>
                  <div className="space-y-2">
                    {narrative.history.map((snapshot, i) => (
                      <div key={i} className="flex items-start gap-3 text-sm">
                        <div className="text-xs text-muted-foreground shrink-0 w-20">
                          {format(snapshot.timestamp, 'MMM d')}
                        </div>
                        <div className="h-2 w-2 rounded-full bg-primary mt-1.5" />
                        <div className="flex-1">
                          <div className="font-mono text-xs mb-1">
                            Confidence: {snapshot.confidenceScore}%
                          </div>
                          <p className="text-muted-foreground">{snapshot.summary}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
