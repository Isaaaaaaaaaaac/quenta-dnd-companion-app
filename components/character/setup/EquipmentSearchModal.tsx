'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { saveInventory } from '@/lib/db/actions';
import { generateId } from '@/lib/utils';
import type { InventoryItem } from '@/lib/db/schema';
import { MAGIC_ITEMS, RARITY_IT, TYPE_IT, TYPE_ICON } from '@/lib/srd/magicItems';
import { GEAR_ITEMS, GEAR_CAT_IT, GEAR_CAT_ICON, gearCatToModalCat } from '@/lib/srd/gear';

// ─── Item database ─────────────────────────────────────────────
type ItemCat = 'Arma' | 'Armatura' | 'Scudo' | 'Magico' | 'Pergamena' | 'Pozione' | 'Comune' | 'Strumento' | 'Cavalcatura' | 'Consumabile';

interface DbItem { id: string; name: string; wt: number; ico: string; cat: ItemCat; sub: string; }

const GEAR_DB: DbItem[] = GEAR_ITEMS.map(item => ({
  id: item.key,
  name: item.name,
  wt: item.weight,
  ico: GEAR_CAT_ICON[item.category],
  cat: gearCatToModalCat(item.category) as ItemCat,
  sub: GEAR_CAT_IT[item.category] + ' · ' + item.cost,
}));

const MAGIC_DB: DbItem[] = MAGIC_ITEMS.map(item => ({
  id: item.key,
  name: item.name,
  wt: 0,
  ico: TYPE_ICON[item.type],
  cat: (item.type === 'pozione' ? 'Pozione' : 'Magico') as ItemCat,
  sub: [
    TYPE_IT[item.type],
    RARITY_IT[item.rarity],
    item.requiresAttunement
      ? 'Sintonia' + (item.attunementNote ? ` (${item.attunementNote})` : '')
      : '',
  ].filter(Boolean).join(' · '),
}));

const DB: DbItem[] = [
  // ── Armi — ID allineati ai key SRD (equipment.ts) per match automatico ──────
  { id:'dagger',       name:'Pugnale',             wt:0.5,  ico:'🗡', cat:'Arma',      sub:'Mischia · Semplice' },
  { id:'club',         name:'Clava',               wt:1.0,  ico:'🪃', cat:'Arma',      sub:'Mischia · Semplice' },
  { id:'javelin',      name:'Giavellotto',         wt:1.5,  ico:'🪃', cat:'Arma',      sub:'Mischia · Semplice' },
  { id:'mace',         name:'Mazza',               wt:2.0,  ico:'🪃', cat:'Arma',      sub:'Mischia · Semplice' },
  { id:'handaxe',      name:'Ascia a Mano',        wt:1.0,  ico:'🪓', cat:'Arma',      sub:'Mischia · Semplice' },
  { id:'spear',        name:'Lancia (Asta)',        wt:1.5,  ico:'🪃', cat:'Arma',      sub:'Mischia · Semplice' },
  { id:'shortbow',     name:'Arco Corto',          wt:1.0,  ico:'🏹', cat:'Arma',      sub:'Distanza · Semplice' },
  { id:'shortsword',   name:'Spada Corta',         wt:1.0,  ico:'⚔',  cat:'Arma',      sub:'Mischia · Marziale' },
  { id:'longsword',    name:'Spada Lunga',         wt:1.5,  ico:'⚔',  cat:'Arma',      sub:'Mischia · Marziale' },
  { id:'greatsword',   name:'Spada a Due Mani',    wt:3.0,  ico:'⚔',  cat:'Arma',      sub:'Mischia · Marziale' },
  { id:'battleaxe',    name:'Ascia da Battaglia',  wt:2.0,  ico:'🪓', cat:'Arma',      sub:'Mischia · Marziale' },
  { id:'warhammer',    name:'Martello da Guerra',  wt:2.0,  ico:'🔨', cat:'Arma',      sub:'Mischia · Marziale' },
  { id:'glaive',       name:'Glaive',              wt:3.0,  ico:'🪃', cat:'Arma',      sub:'Mischia · Marziale' },
  { id:'rapier',       name:'Stocco',              wt:0.5,  ico:'🗡', cat:'Arma',      sub:'Mischia · Marziale' },
  { id:'scimitar',     name:'Scimitarra',          wt:1.5,  ico:'⚔',  cat:'Arma',      sub:'Mischia · Marziale' },
  { id:'longbow',      name:'Arco Lungo',          wt:1.0,  ico:'🏹', cat:'Arma',      sub:'Distanza · Marziale' },
  { id:'hand_crossbow',name:'Balestra a Mano',     wt:1.5,  ico:'🏹', cat:'Arma',      sub:'Distanza · Marziale' },
  { id:'crossbow_light',name:'Balestra Leggera',   wt:2.5,  ico:'🏹', cat:'Arma',      sub:'Distanza · Semplice' },
  { id:'dart',         name:'Dardo',               wt:0.1,  ico:'🏹', cat:'Arma',      sub:'Distanza · Semplice' },
  { id:'sling',        name:'Fionda',              wt:0.0,  ico:'🏹', cat:'Arma',      sub:'Distanza · Semplice' },
  { id:'quarterstaff', name:'Bastone',             wt:2.0,  ico:'🪃', cat:'Arma',      sub:'Mischia · Semplice' },
  { id:'frecce-20',    name:'Frecce (20)',          wt:0.5,  ico:'🏹', cat:'Arma',      sub:'Munizioni' },
  // ── Armature — ID allineati ai key SRD ────────────────────────────────────────
  { id:'leather',         name:'Di Cuoio',             wt:5.0,  ico:'🛡', cat:'Armatura',  sub:'Leggera · CA 11' },
  { id:'studded_leather', name:'Di Cuoio Borchiato',   wt:6.5,  ico:'🛡', cat:'Armatura',  sub:'Leggera · CA 12' },
  { id:'chain_shirt',     name:'Cotta di Maglia',      wt:10.0, ico:'🦺', cat:'Armatura',  sub:'Media · CA 13' },
  { id:'breastplate',     name:'Pettorale',            wt:10.0, ico:'🦺', cat:'Armatura',  sub:'Media · CA 14' },
  { id:'half_plate',      name:'Mezza Armatura',       wt:20.0, ico:'🦺', cat:'Armatura',  sub:'Media · CA 15' },
  { id:'chain_mail',      name:'Cotta di Piastre',     wt:27.5, ico:'🦺', cat:'Armatura',  sub:'Pesante · CA 16' },
  { id:'splint',          name:'A Stecche',            wt:30.0, ico:'🦺', cat:'Armatura',  sub:'Pesante · CA 17' },
  { id:'plate',           name:'A Piastre',            wt:32.5, ico:'🦺', cat:'Armatura',  sub:'Pesante · CA 18' },
  // Scudi
  { id:'shield',          name:'Scudo',                wt:3.0,  ico:'🛡', cat:'Scudo',     sub:'+2 CA' },
  // Pergamene
  { id:'scr-1',        name:'Pergamena Lv. 1',     wt:0.0,  ico:'📜', cat:'Pergamena', sub:'Comune' },
  { id:'scr-2',        name:'Pergamena Lv. 2',     wt:0.0,  ico:'📜', cat:'Pergamena', sub:'Non Comune' },
  { id:'scr-3',        name:'Pergamena Lv. 3',     wt:0.0,  ico:'📜', cat:'Pergamena', sub:'Non Comune' },
  { id:'scr-5',        name:'Pergamena Lv. 5',     wt:0.0,  ico:'📜', cat:'Pergamena', sub:'Rara' },
  // Gear SRD 5.1 (attrezzatura, strumenti, cavalcature, consumabili, merci)
  ...GEAR_DB,
  // Oggetti Magici SRD 5.1
  ...MAGIC_DB,
];

const RECENT_IDS = ['torcia', 'corda-c', 'potion_healing', 'longsword', 'zaino'];

const CAT_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  'Arma':      { bg:'rgba(139,58,26,.18)', color:'#c47a50', border:'rgba(139,58,26,.35)' },
  'Armatura':  { bg:'rgba(42,74,106,.18)', color:'#6aa3cc', border:'rgba(42,74,106,.35)' },
  'Scudo':     { bg:'rgba(42,74,106,.18)', color:'#6aa3cc', border:'rgba(42,74,106,.35)' },
  'Magico':      { bg:'rgba(91,33,182,.15)',  color:'#9b6edd', border:'rgba(91,33,182,.35)' },
  'Pergamena':   { bg:'rgba(74,58,16,.25)',   color:'#b8a050', border:'rgba(74,58,16,.5)'  },
  'Pozione':     { bg:'rgba(26,74,58,.2)',    color:'#50b898', border:'rgba(26,74,58,.4)'  },
  'Comune':      { bg:'rgba(48,45,42,.4)',    color:'var(--fg-2)', border:'rgba(48,45,42,.8)'  },
  'Strumento':   { bg:'rgba(16,58,74,.2)',    color:'#50a8b8', border:'rgba(16,58,74,.4)'  },
  'Cavalcatura': { bg:'rgba(74,44,16,.2)',    color:'#c47a40', border:'rgba(74,44,16,.4)'  },
  'Consumabile': { bg:'rgba(74,20,20,.2)',    color:'#c45858', border:'rgba(74,20,20,.4)'  },
};

const CATS: Array<{ label: string; cat: string }> = [
  { label: 'Tutti', cat: '' },
  { label: 'Armi', cat: 'Arma' },
  { label: 'Armature', cat: 'Armatura' },
  { label: 'Scudi', cat: 'Scudo' },
  { label: 'Magici', cat: 'Magico' },
  { label: 'Pergamene', cat: 'Pergamena' },
  { label: 'Pozioni', cat: 'Pozione' },
  { label: 'Strumenti', cat: 'Strumento' },
  { label: 'Cavalcature', cat: 'Cavalcatura' },
  { label: 'Consumabili', cat: 'Consumabile' },
  { label: 'Comuni', cat: 'Comune' },
];

interface Props {
  characterId: string;
  currentInventory: InventoryItem[];
  currentMoney: { pp: number; gp: number; ep: number; sp: number; cp: number };
  onClose: () => void;
}

type SelMap = Record<string, { item: DbItem; qty: number }>;

export default function EquipmentSearchModal({ characterId, currentInventory, currentMoney, onClose }: Props) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const [query, setQuery] = useState('');
  const [activeChip, setActiveChip] = useState('');
  const [sel, setSel] = useState<SelMap>({});
  const [customOpen, setCustomOpen] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customCat, setCustomCat] = useState('');
  const [customWt, setCustomWt] = useState('');
  const [customQty, setCustomQty] = useState('1');
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    return DB.filter(it => {
      const matchCat = !activeChip || it.cat === activeChip;
      const q = query.toLowerCase();
      const matchQ = !q || it.name.toLowerCase().includes(q) || it.sub.toLowerCase().includes(q) || it.cat.toLowerCase().includes(q);
      return matchCat && matchQ;
    });
  }, [query, activeChip]);

  const recents = RECENT_IDS.map(id => DB.find(i => i.id === id)).filter(Boolean) as DbItem[];
  const showRecents = !query && !activeChip;

  function toggleItem(item: DbItem) {
    setSel(prev => {
      const next = { ...prev };
      if (next[item.id]) delete next[item.id];
      else next[item.id] = { item, qty: 1 };
      return next;
    });
  }

  function changeQty(id: string, d: number) {
    setSel(prev => {
      const next = { ...prev };
      if (!next[id]) return prev;
      const nq = next[id].qty + d;
      if (nq <= 0) delete next[id];
      else next[id] = { ...next[id], qty: nq };
      return next;
    });
  }

  function addCustom() {
    if (!customName.trim()) return;
    const id = 'cst_' + Date.now();
    const item: DbItem = { id, name: customName.trim(), wt: parseFloat(customWt) || 0, ico: '📦', cat: (customCat as ItemCat) || 'Comune', sub: 'Custom' };
    setSel(prev => ({ ...prev, [id]: { item, qty: parseInt(customQty) || 1 } }));
    setCustomName(''); setCustomWt(''); setCustomQty('1'); setCustomCat('');
    setCustomOpen(false);
  }

  async function handleConfirm() {
    const keys = Object.keys(sel);
    if (!keys.length) return;
    setSaving(true);
    const newItems: InventoryItem[] = keys.map(id => ({
      id: generateId(),
      name: sel[id].item.name,
      quantity: sel[id].qty,
      weight: sel[id].item.wt,
      category: sel[id].item.cat,  // persiste categoria per logica equipaggiamento
      srdKey: sel[id].item.id,     // persiste chiave SRD per lookup stats armi/armature
    }));
    const merged = [...currentInventory, ...newItems];
    await saveInventory(characterId, merged, currentMoney);
    setSaving(false);
    onClose();
  }

  const totalQty = Object.values(sel).reduce((s, v) => s + v.qty, 0);
  const totalWt  = Object.values(sel).reduce((s, v) => s + v.item.wt * v.qty, 0);

  function highlight(text: string) {
    if (!query) return text;
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx < 0) return text;
    return text.slice(0, idx) + '<mark style="background:rgba(184,134,11,.25);color:var(--gold);border-radius:2px">' + text.slice(idx, idx + query.length) + '</mark>' + text.slice(idx + query.length);
  }

  const ItemRow = ({ item }: { item: DbItem }) => {
    const isSelected = !!sel[item.id];
    const qty = sel[item.id]?.qty ?? 0;
    const cc = CAT_COLORS[item.cat] ?? CAT_COLORS['Comune'];
    return (
      <div onClick={() => toggleItem(item)} style={{
        display: 'flex', alignItems: 'center', height: 44,
        padding: '0 var(--s-2)', gap: 'var(--s-1)', cursor: 'pointer',
        transition: 'background .15s',
        borderLeft: `2px solid ${isSelected ? 'var(--gold)' : 'transparent'}`,
        backgroundColor: isSelected ? 'rgba(184,134,11,.05)' : 'transparent',
      }}
        onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'var(--bg-card)'; }}
        onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
      >
        <span style={{ fontSize: 15, flexShrink: 0, width: 24, textAlign: 'center' }}>{item.ico}</span>
        <span style={{ flex: 1, fontSize: 14, color: 'var(--fg-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
          dangerouslySetInnerHTML={{ __html: highlight(item.name) }} />
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: 8, fontWeight: 600, letterSpacing: '.05em', textTransform: 'uppercase', padding: '2px 6px', borderRadius: 'var(--r)', flexShrink: 0, backgroundColor: cc.bg, color: cc.color, border: `1px solid ${cc.border}` }}>
          {item.cat}
        </span>
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: 9, color: 'var(--fg-2)', minWidth: 36, textAlign: 'right', flexShrink: 0 }}>
          {item.wt > 0 ? `${item.wt}kg` : '—'}
        </span>
        {!isSelected ? (
          <button onClick={e => { e.stopPropagation(); toggleItem(item); }} style={{ width: 24, height: 24, borderRadius: '50%', border: '1px solid var(--border-leather)', background: 'none', color: 'var(--fg-2)', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>+</button>
        ) : (
          <div onClick={e => e.stopPropagation()} style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
            <button onClick={() => changeQty(item.id, -1)} style={{ width: 24, height: 24, borderRadius: 'var(--r)', border: '1px solid var(--border-leather)', background: 'none', color: 'var(--fg-2)', fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>−</button>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600, color: 'var(--gold)', minWidth: 20, textAlign: 'center' }}>{qty}</span>
            <button onClick={() => changeQty(item.id, 1)} style={{ width: 24, height: 24, borderRadius: 'var(--r)', border: '1px solid var(--border-leather)', background: 'none', color: 'var(--fg-2)', fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>+</button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(4,3,2,.84)', backdropFilter: 'blur(4px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={e => e.target === e.currentTarget && onClose()}>

      <div style={{ background: 'var(--bg-deep)', border: '1px solid var(--border-leather-dim)', borderRadius: 'var(--r2)', width: '100%', maxWidth: 800, maxHeight: '88vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-2)', padding: 'var(--s-2) var(--s-3)', borderBottom: '1px solid var(--border-leather-dim)', flexShrink: 0 }}>
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 700, letterSpacing: '.08em', color: 'var(--gold)', textTransform: 'uppercase' }}>Aggiungi Equipaggiamento</span>
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: 12, color: 'var(--fg-3)', fontStyle: 'italic' }}>seleziona uno o più oggetti</span>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: '1px solid transparent', borderRadius: 'var(--r)', color: 'var(--fg-2)', fontSize: 16, cursor: 'pointer', flexShrink: 0 }}>✕</button>
        </div>

        {/* Search */}
        <div style={{ padding: 'var(--s-2) var(--s-3) 0', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-1)', background: 'var(--bg-card)', border: '1px solid var(--border-leather)', borderRadius: 'var(--r)', padding: '0 var(--s-1)', height: 40 }}>
            <span style={{ color: 'var(--fg-3)', fontSize: 15, flexShrink: 0 }}>🔍</span>
            <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)} placeholder="Cerca tra tutti gli oggetti…" autoFocus
              style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontFamily: 'var(--font-sans)', fontSize: 15, color: 'var(--fg-1)' }} />
            {query && <button onClick={() => { setQuery(''); inputRef.current?.focus(); }} style={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', color: 'var(--fg-3)', fontSize: 13, cursor: 'pointer', borderRadius: '50%' }}>✕</button>}
          </div>
        </div>

        {/* Chips */}
        <div style={{ padding: 'var(--s-1) var(--s-3)', display: 'flex', gap: 6, overflowX: 'auto', flexShrink: 0, scrollbarWidth: 'none' }}>
          {CATS.map(({ label, cat }) => {
            const isOn = activeChip === cat;
            return (
              <button key={cat} onClick={() => setActiveChip(isOn ? '' : cat)} style={{ fontFamily: 'var(--font-sans)', fontSize: 9, fontWeight: 600, letterSpacing: '.07em', textTransform: 'uppercase', height: 24, padding: '0 var(--s-1)', borderRadius: 'var(--r)', border: `1px solid ${isOn ? 'var(--gold-dim)' : 'var(--border-leather)'}`, background: isOn ? 'rgba(184,134,11,.12)' : 'none', color: isOn ? 'var(--gold)' : 'var(--fg-2)', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0, transition: 'all .18s' }}>
                {label}
              </button>
            );
          })}
        </div>

        {/* Body */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0, borderTop: '1px solid var(--border-leather)', flexDirection: isMobile ? 'column' : 'row' }}>

          {/* List */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0, borderRight: isMobile ? 'none' : '1px solid var(--border-leather)', borderBottom: isMobile ? '1px solid var(--border-leather)' : 'none' }}>
            <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--s-1) 0' }}>

              {showRecents && (
                <>
                  <div style={{ fontFamily: 'var(--font-sans)', fontSize: 8, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--fg-3)', padding: 'var(--s-1) var(--s-2) 4px', display: 'flex', alignItems: 'center', gap: 'var(--s-1)' }}>
                    Recenti
                    <span style={{ flex: 1, height: .5, background: 'var(--border-leather)' }} />
                  </div>
                  {recents.map(item => <ItemRow key={item.id} item={item} />)}
                  <div style={{ fontFamily: 'var(--font-sans)', fontSize: 8, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--fg-3)', padding: 'var(--s-1) var(--s-2) 4px', marginTop: 'var(--s-1)', display: 'flex', alignItems: 'center', gap: 'var(--s-1)' }}>
                    Tutti gli oggetti
                    <span style={{ flex: 1, height: .5, background: 'var(--border-leather)' }} />
                  </div>
                </>
              )}

              {!showRecents && (
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 8, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--fg-3)', padding: 'var(--s-1) var(--s-2) 4px', display: 'flex', alignItems: 'center', gap: 'var(--s-1)' }}>
                  {filtered.length} risultat{filtered.length === 1 ? 'o' : 'i'}{query ? ` per "${query}"` : activeChip ? ` · ${activeChip}` : ''}
                  <span style={{ flex: 1, height: .5, background: 'var(--border-leather)' }} />
                </div>
              )}

              {filtered.length === 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 'var(--s-4) var(--s-2)', color: 'var(--fg-3)', fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 13, textAlign: 'center', gap: 'var(--s-1)' }}>
                  <span style={{ fontSize: 24, opacity: .35 }}>⚔</span>
                  Nessun oggetto trovato.
                </div>
              )}

              {filtered.map(item => <ItemRow key={item.id} item={item} />)}

              {/* Custom item */}
              <div onClick={() => setCustomOpen(o => !o)} style={{ display: 'flex', alignItems: 'center', height: 44, padding: '0 var(--s-2)', gap: 'var(--s-1)', cursor: 'pointer', color: 'var(--arcane)', opacity: .7, borderTop: '1px dashed rgba(91,33,182,.25)', transition: 'opacity .15s' }}
                onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                onMouseLeave={e => e.currentTarget.style.opacity = '.7'}>
                <span style={{ fontSize: 12 }}>✦</span>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: 9, fontWeight: 600, letterSpacing: '.07em', textTransform: 'uppercase' }}>Oggetto personalizzato</span>
                <span style={{ marginLeft: 'auto', fontSize: 11, transition: 'transform .2s', transform: customOpen ? 'rotate(180deg)' : 'none' }}>▾</span>
              </div>

              {customOpen && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-1)', padding: 'var(--s-1) var(--s-2) var(--s-2)', background: 'rgba(91,33,182,.04)', borderTop: '1px solid rgba(91,33,182,.2)' }}>
                  <input value={customName} onChange={e => setCustomName(e.target.value)} placeholder="Nome oggetto…"
                    style={{ height: 32, background: 'var(--bg-card)', border: '1px solid var(--border-leather)', borderRadius: 'var(--r)', padding: '0 var(--s-1)', fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--fg-1)', outline: 'none' }} />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--s-1)' }}>
                    <select value={customCat} onChange={e => setCustomCat(e.target.value)}
                      style={{ height: 32, background: 'var(--bg-card)', border: '1px solid var(--border-leather)', borderRadius: 'var(--r)', padding: '0 var(--s-1)', fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--fg-1)', outline: 'none', cursor: 'pointer' }}>
                      <option value="">Categoria…</option>
                      {(['Arma','Armatura','Scudo','Magico','Pergamena','Pozione','Comune'] as ItemCat[]).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <input value={customWt} onChange={e => setCustomWt(e.target.value)} type="number" placeholder="Peso (kg)" min="0" step="0.1"
                      style={{ height: 32, background: 'var(--bg-card)', border: '1px solid var(--border-leather)', borderRadius: 'var(--r)', padding: '0 var(--s-1)', fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--fg-1)', outline: 'none' }} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--s-1)' }}>
                    <input value={customQty} onChange={e => setCustomQty(e.target.value)} type="number" placeholder="Quantità" min="1"
                      style={{ height: 32, background: 'var(--bg-card)', border: '1px solid var(--border-leather)', borderRadius: 'var(--r)', padding: '0 var(--s-1)', fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--fg-1)', outline: 'none' }} />
                    <button onClick={addCustom} disabled={!customName.trim()} style={{ height: 32, fontFamily: 'var(--font-sans)', fontSize: 10, fontWeight: 600, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--arcane)', background: 'rgba(91,33,182,.07)', border: '1px solid rgba(91,33,182,.3)', borderRadius: 'var(--r)', cursor: customName.trim() ? 'pointer' : 'not-allowed', opacity: customName.trim() ? 1 : 0.5 }}>
                      ✦ Aggiungi
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Summary panel */}
          <div style={{ width: isMobile ? '100%' : 232, maxHeight: isMobile ? 200 : undefined, flexShrink: isMobile ? 0 : undefined, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: 'var(--s-2) var(--s-2) var(--s-1)' }}>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 9, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--gold)', display: 'flex', alignItems: 'center', gap: 'var(--s-1)' }}>
                Selezione
                <span style={{ flex: 1, height: .5, background: 'linear-gradient(to right, var(--gold-dim), transparent)' }} />
              </div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '0 var(--s-1)', display: 'flex', flexDirection: 'column', gap: 3 }}>
              {Object.keys(sel).length === 0 ? (
                <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 13, color: 'var(--fg-3)', padding: 'var(--s-2) var(--s-1)', textAlign: 'center', lineHeight: 1.7 }}>
                  Nessun oggetto<br />selezionato.
                </div>
              ) : Object.entries(sel).map(([id, { item, qty }]) => (
                <div key={id} style={{ display: 'flex', alignItems: 'center', padding: '5px var(--s-1)', borderRadius: 'var(--r)', background: 'var(--bg-card)', gap: 4, border: '1px solid transparent' }}>
                  <span style={{ fontSize: 11, flexShrink: 0 }}>{item.ico}</span>
                  <span style={{ flex: 1, fontSize: 12, color: 'var(--fg-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</span>
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: 9, fontWeight: 600, color: 'var(--gold)', flexShrink: 0 }}>×{qty}</span>
                  <button onClick={() => setSel(prev => { const next = { ...prev }; delete next[id]; return next; })} style={{ width: 16, height: 16, border: 'none', background: 'none', color: 'var(--fg-3)', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', borderRadius: '50%', flexShrink: 0 }}>✕</button>
                </div>
              ))}
            </div>
            <div style={{ padding: 'var(--s-1) var(--s-2)', borderTop: '1px solid var(--border-leather)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--s-1)' }}>
              {[['Oggetti', String(totalQty)], ['Peso', `${totalWt.toFixed(1)}kg`]].map(([l, v]) => (
                <div key={l}>
                  <div style={{ fontFamily: 'var(--font-sans)', fontSize: 8, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--fg-3)' }}>{l}</div>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 700, color: 'var(--fg-1)', lineHeight: 1 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 'var(--s-1)', padding: 'var(--s-2) var(--s-3)', borderTop: '1px solid var(--border-leather-dim)', background: 'var(--bg-deep)', flexShrink: 0 }}>
          <button onClick={onClose} style={{ height: 40, padding: '0 var(--s-3)', fontFamily: 'var(--font-sans)', fontSize: 10, fontWeight: 600, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--fg-2)', background: 'none', border: '1px solid var(--border-leather)', borderRadius: 'var(--r)', cursor: 'pointer' }}>
            Annulla
          </button>
          <button onClick={handleConfirm} disabled={Object.keys(sel).length === 0 || saving} style={{ height: 40, padding: '0 var(--s-3)', fontFamily: 'var(--font-sans)', fontSize: 10, fontWeight: 600, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--bg-deep)', background: Object.keys(sel).length === 0 || saving ? 'var(--border-leather)' : 'var(--gold)', border: 'none', borderRadius: 'var(--r)', cursor: Object.keys(sel).length === 0 || saving ? 'not-allowed' : 'pointer', opacity: Object.keys(sel).length === 0 ? .32 : 1, transition: 'all .18s' }}>
            {saving ? 'Salvando…' : `Aggiungi ai Possedimenti${totalQty > 0 ? ` (${totalQty})` : ''}`}
          </button>
        </div>
      </div>
    </div>
  );
}
