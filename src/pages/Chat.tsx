import { useState } from 'react';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const suggestions = [
  "What narratives are most fragile right now?",
  "Explain my portfolio's exposure to AI",
  "What would break the soft landing thesis?",
  "Which narratives conflict with each other?",
];

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', content: "I'm your narrative intelligence assistant. Ask me about market beliefs, your portfolio exposure, or narrative conflicts. I help you understand *why* markets move, not predict *where*." }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: input }]);
    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        id: (Date.now() + 1).toString(), 
        role: 'assistant', 
        content: "Based on the current belief graph, the 'AI Capex Supercycle' narrative has 78% confidence and directly reinforces 'Energy Demand Surge'. Your portfolio has 58% exposure to these interconnected beliefs. The key fragility point is the assumption that 'AI model scaling continues to yield improvements' - this has a 35% fragility score." 
      }]);
    }, 1000);
    setInput('');
  };

  return (
    <div className="space-y-6 h-[calc(100vh-120px)] flex flex-col">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-primary" />
          AI Intelligence
        </h1>
        <p className="text-muted-foreground">Morphic-style exploration of market narratives</p>
      </div>

      <Card className="flex-1 flex flex-col">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map(msg => (
              <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                {msg.role === 'assistant' && <Bot className="h-8 w-8 p-1.5 rounded-full bg-primary text-primary-foreground shrink-0" />}
                <div className={`chat-bubble ${msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}`}>
                  {msg.content}
                </div>
                {msg.role === 'user' && <User className="h-8 w-8 p-1.5 rounded-full bg-muted shrink-0" />}
              </div>
            ))}
          </div>
        </ScrollArea>

        <CardContent className="border-t pt-4 space-y-4">
          <div className="flex flex-wrap gap-2">
            {suggestions.map(s => (
              <Button key={s} variant="outline" size="sm" onClick={() => setInput(s)} className="text-xs">
                {s}
              </Button>
            ))}
          </div>
          <div className="flex gap-2">
            <Input 
              value={input} 
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Ask about narratives, beliefs, or your portfolio..."
            />
            <Button onClick={handleSend}><Send className="h-4 w-4" /></Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
