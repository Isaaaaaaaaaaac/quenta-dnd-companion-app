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

interface Props {
  character: Character;
  onClose: () => void;
}

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'weapons',   label: 'Armi & Difesa',    icon: '⚔' },
  { id: 'inventory', label: 'Inventario',        icon: '🎒' },
  { id: 'spells',    label: 'Incantesimi',       icon: '📜' },
];

const PREPARED_CASTERS = new Set(['cleric', 'druid', 'paladin', 'wizard', 'artificer']);

export default function SetupWizard({ character, onClose }: Props) {
  const sheet = character.sheet as CharacterSheet;
  const cls = CLASSES.find(c => c.key === sheet.classes?.[0]?.classKey);
  const isSpellcaster = cls?.spellcastingType !== 'none';
  const dexMod = abilityModifier(sheet.stats?.dex ?? 10);

  const [tab, setTab] = useState<Tab>('weapons');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // ─── State equipment ───────────────────────────────────────────
  const [weapons, setWeapons] = useState<CharacterWeapon[]>(sheet.weapons ?? []);
  const [equippedArmorKey, setEquippedArmorKey] = useState<string | null>(sheet.equippedArmorKey ?? null);
  const [equippedArmorName, setEquippedArmorName] = useState(sheet.equippedArmorName ?? '');
  const [hasShield, setHasShield] = useState(sheet.hasShield ?? false);
  const [magicItems, setMagicItems] = useState<MagicItem[]>(sheet.magicItems ?? []);

  // ─── State inventario ──────────────────────────────────────────
  const [inventory, setInventory] = useState(sheet.inventory ?? []);
  const [money, setMoney] = useState(sheet.money ?? { pp: 0, gp: 0, ep: 0, sp: 0, cp: 0 });

  // ─── State incantesimi ─────────────────────────────────────────
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
      position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)',
      zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '16px',
    }}
      onClick={e => e.target === e.currentTarget && onClose()}>

      <div style={{
        backgroundColor: '#1a1410', border: '1px solid #c8922a',
        width: '100%', maxWidth: '680px', maxHeight: '90vh',
        display: 'flex', flexDirection: 'column',
      }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid #5a4020', flexShrink: 0 }}>
          <div>
            <h2 style={{ marginBottom: 0 }}>Equipaggiamento</h2>
            <div style={{ color: '#a08060', fontFamily: 'Crimson Text, serif', fontSize: '0.85rem' }}>
              {character.name}
            </div>
          </div>
          <button onClick={onClose}
            style={{ backgroundColor: 'transparent', border: 'none', color: '#5a4020', cursor: 'pointer', fontSize: '1.2rem', padding: '4px' }}>
            ✕
          </button>
        </div>

        {/* Tab bar */}
        <div className="flex" style={{ borderBottom: '1px solid #5a4020', flexShrink: 0 }}>
          {visibleTabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{
                flex: 1, padding: '12px 8px', cursor: 'pointer',
                backgroundColor: 'transparent', border: 'none',
                borderBottom: `2px solid ${tab === t.id ? '#c8922a' : 'transparent'}`,
                color: tab === t.id ? '#c8922a' : '#a08060',
                fontFamily: 'Cinzel, serif', fontSize: '0.75rem', letterSpacing: '0.04em',
              }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto p-6">
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
        <div className="flex items-center justify-between px-6 py-4"
          style={{ borderTop: '1px solid #5a4020', flexShrink: 0 }}>
          <div style={{ color: '#5a4020', fontFamily: 'Crimson Text, serif', fontSize: '0.8rem', fontStyle: 'italic' }}>
            Le modifiche vengono salvate solo premendo "Salva"
          </div>
          <div className="flex gap-3">
            <button onClick={onClose}
              style={{ border: '1px solid #5a4020', color: '#a08060', backgroundColor: 'transparent', fontFamily: 'Cinzel, serif', padding: '8px 18px', cursor: 'pointer', fontSize: '0.8rem' }}>
              Chiudi
            </button>
            <button onClick={handleSave} disabled={saving}
              style={{
                border: '1px solid #c8922a',
                color: saved ? '#4a7c4e' : '#c8922a',
                backgroundColor: saved ? '#1a2a1a' : 'transparent',
                fontFamily: 'Cinzel, serif', padding: '8px 22px',
                cursor: saving ? 'not-allowed' : 'pointer',
                fontSize: '0.8rem', opacity: saving ? 0.6 : 1,
                transition: 'all 0.3s',
              }}>
              {saving ? 'Salvando…' : saved ? '✓ Salvato' : 'Salva tutto'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
