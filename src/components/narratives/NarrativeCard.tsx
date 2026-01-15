import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  AlertTriangle,
  Clock,
  ThumbsUp,
  ThumbsDown,
  ChevronRight,
  Zap
} from 'lucide-react';
import { Narrative } from '@/types/narrative';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { formatDistanceToNow } from 'date-fns';

interface NarrativeCardProps {
  narrative: Narrative;
  onClick?: () => void;
  compact?: boolean;
}

export function NarrativeCard({ narrative, onClick, compact = false }: NarrativeCardProps) {
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

  // Calculate days until significant decay
  const daysSinceReinforced = Math.floor(
    (Date.now() - narrative.decay.lastReinforced.getTime()) / (1000 * 60 * 60 * 24)
  );
  const decayProgress = (daysSinceReinforced / narrative.decay.halfLifeDays) * 100;
  const isDecaying = decayProgress > 50;

  if (compact) {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Card 
          className="cursor-pointer transition-all hover:shadow-md hover:border-primary/30"
          onClick={onClick}
        >
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div 
                className="h-2 w-2 rounded-full" 
                style={{ backgroundColor: confidenceColor }}
              />
              <span className="font-medium">{narrative.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono">{narrative.confidence.score}%</span>
              <TrendIcon className={cn("h-4 w-4", trendColor)} />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className="narrative-card cursor-pointer group"
        onClick={onClick}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-semibold">{narrative.name}</h3>
                {isDecaying && (
                  <Badge variant="outline" className="text-yellow-600 border-yellow-600/30">
                    <Clock className="h-3 w-3 mr-1" />
                    Fading
                  </Badge>
                )}
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {narrative.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-2">
                <span 
                  className="text-2xl font-bold font-mono"
                  style={{ color: confidenceColor }}
                >
                  {narrative.confidence.score}
                </span>
                <TrendIcon className={cn("h-5 w-5", trendColor)} />
              </div>
              <span className="text-xs text-muted-foreground">confidence</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Summary */}
          <p className="text-sm text-muted-foreground line-clamp-2">
            {narrative.summary}
          </p>

          {/* Confidence Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Confidence</span>
              <span>
                Updated {formatDistanceToNow(narrative.confidence.lastUpdated, { addSuffix: true })}
              </span>
            </div>
            <div className="confidence-bar">
              <motion.div
                className="confidence-fill"
                initial={{ width: 0 }}
                animate={{ width: `${narrative.confidence.score}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                style={{ backgroundColor: confidenceColor }}
              />
            </div>
          </div>

          {/* Evidence Summary */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1 text-green-600">
              <ThumbsUp className="h-4 w-4" />
              <span>{narrative.supportingEvidence.length} supporting</span>
            </div>
            <div className="flex items-center gap-1 text-red-500">
              <ThumbsDown className="h-4 w-4" />
              <span>{narrative.contradictingEvidence.length} contradicting</span>
            </div>
          </div>

          {/* Key Assumptions */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <span>Key Assumptions ({narrative.assumptions.length})</span>
            </div>
            <div className="space-y-1">
              {narrative.assumptions.slice(0, 2).map(assumption => (
                <div 
                  key={assumption.id}
                  className="flex items-center justify-between text-xs p-2 bg-muted rounded-md"
                >
                  <span className="text-muted-foreground truncate mr-2">{assumption.text}</span>
                  <Badge 
                    variant={assumption.fragilityScore > 50 ? "destructive" : "secondary"}
                    className="text-xs shrink-0"
                  >
                    {assumption.fragilityScore}% fragile
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Affected Assets */}
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              <div className="flex -space-x-1">
                {narrative.affectedAssets.slice(0, 4).map(asset => (
                  <div
                    key={asset.ticker}
                    className="h-6 w-6 rounded-full bg-primary/10 border-2 border-background flex items-center justify-center"
                  >
                    <span className="text-[8px] font-bold text-primary">
                      {asset.ticker.slice(0, 2)}
                    </span>
                  </div>
                ))}
                {narrative.affectedAssets.length > 4 && (
                  <div className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                    <span className="text-[8px] font-medium">
                      +{narrative.affectedAssets.length - 4}
                    </span>
                  </div>
                )}
              </div>
              <span className="text-xs text-muted-foreground">
                {narrative.affectedAssets.length} assets
              </span>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
