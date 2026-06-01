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
      <button onClick={() => setOpen(true)} className="btn btn-ghost" style={{ padding: '7px 14px' }}>
        Membri
      </button>

      {open && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.8)' }}>
          <div className="card" style={{ width: '90%', maxWidth: 560, maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 28px', borderBottom: '1px solid var(--border-leather)' }}>
              <div>
                <div className="eyebrow" style={{ marginBottom: 4 }}>Campagna</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', fontWeight: 700, color: 'var(--fg-1)' }}>Gestione Membri</div>
              </div>
              <button onClick={() => setOpen(false)} style={{ backgroundColor: 'transparent', border: 'none', color: 'var(--fg-3)', cursor: 'pointer', fontSize: '1.1rem' }}>✕</button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: 28, display: 'flex', flexDirection: 'column', gap: 32 }}>

              {/* Link invito */}
              <div>
                <div className="label" style={{ marginBottom: 12 }}>Link invito</div>
                <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-leather)', padding: '10px 14px', fontFamily: 'var(--font-body)', color: 'var(--fg-2)', fontSize: '0.85rem', wordBreak: 'break-all', marginBottom: 10 }}>
                  {inviteUrl || 'Caricamento…'}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={handleCopy} disabled={!invitation} className="btn btn-secondary" style={{ padding: '6px 14px' }}>
                    {copied ? '✓ Copiato!' : '📋 Copia link'}
                  </button>
                  <button onClick={handleRegenerate} disabled={loading} className="btn btn-ghost" style={{ padding: '6px 14px' }}>
                    Rigenera
                  </button>
                </div>
                <p style={{ fontFamily: 'var(--font-body)', color: 'var(--fg-3)', fontSize: '0.8rem', fontStyle: 'italic', marginTop: 8 }}>
                  Rigenerare il link invalida quello precedente.
                </p>
              </div>

              {/* Membri */}
              <div>
                <div className="label" style={{ marginBottom: 12 }}>Giocatori ({members.length})</div>
                {members.length === 0 ? (
                  <p style={{ fontFamily: 'var(--font-body)', color: 'var(--fg-3)', fontStyle: 'italic', fontSize: '0.875rem' }}>Nessun giocatore ancora.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {members.map(m => (
                      <div key={m.userId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid var(--border-leather)', backgroundColor: 'var(--bg-card)', padding: '12px 16px' }}>
                        <div>
                          <div style={{ fontFamily: 'var(--font-body)', color: 'var(--fg-1)', fontSize: '0.9rem', marginBottom: 2 }}>{m.user?.name || m.user?.email}</div>
                          <div style={{ fontFamily: 'var(--font-body)', color: 'var(--fg-3)', fontSize: '0.8rem', fontStyle: 'italic' }}>{m.user?.email}</div>
                          {m.activeCharacterId && (
                            <div style={{ fontFamily: 'var(--font-label)', fontSize: '7px', letterSpacing: '0.3em', color: 'var(--info)', marginTop: 4 }}>✦ personaggio attivo assegnato</div>
                          )}
                        </div>
                        <button onClick={() => handleRemove(m.userId)} className="btn btn-ghost" style={{ padding: '4px 10px', color: 'var(--fg-1)', borderColor: 'var(--danger)' }}>
                          Rimuovi
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Switch requests */}
              {switchRequests.length > 0 && (
                <div>
                  <div className="label" style={{ marginBottom: 12, color: 'var(--gold)' }}>Richieste cambio personaggio ({switchRequests.length})</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {switchRequests.map(req => (
                      <div key={req.id} style={{ border: '1px solid var(--border-leather)', backgroundColor: 'var(--bg-card)', padding: '12px 16px' }}>
                        <div style={{ fontFamily: 'var(--font-body)', color: 'var(--fg-2)', fontSize: '0.875rem', fontStyle: 'italic', marginBottom: 10 }}>
                          Richiesta cambio personaggio attivo
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={() => handleApproveSwitch(req)} className="btn btn-ghost" style={{ padding: '4px 12px', color: 'var(--fg-1)', borderColor: 'var(--info)' }}>✓ Approva</button>
                          <button onClick={() => handleRejectSwitch(req)} className="btn btn-ghost" style={{ padding: '4px 12px', color: 'var(--fg-1)', borderColor: 'var(--danger)' }}>✕ Rifiuta</button>
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
