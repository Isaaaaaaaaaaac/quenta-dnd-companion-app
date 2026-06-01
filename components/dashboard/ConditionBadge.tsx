'use client';

import { removeCondition } from '@/lib/db/actions';

interface Props { conditionId: string; characterId: string; name: string; icon: string; }

export default function ConditionBadge({ conditionId, characterId, name, icon }: Props) {
  return (
    <button
      onClick={() => removeCondition(conditionId, characterId)}
      title={`Rimuovi: ${name}`}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '0 var(--s-1)', height: 24,
        fontFamily: 'var(--font-sans)', fontSize: '9px', letterSpacing: '.06em',
        border: '1px solid var(--danger-border)', color: 'var(--danger)',
        background: 'var(--danger-soft)', borderRadius: 'var(--r-sm)',
        cursor: 'pointer', transition: 'all .2s',
      }}>
      <span>{icon}</span>
      <span>{name}</span>
    </button>
  );
}
