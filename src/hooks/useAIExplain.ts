import { useState } from 'react';

const EXPLAIN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/narrative-explain`;

interface StreamExplainParams {
  type: 'asset_exposure' | 'evidence' | 'portfolio_analysis' | 'belief_graph_node' | 'belief_graph_edge';
  narrativeName?: string;
  narrativeSummary?: string;
  assetTicker?: string;
  assetName?: string;
  exposureWeight?: number;
  evidenceDescription?: string;
  evidenceSource?: string;
  context?: string;
}

export function useAIExplain() {
  const [explanation, setExplanation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const explain = async (params: StreamExplainParams) => {
    setExplanation('');
    setError(null);
    setIsLoading(true);

    try {
      const resp = await fetch(EXPLAIN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify(params),
      });

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error || `Error ${resp.status}`);
      }

      if (!resp.body) throw new Error('No response body');

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullText += content;
              setExplanation(fullText);
            }
          } catch {
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setExplanation('');
    setError(null);
    setIsLoading(false);
  };

  return { explanation, isLoading, error, explain, reset };
}
