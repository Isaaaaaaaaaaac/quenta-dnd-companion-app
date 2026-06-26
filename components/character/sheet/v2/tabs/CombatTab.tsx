'use client';

import { startTransition, useState } from 'react';
import ListDetailPanel from '../ListDetailPanel';
import { useToast } from '../useToast';
import { useClassResource } from '@/lib/db/actions';
import { abilityModifier, formatModifier } from '@/lib/rules/calculations';
import { innerBox } from '../styles';
import { getSrdItemDescription, getSrdItemIcon } from '@/lib/srd/itemDescription';
import SrdIcon from '../SrdIcon';
import type { CharacterWeapon, PinnedFeature, CharacterResource, CharacterStats } from '@/lib/db/schema';

export interface CombatTabProps {
  characterId: string;
  weapons: CharacterWeapon[];
  stats: CharacterStats;
  prof: number;
  pinnedAll: PinnedFeature[];
  resources: CharacterResource[];
  spellDC: number | null;
  canCast: boolean;
}

interface AttackItem { id: string; weapon: CharacterWeapon; }
interface FeatureItem { id: string; feature: PinnedFeature; }

export default function CombatTab({ characterId, weapons, stats, prof, pinnedAll, resources, spellDC, canCast }: CombatTabProps) {
  const { show } = useToast();
  const [subTab, setSubTab] = useState<'attacks' | 'abilities'>('attacks');
  const [selectedAttackId, setSelectedAttackId] = useState<string | null>(null);
  const [selectedFeatureId, setSelectedFeatureId] = useState<string | null>(null);

  const attackItems: AttackItem[] = weapons.map(w => ({ id: w.id, weapon: w }));
  const featureItems: FeatureItem[] = pinnedAll.map(f => ({ id: f.key, feature: f }));

  function handleUse(resourceKey: string) {
    startTransition(async () => {
      // eslint-disable-next-line react-hooks/rules-of-hooks -- useClassResource is a server action (lib/db/actions.ts), not a React hook; its name only happens to start with "use"
      await useClassResource(characterId, resourceKey, -1);
      show('Capacità utilizzata');
    });
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 2, marginBottom: 'var(--s-1)', background: 'var(--bg-inner)', borderRadius: 'var(--r-sm)', padding: 2, width: 'fit-content' }}>
        <button
          type="button"
          onClick={() => setSubTab('attacks')}
          style={{ padding: '5px 14px', borderRadius: 'var(--r-sm)', cursor: 'pointer', fontSize: '9px', fontWeight: 600, letterSpacing: '.05em', border: 'none', color: subTab === 'attacks' ? 'var(--fg-1)' : 'var(--fg-2)', background: subTab === 'attacks' ? 'var(--bg-card)' : 'transparent' }}
        >
          Attacchi ({attackItems.length})
        </button>
        <button
          type="button"
          onClick={() => setSubTab('abilities')}
          style={{ padding: '5px 14px', borderRadius: 'var(--r-sm)', cursor: 'pointer', fontSize: '9px', fontWeight: 600, letterSpacing: '.05em', border: 'none', color: subTab === 'abilities' ? 'var(--fg-1)' : 'var(--fg-2)', background: subTab === 'abilities' ? 'var(--bg-card)' : 'transparent' }}
        >
          Capacità ({featureItems.length})
        </button>
      </div>

      {subTab === 'attacks' ? (
        <ListDetailPanel
          items={attackItems}
          selectedId={selectedAttackId}
          onSelect={setSelectedAttackId}
          emptyDetailText="Seleziona un attacco per vederne i dettagli"
          renderListItem={(item) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 8px', borderRadius: 'var(--r-sm)' }}>
              <SrdIcon icon={getSrdItemIcon(item.weapon)} />
              <div>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: '12px', color: 'var(--fg-1)' }}>{item.weapon.name}</div>
                <div style={{ fontSize: '9px', color: 'var(--fg-3)' }}>{item.weapon.damageType}</div>
              </div>
            </div>
          )}
          renderDetail={(item) => {
            const w = item.weapon;
            const atkMod = abilityModifier(stats[w.attackStat]) + prof + (w.magicBonus ?? 0);
            const dmgMod = abilityModifier(stats[w.attackStat]) + (w.magicBonus ?? 0);
            return (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <SrdIcon icon={getSrdItemIcon(w)} size={24} color="var(--gold)" />
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: 700, color: 'var(--fg-1)' }}>{w.name}</div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <div style={{ ...innerBox, padding: '5px 10px' }}>
                    <div style={{ fontSize: '7px', color: 'var(--fg-3)', textTransform: 'uppercase' }}>Tiro per Colpire</div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--success)' }}>{formatModifier(atkMod)}</div>
                  </div>
                  <div style={{ ...innerBox, padding: '5px 10px' }}>
                    <div style={{ fontSize: '7px', color: 'var(--fg-3)', textTransform: 'uppercase' }}>Danno</div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--fg-1)' }}>
                      <span>{w.damageDice} </span>
                      <span>{formatModifier(dmgMod)} {w.damageType}</span>
                    </div>
                  </div>
                </div>
                {(() => {
                  const srdDesc = getSrdItemDescription(w);
                  return srdDesc ? (
                    <p style={{ fontFamily: 'var(--font-serif)', fontSize: '13px', color: 'var(--fg-2)', lineHeight: 1.65, marginTop: 12 }}>{srdDesc}</p>
                  ) : null;
                })()}
                {w.notes && (
                  <p style={{ fontFamily: 'var(--font-serif)', fontSize: '13px', color: 'var(--fg-2)', lineHeight: 1.65, fontStyle: 'italic', marginTop: 12 }}>{w.notes}</p>
                )}
              </div>
            );
          }}
        />
      ) : (
        <ListDetailPanel
          items={featureItems}
          selectedId={selectedFeatureId}
          onSelect={setSelectedFeatureId}
          emptyDetailText="Seleziona una capacità per vederne i dettagli"
          renderListItem={(item) => (
            <div style={{ padding: '7px 8px', borderRadius: 'var(--r-sm)' }}>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '12px', color: 'var(--fg-1)' }}>{item.feature.name}</div>
            </div>
          )}
          renderDetail={(item) => {
            const feature = item.feature;
            const resource = feature.resourceKey ? resources.find(r => r.resourceKey === feature.resourceKey) : null;
            return (
              <div>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: 700, color: 'var(--fg-1)', marginBottom: 12 }}>{feature.name}</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                  <div style={{ ...innerBox, padding: '5px 10px' }}>
                    <div style={{ fontSize: '7px', color: 'var(--fg-3)', textTransform: 'uppercase' }}>Utilizzi</div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--gold)' }}>
                      {resource ? `${resource.current}/${resource.maximum}` : 'Illimitato'}
                    </div>
                  </div>
                  {canCast && feature.resourceKey && (
                    <div style={{ ...innerBox, padding: '5px 10px' }}>
                      <div style={{ fontSize: '7px', color: 'var(--fg-3)', textTransform: 'uppercase' }}>CD</div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--danger)' }}>{spellDC}</div>
                    </div>
                  )}
                </div>
                {feature.resourceKey && (
                  <button
                    type="button"
                    onClick={() => handleUse(feature.resourceKey!)}
                    style={{ fontSize: '10px', color: 'var(--gold)', border: '1px solid var(--gold)', borderRadius: 'var(--r-sm)', padding: '4px 12px', background: 'none', cursor: 'pointer' }}
                  >
                    Usa
                  </button>
                )}
                {feature.description && (
                  <p style={{ fontFamily: 'var(--font-serif)', fontSize: '13px', color: 'var(--fg-2)', lineHeight: 1.65, marginTop: 12 }}>{feature.description}</p>
                )}
              </div>
            );
          }}
        />
      )}
    </div>
  );
}
