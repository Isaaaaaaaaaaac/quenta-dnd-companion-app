'use client';

import { useState } from 'react';
import { requestCharacterSwitch } from '@/lib/db/userActions';
import type { Character, CharacterSheet, Campaign, UserCampaignMembership } from '@/lib/db/schema';
import { CLASSES } from '@/lib/srd/classes';

interface CampaignData {
  membership: UserCampaignMembership;
  campaign: Campaign | null;
  characters: Character[];
}

interface Props { data: CampaignData[]; userId: string; }

export default function MyCharactersClient({ data, userId }: Props) {
  const [requesting, setRequesting] = useState<string | null>(null);
  const [requested, setRequested] = useState<Set<string>>(new Set());

  async function handleRequestSwitch(campaignId: string, toCharId: string, fromCharId?: string) {
    setRequesting(toCharId);
    await requestCharacterSwitch(userId, campaignId, toCharId, fromCharId);
    setRequested(prev => new Set([...prev, toCharId]));
    setRequesting(null);
  }

  if (data.length === 0) return (
    <div style={{ textAlign: 'center', padding: '64px 0' }}>
      <p style={{ fontFamily: 'var(--font-body)', color: 'var(--fg-2)', fontSize: '1rem', fontStyle: 'italic', lineHeight: 1.7 }}>
        Non sei ancora membro di nessuna campagna.<br />Chiedi il link di invito al tuo DM.
      </p>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
      {data.map(({ membership, campaign, characters }) => (
        <div key={membership.campaignId}>
          {/* Campaign header */}
          <div style={{ marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--border-leather)' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--fg-1)', letterSpacing: '0.02em', marginBottom: 4 }}>
              {campaign?.name ?? 'Campagna'}
            </div>
            {campaign?.setting && (
              <div style={{ fontFamily: 'var(--font-body)', color: 'var(--gold)', fontSize: '0.85rem', fontStyle: 'italic', opacity: 0.8 }}>
                {campaign.setting}
              </div>
            )}
          </div>

          {/* No characters */}
          {characters.length === 0 ? (
            <div style={{
              border: '1px dashed var(--border-leather)',
              padding: 32,
              textAlign: 'center',
            }}>
              <p style={{ fontFamily: 'var(--font-body)', color: 'var(--fg-2)', fontStyle: 'italic', fontSize: '0.95rem', marginBottom: 20 }}>
                Nessun personaggio in questa campagna.
              </p>
              <a href={`/campaigns/${membership.campaignId}/characters/new`} className="btn btn-secondary">
                + Crea personaggio
              </a>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {characters.map(char => {
                const sheet = char.sheet as CharacterSheet;
                const cls = CLASSES.find(c => c.key === sheet.classes?.[0]?.classKey);
                const isActive = membership.activeCharacterId === char.id;
                const hasRequested = requested.has(char.id);

                return (
                  <div key={char.id} className="card" style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 24,
                    padding: 24,
                    borderColor: isActive ? 'var(--gold)' : 'var(--border-leather)',
                    position: 'relative',
                    overflow: 'hidden',
                  }}>
                    {/* Active accent */}
                    {isActive && (
                      <div style={{
                        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
                        background: 'var(--gold-border)',
                        opacity: 0.5,
                      }} />
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: 20, flex: 1, minWidth: 0 }}>
                      {/* Portrait */}
                      <div style={{
                        width: 52, height: 52, flexShrink: 0,
                        border: `1px solid ${isActive ? 'var(--gold)' : 'var(--border-leather)'}`,
                        backgroundColor: 'var(--bg-card)',
                        overflow: 'hidden',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {sheet.portraitUrl
                          ? <img src={sheet.portraitUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : <span style={{ color: 'var(--fg-3)', fontSize: '1.2rem' }}>⚔</span>
                        }
                      </div>

                      {/* Info */}
                      <div style={{ minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, color: isActive ? 'var(--gold)' : 'var(--fg-1)', letterSpacing: '0.02em' }}>
                            {char.name}
                          </span>
                          {isActive && (
                            <span className="badge badge-info">Attivo</span>
                          )}
                        </div>
                        <div style={{ fontFamily: 'var(--font-body)', color: 'var(--fg-2)', fontSize: '0.85rem', fontStyle: 'italic', marginBottom: 4 }}>
                          {sheet.race && `${sheet.race} · `}{cls?.name ?? ''} {char.level}
                        </div>
                        <div style={{ fontFamily: 'var(--font-label)', fontSize: '7.5px', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--fg-3)' }}>
                          {char.hpCurrent}/{char.hpMax} PF &nbsp;·&nbsp; CA {sheet.armorClass ?? '—'}
                        </div>
                      </div>
                    </div>

                    {/* Switch button */}
                    {!isActive && (
                      <div style={{ flexShrink: 0 }}>
                        {hasRequested ? (
                          <span style={{ fontFamily: 'var(--font-label)', fontSize: '8px', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--fg-3)' }}>
                            Richiesta inviata
                          </span>
                        ) : (
                          <button
                            onClick={() => handleRequestSwitch(membership.campaignId, char.id, membership.activeCharacterId ?? undefined)}
                            disabled={requesting === char.id}
                            className="btn btn-ghost"
                            style={{ padding: '6px 16px' }}
                          >
                            {requesting === char.id ? '…' : 'Richiedi attivo'}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              <div style={{ marginTop: 4 }}>
                <a href={`/campaigns/${membership.campaignId}/characters/new`} className="btn btn-ghost" style={{ padding: '6px 16px' }}>
                  + Altro personaggio
                </a>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
