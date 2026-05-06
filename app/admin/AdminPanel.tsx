'use client';

import { useState } from 'react';
import { approveDm, rejectDm, updateUserRole, deleteUser } from '@/lib/db/userActions';
import type { User } from '@/lib/db/schema';

const ROLE_LABELS: Record<string, string> = {
  superadmin: 'Super Admin', dm: 'DM', player: 'Giocatore',
  pending_dm: 'In attesa (DM)', rejected: 'Rifiutato', pending: 'In attesa',
};
const ROLE_COLORS: Record<string, string> = {
  superadmin: '#c8922a', dm: '#4a7c4e', player: '#4e6a8c',
  pending_dm: '#8a7a2a', rejected: '#8b2020', pending: '#6a5040',
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

  const Tab = ({ id, label, count }: { id: 'requests' | 'users'; label: string; count?: number }) => (
    <button onClick={() => setTab(id)} style={{
      border: 'none', borderBottom: `2px solid ${tab === id ? '#c8922a' : 'transparent'}`,
      backgroundColor: 'transparent', color: tab === id ? '#c8922a' : '#6a5040',
      fontFamily: 'Cinzel, serif', fontSize: '0.75rem', padding: '8px 16px', cursor: 'pointer',
    }}>
      {label}{count !== undefined && count > 0 && <span style={{ marginLeft: 6, backgroundColor: '#8b2020', color: '#fff', borderRadius: '50%', padding: '1px 6px', fontSize: '0.6rem' }}>{count}</span>}
    </button>
  );

  return (
    <div>
      <div style={{ borderBottom: '1px solid #3a3020', marginBottom: 24 }}>
        <Tab id="requests" label="Richieste DM" count={pendingDms.length} />
        <Tab id="users" label="Tutti gli utenti" />
      </div>

      {tab === 'requests' && (
        <div className="space-y-3">
          {pendingDms.length === 0 && (
            <p style={{ color: '#6a5040', fontFamily: 'Crimson Text, serif', fontStyle: 'italic', fontSize: '0.9rem' }}>
              Nessuna richiesta pendente.
            </p>
          )}
          {pendingDms.map(u => (
            <div key={u.id} style={{ border: '1px solid #5a4020', backgroundColor: '#221c14', padding: '16px 20px' }}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div style={{ fontFamily: 'Cinzel, serif', color: '#e8d5a3', fontSize: '0.9rem' }}>{u.name || u.email}</div>
                  <div style={{ color: '#6a5040', fontFamily: 'Crimson Text, serif', fontSize: '0.8rem' }}>{u.email}</div>
                  {u.dmNote && (
                    <div style={{ color: '#a08060', fontFamily: 'Crimson Text, serif', fontSize: '0.85rem', fontStyle: 'italic', marginTop: 8, padding: '8px 12px', border: '1px solid #3a3020', backgroundColor: '#1a1410' }}>
                      "{u.dmNote}"
                    </div>
                  )}
                  <div style={{ color: '#5a4020', fontFamily: 'Cinzel, serif', fontSize: '0.6rem', marginTop: 6 }}>
                    {new Date(u.createdAt).toLocaleDateString('it-IT')}
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => handleApprove(u.id)} disabled={!!loading}
                    style={{ border: '1px solid #4a7c4e', color: '#4a7c4e', backgroundColor: 'transparent', fontFamily: 'Cinzel, serif', fontSize: '0.7rem', padding: '6px 14px', cursor: 'pointer' }}>
                    {loading === u.id + '_approve' ? '…' : '✓ Approva'}
                  </button>
                  <button onClick={() => handleReject(u.id)} disabled={!!loading}
                    style={{ border: '1px solid #8b2020', color: '#8b2020', backgroundColor: 'transparent', fontFamily: 'Cinzel, serif', fontSize: '0.7rem', padding: '6px 14px', cursor: 'pointer' }}>
                    {loading === u.id + '_reject' ? '…' : '✕ Rifiuta'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'users' && (
        <div className="space-y-2">
          {others.map(u => (
            <div key={u.id} className="flex items-center justify-between" style={{ border: '1px solid #3a3020', backgroundColor: '#1e1810', padding: '12px 16px' }}>
              <div>
                <div style={{ fontFamily: 'Cinzel, serif', color: '#e8d5a3', fontSize: '0.85rem' }}>{u.name || u.email}</div>
                <div style={{ color: '#6a5040', fontFamily: 'Crimson Text, serif', fontSize: '0.75rem' }}>{u.email}</div>
              </div>
              <div className="flex items-center gap-3">
                <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.65rem', color: ROLE_COLORS[u.role] ?? '#6a5040', border: `1px solid ${ROLE_COLORS[u.role] ?? '#6a5040'}`, padding: '2px 8px' }}>
                  {ROLE_LABELS[u.role] ?? u.role}
                </span>
                {u.role !== 'superadmin' && (
                  <select value={u.role} onChange={e => handleRoleChange(u.id, e.target.value as User['role'])}
                    style={{ backgroundColor: '#1a1410', border: '1px solid #5a4020', color: '#a08060', fontFamily: 'Cinzel, serif', fontSize: '0.65rem', padding: '3px 6px', outline: 'none' }}>
                    <option value="dm">DM</option>
                    <option value="player">Giocatore</option>
                    <option value="pending">Pending</option>
                    <option value="rejected">Rifiutato</option>
                  </select>
                )}
                {u.role !== 'superadmin' && (
                  <button onClick={() => handleDelete(u.id, u.email)} disabled={!!loading}
                    style={{ border: '1px solid #5a2020', color: '#6a3030', backgroundColor: 'transparent', fontFamily: 'Cinzel, serif', fontSize: '0.6rem', padding: '3px 8px', cursor: 'pointer' }}>
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
