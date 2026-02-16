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
  History,
  Sparkles,
  Loader2
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
import { Button } from '@/components/ui/button';
import { formatDistanceToNow, format } from 'date-fns';
import { useAIExplain } from '@/hooks/useAIExplain';
import ReactMarkdown from 'react-markdown';
import { useState } from 'react';

interface NarrativeDetailSheetProps {
  narrative: Narrative | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NarrativeDetailSheet({ narrative, open, onOpenChange }: NarrativeDetailSheetProps) {
  const { explanation, isLoading, explain, reset } = useAIExplain();
  const [explainTarget, setExplainTarget] = useState<string | null>(null);

  if (!narrative) return null;

  const confidenceColor =
    narrative.confidence.score >= 70 ? 'hsl(var(--confidence-high))' :
    narrative.confidence.score >= 40 ? 'hsl(var(--confidence-medium))' :
    'hsl(var(--confidence-low))';

  const TrendIcon =
    narrative.confidence.trend === 'up' ? TrendingUp :
    narrative.confidence.trend === 'down' ? TrendingDown : Minus;

  const trendColor =
    narrative.confidence.trend === 'up' ? 'text-green-500' :
    narrative.confidence.trend === 'down' ? 'text-red-500' :
    'text-muted-foreground';

  const handleAssetExplain = (asset: { ticker: string; name: string; exposureWeight: number }) => {
    const key = `asset-${asset.ticker}`;
    if (explainTarget === key) { reset(); setExplainTarget(null); return; }
    setExplainTarget(key);
    explain({
      type: 'asset_exposure',
      narrativeName: narrative.name,
      narrativeSummary: narrative.summary,
      assetTicker: asset.ticker,
      assetName: asset.name,
      exposureWeight: asset.exposureWeight,
    });
  };

  const handleEvidenceExplain = (evidence: { id: string; source: string; description: string }) => {
    const key = `evidence-${evidence.id}`;
    if (explainTarget === key) { reset(); setExplainTarget(null); return; }
    setExplainTarget(key);
    explain({
      type: 'evidence',
      narrativeName: narrative.name,
      narrativeSummary: narrative.summary,
      evidenceSource: evidence.source,
      evidenceDescription: evidence.description,
    });
  };

  return (
    <Sheet open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) { reset(); setExplainTarget(null); } }}>
      <SheetContent className="w-full sm:max-w-xl overflow-hidden">
        <SheetHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div>
              <SheetTitle className="text-xl">{narrative.name}</SheetTitle>
              <div className="flex flex-wrap gap-1 mt-2">
                {narrative.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                ))}
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold font-mono" style={{ color: confidenceColor }}>
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
            <section>
              <p className="text-muted-foreground">{narrative.summary}</p>
            </section>

            <Separator />

            {/* Confidence & Decay */}
            <section className="space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <BarChart3 className="h-4 w-4" /> Confidence Analysis
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
            </section>

            <Separator />

            {/* Supporting Evidence */}
            <section className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2" style={{ color: 'hsl(var(--confidence-high))' }}>
                <ThumbsUp className="h-4 w-4" />
                Supporting Evidence ({narrative.supportingEvidence.length})
              </h4>
              <div className="space-y-2">
                {narrative.supportingEvidence.map(evidence => (
                  <div key={evidence.id}>
                    <div
                      className="p-3 border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors"
                      style={{ borderColor: 'hsl(var(--confidence-high) / 0.2)', backgroundColor: 'hsl(var(--confidence-high) / 0.05)' }}
                      onClick={() => handleEvidenceExplain(evidence)}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <span className="font-medium text-sm">{evidence.source}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">{Math.round(evidence.weight * 100)}% weight</Badge>
                          <Sparkles className="h-3 w-3 text-primary" />
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{evidence.description}</p>
                      <div className="text-xs text-muted-foreground mt-2">
                        {formatDistanceToNow(evidence.timestamp, { addSuffix: true })}
                      </div>
                    </div>
                    {explainTarget === `evidence-${evidence.id}` && (isLoading || explanation) && (
                      <div className="mt-2 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                        {isLoading && !explanation && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" /> Analyzing...
                          </div>
                        )}
                        {explanation && (
                          <div className="prose prose-sm prose-invert max-w-none">
                            <ReactMarkdown>{explanation}</ReactMarkdown>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Contradicting Evidence */}
            <section className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2" style={{ color: 'hsl(var(--confidence-low))' }}>
                <ThumbsDown className="h-4 w-4" />
                Contradicting Evidence ({narrative.contradictingEvidence.length})
              </h4>
              {narrative.contradictingEvidence.length > 0 ? (
                <div className="space-y-2">
                  {narrative.contradictingEvidence.map(evidence => (
                    <div key={evidence.id}>
                      <div
                        className="p-3 border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors"
                        style={{ borderColor: 'hsl(var(--confidence-low) / 0.2)', backgroundColor: 'hsl(var(--confidence-low) / 0.05)' }}
                        onClick={() => handleEvidenceExplain(evidence)}
                      >
                        <div className="flex items-start justify-between mb-1">
                          <span className="font-medium text-sm">{evidence.source}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">{Math.round(evidence.weight * 100)}% weight</Badge>
                            <Sparkles className="h-3 w-3 text-primary" />
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{evidence.description}</p>
                        <div className="text-xs text-muted-foreground mt-2">
                          {formatDistanceToNow(evidence.timestamp, { addSuffix: true })}
                        </div>
                      </div>
                      {explainTarget === `evidence-${evidence.id}` && (isLoading || explanation) && (
                        <div className="mt-2 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                          {isLoading && !explanation && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Loader2 className="h-4 w-4 animate-spin" /> Analyzing...
                            </div>
                          )}
                          {explanation && (
                            <div className="prose prose-sm prose-invert max-w-none">
                              <ReactMarkdown>{explanation}</ReactMarkdown>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">No contradicting evidence recorded</p>
              )}
            </section>

            <Separator />

            {/* Key Assumptions */}
            <section className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" style={{ color: 'hsl(var(--confidence-medium))' }} />
                Key Assumptions
              </h4>
              <div className="space-y-2">
                {narrative.assumptions.map(assumption => (
                  <div key={assumption.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="text-sm flex-1 mr-2">{assumption.text}</span>
                    <div className="flex items-center gap-2">
                      <Progress value={assumption.fragilityScore} className="w-16 h-2" />
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

            {/* Affected Assets - clickable for AI explanation */}
            <section className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                Affected Assets
                <span className="text-xs text-muted-foreground font-normal">(click for AI rationale)</span>
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {narrative.affectedAssets.map(asset => (
                  <div key={asset.ticker}>
                    <div
                      className="flex items-center justify-between p-2 bg-muted rounded-lg cursor-pointer hover:bg-accent transition-colors"
                      onClick={() => handleAssetExplain(asset)}
                    >
                      <div>
                        <span className="font-mono font-medium">{asset.ticker}</span>
                        <span className="text-xs text-muted-foreground ml-1">{asset.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Badge variant={asset.exposureWeight > 0 ? "default" : "destructive"}>
                          {asset.exposureWeight > 0 ? '+' : ''}{Math.round(asset.exposureWeight * 100)}%
                        </Badge>
                        <Sparkles className="h-3 w-3 text-primary" />
                      </div>
                    </div>
                    {explainTarget === `asset-${asset.ticker}` && (isLoading || explanation) && (
                      <div className="mt-2 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                        {isLoading && !explanation && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" /> Analyzing...
                          </div>
                        )}
                        {explanation && (
                          <div className="prose prose-sm prose-invert max-w-none">
                            <ReactMarkdown>{explanation}</ReactMarkdown>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Related Narratives */}
            <Separator />
            <section className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <Link2 className="h-4 w-4" /> Related Narratives
              </h4>
              <div className="space-y-2">
                {narrative.relatedNarratives.reinforces.length > 0 && (
                  <div>
                    <span className="text-xs font-medium" style={{ color: 'hsl(var(--confidence-high))' }}>Reinforces:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {narrative.relatedNarratives.reinforces.map(id => (
                        <Badge key={id} variant="outline" className="border-green-600/30" style={{ color: 'hsl(var(--confidence-high))' }}>{id}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {narrative.relatedNarratives.conflicts.length > 0 && (
                  <div>
                    <span className="text-xs font-medium" style={{ color: 'hsl(var(--confidence-low))' }}>Conflicts:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {narrative.relatedNarratives.conflicts.map(id => (
                        <Badge key={id} variant="outline" className="border-red-500/30" style={{ color: 'hsl(var(--confidence-low))' }}>{id}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
