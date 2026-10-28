import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, MapPin, X, Bot, User, Loader2, Compass, ExternalLink, RefreshCw } from 'lucide-react';
import { ChatMessage, Trip } from '../types/travel';

interface ChatAssistantProps {
  currentTrip?: Trip;
  isOpen: boolean;
  onClose?: () => void;
  onLocationsReceived?: (locations: any[]) => void;
  initialQuery?: string | null;
  onClearInitialQuery?: () => void;
}

export const ChatAssistant: React.FC<ChatAssistantProps> = ({
  currentTrip,
  isOpen,
  onClose,
  onLocationsReceived,
  initialQuery,
  onClearInitialQuery,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: `Bonjour ! Je suis votre concierge de voyage Odyssée. Je peux vous renseigner sur les adresses, les horaires, les trajets et les secrets locaux de votre séjour. Que souhaitez-vous découvrir ?`,
      timestamp: 'À l\'instant',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const city = currentTrip?.destination.split(',')[0] || 'Rome';

  // Quick suggestions tailored to current trip
  const quickPrompts = [
    `Meilleures adresses près de ${city}`,
    `Horaires et astuces pour les incontournables`,
    `Où voir le coucher de soleil à ${city} ?`,
    `Règles de circulation locales`,
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Handle external query trigger (e.g., clicking "Poser une question à l'IA" on map or activity)
  useEffect(() => {
    if (initialQuery && initialQuery.trim()) {
      handleSendMessage(`Que peux-tu me dire sur "${initialQuery}" (horaires, astuces, anecdotes et où manger juste à côté) ?`);
      if (onClearInitialQuery) onClearInitialQuery();
    }
  }, [initialQuery]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: messages,
          currentTrip: currentTrip
            ? {
                destination: currentTrip.destination,
                duration: currentTrip.duration,
                travelers: currentTrip.travelers,
                activities: currentTrip.steps[currentTrip.currentDay]?.map((s) => s.activity),
              }
            : null,
        }),
      });

      if (!response.ok) {
        throw new Error(`Erreur réseau: ${response.statusText}`);
      }

      const data = await response.json();
      let rawText: string = data.text || "Désolé, je n'ai pas pu obtenir de réponse.";

      // Extract ```locations JSON block if returned by model
      let extractedLocations: any[] = [];
      const locationsRegex = /```locations\s*([\s\S]*?)\s*```/;
      const match = rawText.match(locationsRegex);

      if (match && match[1]) {
        try {
          extractedLocations = JSON.parse(match[1]);
          rawText = rawText.replace(locationsRegex, '').trim();
          if (onLocationsReceived && extractedLocations.length > 0) {
            onLocationsReceived(extractedLocations);
          }
        } catch (e) {
          console.warn('Failed to parse locations JSON block:', e);
        }
      }

      const assistantMsg: ChatMessage = {
        id: `msg-resp-${Date.now()}`,
        sender: 'assistant',
        text: rawText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        locations: extractedLocations.length > 0 ? extractedLocations : undefined,
        groundingSources: data.groundingChunks?.map((chunk: any) => ({
          title: chunk.web?.title || 'Google Search',
          url: chunk.web?.uri || '#',
        })),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-err-${Date.now()}`,
          sender: 'assistant',
          text: `Désolé, une petite anomalie s'est produite lors de la connexion. Vous pouvez me redemander ou tester l'une des suggestions ci-dessus.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-t-[26px] border border-line bg-white shadow-xl sm:rounded-[26px]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-line bg-gradient-to-r from-paper to-white p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-white shadow-sm">
            <Sparkles className="w-4 h-4 text-amber-300" />
          </div>
          <div>
            <h3 className="font-serif font-semibold text-base text-ink">Concierge Odyssée</h3>
            <p className="flex items-center gap-1.5 text-[11px] text-muted">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>Données Google Search & Maps en direct</span>
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            aria-label="Fermer le chat"
            className="p-2 text-muted hover:text-ink hover:bg-paper rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Messages Thread */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2.5 max-w-[92%] ${
              msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
            }`}
          >
            <div
              className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                msg.sender === 'user' ? 'bg-ink text-white' : 'bg-gold-soft text-accent'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
            </div>

            <div className="flex flex-col">
              <div
                className={`p-3.5 rounded-2xl text-[13px] leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-ink text-white rounded-tr-sm'
                    : 'bg-paper text-ink border border-line rounded-tl-sm'
                }`}
              >
                <div className="whitespace-pre-line">{msg.text}</div>

                {/* Display extracted locations cards if present */}
                {msg.locations && msg.locations.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-line/60 space-y-2">
                    <p className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{msg.locations.length} lieu(x) épinglé(s) sur la carte :</span>
                    </p>
                    <div className="grid grid-cols-1 gap-1.5">
                      {msg.locations.map((loc, i) => (
                        <div
                          key={i}
                          className="bg-white p-2 rounded-xl border border-line text-xs flex items-center justify-between shadow-2xs hover:border-ink transition-all"
                        >
                          <div>
                            <span className="font-bold text-ink">{loc.name}</span>
                            <span className="text-muted block text-[11px] truncate max-w-[200px]">{loc.address}</span>
                          </div>
                          <span className="bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded-full text-[10px]">
                            {loc.category || 'Recommandé'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Grounding web sources */}
                {msg.groundingSources && msg.groundingSources.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-line text-[11px] text-muted flex flex-wrap gap-2">
                    <span className="font-semibold">Sources vérifiées :</span>
                    {msg.groundingSources.slice(0, 3).map((src, idx) => (
                      <a
                        key={idx}
                        href={src.url}
                        target="_blank"
                        rel="noreferrer"
                        className="underline hover:text-ink flex items-center gap-0.5"
                      >
                        {src.title} <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
              <span
                className={`text-[10px] text-muted mt-1 ${
                  msg.sender === 'user' ? 'text-right pr-1' : 'pl-1'
                }`}
              >
                {msg.timestamp}
              </span>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="mr-auto flex max-w-[85%] items-center gap-2.5 rounded-2xl border border-line bg-paper p-3 text-xs text-muted">
            <Loader2 className="w-4 h-4 animate-spin text-accent" />
            <span>Recherche des meilleures informations…</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      <div className="flex items-center gap-1.5 overflow-x-auto border-t border-line bg-white px-4 py-2.5 no-scrollbar">
        {quickPrompts.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(prompt)}
            disabled={isLoading}
            className="flex-shrink-0 whitespace-nowrap rounded-full border border-line bg-paper px-3 py-1.5 text-[11px] font-medium text-ink-soft hover:border-line-strong hover:bg-paper-deep disabled:opacity-50"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input bar */}
      <div className="border-t border-line bg-white p-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2 rounded-2xl border border-line bg-paper p-1.5 focus-within:border-line-strong focus-within:bg-white focus-within:ring-2 focus-within:ring-ink/5"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Posez une question sur ${city}…`}
            aria-label="Votre question au concierge"
            disabled={isLoading}
            className="flex-1 bg-transparent px-3 py-1.5 text-sm text-ink placeholder:text-muted/80 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            aria-label="Envoyer"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink text-white hover:bg-ink-soft disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
