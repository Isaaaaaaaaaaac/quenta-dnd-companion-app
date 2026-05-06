'use client';

import { useState, useEffect } from 'react';
import { getOrCreateInvitation, regenerateInvitation, removeMember, getCampaignMembers, approveSwitchRequest, rejectSwitchRequest, getPendingSwitchRequests } from '@/lib/db/userActions';

interface Props { campaignId: string; dmUserId: string; }

export default function CampaignMembersButton({ campaignId, dmUserId }: Props) {
  const [open, setOpen] = useState(false);
  const [invitation, setInvitation] = useState<{ token: string } | null>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [switchRequests, setSwitchRequests] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    (async () => {
      const [inv, mems, reqs] = await Promise.all([
        getOrCreateInvitation(campaignId, dmUserId),
        getCampaignMembers(campaignId),
        getPendingSwitchRequests(campaignId),
      ]);
      setInvitation(inv);
      setMembers(mems);
      setSwitchRequests(reqs);
    })();
  }, [open, campaignId, dmUserId]);

  const inviteUrl = invitation ? `${window.location.origin}/join/${invitation.token}` : '';

  async function handleCopy() {
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleRegenerate() {
    setLoading(true);
    const inv = await regenerateInvitation(campaignId, dmUserId);
    setInvitation(inv);
    setLoading(false);
  }

  async function handleRemove(userId: string) {
    await removeMember(userId, campaignId);
    setMembers(prev => prev.filter(m => m.userId !== userId));
  }

  async function handleApproveSwitch(req: any) {
    await approveSwitchRequest(req.id, req.userId, req.campaignId, req.toCharId);
    setSwitchRequests(prev => prev.filter(r => r.id !== req.id));
  }

  async function handleRejectSwitch(req: any) {
    await rejectSwitchRequest(req.id);
    setSwitchRequests(prev => prev.filter(r => r.id !== req.id));
  }

  return (
    <>
      <button onClick={() => setOpen(true)}
        style={{ border: '1px solid #5a4020', color: '#a08060', backgroundColor: 'transparent', fontFamily: 'Cinzel, serif', fontSize: '0.75rem', padding: '7px 14px', cursor: 'pointer' }}>
        👥 Membri
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
          <div style={{ backgroundColor: '#1a1410', border: '1px solid #5a4020', width: '90%', maxWidth: 560, maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>

            <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid #5a4020' }}>
              <div style={{ fontFamily: 'Cinzel, serif', color: '#c8922a', fontSize: '1rem' }}>👥 Gestione Membri</div>
              <button onClick={() => setOpen(false)} style={{ border: 'none', background: 'none', color: '#6a5040', cursor: 'pointer', fontSize: '1.1rem' }}>✕</button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">

              {/* Link invito */}
              <div>
                <div style={{ fontFamily: 'Cinzel, serif', fontSize: '0.65rem', color: '#5a4020', letterSpacing: '0.08em', marginBottom: 8 }}>LINK INVITO</div>
                <div style={{ backgroundColor: '#221c14', border: '1px solid #3a3020', padding: '10px 12px', fontFamily: 'Crimson Text, serif', color: '#a08060', fontSize: '0.85rem', wordBreak: 'break-all', marginBottom: 8 }}>
                  {inviteUrl || 'Caricamento…'}
                </div>
                <div className="flex gap-2">
                  <button onClick={handleCopy} disabled={!invitation}
                    style={{ border: '1px solid #c8922a', color: '#c8922a', backgroundColor: 'transparent', fontFamily: 'Cinzel, serif', fontSize: '0.7rem', padding: '5px 14px', cursor: 'pointer' }}>
                    {copied ? '✓ Copiato!' : '📋 Copia link'}
                  </button>
                  <button onClick={handleRegenerate} disabled={loading}
                    style={{ border: '1px solid #5a4020', color: '#6a5040', backgroundColor: 'transparent', fontFamily: 'Cinzel, serif', fontSize: '0.7rem', padding: '5px 14px', cursor: 'pointer' }}>
                    🔄 Rigenera
                  </button>
                </div>
                <p style={{ color: '#5a4020', fontFamily: 'Crimson Text, serif', fontSize: '0.75rem', fontStyle: 'italic', marginTop: 6 }}>
                  Rigenerare il link invalida quello precedente — i nuovi accessi usano il nuovo link.
                </p>
              </div>

              {/* Membri */}
              <div>
                <div style={{ fontFamily: 'Cinzel, serif', fontSize: '0.65rem', color: '#5a4020', letterSpacing: '0.08em', marginBottom: 8 }}>
                  GIOCATORI ({members.length})
                </div>
                {members.length === 0 ? (
                  <p style={{ color: '#5a4020', fontFamily: 'Crimson Text, serif', fontStyle: 'italic', fontSize: '0.85rem' }}>Nessun giocatore ancora.</p>
                ) : (
                  <div className="space-y-2">
                    {members.map(m => (
                      <div key={m.userId} className="flex items-center justify-between" style={{ border: '1px solid #3a3020', backgroundColor: '#1e1810', padding: '10px 12px' }}>
                        <div>
                          <div style={{ fontFamily: 'Cinzel, serif', color: '#e8d5a3', fontSize: '0.85rem' }}>{m.user?.name || m.user?.email}</div>
                          <div style={{ color: '#6a5040', fontFamily: 'Crimson Text, serif', fontSize: '0.75rem' }}>{m.user?.email}</div>
                          {m.activeCharacterId && (
                            <div style={{ color: '#4a7c4e', fontFamily: 'Cinzel, serif', fontSize: '0.6rem', marginTop: 2 }}>✦ Personaggio attivo assegnato</div>
                          )}
                        </div>
                        <button onClick={() => handleRemove(m.userId)}
                          style={{ border: '1px solid #8b2020', color: '#8b2020', backgroundColor: 'transparent', fontFamily: 'Cinzel, serif', fontSize: '0.65rem', padding: '4px 10px', cursor: 'pointer' }}>
                          Rimuovi
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Richieste cambio personaggio */}
              {switchRequests.length > 0 && (
                <div>
                  <div style={{ fontFamily: 'Cinzel, serif', fontSize: '0.65rem', color: '#8a7a2a', letterSpacing: '0.08em', marginBottom: 8 }}>
                    RICHIESTE CAMBIO PERSONAGGIO ({switchRequests.length})
                  </div>
                  <div className="space-y-2">
                    {switchRequests.map(req => (
                      <div key={req.id} style={{ border: '1px solid #5a4020', backgroundColor: '#221c14', padding: '10px 12px' }}>
                        <div style={{ fontFamily: 'Crimson Text, serif', color: '#a08060', fontSize: '0.85rem', marginBottom: 8 }}>
                          Cambio personaggio attivo richiesto
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => handleApproveSwitch(req)}
                            style={{ border: '1px solid #4a7c4e', color: '#4a7c4e', backgroundColor: 'transparent', fontFamily: 'Cinzel, serif', fontSize: '0.65rem', padding: '4px 10px', cursor: 'pointer' }}>
                            ✓ Approva
                          </button>
                          <button onClick={() => handleRejectSwitch(req)}
                            style={{ border: '1px solid #8b2020', color: '#8b2020', backgroundColor: 'transparent', fontFamily: 'Cinzel, serif', fontSize: '0.65rem', padding: '4px 10px', cursor: 'pointer' }}>
                            ✕ Rifiuta
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
