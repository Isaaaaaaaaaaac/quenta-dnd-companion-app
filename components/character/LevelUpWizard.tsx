'use client';

import { useState } from 'react';
import { CLASSES } from '@/lib/srd/classes';
import { getAsiLevels, isAsiLevel } from '@/lib/srd/constants';
import { proficiencyBonus } from '@/lib/rules/calculations';
import { rollHitDie, averageHitDie } from '@/lib/rolls';
import { abilityModifier, formatModifier } from '@/lib/rules/calculations';
import { levelUpCharacter } from '@/lib/db/actions';
import { FEATS, searchFeats, type Feat } from '@/lib/srd/feats';
import type { Character, CharacterSheet, AsiHistoryEntry, CharacterFeat } from '@/lib/db/schema';
import { WizardButton } from './wizard/StepIdentity';

type StatKey = 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha';
type AsiMode = 'single' | 'split' | 'feat';
type Step = 'hp' | 'asi' | 'confirm';

const STAT_LABELS: Record<StatKey, string> = {
  str: 'Forza', dex: 'Destrezza', con: 'Costituzione',
  int: 'Intelligenza', wis: 'Saggezza', cha: 'Carisma',
};
const STAT_SHORT: Record<StatKey, string> = {
  str: 'FOR', dex: 'DES', con: 'COS', int: 'INT', wis: 'SAG', cha: 'CAR',
};
const STATS: StatKey[] = ['str', 'dex', 'con', 'int', 'wis', 'cha'];

interface Props { character: Character; onClose: () => void; }

export default function LevelUpWizard({ character, onClose }: Props) {
  const sheet = character.sheet as CharacterSheet;
  const newLevel = character.level + 1;
  const primaryClass = sheet.classes?.[0];
  const cls = CLASSES.find(c => c.key === primaryClass?.classKey);
  const die = cls?.hitDie ?? 8;
  const conMod = abilityModifier(sheet.stats.con);
  const hasAsi = isAsiLevel(primaryClass?.classKey ?? '', newLevel);
  const newProf = proficiencyBonus(newLevel);

  const steps: Step[] = hasAsi ? ['hp', 'asi', 'confirm'] : ['hp', 'confirm'];
  const [stepIndex, setStepIndex] = useState(0);
  const step = steps[stepIndex];

  // ─── HP (irreversibile) ───────────────────────────────────────────────────
  const [hpRoll, setHpRoll] = useState<number | null>(null);
  const [hpLocked, setHpLocked] = useState(false);
  const hpGain = Math.max(1, (hpRoll ?? 0) + conMod);

  function rollHP() {
    if (hpLocked) return;
    setHpRoll(rollHitDie(die));
    setHpLocked(true);
  }
  function useAvgHP() {
    if (hpLocked) return;
    setHpRoll(averageHitDie(die));
    setHpLocked(true);
  }

  // ─── ASI ──────────────────────────────────────────────────────────────────
  const [asiMode, setAsiMode] = useState<AsiMode>('single');
  const [asiSingle, setAsiSingle] = useState<StatKey | null>(null);
  const [asiSplitA, setAsiSplitA] = useState<StatKey | null>(null);
  const [asiSplitB, setAsiSplitB] = useState<StatKey | null>(null);
  const [selectedFeat, setSelectedFeat] = useState<Feat | null>(null);
  const [featSearch, setFeatSearch] = useState('');
  const [featCustom, setFeatCustom] = useState('');
  const [showFeatList, setShowFeatList] = useState(false);

  const [saving, setSaving] = useState(false);

  function resetAsi(mode: AsiMode) {
    setAsiMode(mode);
    setAsiSingle(null);
    setAsiSplitA(null);
    setAsiSplitB(null);
    setSelectedFeat(null);
    setFeatSearch('');
    setFeatCustom('');
  }

  const asiValid = (() => {
    if (!hasAsi) return true;
    if (asiMode === 'single') return asiSingle !== null;
    if (asiMode === 'split') return asiSplitA !== null && asiSplitB !== null && asiSplitA !== asiSplitB;
    if (asiMode === 'feat') return selectedFeat !== null || featCustom.trim().length > 0;
    return false;
  })();

  async function handleConfirm() {
    setSaving(true);

    const newSheet: Partial<CharacterSheet> = {
      classes: sheet.classes?.map((c, i) => i === 0 ? { ...c, level: newLevel } : c),
    };

    let asiEntry: AsiHistoryEntry | undefined;
    let featEntry: CharacterFeat | undefined;

    if (hasAsi) {
      if (asiMode === 'single' && asiSingle) {
        const currentStats = { ...sheet.stats };
        currentStats[asiSingle] = Math.min(20, currentStats[asiSingle] + 2);
        newSheet.stats = currentStats;
        asiEntry = { level: newLevel, classKey: primaryClass?.classKey ?? '', type: 'single', statA: asiSingle };
      } else if (asiMode === 'split' && asiSplitA && asiSplitB) {
        const currentStats = { ...sheet.stats };
        currentStats[asiSplitA] = Math.min(20, currentStats[asiSplitA] + 1);
        currentStats[asiSplitB] = Math.min(20, currentStats[asiSplitB] + 1);
        newSheet.stats = currentStats;
        asiEntry = { level: newLevel, classKey: primaryClass?.classKey ?? '', type: 'split', statA: asiSplitA, statB: asiSplitB };
      } else if (asiMode === 'feat') {
        const feat = selectedFeat;
        const name = feat?.name ?? featCustom.trim();
        asiEntry = { level: newLevel, classKey: primaryClass?.classKey ?? '', type: 'feat', featKey: feat?.key, featName: name };
        featEntry = {
          key: feat?.key ?? `custom_${Date.now()}`,
          name,
          level: newLevel,
          description: feat?.effect,
          prerequisite: feat?.prerequisite,
        };
      }
    }

    await levelUpCharacter(character.id, newLevel, hpGain, newSheet, asiEntry, featEntry);
    setSaving(false);
    onClose();
  }

  const clsFeatures = getNewFeatures(primaryClass?.classKey ?? '', newLevel);

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.75)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
      onClick={e => e.target === e.currentTarget && onClose()}>

      <div style={{ backgroundColor: '#1a1410', border: '1px solid #c8922a', width: '100%', maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto', padding: '32px' }}>

        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2>Level Up — Livello {newLevel}</h2>
            <div style={{ color: '#a08060', fontFamily: 'Crimson Text, serif', fontSize: '0.9rem' }}>
              {character.name} · {cls?.name}
              {hasAsi && <span style={{ marginLeft: 8, color: '#c8922a', fontFamily: 'Cinzel, serif', fontSize: '0.7rem', border: '1px solid #c8922a', padding: '1px 6px' }}>ASI</span>}
            </div>
          </div>
          <button onClick={onClose} style={{ backgroundColor: 'transparent', border: 'none', color: '#5a4020', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
        </div>

        {/* Progress */}
        <div className="flex gap-1 mb-6">
          {steps.map((s, i) => {
            const labels: Record<Step, string> = { hp: 'Punti Ferita', asi: 'Caratteristica', confirm: 'Conferma' };
            return (
              <div key={s} className="flex-1 text-center">
                <div style={{ height: 2, backgroundColor: stepIndex >= i ? '#c8922a' : '#5a4020', marginBottom: 4 }} />
                <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.6rem', letterSpacing: '0.04em', color: stepIndex === i ? '#c8922a' : stepIndex > i ? '#8a6010' : '#5a4020' }}>
                  {labels[s]}
                </span>
              </div>
            );
          })}
        </div>

        {/* Nuove features di classe */}
        {clsFeatures.length > 0 && (
          <div className="mb-5 p-3" style={{ backgroundColor: '#2a2010', border: '1px solid #5a4020' }}>
            <div style={{ fontFamily: 'Cinzel, serif', color: '#c8922a', fontSize: '0.65rem', letterSpacing: '0.06em', marginBottom: 6 }}>
              NUOVE CAPACITÀ AL LIVELLO {newLevel}
            </div>
            {clsFeatures.map(f => (
              <div key={f} style={{ color: '#e8d5a3', fontFamily: 'Crimson Text, serif', padding: '2px 0', fontSize: '0.9rem' }}>✦ {f}</div>
            ))}
          </div>
        )}

        {/* Bonus competenza aggiornato */}
        {newProf !== proficiencyBonus(character.level) && (
          <div className="mb-5 p-3" style={{ backgroundColor: '#1a2a1a', border: '1px solid #4a7c4e' }}>
            <span style={{ color: '#4a7c4e', fontFamily: 'Cinzel, serif', fontSize: '0.75rem' }}>
              ✦ Bonus Competenza aumenta: +{proficiencyBonus(character.level)} → +{newProf}
            </span>
          </div>
        )}

        {/* ── Step HP ── */}
        {step === 'hp' && (
          <div>
            <h3 className="mb-2">Punti Ferita</h3>
            <p style={{ color: '#a08060', fontFamily: 'Crimson Text, serif', fontSize: '0.9rem', marginBottom: 16 }}>
              d{die} + modificatore COS ({formatModifier(conMod)}) · min. 1 PF
            </p>

            {!hpLocked ? (
              <div className="flex gap-3 mb-4">
                <button onClick={rollHP}
                  style={{ border: '1px solid #c8922a', color: '#c8922a', backgroundColor: 'transparent', fontFamily: 'Cinzel, serif', padding: '10px 20px', cursor: 'pointer', fontSize: '0.85rem' }}>
                  🎲 Tira d{die}
                </button>
                <button onClick={useAvgHP}
                  style={{ border: '1px solid #5a4020', color: '#a08060', backgroundColor: 'transparent', fontFamily: 'Cinzel, serif', padding: '10px 20px', cursor: 'pointer', fontSize: '0.85rem' }}>
                  ⌀ Media ({averageHitDie(die)})
                </button>
              </div>
            ) : (
              <div className="p-4 text-center mb-4" style={{ border: '1px solid #c8922a', backgroundColor: '#2a2010' }}>
                <div style={{ color: '#a08060', fontFamily: 'Cinzel, serif', fontSize: '0.65rem', letterSpacing: '0.1em', marginBottom: 4 }}>PF GUADAGNATI — CONFERMATO</div>
                <div style={{ fontFamily: 'Cinzel, serif', fontSize: '3rem', color: '#c8922a', lineHeight: 1 }}>
                  +{hpGain}
                </div>
                <div style={{ color: '#a08060', fontFamily: 'Crimson Text, serif', fontSize: '0.85rem', marginTop: 6 }}>
                  {hpRoll} (dado) {conMod >= 0 ? '+' : ''}{conMod} (COS)
                  &nbsp;→ {character.hpMax} ➜ <strong style={{ color: '#e8d5a3' }}>{character.hpMax + hpGain}</strong>
                </div>
                <div style={{ color: '#5a4020', fontFamily: 'Cinzel, serif', fontSize: '0.65rem', marginTop: 8, letterSpacing: '0.04em' }}>
                  ⚔ TIRO IRREVERSIBILE — NON PUÒ ESSERE RIPETUTO
                </div>
              </div>
            )}

            <div className="flex justify-between mt-6">
              <WizardButton onClick={onClose} variant="secondary">Annulla</WizardButton>
              <WizardButton onClick={() => setStepIndex(i => i + 1)} disabled={!hpLocked}>
                {hasAsi ? 'Avanti → Caratteristica' : 'Avanti → Conferma'}
              </WizardButton>
            </div>
          </div>
        )}

        {/* ── Step ASI ── */}
        {step === 'asi' && (
          <div>
            <h3 className="mb-2">Aumento di Caratteristica</h3>
            <p style={{ color: '#a08060', fontFamily: 'Crimson Text, serif', fontSize: '0.85rem', fontStyle: 'italic', marginBottom: 16 }}>
              Al livello {newLevel} puoi aumentare le caratteristiche o apprendere un talento.
            </p>

            {/* Modalità */}
            <div className="flex gap-1 mb-5">
              {(['single', 'split', 'feat'] as AsiMode[]).map(mode => (
                <button key={mode} onClick={() => resetAsi(mode)}
                  style={{ flex: 1, border: `1px solid ${asiMode === mode ? '#c8922a' : '#5a4020'}`, color: asiMode === mode ? '#c8922a' : '#a08060', backgroundColor: asiMode === mode ? '#2a2010' : 'transparent', fontFamily: 'Cinzel, serif', padding: '8px 4px', cursor: 'pointer', fontSize: '0.75rem', letterSpacing: '0.03em' }}>
                  {mode === 'single' ? '+2 a una' : mode === 'split' ? '+1/+1 a due' : '⚑ Talento'}
                </button>
              ))}
            </div>

            {/* +2 su una */}
            {asiMode === 'single' && (
              <div>
                <p style={{ fontSize: '0.7rem', color: '#a08060', fontFamily: 'Cinzel, serif', letterSpacing: '0.05em', marginBottom: 10 }}>
                  SCEGLI UNA CARATTERISTICA DA AUMENTARE DI +2
                </p>
                <StatGrid stats={sheet.stats} selected={asiSingle ? [asiSingle] : []} increment={2}
                  onSelect={stat => setAsiSingle(stat)} maxSelected={1} />
              </div>
            )}

            {/* +1/+1 su due */}
            {asiMode === 'split' && (
              <div>
                <p style={{ fontSize: '0.7rem', color: '#a08060', fontFamily: 'Cinzel, serif', letterSpacing: '0.05em', marginBottom: 10 }}>
                  SCEGLI DUE CARATTERISTICHE DIVERSE DA AUMENTARE DI +1
                </p>
                <StatGrid stats={sheet.stats} selected={[asiSplitA, asiSplitB].filter(Boolean) as StatKey[]} increment={1}
                  onSelect={stat => {
                    if (!asiSplitA) { setAsiSplitA(stat); return; }
                    if (stat === asiSplitA) { setAsiSplitA(null); return; }
                    if (!asiSplitB) { setAsiSplitB(stat); return; }
                    if (stat === asiSplitB) { setAsiSplitB(null); return; }
                  }} maxSelected={2} />
              </div>
            )}

            {/* Talento */}
            {asiMode === 'feat' && (
              <div>
                <p style={{ fontSize: '0.7rem', color: '#a08060', fontFamily: 'Cinzel, serif', letterSpacing: '0.05em', marginBottom: 10 }}>
                  SCEGLI UN TALENTO SRD O PERSONALIZZATO
                </p>

                {/* Talento selezionato */}
                {selectedFeat && (
                  <div className="mb-3 p-3" style={{ border: '1px solid #c8922a', backgroundColor: '#2a2010' }}>
                    <div className="flex justify-between items-start">
                      <div>
                        <div style={{ fontFamily: 'Cinzel, serif', color: '#c8922a', fontSize: '0.95rem' }}>{selectedFeat.name}</div>
                        {selectedFeat.prerequisite && (
                          <div style={{ color: '#a08060', fontFamily: 'Crimson Text, serif', fontSize: '0.75rem', fontStyle: 'italic' }}>
                            Prerequisito: {selectedFeat.prerequisite}
                          </div>
                        )}
                      </div>
                      <button onClick={() => setSelectedFeat(null)}
                        style={{ border: 'none', color: '#5a4020', backgroundColor: 'transparent', cursor: 'pointer', fontSize: '1rem' }}>✕</button>
                    </div>
                    <p style={{ color: '#a08060', fontFamily: 'Crimson Text, serif', fontSize: '0.85rem', marginTop: 6 }}>{selectedFeat.effect}</p>
                  </div>
                )}

                {!selectedFeat && (
                  <>
                    {/* Ricerca SRD */}
                    <div className="relative mb-3">
                      <input value={featSearch}
                        onChange={e => { setFeatSearch(e.target.value); setShowFeatList(true); }}
                        onFocus={() => setShowFeatList(true)}
                        placeholder="Cerca talento SRD…"
                        style={{ width: '100%', backgroundColor: 'transparent', border: 'none', borderBottom: '1px solid #5a4020', color: '#e8d5a3', outline: 'none', fontFamily: 'Crimson Text, serif', fontSize: '0.95rem', padding: '6px 0' }} />

                      {showFeatList && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setShowFeatList(false)} />
                          <div className="absolute left-0 right-0 z-20 max-h-52 overflow-y-auto"
                            style={{ backgroundColor: '#221c14', border: '1px solid #5a4020', top: '100%' }}>
                            {searchFeats(featSearch).map(feat => (
                              <button key={feat.key}
                                onClick={() => { setSelectedFeat(feat); setFeatSearch(''); setShowFeatList(false); }}
                                style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 12px', border: 'none', borderBottom: '1px solid #2a2018', backgroundColor: 'transparent', cursor: 'pointer', color: '#e8d5a3', fontFamily: 'Crimson Text, serif', fontSize: '0.9rem' }}>
                                <div style={{ fontFamily: 'Cinzel, serif', fontSize: '0.8rem', color: '#c8922a' }}>{feat.name}</div>
                                {feat.prerequisite && (
                                  <div style={{ fontSize: '0.7rem', color: '#5a4020', fontStyle: 'italic' }}>Req: {feat.prerequisite}</div>
                                )}
                                <div style={{ fontSize: '0.8rem', color: '#a08060', marginTop: 2 }}>{feat.effect.slice(0, 80)}…</div>
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>

                    <div style={{ color: '#5a4020', fontFamily: 'Crimson Text, serif', fontSize: '0.8rem', marginBottom: 8, textAlign: 'center' }}>
                      — oppure —
                    </div>

                    <div>
                      <input value={featCustom} onChange={e => setFeatCustom(e.target.value)}
                        placeholder="Nome talento personalizzato / homebrew…"
                        style={{ width: '100%', backgroundColor: 'transparent', border: 'none', borderBottom: '1px solid #5a4020', color: '#e8d5a3', outline: 'none', fontFamily: 'Crimson Text, serif', fontSize: '0.95rem', padding: '6px 0' }} />
                      <div style={{ color: '#5a4020', fontSize: '0.75rem', fontFamily: 'Crimson Text, serif', fontStyle: 'italic', marginTop: 4 }}>
                        Gli effetti del talento vanno aggiunti manualmente alla scheda.
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            <div className="flex justify-between mt-6">
              <WizardButton onClick={() => setStepIndex(i => i - 1)} variant="secondary">← Indietro</WizardButton>
              <WizardButton onClick={() => setStepIndex(i => i + 1)} disabled={!asiValid}>Avanti → Conferma</WizardButton>
            </div>
          </div>
        )}

        {/* ── Step Confirm ── */}
        {step === 'confirm' && (
          <div>
            <h3 className="mb-4">Riepilogo Level Up</h3>
            <div className="space-y-2 mb-6">
              <SummaryRow label="Nuovo livello" value={`${newLevel}`} />
              <SummaryRow label="PF guadagnati" value={`+${hpGain} (${character.hpMax} → ${character.hpMax + hpGain})`} />
              {newProf !== proficiencyBonus(character.level) && (
                <SummaryRow label="Bonus competenza" value={`+${proficiencyBonus(character.level)} → +${newProf}`} />
              )}
              {hasAsi && asiMode === 'single' && asiSingle && (
                <SummaryRow label="+2 a caratteristica"
                  value={`${STAT_LABELS[asiSingle]} (${STAT_SHORT[asiSingle]}): ${sheet.stats[asiSingle]} → ${Math.min(20, sheet.stats[asiSingle] + 2)}`} />
              )}
              {hasAsi && asiMode === 'split' && asiSplitA && asiSplitB && (
                <>
                  <SummaryRow label="+1 a caratteristica A" value={`${STAT_LABELS[asiSplitA]}: ${sheet.stats[asiSplitA]} → ${Math.min(20, sheet.stats[asiSplitA] + 1)}`} />
                  <SummaryRow label="+1 a caratteristica B" value={`${STAT_LABELS[asiSplitB]}: ${sheet.stats[asiSplitB]} → ${Math.min(20, sheet.stats[asiSplitB] + 1)}`} />
                </>
              )}
              {hasAsi && asiMode === 'feat' && (
                <SummaryRow label="Talento acquisito" value={selectedFeat?.name ?? featCustom} />
              )}
              {clsFeatures.length > 0 && (
                <SummaryRow label="Nuove capacità" value={clsFeatures.join(', ')} />
              )}
            </div>

            <div className="flex justify-between">
              <WizardButton onClick={() => setStepIndex(i => i - 1)} variant="secondary">← Modifica</WizardButton>
              <button onClick={handleConfirm} disabled={saving}
                style={{ border: '1px solid #c8922a', color: '#1a1410', backgroundColor: saving ? '#5a4020' : '#c8922a', fontFamily: 'Cinzel, serif', fontSize: '0.9rem', padding: '10px 28px', cursor: saving ? 'not-allowed' : 'pointer' }}>
                {saving ? 'Salvando…' : `⬆ Conferma Lv ${newLevel}`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Griglia caratteristiche ─────────────────────────────────────────────────
function StatGrid({ stats, selected, onSelect, increment, maxSelected }: {
  stats: CharacterSheet['stats'];
  selected: StatKey[];
  onSelect: (stat: StatKey) => void;
  increment: number;
  maxSelected: number;
}) {
  return (
    <div className="grid grid-cols-3 gap-2 mb-2">
      {STATS.map(stat => {
        const val = stats[stat];
        const mod = abilityModifier(val);
        const isMax = val >= 20;
        const isSel = selected.includes(stat);
        const isFull = selected.length >= maxSelected && !isSel;
        return (
          <button key={stat} onClick={() => !isMax && !isFull && onSelect(stat)} disabled={isMax}
            style={{
              border: `1px solid ${isSel ? '#c8922a' : isMax ? '#2a2018' : '#5a4020'}`,
              backgroundColor: isSel ? '#2a2010' : '#1e1810',
              color: isMax ? '#3a3020' : '#e8d5a3',
              padding: '10px 6px', textAlign: 'center',
              fontFamily: 'Cinzel, serif',
              cursor: isMax || isFull ? 'not-allowed' : 'pointer',
              opacity: isFull && !isSel ? 0.4 : 1,
            }}>
            <div style={{ fontSize: '0.55rem', color: '#a08060', letterSpacing: '0.06em', marginBottom: 2 }}>{STAT_LABELS[stat].toUpperCase()}</div>
            <div style={{ fontSize: '1.3rem', lineHeight: 1.1 }}>
              {isMax ? '20' : isSel ? `${val} → ${val + increment}` : `${val}`}
            </div>
            <div style={{ fontSize: '0.75rem', color: mod >= 0 ? '#c8922a' : '#8b2020' }}>
              {formatModifier(mod)}{isSel ? ` → ${formatModifier(mod + increment > 10 ? 5 : abilityModifier(Math.min(20, val + increment)))}` : ''}
            </div>
            {isMax && <div style={{ fontSize: '0.5rem', color: '#3a3020', letterSpacing: '0.04em' }}>MAX</div>}
          </button>
        );
      })}
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-1.5" style={{ borderBottom: '1px solid #2a2018' }}>
      <span style={{ color: '#a08060', fontFamily: 'Cinzel, serif', fontSize: '0.72rem', letterSpacing: '0.04em' }}>{label.toUpperCase()}</span>
      <span style={{ color: '#e8d5a3', fontFamily: 'Crimson Text, serif', fontSize: '0.9rem' }}>{value}</span>
    </div>
  );
}

// ─── Features di classe per livello ──────────────────────────────────────────
function getNewFeatures(classKey: string, level: number): string[] {
  const features: Record<string, Record<number, string[]>> = {
    barbarian: { 2: ['Temerarietà'], 3: ['Senso del Pericolo', 'Via del Primitivo'], 5: ['Attacco Extra', 'Scatto Rapido'], 7: ['Istinto Ferale'] },
    bard: { 2: ['Verso di Cura', 'Versatilità del Bardo'], 3: ['Competenza Esperta', 'Collegio Bardico'], 5: ['Ispirazione Bardica (d8)'], 9: ['Segreti Magici'] },
    cleric: { 2: ['Incanalare Divinità'], 5: ['Distruggi Non Morti'], 8: ['Colpo Divino / Potente Fulmine'], 10: ['Intervento Divino'] },
    druid: { 2: ['Forma Selvatica', 'Cerchia Druidica'], 4: ['Miglioramento Forma Selvatica'], 18: ['Corpo Senza Età', 'Mente Bestiale'] },
    fighter: { 2: ['Scatto d\'Azione'], 3: ['Archetipo Marziale'], 5: ['Attacco Extra'], 9: ['Indomabile'], 11: ['Attacco Extra (2)'], 17: ['Scatto d\'Azione (2)'], 20: ['Attacco Extra (3)'] },
    monk: { 2: ['Ki', 'Movimento senza Armatura'], 3: ['Tradizione Monastica', 'Schivata Deflettente'], 4: ['Caduta Lenta'], 5: ['Attacco Extra', 'Colpo Stordente'], 6: ['Colpi di Ki', 'Forza Imperturbabile'], 7: ['Evasione', 'Quiete della Mente'] },
    paladin: { 2: ['Combattimento Divino', 'Imposizione delle Mani Extra'], 3: ['Sacramento Sacro'], 5: ['Attacco Extra'] },
    ranger: { 2: ['Stile di Combattimento', 'Lancia-incantesimi'], 3: ['Archetipo del Ranger', 'Scaltrezza Primitiva'], 5: ['Attacco Extra'] },
    rogue: { 2: ['Azione Scaltra'], 3: ['Archetipo Ladro'], 5: ['Attacco Furtivo (3d6)'], 7: ['Evasione'], 11: ['Talento Affidabile'], 14: ['Senso Cieco'], 15: ['Riflessi Scivolosi'] },
    sorcerer: { 2: ['Magia della Stregoneria'], 3: ['Metamagia'], 6: ['Origini del Potere Extra'] },
    warlock: { 2: ['Invocazioni Occulte'], 3: ['Dono del Patto'], 5: ['Invocazione Extra'] },
    wizard: { 2: ['Tradizione Arcana'], 6: ['Privilegio della Tradizione'], 18: ['Maestria degli Incantesimi'], 20: ['Firma degli Incantesimi'] },
  };
  return features[classKey]?.[level] ?? [];
}
