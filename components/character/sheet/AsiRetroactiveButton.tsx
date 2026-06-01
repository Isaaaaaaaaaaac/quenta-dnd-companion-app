'use client';

import { useState } from 'react';
import { applyRetroactiveAsi } from '@/lib/db/actions';
import { getAsiLevels } from '@/lib/srd/constants';
import { searchFeats, type Feat } from '@/lib/srd/feats';
import { formatModifier } from '@/lib/rules/calculations';
import type { Character, CharacterSheet, AsiHistoryEntry, CharacterFeat } from '@/lib/db/schema';

type StatKey = 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha';
type AsiMode = 'single' | 'split' | 'feat';

const STAT_LABELS: Record<StatKey, string> = {
  str: 'Forza', dex: 'Destrezza', con: 'Costituzione',
  int: 'Intelligenza', wis: 'Saggezza', cha: 'Carisma',
};
const STATS: StatKey[] = ['str', 'dex', 'con', 'int', 'wis', 'cha'];

interface Props { character: Character; }

export default function AsiRetroactiveButton({ character }: Props) {
  const [open, setOpen] = useState(false);
  const sheet = character.sheet as CharacterSheet;
  const classKey = sheet.classes?.[0]?.classKey ?? '';
  const asiLevels = getAsiLevels(classKey);
  const appliedLevels = new Set((sheet.asiHistory ?? []).map(h => h.level));
  const pendingLevels = asiLevels.filter(lv => lv <= character.level && !appliedLevels.has(lv));

  if (pendingLevels.length === 0) return null;

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn btn-secondary"
        style={{ padding: '6px 12px', borderColor: 'var(--gold)', color: 'var(--gold)' }}>
        ⚡ {pendingLevels.length} ASI non assegnat{pendingLevels.length === 1 ? 'o' : 'i'}
      </button>
      {open && (
        <AsiRetroModal character={character} sheet={sheet} classKey={classKey}
          pendingLevels={pendingLevels} onClose={() => setOpen(false)} />
      )}
    </>
  );
}

function AsiRetroModal({ character, sheet, classKey, pendingLevels, onClose }: {
  character: Character; sheet: CharacterSheet; classKey: string;
  pendingLevels: number[]; onClose: () => void;
}) {
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [asiMode, setAsiMode] = useState<AsiMode>('single');
  const [asiSingle, setAsiSingle] = useState<StatKey | null>(null);
  const [asiSplitA, setAsiSplitA] = useState<StatKey | null>(null);
  const [asiSplitB, setAsiSplitB] = useState<StatKey | null>(null);
  const [selectedFeat, setSelectedFeat] = useState<Feat | null>(null);
  const [featCustom, setFeatCustom] = useState('');
  const [featSearch, setFeatSearch] = useState('');
  const [showFeatList, setShowFeatList] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentStats, setCurrentStats] = useState({ ...sheet.stats });

  const currentLevel = pendingLevels[currentLevelIndex];
  const isLast = currentLevelIndex === pendingLevels.length - 1;

  const asiValid = (() => {
    if (asiMode === 'single') return asiSingle !== null;
    if (asiMode === 'split') return asiSplitA !== null && asiSplitB !== null && asiSplitA !== asiSplitB;
    return selectedFeat !== null || featCustom.trim().length > 0;
  })();

  function resetChoice() {
    setAsiMode('single'); setAsiSingle(null); setAsiSplitA(null); setAsiSplitB(null);
    setSelectedFeat(null); setFeatCustom(''); setFeatSearch('');
  }

  async function applyAndNext() {
    if (!asiValid) return;
    setSaving(true);
    let asiEntry: AsiHistoryEntry;
    let featEntry: CharacterFeat | undefined;
    let newStats = { ...currentStats };

    if (asiMode === 'single' && asiSingle) {
      newStats[asiSingle] = Math.min(20, newStats[asiSingle] + 2);
      asiEntry = { level: currentLevel, classKey, type: 'single', statA: asiSingle };
    } else if (asiMode === 'split' && asiSplitA && asiSplitB) {
      newStats[asiSplitA] = Math.min(20, newStats[asiSplitA] + 1);
      newStats[asiSplitB] = Math.min(20, newStats[asiSplitB] + 1);
      asiEntry = { level: currentLevel, classKey, type: 'split', statA: asiSplitA, statB: asiSplitB };
    } else {
      const name = selectedFeat?.name ?? featCustom.trim();
      asiEntry = { level: currentLevel, classKey, type: 'feat', featKey: selectedFeat?.key, featName: name };
      featEntry = { key: selectedFeat?.key ?? `custom_${Date.now()}`, name, level: currentLevel, description: selectedFeat?.effect };
    }

    await applyRetroactiveAsi(character.id, asiEntry, featEntry);
    setCurrentStats(newStats);
    setSaving(false);
    if (isLast) { onClose(); } else { setCurrentLevelIndex(i => i + 1); resetChoice(); }
  }

  const statBtn = (stat: StatKey, isSelected: boolean, isDisabled: boolean, val: number, previewVal?: number) => (
    <button key={stat} onClick={() => !isDisabled && (isSelected ? setAsiSingle(null) : setAsiSingle(stat))} disabled={isDisabled}
      style={{
        border: `1px solid ${isSelected ? 'var(--gold)' : 'var(--border-leather)'}`,
        backgroundColor: isSelected ? 'var(--gold-soft)' : 'var(--bg-card)',
        color: isDisabled ? 'var(--fg-3)' : 'var(--fg-1)',
        padding: '10px 8px', textAlign: 'center' as const,
        fontFamily: 'var(--font-body)', cursor: isDisabled ? 'not-allowed' : 'pointer',
      }}>
      <div style={{ fontFamily: 'var(--font-label)', fontSize: '7px', letterSpacing: '0.3em', color: 'var(--fg-3)', marginBottom: 4 }}>{STAT_LABELS[stat]}</div>
      <div style={{ fontSize: '1rem', fontWeight: 700, color: isSelected ? 'var(--gold)' : 'var(--fg-1)' }}>
        {isDisabled ? 'MAX' : isSelected && previewVal ? `${val} → ${previewVal}` : val}
      </div>
    </button>
  );

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'var(--modal-bg)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="card" style={{ width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', padding: 32, borderColor: 'var(--gold)' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: 6 }}>ASI Retroattivo</div>
            <h2 style={{ marginBottom: 4 }}>Livello {currentLevel}</h2>
            <div style={{ fontFamily: 'var(--font-body)', color: 'var(--fg-3)', fontSize: '0.85rem', fontStyle: 'italic' }}>
              {character.name} · ({currentLevelIndex + 1}/{pendingLevels.length})
            </div>
          </div>
          <button onClick={onClose} style={{ backgroundColor: 'transparent', border: 'none', color: 'var(--fg-3)', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
        </div>

        <div style={{ fontFamily: 'var(--font-body)', color: 'var(--fg-2)', fontSize: '0.9rem', fontStyle: 'italic', lineHeight: 1.65, padding: '12px 16px', backgroundColor: 'var(--bg-card)', borderLeft: '2px solid var(--gold)', marginBottom: 24 }}>
          Scegli l'ASI mancante per il livello {currentLevel}.
        </div>

        {/* Mode selector */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 24 }}>
          {(['single', 'split', 'feat'] as AsiMode[]).map(mode => (
            <button key={mode} onClick={() => { setAsiMode(mode); setAsiSingle(null); setAsiSplitA(null); setAsiSplitB(null); setSelectedFeat(null); }}
              className={asiMode === mode ? 'btn btn-secondary' : 'btn btn-ghost'}
              style={{ flex: 1, padding: '7px 4px', ...(asiMode === mode ? { borderColor: 'var(--gold)', color: 'var(--gold)' } : {}) }}>
              {mode === 'single' ? '+2 a una' : mode === 'split' ? '+1/+1 a due' : '⚑ Talento'}
            </button>
          ))}
        </div>

        {/* +2 su una stat */}
        {asiMode === 'single' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 24 }}>
            {STATS.map(stat => {
              const val = currentStats[stat];
              const isMax = val >= 20;
              const isSel = asiSingle === stat;
              return (
                <button key={stat} onClick={() => !isMax && setAsiSingle(isSel ? null : stat)} disabled={isMax}
                  style={{ border: `1px solid ${isSel ? 'var(--gold)' : 'var(--border-leather)'}`, backgroundColor: isSel ? 'var(--gold-soft)' : 'var(--bg-card)', color: isMax ? 'var(--fg-3)' : 'var(--fg-1)', padding: '10px 8px', textAlign: 'center', cursor: isMax ? 'not-allowed' : 'pointer' }}>
                  <div style={{ fontFamily: 'var(--font-label)', fontSize: '7px', letterSpacing: '0.3em', color: 'var(--fg-3)', marginBottom: 4 }}>{STAT_LABELS[stat]}</div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '1rem', fontWeight: 700, color: isSel ? 'var(--gold)' : 'var(--fg-1)' }}>
                    {isMax ? 'MAX' : isSel ? `${val} → ${val + 2}` : val}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* +1/+1 */}
        {asiMode === 'split' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 24 }}>
            {STATS.map(stat => {
              const val = currentStats[stat];
              const isMax = val >= 20;
              const selA = asiSplitA === stat;
              const selB = asiSplitB === stat;
              const isSel = selA || selB;
              const full = [asiSplitA, asiSplitB].filter(Boolean).length >= 2 && !isSel;
              return (
                <button key={stat} onClick={() => {
                  if (isMax) return;
                  if (selA) { setAsiSplitA(null); return; }
                  if (selB) { setAsiSplitB(null); return; }
                  if (!asiSplitA) { setAsiSplitA(stat); return; }
                  if (!asiSplitB) { setAsiSplitB(stat); }
                }} disabled={isMax || full}
                  style={{ border: `1px solid ${isSel ? 'var(--gold)' : 'var(--border-leather)'}`, backgroundColor: isSel ? 'var(--gold-soft)' : 'var(--bg-card)', color: (isMax || full) ? 'var(--fg-3)' : 'var(--fg-1)', padding: '10px 8px', textAlign: 'center', cursor: (isMax || full) ? 'not-allowed' : 'pointer', opacity: full ? 0.4 : 1 }}>
                  <div style={{ fontFamily: 'var(--font-label)', fontSize: '7px', letterSpacing: '0.3em', color: 'var(--fg-3)', marginBottom: 4 }}>{STAT_LABELS[stat]}</div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '1rem', fontWeight: 700, color: isSel ? 'var(--gold)' : 'var(--fg-1)' }}>
                    {isMax ? 'MAX' : isSel ? `${val} → ${val + 1}` : val}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Talento */}
        {asiMode === 'feat' && !selectedFeat && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ position: 'relative' }}>
              <input value={featSearch} onChange={e => { setFeatSearch(e.target.value); setShowFeatList(true); }} onFocus={() => setShowFeatList(true)}
                placeholder="Cerca talento SRD…" className="field-input" style={{ marginBottom: 8 }} />
              {showFeatList && (
                <>
                  <div style={{ position: 'fixed', inset: 0, zIndex: 10 }} onClick={() => setShowFeatList(false)} />
                  <div style={{ position: 'absolute', left: 0, right: 0, zIndex: 20, maxHeight: 160, overflowY: 'auto', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-leather)', top: '100%' }}>
                    {searchFeats(featSearch).map(feat => (
                      <button key={feat.key} onClick={() => { setSelectedFeat(feat); setFeatSearch(''); setShowFeatList(false); }}
                        style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 12px', border: 'none', borderBottom: '1px solid var(--border-leather)', backgroundColor: 'transparent', cursor: 'pointer', color: 'var(--fg-1)', fontFamily: 'var(--font-body)', fontSize: '0.875rem' }}>
                        <span style={{ fontFamily: 'var(--font-label)', fontSize: '8px', letterSpacing: '0.3em', color: 'var(--gold)', marginRight: 8 }}>{feat.name}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            <input value={featCustom} onChange={e => setFeatCustom(e.target.value)}
              placeholder="Oppure: nome talento personalizzato…" className="field-input" />
          </div>
        )}

        {selectedFeat && (
          <div style={{ marginBottom: 24, padding: '16px 20px', border: '1px solid var(--gold)', backgroundColor: 'var(--gold-soft)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', color: 'var(--gold)' }}>{selectedFeat.name}</span>
              <button onClick={() => setSelectedFeat(null)} style={{ border: 'none', color: 'var(--fg-3)', backgroundColor: 'transparent', cursor: 'pointer' }}>✕</button>
            </div>
            <p style={{ fontFamily: 'var(--font-body)', color: 'var(--fg-2)', fontSize: '0.875rem', fontStyle: 'italic' }}>{selectedFeat.effect}</p>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
          <button onClick={onClose} className="btn btn-ghost" style={{ padding: '8px 18px' }}>Chiudi</button>
          <button onClick={applyAndNext} disabled={!asiValid || saving} className="btn btn-primary"
            style={{ padding: '8px 22px', opacity: !asiValid || saving ? 0.4 : 1 }}>
            {saving ? 'Salvando…' : isLast ? 'Applica e chiudi' : `Applica → Lv ${pendingLevels[currentLevelIndex + 1]}`}
          </button>
        </div>
      </div>
    </div>
  );
}
