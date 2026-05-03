'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createCharacter } from '@/lib/db/actions';
import { CLASSES } from '@/lib/srd/classes';
import type { CharacterSheet, CharacterClass } from '@/lib/db/schema';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ParsedCharacter {
  name: string;
  type: 'pc' | 'npc_major' | 'npc_minor';
  race?: string;
  subrace?: string;
  classes: { classKey: string; level: number; subclass?: string }[];
  background?: string;
  alignment?: string;
  stats: { str: number; dex: number; con: number; int: number; wis: number; cha: number };
  armorClass?: number;
  speed?: number;
  hpMax?: number;
  savingThrowProficiencies?: Record<string, boolean>;
  skills?: Record<string, { proficient: boolean; expertise: boolean }>;
  personality?: string;
  ideals?: string;
  bonds?: string;
  flaws?: string;
  backstory?: string;
  dmNotes?: string;
}

interface Props {
  campaignId: string;
  onBack: () => void;
}

const STARTERS = [
  'Un capitano della guardia corrotto, ex soldato d\'elite, livello 7',
  'Una spia elfica al servizio di un\'organizzazione segreta',
  'Un vecchio mago recluso con oscuri segreti del passato',
  'Un mercante nano con connessioni nel mondo criminale',
  'Un giovane paladino in crisi di fede',
];

export default function AiCharacterBuilder({ campaignId, onBack }: Props) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [parsedChar, setParsedChar] = useState<ParsedCharacter | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function extractCharacterSheet(text: string): ParsedCharacter | null {
    const match = text.match(/<character_sheet>([\s\S]*?)<\/character_sheet>/);
    if (!match) return null;
    try {
      return JSON.parse(match[1].trim());
    } catch {
      return null;
    }
  }

  async function sendMessage(content: string) {
    if (!content.trim() || streaming) return;
    setError('');

    const newMessages: Message[] = [...messages, { role: 'user', content }];
    setMessages(newMessages);
    setInput('');
    setStreaming(true);

    // Placeholder messaggio assistente
    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

    try {
      const res = await fetch('/api/ai-character', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok || !res.body) throw new Error(`Errore ${res.status}`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;

        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: 'assistant', content: fullText };
          return updated;
        });
      }

      // Estrai scheda se presente
      const parsed = extractCharacterSheet(fullText);
      if (parsed) setParsedChar(parsed);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore di connessione');
      setMessages(prev => prev.slice(0, -1)); // rimuovi placeholder vuoto
    } finally {
      setStreaming(false);
    }
  }

  async function handleSave() {
    if (!parsedChar) return;
    setSaving(true);

    const cls = CLASSES.find(c => c.key === parsedChar.classes?.[0]?.classKey);
    const classes: CharacterClass[] = (parsedChar.classes ?? []).map(c => ({
      classKey: c.classKey,
      level: c.level,
      subclass: c.subclass,
    }));

    const sheet: CharacterSheet = {
      race: parsedChar.race,
      subrace: parsedChar.subrace,
      classes,
      background: parsedChar.background,
      alignment: parsedChar.alignment,
      stats: parsedChar.stats,
      armorClass: parsedChar.armorClass,
      speed: parsedChar.speed,
      savingThrowProficiencies: (parsedChar.savingThrowProficiencies as CharacterSheet['savingThrowProficiencies']) ?? {
        str: false, dex: false, con: false, int: false, wis: false, cha: false,
      },
      skills: parsedChar.skills ?? {},
      hitDice: [{ die: `d${cls?.hitDie ?? 8}`, total: parsedChar.classes?.[0]?.level ?? 1, used: 0 }],
      inventory: [],
      money: { pp: 0, gp: 0, ep: 0, sp: 0, cp: 0 },
      personality: parsedChar.personality,
      ideals: parsedChar.ideals,
      bonds: parsedChar.bonds,
      flaws: parsedChar.flaws,
      backstory: parsedChar.backstory,
      dmNotes: parsedChar.dmNotes,
    };

    const level = parsedChar.classes?.[0]?.level ?? 1;
    const hpMax = parsedChar.hpMax ?? (cls?.hitDie ?? 8) + Math.floor((parsedChar.stats.con - 10) / 2);

    await createCharacter({
      name: parsedChar.name,
      type: parsedChar.type ?? 'npc_major',
      level,
      xp: 0,
      hpCurrent: hpMax,
      hpMax,
      hpTemp: 0,
      sheet,
      campaignId,
    });

    router.push(`/campaigns/${campaignId}`);
  }

  const inp: React.CSSProperties = {
    flex: 1, backgroundColor: 'transparent', border: 'none',
    color: '#e8d5a3', outline: 'none', fontFamily: 'Crimson Text, serif',
    fontSize: '1rem', resize: 'none', padding: '8px 0', lineHeight: 1.5,
  };

  return (
    <div className="flex flex-col" style={{ height: '70vh', minHeight: '500px' }}>

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 style={{ marginBottom: 2 }}>Genera con AI</h2>
          <p style={{ color: '#a08060', fontFamily: 'Crimson Text, serif', fontSize: '0.85rem', fontStyle: 'italic' }}>
            Descrivi il personaggio che vuoi creare — l'AI genererà la scheda completa.
          </p>
        </div>
        <button onClick={onBack}
          style={{ border: '1px solid #5a4020', color: '#a08060', backgroundColor: 'transparent', fontFamily: 'Cinzel, serif', fontSize: '0.75rem', padding: '6px 14px', cursor: 'pointer' }}>
          ← Indietro
        </button>
      </div>

      {/* Starter suggestions */}
      {messages.length === 0 && (
        <div className="mb-4">
          <p style={{ color: '#5a4020', fontFamily: 'Cinzel, serif', fontSize: '0.65rem', letterSpacing: '0.06em', marginBottom: 8 }}>
            ESEMPI DI DESCRIZIONE
          </p>
          <div className="flex flex-wrap gap-2">
            {STARTERS.map(s => (
              <button key={s} onClick={() => sendMessage(s)}
                style={{ border: '1px solid #3a3020', color: '#a08060', backgroundColor: 'transparent', fontFamily: 'Crimson Text, serif', fontSize: '0.85rem', padding: '4px 10px', cursor: 'pointer', fontStyle: 'italic', textAlign: 'left' }}>
                "{s}"
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-3" style={{ borderTop: '1px solid #3a3020', paddingTop: 12 }}>
        {messages.map((msg, i) => {
          // Nascondi il tag <character_sheet> nel testo visualizzato
          const displayText = msg.content.replace(/<character_sheet>[\s\S]*?<\/character_sheet>/g, '').trim();
          const hasSheet = msg.role === 'assistant' && /<character_sheet>/.test(msg.content);

          return (
            <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <div style={{
                maxWidth: '85%', padding: '10px 14px',
                backgroundColor: msg.role === 'user' ? '#2a2010' : '#221c14',
                border: `1px solid ${msg.role === 'user' ? '#8a6010' : '#5a4020'}`,
                fontFamily: 'Crimson Text, serif', color: '#e8d5a3', fontSize: '0.95rem',
                whiteSpace: 'pre-wrap', lineHeight: 1.6,
              }}>
                {displayText || (streaming && i === messages.length - 1 ? (
                  <span style={{ color: '#5a4020' }}>⏳ Generazione in corso…</span>
                ) : '')}
                {hasSheet && (
                  <div className="mt-2 pt-2" style={{ borderTop: '1px solid #5a4020', color: '#4a7c4e', fontFamily: 'Cinzel, serif', fontSize: '0.75rem' }}>
                    ✦ Scheda generata — vedi anteprima qui sotto
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Anteprima scheda generata */}
      {parsedChar && (
        <div className="mb-4 p-4" style={{ border: '1px solid #c8922a', backgroundColor: '#2a2010' }}>
          <div className="flex items-center justify-between mb-2">
            <div>
              <div style={{ fontFamily: 'Cinzel, serif', color: '#c8922a', fontSize: '1.1rem' }}>{parsedChar.name}</div>
              <div style={{ color: '#a08060', fontFamily: 'Crimson Text, serif', fontSize: '0.85rem' }}>
                {parsedChar.race}
                {parsedChar.classes?.[0] && ` · ${CLASSES.find(c => c.key === parsedChar.classes[0].classKey)?.name ?? parsedChar.classes[0].classKey} ${parsedChar.classes[0].level}`}
                {parsedChar.alignment && ` · ${parsedChar.alignment}`}
              </div>
            </div>
            <div className="flex gap-2">
              <div className="text-center" style={{ border: '1px solid #5a4020', padding: '4px 10px' }}>
                <div style={{ fontSize: '0.55rem', color: '#a08060', fontFamily: 'Cinzel, serif' }}>PF</div>
                <div style={{ fontFamily: 'Cinzel, serif', color: '#e8d5a3' }}>{parsedChar.hpMax ?? '?'}</div>
              </div>
              <div className="text-center" style={{ border: '1px solid #5a4020', padding: '4px 10px' }}>
                <div style={{ fontSize: '0.55rem', color: '#a08060', fontFamily: 'Cinzel, serif' }}>CA</div>
                <div style={{ fontFamily: 'Cinzel, serif', color: '#e8d5a3' }}>{parsedChar.armorClass ?? '?'}</div>
              </div>
            </div>
          </div>
          {parsedChar.backstory && (
            <p style={{ color: '#a08060', fontFamily: 'Crimson Text, serif', fontSize: '0.85rem', fontStyle: 'italic', marginBottom: 12 }}>
              {parsedChar.backstory.slice(0, 150)}{parsedChar.backstory.length > 150 ? '…' : ''}
            </p>
          )}
          <div className="flex gap-2">
            <button onClick={handleSave} disabled={saving}
              style={{ border: '1px solid #c8922a', color: '#1a1410', backgroundColor: saving ? '#5a4020' : '#c8922a', fontFamily: 'Cinzel, serif', padding: '8px 22px', cursor: saving ? 'not-allowed' : 'pointer', fontSize: '0.85rem' }}>
              {saving ? 'Salvando…' : '✦ Salva personaggio'}
            </button>
            <button onClick={() => { setParsedChar(null); setMessages([]); }}
              style={{ border: '1px solid #5a4020', color: '#a08060', backgroundColor: 'transparent', fontFamily: 'Cinzel, serif', padding: '8px 18px', cursor: 'pointer', fontSize: '0.85rem' }}>
              Ricomincia
            </button>
          </div>
        </div>
      )}

      {/* Errore */}
      {error && (
        <div className="mb-3 p-3" style={{ backgroundColor: '#1a0a0a', border: '1px solid #8b2020', color: '#8b2020', fontFamily: 'Crimson Text, serif', fontSize: '0.85rem' }}>
          ⚠ {error}
        </div>
      )}

      {/* Input */}
      {!parsedChar && (
        <div style={{ border: '1px solid #5a4020', backgroundColor: '#221c14', padding: '8px 12px' }}>
          <div className="flex gap-3 items-end">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(input);
                }
              }}
              placeholder="Descrivi il personaggio… (Invio per inviare, Shift+Invio per andare a capo)"
              rows={2}
              style={inp}
              disabled={streaming}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={streaming || !input.trim()}
              style={{
                border: '1px solid #c8922a', color: '#c8922a', backgroundColor: 'transparent',
                fontFamily: 'Cinzel, serif', padding: '8px 16px', cursor: 'pointer',
                fontSize: '0.8rem', flexShrink: 0,
                opacity: streaming || !input.trim() ? 0.4 : 1,
              }}>
              {streaming ? '⏳' : '→ Invia'}
            </button>
          </div>
          <div style={{ color: '#3a3020', fontFamily: 'Crimson Text, serif', fontSize: '0.75rem', marginTop: 4 }}>
            Powered by Claude · Le informazioni rimangono private
          </div>
        </div>
      )}
    </div>
  );
}
