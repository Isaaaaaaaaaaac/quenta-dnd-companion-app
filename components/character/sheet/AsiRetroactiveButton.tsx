'use client';

import { useState } from 'react';
import { applyRetroactiveAsi } from '@/lib/db/actions';
import { getAsiLevels } from '@/lib/srd/constants';
import { searchFeats, type Feat } from '@/lib/srd/feats';
import { abilityModifier, formatModifier } from '@/lib/rules/calculations';
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
      <button onClick={() => setOpen(true)}
        style={{ border: '1px solid #c8922a', color: '#c8922a', backgroundColor: '#2a1a00', fontFamily: 'Cinzel, serif', fontSize: '0.7rem', padding: '6px 12px', cursor: 'pointer', letterSpacing: '0.04em' }}>
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
  character: Character;
  sheet: CharacterSheet;
  classKey: string;
  pendingLevels: number[];
  onClose: () => void;
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
    setAsiMode('single');
    setAsiSingle(null);
    setAsiSplitA(null);
    setAsiSplitB(null);
    setSelectedFeat(null);
    setFeatCustom('');
    setFeatSearch('');
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

    if (isLast) { onClose(); }
    else { setCurrentLevelIndex(i => i + 1); resetChoice(); }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.75)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ backgroundColor: '#1a1410', border: '1px solid #c8922a', width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto', padding: '28px' }}>

        <div className="flex justify-between items-start mb-4">
          <div>
            <h2>ASI Retroattivo</h2>
            <p style={{ color: '#a08060', fontFamily: 'Crimson Text, serif', fontSize: '0.85rem' }}>
              {character.name} · Livello {currentLevel} · ({currentLevelIndex + 1}/{pendingLevels.length})
            </p>
          </div>
          <button onClick={onClose} style={{ backgroundColor: 'transparent', border: 'none', color: '#5a4020', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
        </div>

        <div className="p-3 mb-4" style={{ backgroundColor: '#2a2010', border: '1px solid #5a4020' }}>
          <p style={{ color: '#a08060', fontFamily: 'Crimson Text, serif', fontSize: '0.85rem', fontStyle: 'italic' }}>
            Questo personaggio è stato creato al livello {character.level} senza applicare tutti gli aumenti di caratteristica guadagnati.
            Scegli ora l'ASI mancante per il livello {currentLevel}.
          </p>
        </div>

        {/* Modalità */}
        <div className="flex gap-1 mb-5">
          {(['single', 'split', 'feat'] as AsiMode[]).map(mode => (
            <button key={mode} onClick={() => { setAsiMode(mode); setAsiSingle(null); setAsiSplitA(null); setAsiSplitB(null); setSelectedFeat(null); }}
              style={{ flex: 1, border: `1px solid ${asiMode === mode ? '#c8922a' : '#5a4020'}`, color: asiMode === mode ? '#c8922a' : '#a08060', backgroundColor: asiMode === mode ? '#2a2010' : 'transparent', fontFamily: 'Cinzel, serif', padding: '7px 4px', cursor: 'pointer', fontSize: '0.7rem' }}>
              {mode === 'single' ? '+2 a una' : mode === 'split' ? '+1/+1 a due' : '⚑ Talento'}
            </button>
          ))}
        </div>

        {/* +2 su una */}
        {asiMode === 'single' && (
          <div className="grid grid-cols-3 gap-2 mb-4">
            {STATS.map(stat => {
              const val = currentStats[stat];
              const isMax = val >= 20;
              const isSel = asiSingle === stat;
              return (
                <button key={stat} onClick={() => !isMax && setAsiSingle(isSel ? null : stat)} disabled={isMax}
                  style={{ border: `1px solid ${isSel ? '#c8922a' : '#5a4020'}`, backgroundColor: isSel ? '#2a2010' : '#1e1810', color: isMax ? '#3a3020' : '#e8d5a3', padding: '8px', textAlign: 'center', fontFamily: 'Cinzel, serif', cursor: isMax ? 'not-allowed' : 'pointer', fontSize: '0.75rem' }}>
                  <div style={{ fontSize: '0.55rem', color: '#a08060' }}>{STAT_LABELS[stat]}</div>
                  <div>{isMax ? '20 MAX' : isSel ? `${val} → ${val + 2}` : val}</div>
                </button>
              );
            })}
          </div>
        )}

        {/* +1/+1 */}
        {asiMode === 'split' && (
          <div className="grid grid-cols-3 gap-2 mb-4">
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
                  style={{ border: `1px solid ${isSel ? '#c8922a' : '#5a4020'}`, backgroundColor: isSel ? '#2a2010' : '#1e1810', color: (isMax || full) ? '#3a3020' : '#e8d5a3', padding: '8px', textAlign: 'center', fontFamily: 'Cinzel, serif', cursor: (isMax || full) ? 'not-allowed' : 'pointer', fontSize: '0.75rem', opacity: full ? 0.4 : 1 }}>
                  <div style={{ fontSize: '0.55rem', color: '#a08060' }}>{STAT_LABELS[stat]}</div>
                  <div>{isMax ? 'MAX' : isSel ? `${val} → ${val + 1}` : val}</div>
                </button>
              );
            })}
          </div>
        )}

        {/* Talento */}
        {asiMode === 'feat' && !selectedFeat && (
          <div className="mb-4">
            <div className="relative">
              <input value={featSearch} onChange={e => { setFeatSearch(e.target.value); setShowFeatList(true); }} onFocus={() => setShowFeatList(true)}
                placeholder="Cerca talento SRD…"
                style={{ width: '100%', backgroundColor: 'transparent', border: 'none', borderBottom: '1px solid #5a4020', color: '#e8d5a3', outline: 'none', fontFamily: 'Crimson Text, serif', fontSize: '0.9rem', padding: '4px 0', marginBottom: 8 }} />
              {showFeatList && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowFeatList(false)} />
                  <div className="absolute left-0 right-0 z-20 max-h-40 overflow-y-auto" style={{ backgroundColor: '#221c14', border: '1px solid #5a4020', top: '100%' }}>
                    {searchFeats(featSearch).map(feat => (
                      <button key={feat.key} onClick={() => { setSelectedFeat(feat); setFeatSearch(''); setShowFeatList(false); }}
                        style={{ display: 'block', width: '100%', textAlign: 'left', padding: '6px 10px', border: 'none', borderBottom: '1px solid #2a2018', backgroundColor: 'transparent', cursor: 'pointer', color: '#e8d5a3', fontFamily: 'Crimson Text, serif', fontSize: '0.85rem' }}>
                        <span style={{ fontFamily: 'Cinzel, serif', color: '#c8922a', fontSize: '0.75rem' }}>{feat.name}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            <input value={featCustom} onChange={e => setFeatCustom(e.target.value)} placeholder="Oppure: nome talento personalizzato…"
              style={{ width: '100%', backgroundColor: 'transparent', border: 'none', borderBottom: '1px solid #5a4020', color: '#e8d5a3', outline: 'none', fontFamily: 'Crimson Text, serif', fontSize: '0.9rem', padding: '4px 0' }} />
          </div>
        )}

        {selectedFeat && (
          <div className="mb-4 p-3" style={{ border: '1px solid #c8922a', backgroundColor: '#2a2010' }}>
            <div className="flex justify-between">
              <span style={{ fontFamily: 'Cinzel, serif', color: '#c8922a' }}>{selectedFeat.name}</span>
              <button onClick={() => setSelectedFeat(null)} style={{ border: 'none', color: '#5a4020', backgroundColor: 'transparent', cursor: 'pointer' }}>✕</button>
            </div>
            <p style={{ color: '#a08060', fontFamily: 'Crimson Text, serif', fontSize: '0.8rem', marginTop: 4 }}>{selectedFeat.effect}</p>
          </div>
        )}

        <div className="flex justify-between mt-6">
          <button onClick={onClose} style={{ border: '1px solid #5a4020', color: '#a08060', backgroundColor: 'transparent', fontFamily: 'Cinzel, serif', padding: '8px 18px', cursor: 'pointer', fontSize: '0.8rem' }}>
            Chiudi
          </button>
          <button onClick={applyAndNext} disabled={!asiValid || saving}
            style={{ border: '1px solid #c8922a', color: '#1a1410', backgroundColor: asiValid && !saving ? '#c8922a' : '#5a4020', fontFamily: 'Cinzel, serif', padding: '8px 22px', cursor: asiValid && !saving ? 'pointer' : 'not-allowed', fontSize: '0.85rem' }}>
            {saving ? 'Salvando…' : isLast ? 'Applica e chiudi' : `Applica → ASI Lv ${pendingLevels[currentLevelIndex + 1]}`}
          </button>
        </div>
      </div>
    </div>
  );
}
