'use client';

import { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import SidebarDmActions from './SidebarDmActions';
import HpStatsRow from './HpStatsRow';
import ConditionsRow from './ConditionsRow';
import TabNav, { type SheetTabId } from './TabNav';
import { ToastProvider } from './Toast';
import StatsTab from './tabs/StatsTab';
import CombatTab from './tabs/CombatTab';
import SpellsTab from './tabs/SpellsTab';
import InventoryTab from './tabs/InventoryTab';
import NarrativeTab from './tabs/NarrativeTab';
import type { Character, CharacterSheet, CharacterCondition, CharacterResource } from '@/lib/db/schema';
import type { SheetViewModel } from '@/lib/character-sheet/buildSheetViewModel';

export interface CharacterSheetViewProps {
  character: Character;
  sheet: CharacterSheet;
  model: SheetViewModel;
  conditions: CharacterCondition[];
  resources: CharacterResource[];
  campaign: { id: string; name: string } | null;
  isActiveCharacter: boolean;
  currentActiveName: string | null;
  viewerRole: 'dm' | 'player';
  currentUserId: string | null;
  isOwner: boolean;
}

const STORAGE_PREFIX = 'quenta:sheet-v2-tab:';
const VALID_TABS: SheetTabId[] = ['stats', 'combat', 'spells', 'inventory', 'narrative'];

function readStoredTab(characterId: string): SheetTabId {
  if (typeof window === 'undefined') return 'stats';
  const saved = window.localStorage.getItem(`${STORAGE_PREFIX}${characterId}`);
  return (VALID_TABS as string[]).includes(saved ?? '') ? (saved as SheetTabId) : 'stats';
}

export default function CharacterSheetView({
  character, sheet, model, conditions, resources, campaign,
  isActiveCharacter, currentActiveName, viewerRole, currentUserId, isOwner,
}: CharacterSheetViewProps) {
  // Inizializza sempre con 'stats' per coincidere col markup renderizzato dal server
  // (window.localStorage non esiste lì): leggere il valore reale già nel lazy initializer
  // produrrebbe un mismatch di hydration, perché il primo render client avverrebbe con
  // un tab diverso da quello del server prima ancora che React possa confrontarli.
  const [activeTab, setActiveTab] = useState<SheetTabId>('stats');

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intenzionale: sincronizza con localStorage solo dopo il mount, per evitare un mismatch di hydration (vedi commento sopra)
    setActiveTab(readStoredTab(character.id));
  }, [character.id]);

  function handleTabChange(tab: SheetTabId) {
    setActiveTab(tab);
    window.localStorage.setItem(`${STORAGE_PREFIX}${character.id}`, tab);
  }

  return (
    <ToastProvider>
      <div style={{ display: 'flex', gap: 'var(--s-2)', alignItems: 'start' }}>
        <Sidebar
          character={character}
          sheet={sheet}
          model={model}
          resources={resources}
          campaign={campaign}
          isActiveCharacter={isActiveCharacter}
          currentActiveName={currentActiveName}
          dmActions={viewerRole === 'dm' ? (
            <SidebarDmActions characterId={character.id} currentUserId={currentUserId} dmNotes={sheet.dmNotes} />
          ) : undefined}
        />

        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 'var(--s-2)' }}>
          <HpStatsRow character={character} sheet={sheet} model={model} />
          <ConditionsRow characterId={character.id} conditions={conditions} />
          <TabNav characterId={character.id} activeTab={activeTab} onChange={handleTabChange} />

          {activeTab === 'stats' && (
            <StatsTab stats={model.stats} savingThrows={model.savingThrows} skillMap={model.skillMap} level={model.level} />
          )}
          {activeTab === 'combat' && (
            <CombatTab
              characterId={character.id}
              weapons={sheet.weapons ?? []}
              stats={model.stats}
              prof={model.prof}
              pinnedAll={model.pinnedAll}
              resources={resources}
              spellDC={model.spellDC}
              canCast={model.canCast}
            />
          )}
          {activeTab === 'spells' && (
            <SpellsTab
              characterId={character.id}
              activeSpellSlots={model.activeSpellSlots}
              knownSpells={model.knownSpells}
              canCast={model.canCast}
              casterClassKeys={model.casterClassKeys}
              characterClasses={sheet.classes ?? []}
              characterStats={model.stats}
            />
          )}
          {activeTab === 'inventory' && (
            <InventoryTab
              characterId={character.id}
              inventory={sheet.inventory ?? []}
              money={sheet.money}
              carriedKg={model.carriedKg}
              carryMax={model.carryMax}
            />
          )}
          {activeTab === 'narrative' && (
            <NarrativeTab characterId={character.id} charName={character.name} sheet={sheet} isOwner={isOwner} />
          )}
        </div>
      </div>
    </ToastProvider>
  );
}
