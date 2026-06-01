'use client';

import { useState, useTransition } from 'react';
import { applyDamage, applyHealing, addCondition, addXp } from '@/lib/db/actions';
import { CONDITIONS } from '@/lib/srd/conditions';
import EquipmentSearchModal from '@/components/character/setup/EquipmentSearchModal';
import SpellSearchModal from '@/components/character/spell/SpellSearchModal';
import type { InventoryItem, KnownSpell, CharacterClass, CharacterStats } from '@/lib/db/schema';

// ─── types ────────────────────────────────────────────────────

type ModalId = 'equipment' | 'item' | 'spell' | 'condition' | 'damage' | 'heal' | 'xp';

interface Action {
  id: ModalId;
  icon: string;
  label: string;
  bg: string;
  color: string;
}

interface Props {
  characterId: string;
  isDm: boolean;
  canCast: boolean;
  hpCurrent: number;
  hpMax: number;
  inventory: InventoryItem[];
  money: { pp: number; gp: number; ep: number; sp: number; cp: number };
  knownSpells: KnownSpell[];
  casterClassKeys: string[];
  characterClasses: CharacterClass[];
  characterStats: CharacterStats;
}

// ─── sub-components ───────────────────────────────────────────

function QuickInputModal({
  title, subtitle, inputValue, onChangeInput,
  quickAmounts, onClose, onConfirm, isPending, confirmLabel, confirmColor,
}: {
  title: string; subtitle?: string;
  inputValue: string; onChangeInput: (v: string) => void;
  quickAmounts: number[];
  onClose: () => void; onConfirm: () => void;
  isPending: boolean; confirmLabel: string; confirmColor: string;
}) {
  const valid = !!inputValue && parseInt(inputValue) > 0;
  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 460, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(0,0,0,.65)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background: 'var(--bg-deep)', border: '1px solid var(--border-leather-dim)', borderRadius: 'var(--r-lg)', padding: 'var(--s-3)', width: '100%', maxWidth: 320 }}>
        {/* header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: subtitle ? 4 : 'var(--s-2)' }}>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 700, color: 'var(--fg-1)' }}>{title}</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--fg-2)', fontSize: 16, cursor: 'pointer', padding: 4 }}>✕</button>
        </div>
        {subtitle && (
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: 'var(--fg-2)', marginBottom: 'var(--s-2)' }}>{subtitle}</div>
        )}

        {/* quick amounts */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 'var(--s-2)' }}>
          {quickAmounts.map(n => {
            const sel = inputValue === String(n);
            return (
              <button key={n} onClick={() => onChangeInput(String(n))} style={{
                height: 36, padding: '0 14px', borderRadius: 'var(--r-sm)',
                border: `1px solid ${sel ? 'var(--gold)' : 'var(--border-leather)'}`,
                background: sel ? 'var(--gold-soft)' : 'none',
                color: sel ? 'var(--gold)' : 'var(--fg-2)',
                fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: sel ? 600 : 400,
                cursor: 'pointer', transition: 'all .15s',
              }}>{n}</button>
            );
          })}
        </div>

        {/* free input */}
        <input
          type="number" value={inputValue} onChange={e => onChangeInput(e.target.value)}
          min="1" placeholder="Valore personalizzato…"
          autoFocus
          style={{
            width: '100%', height: 48, background: 'var(--bg-card)',
            border: '1px solid var(--border-leather)', borderRadius: 'var(--r-sm)',
            color: 'var(--fg-1)', fontFamily: 'var(--font-sans)', fontSize: '18px',
            outline: 'none', padding: '0 var(--s-2)', marginBottom: 'var(--s-2)',
            boxSizing: 'border-box', textAlign: 'center',
          }}
        />

        <button
          onClick={onConfirm}
          disabled={!valid || isPending}
          style={{
            width: '100%', height: 48, borderRadius: 'var(--r-sm)',
            background: valid ? confirmColor : 'var(--bg-card)',
            color: valid ? 'var(--fg-1)' : 'var(--fg-3)',
            border: 'none',
            fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 600,
            cursor: (!valid || isPending) ? 'not-allowed' : 'pointer',
            opacity: (!valid || isPending) ? 0.55 : 1,
            transition: 'all .2s',
          }}
        >
          {isPending ? 'Applicando…' : confirmLabel}
        </button>
      </div>
    </div>
  );
}

function ConditionPickerModal({ onClose, onSelect }: { onClose: () => void; onSelect: (key: string) => void }) {
  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 460, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(0,0,0,.65)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background: 'var(--bg-deep)', border: '1px solid var(--border-leather-dim)', borderRadius: 'var(--r-lg)', padding: 'var(--s-2)', width: '100%', maxWidth: 360, maxHeight: '72vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--s-2)', flexShrink: 0 }}>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 700, color: 'var(--fg-1)' }}>⚠ Aggiungi Condizione</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--fg-2)', fontSize: 16, cursor: 'pointer', padding: 4 }}>✕</button>
        </div>
        <div style={{ overflowY: 'auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {CONDITIONS.map(c => (
            <button
              key={c.key}
              onClick={() => onSelect(c.key)}
              style={{
                height: 52, borderRadius: 'var(--r-sm)',
                border: '1px solid var(--border-leather)', background: 'var(--bg-card)',
                color: 'var(--fg-1)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px',
                fontFamily: 'var(--font-sans)', fontSize: '12px',
                transition: 'background .15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--gold-soft)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-card)'}
            >
              <span style={{ fontSize: 16, flexShrink: 0 }}>{c.icon}</span>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── main component ───────────────────────────────────────────

const HP_AMOUNTS  = [1, 2, 3, 5, 8, 10, 15, 20];
const XP_AMOUNTS  = [50, 100, 200, 300, 500, 1000];

export default function MobileFab({
  characterId, isDm, canCast,
  hpCurrent, hpMax,
  inventory, money,
  knownSpells, casterClassKeys, characterClasses, characterStats,
}: Props) {
  const [open, setOpen]         = useState(false);
  const [modal, setModal]       = useState<ModalId | null>(null);
  const [inputVal, setInputVal] = useState('');
  const [isPending, startTransition] = useTransition();

  const actions: Action[] = [
    { id: 'damage',    icon: '💢', label: 'Aggiungi danno',           bg: 'var(--danger-soft)',  color: 'var(--danger)' },
    { id: 'heal',      icon: '❤️', label: 'Recupera PF',              bg: 'var(--success-soft)',  color: 'var(--hp-healthy)' },
    { id: 'condition', icon: '⚠',  label: 'Aggiungi Condizione',      bg: 'var(--arcane-soft)',  color: 'var(--arcane)' },
    ...(canCast ? [{ id: 'spell' as ModalId, icon: '✨', label: 'Aggiungi Incantesimo', bg: 'var(--info-soft)', color: 'var(--info)' }] : []),
    { id: 'equipment', icon: '⚔',  label: 'Aggiungi Equipaggiamento', bg: 'var(--gold-soft)', color: 'var(--gold)' },
    ...(isDm ? [
      { id: 'xp'   as ModalId, icon: '⭐', label: 'Assegna XP',      bg: 'var(--gold-soft)', color: 'var(--gold)' },
      { id: 'item' as ModalId, icon: '🎁', label: 'Assegna Oggetto',  bg: 'var(--gold-soft)', color: 'var(--gold)' },
    ] : []),
  ];

  function openModal(id: ModalId) {
    setInputVal('');
    setModal(id);
    setOpen(false);
  }

  function closeModal() {
    setModal(null);
    setInputVal('');
  }

  function handleDamage() {
    const n = parseInt(inputVal);
    if (!n || n <= 0) return;
    startTransition(() => applyDamage(characterId, n));
    closeModal();
  }

  function handleHeal() {
    const n = parseInt(inputVal);
    if (!n || n <= 0) return;
    startTransition(() => applyHealing(characterId, n));
    closeModal();
  }

  function handleXp() {
    const n = parseInt(inputVal);
    if (!n || n <= 0) return;
    startTransition(() => addXp(characterId, n));
    closeModal();
  }

  function handleCondition(key: string) {
    startTransition(() => addCondition(characterId, key));
    closeModal();
  }

  return (
    <>
      {/* ── Backdrop speed dial ──────────────────────────────── */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 44, background: 'rgba(0,0,0,.35)' }}
        />
      )}

      {/* ── Speed dial + FAB ─────────────────────────────────── */}
      <div style={{
        position: 'fixed', bottom: 80, right: 16, zIndex: 45,
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
        {open && actions.map((action, i) => (
          <div
            key={action.id}
            onClick={() => openModal(action.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              cursor: 'pointer',
              animation: `fabItem .15s ease ${i * 0.04}s both`,
            }}
          >
            {/* Label pill */}
            <span style={{
              background: 'var(--bg-deep)',
              border: '1px solid var(--border-leather)',
              borderRadius: 'var(--r-lg)', padding: '6px 14px',
              fontFamily: 'var(--font-sans)', fontSize: '12px', fontWeight: 600,
              color: 'var(--fg-1)',
              whiteSpace: 'nowrap',
              boxShadow: '0 2px 10px rgba(0,0,0,.35)',
            }}>
              {action.label}
            </span>
            {/* Icon circle */}
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

      {/* ── Danno ────────────────────────────────────────────── */}
      {modal === 'damage' && (
        <QuickInputModal
          title="💢 Aggiungi danno"
          subtitle={`PF attuali: ${hpCurrent} / ${hpMax}`}
          inputValue={inputVal} onChangeInput={setInputVal}
          quickAmounts={HP_AMOUNTS}
          onClose={closeModal} onConfirm={handleDamage}
          isPending={isPending}
          confirmLabel="Applica danno"
          confirmColor="var(--danger)"
        />
      )}

      {/* ── Recupera PF ──────────────────────────────────────── */}
      {modal === 'heal' && (
        <QuickInputModal
          title="❤️ Recupera PF"
          subtitle={`PF attuali: ${hpCurrent} / ${hpMax}`}
          inputValue={inputVal} onChangeInput={setInputVal}
          quickAmounts={HP_AMOUNTS}
          onClose={closeModal} onConfirm={handleHeal}
          isPending={isPending}
          confirmLabel="Applica guarigione"
          confirmColor="var(--success)"
        />
      )}

      {/* ── Assegna XP ───────────────────────────────────────── */}
      {modal === 'xp' && (
        <QuickInputModal
          title="⭐ Assegna XP"
          inputValue={inputVal} onChangeInput={setInputVal}
          quickAmounts={XP_AMOUNTS}
          onClose={closeModal} onConfirm={handleXp}
          isPending={isPending}
          confirmLabel="Assegna XP"
          confirmColor="var(--gold)"
        />
      )}

      {/* ── Condizione ───────────────────────────────────────── */}
      {modal === 'condition' && (
        <ConditionPickerModal onClose={closeModal} onSelect={handleCondition} />
      )}

      {/* ── Equipaggiamento / Assegna Oggetto ────────────────── */}
      {(modal === 'equipment' || modal === 'item') && (
        <EquipmentSearchModal
          characterId={characterId}
          currentInventory={inventory}
          currentMoney={money}
          onClose={closeModal}
        />
      )}

      {/* ── Incantesimo ──────────────────────────────────────── */}
      {modal === 'spell' && (
        <SpellSearchModal
          characterId={characterId}
          currentSpells={knownSpells}
          casterClassKeys={casterClassKeys}
          characterClasses={characterClasses}
          characterStats={characterStats}
          onClose={closeModal}
        />
      )}
    </>
  );
}
