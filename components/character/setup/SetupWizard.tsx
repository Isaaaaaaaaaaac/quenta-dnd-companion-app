'use client';

import { useState } from 'react';
import { saveEquipment, saveInventory, saveKnownSpells } from '@/lib/db/actions';
import { calcAC } from '@/lib/srd/equipment';
import { abilityModifier, totalCarriedWeight } from '@/lib/rules/calculations';
import { CLASSES } from '@/lib/srd/classes';
import type { Character, CharacterSheet, CharacterWeapon, MagicItem, KnownSpell } from '@/lib/db/schema';

import TabWeapons from './TabWeapons';
import TabInventory from './TabInventory';
import TabSpells from './TabSpells';

type Tab = 'weapons' | 'inventory' | 'spells';
interface Props { character: Character; onClose: () => void; }

// ── DS inline style constants ──────────────────────────────────────────────
const S = {
  eyebrow: {
    fontFamily: 'var(--font-label)',
    fontSize: '8px',
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
    color: 'var(--gold)',
    opacity: 0.8,
  },
  btnGhost: {
    fontFamily: 'var(--font-label)',
    fontSize: '10px',
    letterSpacing: '0.3em',
    textTransform: 'uppercase' as const,
    padding: '8px 18px',
    border: '1px solid var(--border-leather)',
    backgroundColor: 'transparent',
    color: 'var(--fg-3)',
    cursor: 'pointer',
  },
  btnSecondary: {
    fontFamily: 'var(--font-label)',
    fontSize: '10px',
    letterSpacing: '0.3em',
    textTransform: 'uppercase' as const,
    padding: '8px 22px',
    border: '1px solid var(--border-leather-dim)',
    backgroundColor: 'transparent',
    color: 'var(--fg-2)',
    cursor: 'pointer',
  },
} as const;

const TABS: { id: Tab; label: string }[] = [
  { id: 'weapons',   label: 'Armi & Difesa' },
  { id: 'inventory', label: 'Inventario' },
  { id: 'spells',    label: 'Incantesimi' },
];

export default function SetupWizard({ character, onClose }: Props) {
  const sheet = character.sheet as CharacterSheet;
  const cls = CLASSES.find(c => c.key === sheet.classes?.[0]?.classKey);
  const isSpellcaster = cls?.spellcastingType !== 'none';
  const dexMod = abilityModifier(sheet.stats?.dex ?? 10);

  const [tab, setTab] = useState<Tab>('weapons');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [weapons, setWeapons] = useState<CharacterWeapon[]>(sheet.weapons ?? []);
  const [equippedArmorKey, setEquippedArmorKey] = useState<string | null>(sheet.equippedArmorKey ?? null);
  const [equippedArmorName, setEquippedArmorName] = useState(sheet.equippedArmorName ?? '');
  const [hasShield, setHasShield] = useState(sheet.hasShield ?? false);
  const [magicItems, setMagicItems] = useState<MagicItem[]>(sheet.magicItems ?? []);
  const [inventory, setInventory] = useState(sheet.inventory ?? []);
  const [money, setMoney] = useState(sheet.money ?? { pp: 0, gp: 0, ep: 0, sp: 0, cp: 0 });
  const [knownSpells, setKnownSpells] = useState<KnownSpell[]>(sheet.knownSpells ?? []);

  const computedAC = calcAC(equippedArmorKey, hasShield, dexMod, sheet.classes?.[0]?.classKey);
  const carriedKg = totalCarriedWeight(inventory);
  const carryMax = Math.floor((sheet.stats?.str ?? 10) * 7.5);

  async function handleSave() {
    setSaving(true);
    await Promise.all([
      saveEquipment(character.id, weapons, equippedArmorKey, equippedArmorName, hasShield, magicItems),
      saveInventory(character.id, inventory, money),
      isSpellcaster ? saveKnownSpells(character.id, knownSpells) : Promise.resolve(),
    ]);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const visibleTabs = isSpellcaster ? TABS : TABS.filter(t => t.id !== 'spells');

  return (
    <div style={{
      position: 'fixed', inset: 0, backgroundColor: 'var(--modal-bg)',
      zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }}
      onClick={e => e.target === e.currentTarget && onClose()}>

      <div style={{
        backgroundColor: 'var(--bg-deep)',
        border: '1px solid var(--gold)',
        width: '100%', maxWidth: 700, maxHeight: '90vh',
        display: 'flex', flexDirection: 'column',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Gold top accent */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'var(--gold-border)', opacity: 0.5 }} />

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 28px', borderBottom: '1px solid var(--border-leather)', flexShrink: 0 }}>
          <div>
            <div style={{ ...S.eyebrow, marginBottom: 8 }}>Personaggio</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 700, color: 'var(--fg-1)', letterSpacing: '0.02em', marginBottom: 4 }}>
              Equipaggiamento
            </div>
            <div style={{ fontFamily: 'var(--font-body)', color: 'var(--fg-2)', fontSize: '0.875rem', fontStyle: 'italic' }}>
              {character.name}
            </div>
          </div>
          <button onClick={onClose} style={{ backgroundColor: 'transparent', border: 'none', color: 'var(--fg-3)', cursor: 'pointer', fontSize: '1.1rem', lineHeight: 1 }}>
            ✕
          </button>
        </div>

        {/* Tab bar */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-leather)', flexShrink: 0 }}>
          {visibleTabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              flex: 1, padding: '12px 8px', cursor: 'pointer',
              backgroundColor: 'transparent', border: 'none',
              borderBottom: `2px solid ${tab === t.id ? 'var(--gold)' : 'transparent'}`,
              color: tab === t.id ? 'var(--gold)' : 'var(--fg-2)',
              fontFamily: 'var(--font-label)', fontSize: '8px', letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content — padding: 28px inline, no Tailwind */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 28 }}>
          {tab === 'weapons' && (
            <TabWeapons
              sheet={sheet}
              weapons={weapons} setWeapons={setWeapons}
              equippedArmorKey={equippedArmorKey} setEquippedArmorKey={setEquippedArmorKey}
              equippedArmorName={equippedArmorName} setEquippedArmorName={setEquippedArmorName}
              hasShield={hasShield} setHasShield={setHasShield}
              magicItems={magicItems} setMagicItems={setMagicItems}
              computedAC={computedAC}
            />
          )}
          {tab === 'inventory' && (
            <TabInventory
              inventory={inventory} setInventory={setInventory}
              money={money} setMoney={setMoney}
              carriedKg={carriedKg} carryMax={carryMax}
            />
          )}
          {tab === 'spells' && isSpellcaster && (
            <TabSpells
              classKey={sheet.classes?.[0]?.classKey ?? ''}
              level={character.level}
              stats={sheet.stats ?? { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 }}
              knownSpells={knownSpells} setKnownSpells={setKnownSpells}
            />
          )}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 28px', borderTop: '1px solid var(--border-leather)', flexShrink: 0 }}>
          <div style={{ fontFamily: 'var(--font-body)', color: 'var(--fg-3)', fontSize: '0.8rem', fontStyle: 'italic' }}>
            Le modifiche vengono salvate solo premendo "Salva"
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={onClose} style={S.btnGhost}>Chiudi</button>
            <button onClick={handleSave} disabled={saving} style={{
              ...S.btnSecondary,
              ...(saved ? { borderColor: 'var(--info)', color: 'var(--fg-1)' } : {}),
              opacity: saving ? 0.5 : 1,
            }}>
              {saving ? 'Salvando…' : saved ? '✓ Salvato' : 'Salva tutto'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
