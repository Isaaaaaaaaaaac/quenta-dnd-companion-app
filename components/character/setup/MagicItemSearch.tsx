'use client';

import { useState, useEffect, useRef } from 'react';
import type { MagicItem } from '@/lib/db/schema';
import { generateId } from '@/lib/utils';
import { ITEM_RARITIES } from '@/lib/srd/equipment';

interface SrdMagicItem {
  index: string;
  name: string;
  rarity?: { name: string };
  requires_attunement?: boolean | string;
  desc?: string[];
  equipment_category?: { name: string };
}

interface Props {
  magicItems: MagicItem[];
  setMagicItems: (items: MagicItem[]) => void;
}

const RARITY_MAP: Record<string, string> = {
  'Common': 'comune',
  'Uncommon': 'non comune',
  'Rare': 'raro',
  'Very Rare': 'molto raro',
  'Legendary': 'leggendario',
  'Artifact': 'artefatto',
  'Varies': 'variabile',
};

export default function MagicItemSearch({ magicItems, setMagicItems }: Props) {
  const [allItems, setAllItems] = useState<{ index: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [search, setSearch] = useState('');
  const [filterRarity, setFilterRarity] = useState('all');
  const [detailCache, setDetailCache] = useState<Record<string, SrdMagicItem>>({});
  const [previewItem, setPreviewItem] = useState<SrdMagicItem | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const existingIds = new Set(magicItems.map(i => i.id));

  useEffect(() => {
    setLoading(true);
    // Prova prima con /api/2014/magic-items, poi fallback a /api/magic-items
    const tryFetch = (url: string) =>
      fetch(url)
        .then(r => { if (!r.ok) throw new Error(); return r.json(); })
        .then(data => {
          const results: { index: string; name: string }[] = data.results ?? [];
          setAllItems(results);
          setLoading(false);
        });

    tryFetch('https://www.dnd5eapi.co/api/2014/magic-items')
      .catch(() => tryFetch('https://www.dnd5eapi.co/api/magic-items'))
      .catch(() => {
        setLoadError('SRD API non raggiungibile. Puoi aggiungere oggetti manualmente.');
        setLoading(false);
      });
  }, []);

  async function fetchDetail(index: string): Promise<SrdMagicItem | null> {
    if (detailCache[index]) return detailCache[index];
    setLoadingDetail(true);
    try {
      const tryUrl = async (url: string) => {
        const r = await fetch(url);
        if (!r.ok) throw new Error();
        return r.json();
      };
      const data = await tryUrl(`https://www.dnd5eapi.co/api/2014/magic-items/${index}`)
        .catch(() => tryUrl(`https://www.dnd5eapi.co/api/magic-items/${index}`));
      setDetailCache(c => ({ ...c, [index]: data }));
      setLoadingDetail(false);
      return data;
    } catch {
      setLoadingDetail(false);
      return null;
    }
  }

  async function handleSelectItem(index: string, name: string) {
    if (existingIds.has(index)) { removeItem(index); return; }
    const detail = await fetchDetail(index);
    if (detail) setPreviewItem(detail);
    else {
      // Aggiungi direttamente senza dettaglio
      addItemToList({
        id: index, name,
        rarity: 'non comune', attunement: false, attuned: false, description: '',
      });
    }
  }

  function addItemToList(item: MagicItem) {
    setMagicItems([...magicItems, item]);
    setPreviewItem(null);
    setSearch('');
    setShowDropdown(false);
  }

  function confirmPreview() {
    if (!previewItem) return;
    const rarity = RARITY_MAP[previewItem.rarity?.name ?? ''] ?? 'non comune';
    const attunement = typeof previewItem.requires_attunement === 'string'
      ? true : previewItem.requires_attunement ?? false;
    const description = previewItem.desc?.join('\n') ?? '';

    addItemToList({
      id: previewItem.index,
      name: previewItem.name,
      rarity,
      attunement,
      attuned: false,
      description,
    });
  }

  function addManual() {
    addItemToList({
      id: generateId(),
      name: search.trim() || 'Oggetto Magico',
      rarity: 'non comune',
      attunement: false, attuned: false, description: '',
    });
  }

  function removeItem(id: string) { setMagicItems(magicItems.filter(i => i.id !== id)); }

  function updateItem(id: string, field: keyof MagicItem, value: unknown) {
    setMagicItems(magicItems.map(i => i.id === id ? { ...i, [field]: value } : i));
  }

  const filtered = allItems.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase())
  );

  const RARITY_COLORS: Record<string, string> = {
    'comune': '#a08060', 'non comune': '#4a7c4e', 'raro': '#4a6a9a',
    'molto raro': '#7a3a9a', 'leggendario': '#c8922a', 'artefatto': '#8b2020',
  };

  return (
    <div>
      {/* ── Lista oggetti aggiunti ── */}
      {magicItems.length > 0 && (
        <div className="mb-4 space-y-2">
          {magicItems.map(item => (
            <div key={item.id} className="p-3" style={{ border: '1px solid #5a4020', backgroundColor: '#1e1810' }}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div style={{ fontFamily: 'Cinzel, serif', color: '#e8d5a3', fontSize: '0.9rem' }}>{item.name}</div>
                  <div className="flex gap-2 mt-1">
                    <span style={{ border: `1px solid ${RARITY_COLORS[item.rarity] ?? '#a08060'}`, color: RARITY_COLORS[item.rarity] ?? '#a08060', fontFamily: 'Cinzel, serif', fontSize: '0.6rem', padding: '1px 5px' }}>
                      {item.rarity}
                    </span>
                    {item.attunement && (
                      <button onClick={() => updateItem(item.id, 'attuned', !item.attuned)}
                        style={{ border: `1px solid ${item.attuned ? '#4a7c4e' : '#8b2020'}`, color: item.attuned ? '#4a7c4e' : '#8b2020', backgroundColor: 'transparent', fontFamily: 'Cinzel, serif', fontSize: '0.6rem', padding: '1px 5px', cursor: 'pointer' }}>
                        {item.attuned ? '✓ Sintonizzato' : '○ Sintonizzazione richiesta'}
                      </button>
                    )}
                  </div>
                </div>
                <button onClick={() => removeItem(item.id)}
                  style={{ border: 'none', color: '#8b2020', backgroundColor: 'transparent', cursor: 'pointer', fontSize: '1rem', padding: '0 4px' }}>
                  ✕
                </button>
              </div>
              {item.description && (
                <details>
                  <summary style={{ color: '#5a4020', fontFamily: 'Cinzel, serif', fontSize: '0.65rem', cursor: 'pointer', letterSpacing: '0.04em' }}>
                    DESCRIZIONE
                  </summary>
                  <p style={{ color: '#a08060', fontFamily: 'Crimson Text, serif', fontSize: '0.85rem', fontStyle: 'italic', marginTop: 6, whiteSpace: 'pre-wrap' }}>
                    {item.description}
                  </p>
                </details>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Preview dettaglio prima di aggiungere ── */}
      {previewItem && (
        <div className="mb-4 p-4" style={{ border: '1px solid #c8922a', backgroundColor: '#2a2010' }}>
          <div className="flex justify-between items-start mb-2">
            <div>
              <div style={{ fontFamily: 'Cinzel, serif', color: '#c8922a', fontSize: '1rem' }}>{previewItem.name}</div>
              <div className="flex gap-2 mt-1">
                {previewItem.rarity && (
                  <span style={{ color: RARITY_COLORS[RARITY_MAP[previewItem.rarity.name]] ?? '#a08060', fontFamily: 'Cinzel, serif', fontSize: '0.65rem' }}>
                    {RARITY_MAP[previewItem.rarity.name] ?? previewItem.rarity.name}
                  </span>
                )}
                {previewItem.requires_attunement && (
                  <span style={{ color: '#8a6a2a', fontFamily: 'Cinzel, serif', fontSize: '0.65rem' }}>
                    Richiede sintonizzazione
                    {typeof previewItem.requires_attunement === 'string' ? ` (${previewItem.requires_attunement})` : ''}
                  </span>
                )}
              </div>
            </div>
            <button onClick={() => setPreviewItem(null)}
              style={{ border: 'none', color: '#5a4020', backgroundColor: 'transparent', cursor: 'pointer', fontSize: '1rem' }}>
              ✕
            </button>
          </div>
          {previewItem.desc && previewItem.desc.slice(0, 3).map((line, i) => (
            <p key={i} style={{ color: '#a08060', fontFamily: 'Crimson Text, serif', fontSize: '0.85rem', fontStyle: 'italic', marginBottom: 4 }}>
              {line}
            </p>
          ))}
          <div className="flex gap-2 mt-3">
            <button onClick={confirmPreview}
              style={{ border: '1px solid #c8922a', color: '#c8922a', backgroundColor: 'transparent', fontFamily: 'Cinzel, serif', padding: '6px 16px', cursor: 'pointer', fontSize: '0.8rem' }}>
              + Aggiungi al personaggio
            </button>
            <button onClick={() => setPreviewItem(null)}
              style={{ border: '1px solid #5a4020', color: '#a08060', backgroundColor: 'transparent', fontFamily: 'Cinzel, serif', padding: '6px 16px', cursor: 'pointer', fontSize: '0.8rem' }}>
              Annulla
            </button>
          </div>
        </div>
      )}

      {/* ── Ricerca ── */}
      {loadError ? (
        <div className="p-3 mb-3" style={{ backgroundColor: '#1a0a0a', border: '1px solid #8b2020' }}>
          <p style={{ color: '#8b2020', fontFamily: 'Crimson Text, serif', fontSize: '0.85rem', marginBottom: 8 }}>{loadError}</p>
          <button onClick={addManual}
            style={{ border: '1px solid #5a4020', color: '#a08060', backgroundColor: 'transparent', fontFamily: 'Cinzel, serif', padding: '5px 12px', cursor: 'pointer', fontSize: '0.75rem' }}>
            + Aggiungi oggetto manuale
          </button>
        </div>
      ) : (
        <div className="relative">
          <div className="flex gap-2 mb-2">
            <input
              ref={inputRef}
              value={search}
              onChange={e => { setSearch(e.target.value); setShowDropdown(true); }}
              onFocus={() => setShowDropdown(true)}
              placeholder={loading ? 'Caricamento SRD…' : 'Cerca oggetto magico SRD…'}
              disabled={loading}
              style={{ flex: 1, backgroundColor: 'transparent', border: 'none', borderBottom: '1px solid #5a4020', color: '#e8d5a3', outline: 'none', fontFamily: 'Crimson Text, serif', fontSize: '0.9rem', padding: '4px 0' }}
            />
            <button onClick={addManual}
              style={{ border: '1px dashed #5a4020', color: '#a08060', backgroundColor: 'transparent', fontFamily: 'Cinzel, serif', padding: '4px 10px', cursor: 'pointer', fontSize: '0.75rem', flexShrink: 0 }}>
              + Manuale
            </button>
          </div>

          {showDropdown && search.length > 0 && filtered.length > 0 && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />
              <div className="absolute left-0 right-0 z-20 max-h-52 overflow-y-auto"
                style={{ backgroundColor: '#221c14', border: '1px solid #5a4020', top: '100%' }}>
                {loadingDetail && (
                  <div style={{ padding: '8px 12px', color: '#a08060', fontFamily: 'Crimson Text, serif', fontSize: '0.85rem' }}>
                    Caricamento dettaglio…
                  </div>
                )}
                {filtered.slice(0, 30).map(item => {
                  const isAdded = existingIds.has(item.index);
                  return (
                    <button key={item.index}
                      onClick={() => handleSelectItem(item.index, item.name)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        width: '100%', padding: '8px 12px', textAlign: 'left',
                        border: 'none', borderBottom: '1px solid #2a2018',
                        backgroundColor: isAdded ? '#2a2010' : 'transparent',
                        cursor: 'pointer',
                        color: isAdded ? '#c8922a' : '#e8d5a3',
                        fontFamily: 'Crimson Text, serif', fontSize: '0.9rem',
                      }}>
                      <span style={{ fontSize: '0.75rem', color: isAdded ? '#c8922a' : '#5a4020' }}>
                        {isAdded ? '◆' : '◇'}
                      </span>
                      {item.name}
                    </button>
                  );
                })}
                {filtered.length > 30 && (
                  <div style={{ padding: '6px 12px', color: '#5a4020', fontFamily: 'Crimson Text, serif', fontSize: '0.8rem', fontStyle: 'italic' }}>
                    {filtered.length - 30} altri risultati — affina la ricerca
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
