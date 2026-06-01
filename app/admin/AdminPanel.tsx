'use client';

import { useState } from 'react';
import { approveDm, rejectDm, updateUserRole, deleteUser } from '@/lib/db/userActions';
import type { User } from '@/lib/db/schema';

const ROLE_LABELS: Record<string, string> = {
  superadmin: 'Super Admin', dm: 'DM', player: 'Giocatore',
  pending_dm: 'In attesa (DM)', rejected: 'Rifiutato', pending: 'In attesa',
};

const ROLE_BADGE: Record<string, string> = {
  superadmin: 'badge-gold', dm: 'badge-info', player: 'badge-default',
  pending_dm: 'badge-warning', rejected: 'badge-danger', pending: 'badge-default',
};

export default function AdminPanel({ users }: { users: User[] }) {
  const [tab, setTab] = useState<'requests' | 'users'>('requests');
  const [loading, setLoading] = useState<string | null>(null);

  const pendingDms = users.filter(u => u.role === 'pending_dm');
  const others = users.filter(u => u.role !== 'pending_dm');

  async function handleApprove(userId: string) {
    setLoading(userId + '_approve');
    await approveDm(userId);
    setLoading(null);
  }

  async function handleReject(userId: string) {
    setLoading(userId + '_reject');
    await rejectDm(userId);
    setLoading(null);
  }

  async function handleRoleChange(userId: string, role: User['role']) {
    setLoading(userId + '_role');
    await updateUserRole(userId, role);
    setLoading(null);
  }

  async function handleDelete(userId: string, email: string) {
    if (!confirm(`Eliminare l'utente ${email}? Questa azione è irreversibile.`)) return;
    setLoading(userId + '_delete');
    await deleteUser(userId);
    setLoading(null);
  }

  return (
    <div>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--border-leather)', marginBottom: 32 }}>
        {([
          { id: 'requests' as const, label: 'Richieste DM', count: pendingDms.length },
          { id: 'users' as const, label: 'Tutti gli utenti' },
        ]).map(({ id, label, count }) => (
          <button key={id} onClick={() => setTab(id)} style={{
            fontFamily: 'var(--font-label)', fontSize: '8px', letterSpacing: '0.4em', textTransform: 'uppercase',
            padding: '10px 20px', border: 'none', borderBottom: `2px solid ${tab === id ? 'var(--gold)' : 'transparent'}`,
            backgroundColor: 'transparent', color: tab === id ? 'var(--gold)' : 'var(--fg-3)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            {label}
            {count !== undefined && count > 0 && (
              <span style={{ backgroundColor: 'var(--danger)', color: 'var(--fg-1)', borderRadius: 'var(--r-sm)', padding: '1px 6px', fontSize: '7px' }}>
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Richieste DM */}
      {tab === 'requests' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {pendingDms.length === 0 && (
            <p style={{ fontFamily: 'var(--font-body)', color: 'var(--fg-3)', fontStyle: 'italic', fontSize: '0.95rem' }}>
              Nessuna richiesta pendente.
            </p>
          )}
          {pendingDms.map(u => (
            <div key={u.id} className="card" style={{ padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', fontWeight: 700, color: 'var(--fg-1)', marginBottom: 4 }}>
                    {u.name || u.email}
                  </div>
                  <div style={{ fontFamily: 'var(--font-body)', color: 'var(--fg-3)', fontSize: '0.8rem', fontStyle: 'italic', marginBottom: 12 }}>
                    {u.email}
                  </div>
                  {u.dmNote && (
                    <div style={{ fontFamily: 'var(--font-body)', color: 'var(--fg-2)', fontSize: '0.9rem', fontStyle: 'italic', lineHeight: 1.65, padding: '12px 16px', backgroundColor: 'var(--bg-card)', borderLeft: '2px solid var(--gold)', marginBottom: 8 }}>
                      "{u.dmNote}"
                    </div>
                  )}
                  <div className="label" style={{ marginTop: 8 }}>{new Date(u.createdAt).toLocaleDateString('it-IT')}</div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <button onClick={() => handleApprove(u.id)} disabled={!!loading} className="btn btn-ghost"
                    style={{ padding: '6px 14px', color: 'var(--fg-1)', borderColor: 'var(--info)' }}>
                    {loading === u.id + '_approve' ? '…' : '✓ Approva'}
                  </button>
                  <button onClick={() => handleReject(u.id)} disabled={!!loading} className="btn btn-ghost"
                    style={{ padding: '6px 14px', color: 'var(--fg-1)', borderColor: 'var(--danger)' }}>
                    {loading === u.id + '_reject' ? '…' : '✕ Rifiuta'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tutti gli utenti */}
      {tab === 'users' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {others.map(u => (
            <div key={u.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '14px 20px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-leather)' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--font-body)', color: 'var(--fg-1)', fontSize: '0.9rem', marginBottom: 2 }}>
                  {u.name || u.email}
                </div>
                <div style={{ fontFamily: 'var(--font-body)', color: 'var(--fg-3)', fontSize: '0.8rem', fontStyle: 'italic' }}>
                  {u.email}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                <span className={`badge ${ROLE_BADGE[u.role] ?? 'badge-default'}`}>
                  {ROLE_LABELS[u.role] ?? u.role}
                </span>
                {u.role !== 'superadmin' && (
                  <select
                    value={u.role}
                    onChange={e => handleRoleChange(u.id, e.target.value as User['role'])}
                    style={{
                      backgroundColor: 'var(--bg-deep)', border: '1px solid var(--border-leather)',
                      color: 'var(--fg-2)', fontFamily: 'var(--font-label)',
                      fontSize: '8px', letterSpacing: '0.3em', padding: '4px 8px', outline: 'none', cursor: 'pointer',
                    }}
                  >
                    <option value="dm">DM</option>
                    <option value="player">Giocatore</option>
                    <option value="pending">Pending</option>
                    <option value="rejected">Rifiutato</option>
                  </select>
                )}
                {u.role !== 'superadmin' && (
                  <button onClick={() => handleDelete(u.id, u.email)} disabled={!!loading}
                    className="btn btn-ghost" style={{ padding: '4px 10px', color: 'var(--fg-1)', borderColor: 'var(--danger-border)', fontSize: '8px' }}>
                    🗑
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
