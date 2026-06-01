'use client';

import { useState, useMemo, useTransition, useEffect } from 'react';
import { FEATS } from '@/lib/srd/feats';
import { updateCharacterFeats, togglePinFeature } from '@/lib/db/actions';
import type { CharacterFeat, CharacterStats, AsiHistoryEntry, PinnedFeature } from '@/lib/db/schema';
import { CLASSES } from '@/lib/srd/classes';

interface Props {
  characterId: string;
  currentFeats: CharacterFeat[];
  asiHistory: AsiHistoryEntry[];
  stats: CharacterStats;
  classes: { classKey: string; level: number }[];
  pinnedFeatures?: PinnedFeature[];
  onClose: () => void;
}

// ─── Calcola slot talento disponibili ─────────────────────────────────────────
function computeAvailableFeatSlots(
  classes: { classKey: string; level: number }[],
  asiHistory: AsiHistoryEntry[],
): { total: number; used: number; available: number } {
  // Opportunità ASI standard: livelli 4, 8, 12, 16, 19
  // Fighter: +2 extra a lvl 6, 14 → totale 7
  // Rogue: +1 extra a lvl 10 → totale 6
  let total = 0;
  for (const c of classes) {
    const standardAsiLevels = [4, 8, 12, 16, 19];
    const extraLevels: Record<string, number[]> = {
      fighter: [6, 14],
      rogue:   [10],
    };
    const levels = [...standardAsiLevels, ...(extraLevels[c.classKey] ?? [])];
    total += levels.filter(l => l <= c.level).length;
  }
  const usedForFeats = asiHistory.filter(a => a.type === 'feat').length;
  const usedForStats = asiHistory.filter(a => a.type !== 'feat').length;
  return { total, used: usedForStats + usedForFeats, available: total - usedForFeats - usedForStats };
}

// ─── Parse prerequisiti ───────────────────────────────────────────────────────
function checkPrerequisite(prereq: string | undefined, stats: CharacterStats, feats: CharacterFeat[], casterClassKeys: string[]): { ok: boolean; reason: string } {
  if (!prereq) return { ok: true, reason: '' };

  const statMap: Record<string, keyof CharacterStats> = {
    'FOR': 'str', 'DES': 'dex', 'COS': 'con', 'INT': 'int', 'SAG': 'wis', 'CAR': 'cha',
  };

  // Pattern: "FOR 13" or "DES 13" or "FOR o DES 13"
  const multiStatMatch = prereq.match(/^(\w+)\s+o\s+(\w+)\s+(\d+)$/);
  if (multiStatMatch) {
    const [, a, b, val] = multiStatMatch;
    const min = parseInt(val);
    const keyA = statMap[a], keyB = statMap[b];
    if (keyA && keyB) {
      const ok = stats[keyA] >= min || stats[keyB] >= min;
      return { ok, reason: ok ? '' : `Richiede ${a} o ${b} almeno ${min}` };
    }
  }
  const singleStatMatch = prereq.match(/^(\w+)\s+(\d+)$/);
  if (singleStatMatch) {
    const [, stat, val] = singleStatMatch;
    const key = statMap[stat];
    if (key) {
      const ok = stats[key] >= parseInt(val);
      return { ok, reason: ok ? '' : `Richiede ${stat} almeno ${val}` };
    }
  }
  if (prereq.includes('incantesimo')) {
    const ok = casterClassKeys.length > 0;
    return { ok, reason: ok ? '' : 'Richiede capacità di lanciare almeno un incantesimo' };
  }

  // Prerequisito non parsabile — mostra il testo e lascia passare (DM giudica)
  return { ok: true, reason: `Prerequisito: ${prereq}` };
}

// ─── Stili ────────────────────────────────────────────────────────────────────
const OVERLAY: React.CSSProperties = {
  position: 'fixed', inset: 0, zIndex: 250, background: 'var(--modal-bg)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
};
const MODAL: React.CSSProperties = {
  background: 'var(--bg-deep)', border: '1px solid var(--border-leather-dim)', borderRadius: 'var(--r-lg)',
  width: '100%', maxWidth: 720, maxHeight: '88vh', display: 'flex', flexDirection: 'column', overflow: 'hidden',
};

export default function TalentiModal({ characterId, currentFeats, asiHistory, stats, classes, pinnedFeatures = [], onClose }: Props) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const [query, setQuery] = useState('');
  const [pending, setPending] = useState(false);
  const [localFeats, setLocalFeats] = useState<CharacterFeat[]>([...currentFeats]);
  const [, startTransition] = useTransition();
  const [localPinned, setLocalPinned] = useState<Set<string>>(
    new Set(pinnedFeatures.map(f => `feat:${f.key}`))
  );

  function handlePin(feat: typeof FEATS[number]) {
    const id = `feat:${feat.key}`;
    const isPinned = localPinned.has(id);
    setLocalPinned(prev => { const n = new Set(prev); isPinned ? n.delete(id) : n.add(id); return n; });
    const pf: PinnedFeature = { key: feat.key, type: 'feat', name: feat.name, description: feat.effect };
    startTransition(() => togglePinFeature(characterId, pf, !isPinned));
  }

  const slots = computeAvailableFeatSlots(classes, asiHistory);
  const currentFeatSlots = localFeats.length;
  const canAddMore = currentFeatSlots < (asiHistory.filter(a => a.type === 'feat').length + slots.available);

  // Caster keys per prerequisito "incantesimo"
  const casterClassKeys = classes
    .map(c => CLASSES.find(cl => cl.key === c.classKey))
    .filter(c => c && c.spellcastingType !== 'none')
    .map(c => c!.key);

  const localFeatKeys = new Set(localFeats.map(f => f.key));

  const catalog = useMemo(() => {
    return FEATS.filter(f => !query || f.name.toLowerCase().includes(query.toLowerCase()) || f.description.toLowerCase().includes(query.toLowerCase()));
  }, [query]);

  function addFeat(key: string, name: string) {
    if (localFeatKeys.has(key) || !canAddMore) return;
    setLocalFeats(prev => [...prev, { key, name, level: 0, description: FEATS.find(f => f.key === key)?.description }]);
  }

  function removeFeat(key: string) {
    setLocalFeats(prev => prev.filter(f => f.key !== key));
  }

  async function handleSave() {
    setPending(true);
    await updateCharacterFeats(characterId, localFeats);
    setPending(false);
    onClose();
  }

  return (
    <div style={OVERLAY} className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={MODAL}>
        {/* Header */}
        <div style={{ padding: '16px 20px 12px', borderBottom: '1px solid var(--border-leather)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', fontWeight: 600, letterSpacing: '.1em', color: 'var(--gold)', textTransform: 'uppercase' }}>Talenti</span>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: 'var(--fg-2)', marginTop: 2 }}>
                Slot disponibili: <strong style={{ color: slots.available > 0 ? 'var(--gold)' : 'var(--fg-3)' }}>{slots.available}</strong> · Talenti attuali: {localFeats.length}
              </div>
            </div>
            <button onClick={onClose} style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: '1px solid transparent', borderRadius: 'var(--r-sm)', color: 'var(--fg-2)', fontSize: 16, cursor: 'pointer' }}>✕</button>
          </div>
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Cerca talento…"
            style={{ width: '100%', height: 36, background: 'var(--bg-card)', border: '1px solid var(--border-leather)', borderRadius: 'var(--r-sm)', color: 'var(--fg-1)', fontFamily: 'var(--font-sans)', fontSize: '13px', outline: 'none', padding: '0 12px' }} />
        </div>

        {/* Body */}
        {/* Body */}
        <div style={{
          display: 'flex', flex: 1, overflow: 'hidden',
          flexDirection: isMobile ? 'column' : 'row',
        }}>

          {/* Catalogo */}
          <div style={{
            flex: 1, overflowY: 'auto', padding: 'var(--s-1) 0',
            borderRight: isMobile ? 'none' : '1px solid var(--border-leather)',
            borderBottom: isMobile ? '1px solid var(--border-leather)' : 'none',
          }}>
            {catalog.map(feat => {
              const { ok, reason } = checkPrerequisite(feat.prerequisite, stats, localFeats, casterClassKeys);
              const owned = localFeatKeys.has(feat.key);
              const blocked = !ok || (!canAddMore && !owned);

              return (
                <div key={feat.key} style={{ padding: '10px 16px', borderBottom: '.5px solid var(--bg-elevated)', opacity: (!ok && !owned) ? 0.45 : 1 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', fontWeight: 600, color: owned ? 'var(--gold)' : 'var(--fg-1)', marginBottom: 2 }}>
                        {feat.name}
                        {owned && <span style={{ marginLeft: 8, fontSize: '9px', color: 'var(--gold)', border: '1px solid var(--gold-border)', borderRadius: 'var(--r-sm)', padding: '1px 5px' }}>Acquisito</span>}
                      </div>
                      {feat.prerequisite && (
                        <div style={{ fontFamily: 'var(--font-sans)', fontSize: '9px', color: ok ? 'var(--fg-3)' : 'var(--danger)', marginBottom: 4 }}>
                          {ok ? `📋 ${feat.prerequisite}` : `⛔ ${reason}`}
                        </div>
                      )}
                      <div style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: 'var(--fg-2)', lineHeight: 1.5 }}>{feat.effect}</div>
                    </div>
                    {owned && (
                      <button onClick={() => handlePin(feat)} title={localPinned.has(`feat:${feat.key}`) ? 'Rimuovi pin' : 'Pinna sulla scheda'}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, opacity: localPinned.has(`feat:${feat.key}`) ? 1 : 0.25, transition: 'opacity .2s', padding: 2, flexShrink: 0 }}>
                        📌
                      </button>
                    )}
                    <button
                      onClick={() => owned ? removeFeat(feat.key) : addFeat(feat.key, feat.name)}
                      disabled={!owned && blocked}
                      style={{
                        fontFamily: 'var(--font-sans)', fontSize: '9px', letterSpacing: '.05em', flexShrink: 0,
                        width: 64, height: 24, borderRadius: 'var(--r-sm)',
                        border: owned ? '1px solid var(--danger-border)' : blocked ? '1px solid var(--border-leather)' : '1px solid var(--gold-border)',
                        color: owned ? 'var(--danger)' : blocked ? 'var(--fg-3)' : 'var(--gold)',
                        background: owned ? 'var(--danger-soft)' : 'transparent',
                        cursor: (!owned && blocked) ? 'not-allowed' : 'pointer', transition: 'all .2s',
                      }}>
                      {owned ? 'Rimuovi' : '+ Aggiungi'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Talenti acquisiti */}
          <div style={{
            width: isMobile ? '100%' : 220,
            maxHeight: isMobile ? 200 : undefined,
            flexShrink: isMobile ? 0 : undefined,
            overflowY: 'auto', padding: 'var(--s-1) 0',
            display: 'flex', flexDirection: 'column',
          }}>
            <div style={{ padding: '4px 16px 8px', fontFamily: 'var(--font-sans)', fontSize: '9px', fontWeight: 600, letterSpacing: '.08em', color: 'var(--fg-3)', textTransform: 'uppercase' }}>
              Talenti ({localFeats.length})
            </div>
            {localFeats.length === 0 && (
              <p style={{ padding: '12px 16px', fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '12px', color: 'var(--fg-3)' }}>Nessun talento</p>
            )}
            {localFeats.map(f => (
              <div key={f.key} style={{ padding: '6px 16px', borderBottom: '.5px solid var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: 'var(--fg-1)', flex: 1 }}>{f.name}</span>
                <button onClick={() => removeFeat(f.key)} style={{ width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: '1px solid transparent', borderRadius: 'var(--r-sm)', color: 'var(--fg-3)', fontSize: 10, cursor: 'pointer' }}>✕</button>
              </div>
            ))}
            <div style={{ marginTop: 'auto', padding: 12, borderTop: '1px solid var(--border-leather)', flexShrink: 0 }}>
              <button onClick={handleSave} disabled={pending}
                style={{ width: '100%', height: 40, fontFamily: 'var(--font-sans)', fontSize: '10px', fontWeight: 600, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--bg-deep)', background: 'var(--gold)', border: 'none', borderRadius: 'var(--r-sm)', cursor: pending ? 'not-allowed' : 'pointer', opacity: pending ? 0.5 : 1 }}>
                {pending ? 'Salvataggio…' : 'Conferma'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
