'use client';

import { useState, useRef, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { shortRestParty, longRestParty, addXpToAll } from '@/lib/db/actions';
import CombatStartButton from '@/components/combat/CombatStartButton';
import CampaignSettingsButton from '@/components/campaign/CampaignSettingsButton';
import CampaignMembersButton from '@/components/campaign/CampaignMembersButton';
import type { Campaign, Character } from '@/lib/db/schema';

// ─── types ────────────────────────────────────────────────────

type ActionId = 'combat' | 'rest-short' | 'rest-long' | 'xp' | 'new-char' | 'settings' | 'members';

interface Action {
  id: ActionId;
  icon: string;
  label: string;
  bg: string;
  color: string;
}

interface Props {
  campaignId: string;
  campaign: Campaign;
  dmUserId: string;
  characters: Character[];
}

// ─── quick XP input modal ─────────────────────────────────────

const XP_AMOUNTS = [50, 100, 200, 300, 500, 1000];

function XpModal({
  onClose, onConfirm, isPending,
}: {
  onClose: () => void;
  onConfirm: (n: number) => void;
  isPending: boolean;
}) {
  const [val, setVal] = useState('');
  const n = parseInt(val);
  const valid = !!val && n > 0;

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 460, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(0,0,0,.65)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background: 'var(--bg-deep)', border: '1px solid var(--border-leather-dim)', borderRadius: 'var(--r-lg)', padding: 'var(--s-3)', width: '100%', maxWidth: 320 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--s-1)' }}>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 700, color: 'var(--fg-1)' }}>⭐ Assegna XP al gruppo</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--fg-2)', fontSize: 16, cursor: 'pointer', padding: 4 }}>✕</button>
        </div>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: 'var(--fg-2)', marginBottom: 'var(--s-2)' }}>
          L'XP verrà assegnato a tutti i personaggi della campagna.
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 'var(--s-2)' }}>
          {XP_AMOUNTS.map(amount => (
            <button key={amount} onClick={() => setVal(String(amount))} style={{
              height: 34, padding: '0 12px', borderRadius: 'var(--r-sm)',
              border: `1px solid ${val === String(amount) ? 'var(--gold)' : 'var(--border-leather)'}`,
              background: val === String(amount) ? 'var(--gold-soft)' : 'none',
              color: val === String(amount) ? 'var(--gold)' : 'var(--fg-2)',
              fontFamily: 'var(--font-sans)', fontSize: '12px',
              cursor: 'pointer', transition: 'all .15s',
            }}>{amount}</button>
          ))}
        </div>
        <input
          type="number" value={val} onChange={e => setVal(e.target.value)}
          min="1" placeholder="Valore personalizzato…" autoFocus
          style={{
            width: '100%', height: 48, background: 'var(--bg-card)',
            border: '1px solid var(--border-leather)', borderRadius: 'var(--r-sm)',
            color: 'var(--fg-1)', fontFamily: 'var(--font-sans)', fontSize: '18px',
            outline: 'none', padding: '0 var(--s-2)', marginBottom: 'var(--s-2)',
            boxSizing: 'border-box', textAlign: 'center',
          }}
        />
        <button
          onClick={() => valid && onConfirm(n)}
          disabled={!valid || isPending}
          style={{
            width: '100%', height: 48, borderRadius: 'var(--r-sm)',
            background: valid ? 'var(--gold)' : 'var(--bg-card)',
            color: valid ? 'var(--bg-deep)' : 'var(--fg-3)',
            border: 'none', fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 600,
            cursor: (!valid || isPending) ? 'not-allowed' : 'pointer',
            opacity: (!valid || isPending) ? 0.55 : 1, transition: 'all .2s',
          }}
        >
          {isPending ? 'Assegnando…' : 'Assegna XP'}
        </button>
      </div>
    </div>
  );
}

// ─── main component ───────────────────────────────────────────

const ACTIONS: Action[] = [
  { id: 'combat',     icon: '🗡',  label: 'Inizia Combat',           bg: 'var(--danger-soft)',  color: 'var(--danger)' },
  { id: 'rest-short', icon: '☽',   label: 'Riposo Breve (party)',     bg: 'var(--info-soft)', color: 'var(--info)' },
  { id: 'rest-long',  icon: '☾',   label: 'Riposo Lungo (party)',     bg: 'var(--arcane-soft)',  color: 'var(--arcane)' },
  { id: 'xp',         icon: '⭐',  label: 'Assegna XP al gruppo',     bg: 'var(--gold-soft)', color: 'var(--gold)' },
  { id: 'new-char',   icon: '⚔',   label: 'Aggiungi Personaggio',     bg: 'var(--gold-soft)', color: 'var(--gold)' },
  { id: 'settings',   icon: '⚙',   label: 'Impostazioni campagna',    bg: 'rgba(48,45,42,.4)',    color: 'var(--fg-2)' },
  { id: 'members',    icon: '👥',  label: 'Gestisci Membri',          bg: 'rgba(48,45,42,.4)',    color: 'var(--fg-2)' },
];

export default function CampaignFab({ campaignId, campaign, dmUserId, characters }: Props) {
  const [open, setOpen]       = useState(false);
  const [xpOpen, setXpOpen]   = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Refs per i bottoni nascosti dei componenti esistenti
  const combatRef   = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);
  const membersRef  = useRef<HTMLDivElement>(null);

  function triggerHidden(ref: React.RefObject<HTMLDivElement | null>) {
    ref.current?.querySelector('button')?.click();
  }

  function handleAction(id: ActionId) {
    setOpen(false);
    switch (id) {
      case 'combat':
        triggerHidden(combatRef);
        break;
      case 'rest-short':
        if (confirm('Avviare un Riposo Breve per tutto il party?')) {
          startTransition(() => shortRestParty(campaignId));
        }
        break;
      case 'rest-long':
        if (confirm('Avviare un Riposo Lungo per tutto il party?')) {
          startTransition(() => longRestParty(campaignId));
        }
        break;
      case 'xp':
        setXpOpen(true);
        break;
      case 'new-char':
        router.push(`/campaigns/${campaignId}/characters/new`);
        break;
      case 'settings':
        triggerHidden(settingsRef);
        break;
      case 'members':
        triggerHidden(membersRef);
        break;
    }
  }

  function handleXpConfirm(amount: number) {
    startTransition(() => addXpToAll(amount));
    setXpOpen(false);
  }

  return (
    <>
      {/* Bottoni nascosti — trigger per componenti esistenti */}
      <div style={{ position: 'fixed', top: -200, left: -200, opacity: 0, pointerEvents: 'none', zIndex: -1 }} aria-hidden>
        <div ref={combatRef}>
          <CombatStartButton campaignId={campaignId} characters={characters} />
        </div>
        <div ref={settingsRef}>
          <CampaignSettingsButton campaign={campaign} />
        </div>
        <div ref={membersRef}>
          <CampaignMembersButton campaignId={campaignId} dmUserId={dmUserId} />
        </div>
      </div>

      {/* Backdrop */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 44, background: 'rgba(0,0,0,.35)' }}
        />
      )}

      {/* Speed dial + FAB */}
      <div style={{
        position: 'fixed', bottom: 16, right: 16, zIndex: 45,
        display: 'flex', flexDirection: 'column-reverse', alignItems: 'flex-end', gap: 10,
      }}>
        {/* FAB button */}
        <button
          onClick={() => setOpen(o => !o)}
          style={{
            width: 56, height: 56, borderRadius: 'var(--r-sm)',
            background: open ? 'var(--bg-elevated)' : 'var(--gold)',
            color: open ? 'var(--fg-1)' : 'var(--bg-deep)',
            border: open ? '1px solid var(--border-leather-dim)' : 'none',
            fontSize: open ? 18 : 20,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(0,0,0,.5)',
            transition: 'all .22s',
            flexShrink: 0,
          }}
        >
          {open ? '✕' : '✦'}
        </button>

        {/* Action items */}
        {open && ACTIONS.map((action, i) => (
          <div
            key={action.id}
            onClick={() => handleAction(action.id)}
            style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
          >
            <span style={{
              background: 'var(--bg-deep)', border: '1px solid var(--border-leather)',
              borderRadius: 'var(--r-lg)', padding: '6px 14px',
              fontFamily: 'var(--font-sans)', fontSize: '12px', fontWeight: 600,
              color: 'var(--fg-1)', whiteSpace: 'nowrap',
              boxShadow: '0 2px 10px rgba(0,0,0,.35)',
            }}>
              {action.label}
            </span>
            <div style={{
              width: 44, height: 44, borderRadius: 'var(--r-sm)', flexShrink: 0,
              background: action.bg,
              border: `1.5px solid ${action.color}66`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18,
              boxShadow: '0 2px 10px rgba(0,0,0,.35)',
            }}>
              {action.icon}
            </div>
          </div>
        ))}
      </div>

      {/* XP modal */}
      {xpOpen && (
        <XpModal
          onClose={() => setXpOpen(false)}
          onConfirm={handleXpConfirm}
          isPending={isPending}
        />
      )}
    </>
  );
}
