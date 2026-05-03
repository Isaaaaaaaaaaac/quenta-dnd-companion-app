'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createCampaign } from '@/lib/db/actions';

const inp: React.CSSProperties = { backgroundColor: 'transparent', border: 'none', borderBottom: '1px solid #5a4020', color: '#e8d5a3', outline: 'none', fontFamily: 'Crimson Text, serif', fontSize: '1rem', width: '100%', padding: '4px 0' };
const lbl: React.CSSProperties = { display: 'block', fontSize: '0.75rem', color: '#a08060', fontFamily: 'Cinzel, serif', letterSpacing: '0.05em', marginBottom: 4 };
const textarea: React.CSSProperties = { ...inp, borderBottom: 'none', border: '1px solid #5a4020', padding: '8px', resize: 'vertical' as const };

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
    <form onSubmit={handleSubmit} className="space-y-5 max-w-xl">
      <div className="p-5 border" style={{ borderColor: '#5a4020', backgroundColor: '#221c14' }}>
        <h2 className="mb-5">Informazioni Campagna</h2>

        <div className="space-y-4">
          <div>
            <label style={lbl}>Nome della campagna *</label>
            <input value={name} onChange={e => setName(e.target.value)} required
              style={inp} placeholder="Es. Aethon, La Maledizione di Strahd…" autoFocus />
          </div>

          <div>
            <label style={lbl}>Ambientazione</label>
            <input value={setting} onChange={e => setSetting(e.target.value)}
              style={inp} placeholder="Es. Dark Fantasy, Forgotten Realms, homebrew…" />
          </div>

          <div>
            <label style={lbl}>Descrizione</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)}
              rows={3} style={textarea} placeholder="Una breve descrizione della campagna, il tono, il premise…" />
          </div>

          <div>
            <label style={lbl}>Immagine di copertina (URL)</label>
            <input value={coverUrl} onChange={e => setCoverUrl(e.target.value)}
              style={inp} placeholder="https://…" />
            {coverUrl && (
              <img src={coverUrl} alt="Anteprima" onError={() => setCoverUrl('')}
                style={{ marginTop: 8, width: '100%', maxHeight: 160, objectFit: 'cover', border: '1px solid #5a4020' }} />
            )}
          </div>

          <div>
            <label style={lbl}>Note DM (private)</label>
            <textarea value={dmNotes} onChange={e => setDmNotes(e.target.value)}
              rows={3} style={{ ...textarea, border: '1px solid #8b2020', backgroundColor: '#1a0a0a' }}
              placeholder="Trame segrete, connessioni tra PNG, segreti che i giocatori non devono vedere…" />
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button type="submit" disabled={saving || !name.trim()}
          style={{ border: '1px solid #c8922a', color: '#c8922a', backgroundColor: 'transparent', fontFamily: 'Cinzel, serif', padding: '10px 24px', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.5 : 1, fontSize: '0.85rem' }}>
          {saving ? 'Creando…' : '✦ Crea Campagna'}
        </button>
        <button type="button" onClick={() => router.back()}
          style={{ border: '1px solid #5a4020', color: '#a08060', backgroundColor: 'transparent', fontFamily: 'Cinzel, serif', padding: '10px 24px', cursor: 'pointer', fontSize: '0.85rem' }}>
          Annulla
        </button>
      </div>
    </form>
  );
}
