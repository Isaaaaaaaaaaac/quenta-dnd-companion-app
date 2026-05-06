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
    <div style={{ textAlign: 'center', padding: '4rem', color: '#6a5040', fontFamily: 'Crimson Text, serif', fontStyle: 'italic' }}>
      Non sei ancora membro di nessuna campagna. Chiedi il link di invito al tuo DM.
    </div>
  );

  return (
    <div className="space-y-8">
      {data.map(({ membership, campaign, characters }) => (
        <div key={membership.campaignId}>
          <div style={{ fontFamily: 'Cinzel Decorative, serif', color: '#c8922a', fontSize: '1.1rem', marginBottom: 4 }}>
            {campaign?.name ?? 'Campagna'}
          </div>
          {campaign?.setting && (
            <div style={{ color: '#6a5040', fontFamily: 'Crimson Text, serif', fontSize: '0.85rem', fontStyle: 'italic', marginBottom: 12 }}>{campaign.setting}</div>
          )}

          {characters.length === 0 ? (
            <div style={{ border: '1px dashed #3a3020', padding: 20, textAlign: 'center' }}>
              <p style={{ color: '#6a5040', fontFamily: 'Crimson Text, serif', fontStyle: 'italic', fontSize: '0.9rem', marginBottom: 12 }}>
                Nessun personaggio in questa campagna.
              </p>
              <a href={`/campaigns/${membership.campaignId}/characters/new`}
                style={{ border: '1px solid #c8922a', color: '#c8922a', fontFamily: 'Cinzel, serif', fontSize: '0.75rem', padding: '6px 16px', textDecoration: 'none' }}>
                + Crea personaggio
              </a>
            </div>
          ) : (
            <div className="space-y-3">
              {characters.map(char => {
                const sheet = char.sheet as CharacterSheet;
                const cls = CLASSES.find(c => c.key === sheet.classes?.[0]?.classKey);
                const isActive = membership.activeCharacterId === char.id;
                const hasRequested = requested.has(char.id);
                return (
                  <div key={char.id} style={{
                    border: `1px solid ${isActive ? '#c8922a' : '#3a3020'}`,
                    backgroundColor: isActive ? '#2a2010' : '#1e1810',
                    padding: '16px 20px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
                  }}>
                    <div className="flex items-center gap-3">
                      {sheet.portraitUrl && (
                        <img src={sheet.portraitUrl} alt="" style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 2 }} />
                      )}
                      <div>
                        <div style={{ fontFamily: 'Cinzel, serif', color: isActive ? '#c8922a' : '#e8d5a3', fontSize: '1rem' }}>
                          {char.name}
                          {isActive && <span style={{ marginLeft: 8, fontSize: '0.6rem', color: '#4a7c4e', border: '1px solid #4a7c4e', padding: '1px 6px' }}>ATTIVO</span>}
                        </div>
                        <div style={{ color: '#6a5040', fontFamily: 'Crimson Text, serif', fontSize: '0.8rem' }}>
                          {sheet.race} · {cls?.name ?? ''} {char.level}
                        </div>
                        <div style={{ color: '#4a3020', fontFamily: 'Cinzel, serif', fontSize: '0.65rem', marginTop: 2 }}>
                          {char.hpCurrent}/{char.hpMax} PF · CA {sheet.armorClass ?? '—'}
                        </div>
                      </div>
                    </div>
                    <div>
                      {!isActive && (
                        hasRequested ? (
                          <span style={{ color: '#8a7a2a', fontFamily: 'Cinzel, serif', fontSize: '0.65rem' }}>⏳ Richiesta inviata</span>
                        ) : (
                          <button onClick={() => handleRequestSwitch(membership.campaignId, char.id, membership.activeCharacterId ?? undefined)}
                            disabled={requesting === char.id}
                            style={{ border: '1px solid #5a4020', color: '#a08060', backgroundColor: 'transparent', fontFamily: 'Cinzel, serif', fontSize: '0.7rem', padding: '5px 12px', cursor: 'pointer' }}>
                            {requesting === char.id ? '…' : 'Richiedi attivo'}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                );
              })}
              <a href={`/campaigns/${membership.campaignId}/characters/new`}
                style={{ display: 'inline-block', border: '1px solid #3a3020', color: '#6a5040', fontFamily: 'Cinzel, serif', fontSize: '0.7rem', padding: '5px 14px', textDecoration: 'none', marginTop: 4 }}>
                + Altro personaggio
              </a>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
