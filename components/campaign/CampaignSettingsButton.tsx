'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateCampaign, archiveCampaign } from '@/lib/db/actions';
import type { Campaign } from '@/lib/db/schema';

export default function CampaignSettingsButton({ campaign }: { campaign: Campaign }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const [name, setName] = useState(campaign.name);
  const [setting, setSetting] = useState(campaign.setting ?? '');
  const [description, setDescription] = useState(campaign.description ?? '');
  const [dmNotes, setDmNotes] = useState(campaign.dmNotes ?? '');
  const [coverUrl, setCoverUrl] = useState(campaign.coverUrl ?? '');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await updateCampaign(campaign.id, { name, setting: setting || null, description: description || null, dmNotes: dmNotes || null, coverUrl: coverUrl || null });
    setSaving(false);
    setOpen(false);
    router.refresh();
  }

  async function handleArchive() {
    if (!confirm(`Archiviare "${campaign.name}"? Puoi riattivarla in seguito.`)) return;
    await archiveCampaign(campaign.id);
    router.push('/campaigns');
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn btn-ghost" style={{ padding: '7px 14px' }}>
        ⚙ Impostazioni
      </button>

      {open && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
          onClick={e => e.target === e.currentTarget && setOpen(false)}>
          <div className="card" style={{ width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', padding: 32, borderColor: 'var(--gold)' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
              <div>
                <div className="eyebrow" style={{ marginBottom: 6 }}>Campagna</div>
                <h2>Impostazioni</h2>
              </div>
              <button onClick={() => setOpen(false)} style={{ backgroundColor: 'transparent', border: 'none', color: 'var(--fg-3)', cursor: 'pointer', fontSize: '1.2rem', lineHeight: 1 }}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <label className="field-label">Nome *</label>
                <input className="field-input" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div>
                <label className="field-label">Ambientazione</label>
                <input className="field-input" value={setting} onChange={e => setSetting(e.target.value)} />
              </div>
              <div>
                <label className="field-label">Descrizione</label>
                <textarea className="field-input" value={description} onChange={e => setDescription(e.target.value)} rows={3} style={{ resize: 'vertical' }} />
              </div>
              <div>
                <label className="field-label">Immagine di copertina (URL)</label>
                <input className="field-input" value={coverUrl} onChange={e => setCoverUrl(e.target.value)} placeholder="https://…" />
              </div>
              <div style={{ borderTop: '1px solid rgba(139,26,26,0.3)', paddingTop: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <div style={{ width: 2, height: 14, backgroundColor: 'var(--danger)', opacity: 0.7 }} />
                  <label className="field-label" style={{ color: 'var(--fg-1)', marginBottom: 0 }}>Note DM — private</label>
                </div>
                <textarea className="field-input" value={dmNotes} onChange={e => setDmNotes(e.target.value)} rows={3} style={{ resize: 'vertical', borderColor: 'rgba(139,26,26,0.4)' }} />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 28 }}>
              <button onClick={handleArchive} className="btn btn-ghost" style={{ padding: '6px 14px', color: 'var(--fg-3)' }}>
                Archivia campagna
              </button>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setOpen(false)} className="btn btn-ghost" style={{ padding: '8px 18px' }}>Annulla</button>
                <button onClick={handleSave} disabled={saving || !name.trim()} className="btn btn-secondary" style={{ padding: '8px 22px' }}>
                  {saving ? 'Salvando…' : 'Salva'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
