'use client';

import { removeCondition } from '@/lib/db/actions';

interface Props {
  conditionId: string;
  characterId: string;
  name: string;
  icon: string;
}

export default function ConditionBadge({ conditionId, characterId, name, icon }: Props) {
  return (
    <button
      onClick={() => removeCondition(conditionId, characterId)}
      title={`Rimuovi: ${name}`}
      className="flex items-center gap-1 px-2 py-0.5 text-xs transition-opacity hover:opacity-70"
      style={{
        border: '1px solid #8b2020',
        backgroundColor: '#2a1010',
        color: '#e8d5a3',
        fontFamily: 'Crimson Text, serif',
        cursor: 'pointer',
      }}
    >
      <span>{icon}</span>
      <span>{name}</span>
    </button>
  );
}
