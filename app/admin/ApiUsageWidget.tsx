'use client';

interface Props {
  totalAllTime: number;
  thisMonthCost: number;
  thisMonthCount: number;
  budgetEur: number;
  isWarning: boolean;
  rows: { month: string; count: number; cost: number }[];
}

export default function ApiUsageWidget({ totalAllTime, thisMonthCost, thisMonthCount, budgetEur, isWarning, rows }: Props) {
  const pct = Math.min(100, (totalAllTime / budgetEur) * 100);
  const remaining = Math.max(0, budgetEur - totalAllTime);

  const barColor = pct >= 90 ? 'var(--danger)' : pct >= 80 ? '#8a7a2a' : 'var(--hp-healthy)';

  return (
    <div style={{
      background: 'var(--bg-deep)', border: `1px solid ${isWarning ? 'rgba(139,26,26,.5)' : 'var(--border-leather-dim)'}`,
      borderRadius: 'var(--r-lg)', padding: 'var(--s-3)', marginBottom: 'var(--s-4)',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--s-2)' }}>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: '9px', fontWeight: 600, letterSpacing: '.1em', color: 'var(--gold)', textTransform: 'uppercase' }}>
          ✨ Utilizzo Gemini API — Generazione Ritratti
        </div>
        {isWarning && (
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: '9px', fontWeight: 600, letterSpacing: '.06em', color: 'var(--danger)', background: 'rgba(139,26,26,.1)', border: '1px solid rgba(139,26,26,.3)', borderRadius: 'var(--r-sm)', padding: '2px 10px' }}>
            ⚠ Crediti in esaurimento
          </div>
        )}
      </div>

      {/* Barra progresso budget */}
      <div style={{ marginBottom: 'var(--s-2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: 'var(--fg-2)' }}>
            Budget utilizzato
          </span>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: pct >= 80 ? 'var(--danger)' : 'var(--fg-1)', fontWeight: 600 }}>
            €{totalAllTime.toFixed(2)} / €{budgetEur.toFixed(2)} ({pct.toFixed(0)}%)
          </span>
        </div>
        <div style={{ height: 8, background: 'var(--bg-elevated)', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: barColor, borderRadius: 4, transition: 'width .4s ease' }} />
        </div>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', color: 'var(--fg-2)', marginTop: 6 }}>
          Rimanenti stimati: <strong style={{ color: remaining < 2 ? 'var(--danger)' : 'var(--fg-1)' }}>€{remaining.toFixed(2)}</strong>
        </div>
      </div>

      {/* Stats questo mese */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--s-1)', marginBottom: 'var(--s-2)' }}>
        {[
          { label: 'Questo mese', value: `${thisMonthCount} img` },
          { label: 'Costo mese', value: `€${thisMonthCost.toFixed(2)}` },
          { label: 'Costo medio/img', value: `€0.04` },
        ].map(({ label, value }) => (
          <div key={label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-leather)', borderRadius: 'var(--r-sm)', padding: 'var(--s-1)', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: '8px', letterSpacing: '.07em', color: 'var(--fg-3)', textTransform: 'uppercase', marginBottom: 4 }}>{label}</div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', fontWeight: 600, color: 'var(--fg-1)' }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Storico mensile */}
      {rows.length > 0 && (
        <div>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: '9px', fontWeight: 600, letterSpacing: '.08em', color: 'var(--fg-3)', textTransform: 'uppercase', marginBottom: 8 }}>
            Storico
          </div>
          {rows.map(r => (
            <div key={r.month} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0', borderBottom: '.5px solid var(--bg-elevated)' }}>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: 'var(--fg-2)' }}>{r.month}</span>
              <div style={{ display: 'flex', gap: 24 }}>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: 'var(--fg-2)' }}>{r.count} img</span>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: 'var(--fg-1)', fontWeight: 500, minWidth: 50, textAlign: 'right' }}>€{r.cost.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {rows.length === 0 && (
        <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '12px', color: 'var(--fg-3)' }}>
          Nessuna generazione ancora — il contatore partirà dalla prima immagine generata.
        </p>
      )}

      <div style={{ marginTop: 'var(--s-2)', fontFamily: 'var(--font-sans)', fontSize: '10px', color: 'var(--fg-3)', lineHeight: 1.6 }}>
        * I costi sono stime basate su €0.04/immagine. Per dati esatti consulta{' '}
        <a href="https://aistudio.google.com/billing" target="_blank" rel="noreferrer" style={{ color: 'var(--gold)' }}>
          AI Studio Billing
        </a>.
      </div>
    </div>
  );
}
