import HpControls from '@/components/dashboard/HpControls';
import ConditionBadge from '@/components/dashboard/ConditionBadge';
import AddConditionButton from '@/components/dashboard/AddConditionButton';
import DeathSavesTracker from '@/components/character/sheet/DeathSavesTracker';
import { CONDITIONS } from '@/lib/srd/conditions';
import type { CharacterSheet } from '@/lib/db/schema';

interface Props {
  characterId: string;
  hpCurrent: number;
  hpMax: number;
  hpTemp: number;
  hpPct: number;
  hpColor: string;
  hitDie: number;
  level: number;
  conditions: Array<{ id: string; conditionKey: string; characterId: string }>;
  sheet: CharacterSheet;
}

export default function HpStrip({
  characterId,
  hpCurrent,
  hpMax,
  hpTemp,
  hpPct,
  hpColor,
  hitDie,
  level,
  conditions,
  sheet,
}: Props) {
  return (
    <div
      style={{
        background: 'var(--bg-deep)',
        border: '1px solid var(--border-leather-dim)',
        borderRadius: 'var(--r-lg)',
        padding: 'var(--s-2)',
        display: 'flex',
        gap: 'var(--s-3)',
        alignItems: 'center',
        flexWrap: 'wrap',
      }}
    >
      {/* HP number + bar */}
      <div style={{ minWidth: 140 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--s-1)', marginBottom: 4 }}>
          <span
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '40px',
              fontWeight: 700,
              lineHeight: 1,
              color: hpColor,
              transition: 'color .4s',
            }}
          >
            {hpCurrent}
          </span>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--fg-2)' }}>
            / {hpMax} max{hpTemp > 0 ? ` (+${hpTemp} temp)` : ''}
          </span>
        </div>
        <div
          style={{
            height: 4,
            backgroundColor: 'var(--bg-card)',
            borderRadius: 'var(--r-sm)',
            overflow: 'hidden',
            marginBottom: 4,
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${hpPct}%`,
              backgroundColor: hpColor,
              borderRadius: 'var(--r-sm)',
              transition: 'width .5s ease, background .6s',
            }}
          />
        </div>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', color: 'var(--fg-3)' }}>
          Dado Vita{' '}
          <strong style={{ fontFamily: 'var(--font-serif)', fontSize: '11px', color: 'var(--fg-2)' }}>
            d{hitDie} × {level}
          </strong>
        </div>
      </div>

      {/* Divider */}
      <div
        style={{
          width: 1,
          alignSelf: 'stretch',
          background: 'var(--border-leather-dim)',
          flexShrink: 0,
        }}
      />

      {/* Interactive controls */}
      <div>
        <HpControls characterId={characterId} hpCurrent={hpCurrent} hpMax={hpMax} />
        {hpCurrent === 0 && (
          <div
            style={{
              marginTop: 'var(--s-1)',
              paddingTop: 'var(--s-1)',
              borderTop: '1px solid var(--danger-border)',
            }}
          >
            <DeathSavesTracker characterId={characterId} sheet={sheet} />
          </div>
        )}
      </div>

      {/* Divider */}
      <div
        style={{
          width: 1,
          alignSelf: 'stretch',
          background: 'var(--border-leather-dim)',
          flexShrink: 0,
        }}
      />

      {/* Conditions */}
      <div style={{ flex: 1, minWidth: 120 }}>
        <div
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '8px',
            fontWeight: 600,
            letterSpacing: '.1em',
            color: 'var(--gold)',
            textTransform: 'uppercase',
            marginBottom: 6,
          }}
        >
          Condizioni Attive
        </div>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 'var(--s-1)',
            alignItems: 'center',
            minHeight: 24,
          }}
        >
          {conditions.length === 0 && (
            <span
              style={{
                fontFamily: 'var(--font-serif)',
                fontStyle: 'italic',
                fontSize: '12px',
                color: 'var(--fg-3)',
              }}
            >
              Nessuna condizione
            </span>
          )}
          {conditions.map(c => {
            const def = CONDITIONS.find(d => d.key === c.conditionKey);
            return def ? (
              <ConditionBadge
                key={c.id}
                conditionId={c.id}
                characterId={characterId}
                name={def.name}
                icon={def.icon}
              />
            ) : null;
          })}
          <AddConditionButton characterId={characterId} />
        </div>
      </div>
    </div>
  );
}
