'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createCampaign } from '@/lib/db/actions';

export default function NewCampaignForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [setting, setSetting] = useState('');
  const [description, setDescription] = useState('');
  const [dmNotes, setDmNotes] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    const id = await createCampaign({
      name: name.trim(),
      setting: setting || null,
      description: description || null,
      dmNotes: dmNotes || null,
      coverUrl: coverUrl || null,
      status: 'active',
    });
    router.push(`/campaigns/${id}`);
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Card principale */}
      <div className="card" style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div>
          <label className="field-label">Nome della campagna *</label>
          <input
            className="field-input"
            value={name} onChange={e => setName(e.target.value)}
            required placeholder="Es. Aethon, La Maledizione di Strahd…"
            autoFocus
          />
        </div>

        <div>
          <label className="field-label">Ambientazione</label>
          <input
            className="field-input"
            value={setting} onChange={e => setSetting(e.target.value)}
            placeholder="Es. Dark Fantasy, Forgotten Realms, homebrew…"
          />
        </div>

        <div>
          <label className="field-label">Descrizione</label>
          <textarea
            className="field-input"
            value={description} onChange={e => setDescription(e.target.value)}
            rows={3} placeholder="Una breve descrizione della campagna, il tono, il premise…"
            style={{ resize: 'vertical' }}
          />
        </div>

        <div>
          <label className="field-label">Immagine di copertina (URL)</label>
          <input
            className="field-input"
            value={coverUrl} onChange={e => setCoverUrl(e.target.value)}
            placeholder="https://…"
          />
          {coverUrl && (
            <img
              src={coverUrl} alt="Anteprima"
              onError={() => setCoverUrl('')}
              style={{ marginTop: 12, width: '100%', maxHeight: 160, objectFit: 'cover', border: '1px solid var(--border-leather)', display: 'block' }}
            />
          )}
        </div>
      </div>

      {/* Card note DM */}
      <div className="card" style={{ padding: 32, borderColor: 'rgba(139,26,26,0.4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <div style={{ width: 2, height: 16, backgroundColor: 'var(--danger)', opacity: 0.7 }} />
          <label className="field-label" style={{ color: 'var(--fg-1)', marginBottom: 0 }}>Note DM — private</label>
        </div>
        <textarea
          className="field-input"
          value={dmNotes} onChange={e => setDmNotes(e.target.value)}
          rows={4} placeholder="Trame segrete, connessioni tra PNG, segreti che i giocatori non devono vedere…"
          style={{ resize: 'vertical', borderColor: 'rgba(139,26,26,0.4)' }}
        />
      </div>

      {/* Azioni */}
      <div style={{ display: 'flex', gap: 12, paddingTop: 8 }}>
        <button type="submit" disabled={saving || !name.trim()} className="btn btn-primary">
          {saving ? 'Creando…' : '✦  Crea Campagna'}
        </button>
        <button type="button" onClick={() => router.back()} className="btn btn-ghost">
          Annulla
        </button>
      </div>
    </form>
  );
}
