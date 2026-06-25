'use client';

import { startTransition, useState } from 'react';
import { card } from './styles';
import { useToast } from './useToast';
import { applyDamage, applyHealing, setTempHp } from '@/lib/db/actions';
import DeathSavesTracker from '@/components/character/sheet/DeathSavesTracker';
import type { Character, CharacterSheet } from '@/lib/db/schema';
import type { SheetViewModel } from '@/lib/character-sheet/buildSheetViewModel';

export interface HpStatsRowProps {
  character: Character;
  sheet: CharacterSheet;
  model: SheetViewModel;
}

const iconButton = (color: string): React.CSSProperties => ({
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  width: 22, height: 22, borderRadius: 'var(--r-sm)', border: `1px solid ${color}`,
  color, background: 'none', cursor: 'pointer', fontSize: '10px',
});

export default function HpStatsRow({ character, sheet, model }: HpStatsRowProps) {
  const { show } = useToast();
  const [input, setInput] = useState('');

  function parsedAmount(): number {
    return parseInt(input, 10) || 0;
  }

  function handleDamage() {
    const v = parsedAmount();
    if (!v) return;
    startTransition(async () => {
      await applyDamage(character.id, v);
      show(`-${v} HP`);
      setInput('');
    });
  }

  function handleHeal() {
    const v = parsedAmount();
    if (!v) return;
    startTransition(async () => {
      await applyHealing(character.id, v);
      show(`+${v} HP`);
      setInput('');
    });
  }

  function handleTemp() {
    const v = parsedAmount();
    if (!v) return;
    startTransition(async () => {
      await setTempHp(character.id, v);
      show(`+${v} HP temp`);
      setInput('');
    });
  }

  const stats: { label: string; value: string }[] = [
    { label: 'C.A.', value: String(sheet.armorClass ?? '—') },
    { label: 'Iniziativa', value: String(model.prof) },
    { label: 'Velocità', value: sheet.speed ? `${sheet.speed}m` : '—' },
  ];
  if (model.canCast) {
    stats.push(
      { label: 'CD Incantesimi', value: String(model.spellDC) },
      { label: 'Attacco Incantesimi', value: String(model.spellAtk) },
    );
  }

  return (
    <div style={{ display: 'flex', gap: 'var(--s-2)', alignItems: 'stretch' }}>
      <div style={{ width: 200, flexShrink: 0, ...card, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 3 }}>
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', fontWeight: 700, color: model.hpColor }}>
            {character.hpCurrent}
          </span>
          <span style={{ fontSize: '10px', color: 'var(--fg-2)' }}>
            / {character.hpMax}{character.hpTemp > 0 ? ` (+${character.hpTemp} temp)` : ''}
          </span>
        </div>
        <div style={{ height: 3, background: 'var(--bg-inner)', borderRadius: 3, overflow: 'hidden', marginBottom: 6 }}>
          <div style={{
            height: '100%', width: `${model.hpPct}%`, background: model.hpColor, borderRadius: 3,
            transition: 'width .5s ease, background .6s',
          }} />
        </div>
        <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
          <input
            type="number" min={0} placeholder="0" value={input}
            onChange={e => setInput(e.target.value)}
            style={{
              width: 32, height: 22, padding: '0 2px', textAlign: 'center',
              background: 'var(--bg-inner)', border: '1px solid var(--border-leather)',
              borderRadius: 'var(--r-sm)', color: 'var(--fg-1)', fontSize: '10px',
            }}
          />
          <button title="Danno" onClick={handleDamage} style={iconButton('var(--danger)')}>−</button>
          <button title="Cura" onClick={handleHeal} style={iconButton('var(--success)')}>+</button>
          <button title="Temp" onClick={handleTemp} style={{ ...iconButton('var(--gold)'), width: 'auto', padding: '0 5px', fontSize: '7px' }}>TMP</button>
        </div>
        {character.hpCurrent <= 0 && (
          <div style={{ marginTop: 5, paddingTop: 5, borderTop: '1px solid rgba(168,51,28,.35)' }}>
            <DeathSavesTracker characterId={character.id} sheet={sheet} />
          </div>
        )}
      </div>

      <div style={{ flex: 1, display: 'flex', gap: 'var(--s-2)' }}>
        {stats.map(stat => (
          <div key={stat.label} style={{ flex: 1, ...card, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '7px', fontWeight: 600, letterSpacing: '.06em', color: 'var(--fg-2)', textTransform: 'uppercase', marginBottom: 2 }}>
              {stat.label}
            </span>
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', fontWeight: 700, color: 'var(--fg-1)' }}>
              {stat.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
