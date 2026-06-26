import { card } from './styles';
import ConditionBadge from '@/components/dashboard/ConditionBadge';
import AddConditionButton from '@/components/dashboard/AddConditionButton';
import { getCondition } from '@/lib/srd/conditions';
import type { CharacterCondition } from '@/lib/db/schema';

export interface ConditionsRowProps {
  characterId: string;
  conditions: CharacterCondition[];
}

export default function ConditionsRow({ characterId, conditions }: ConditionsRowProps) {
  return (
    <div style={{ ...card, display: 'flex', alignItems: 'center', gap: 'var(--s-1)', flexWrap: 'wrap', minHeight: 32 }}>
      <span style={{ fontSize: '7px', fontWeight: 600, letterSpacing: '.08em', color: 'var(--gold)', textTransform: 'uppercase', flexShrink: 0 }}>
        Condizioni Attive
      </span>
      {conditions.length === 0 && (
        <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '10px', color: 'var(--fg-3)' }}>
          Nessuna condizione
        </span>
      )}
      {conditions.map(cond => {
        const def = getCondition(cond.conditionKey);
        if (!def) return null;
        return (
          <ConditionBadge
            key={cond.id}
            conditionId={cond.id}
            characterId={characterId}
            name={def.name}
            icon={def.icon}
          />
        );
      })}
      <AddConditionButton characterId={characterId} />
    </div>
  );
}
