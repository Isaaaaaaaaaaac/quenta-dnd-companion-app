'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateCampaign, archiveCampaign } from '@/lib/db/actions';
import type { Campaign } from '@/lib/db/schema';

const inp: React.CSSProperties = { backgroundColor: 'transparent', border: 'none', borderBottom: '1px solid #5a4020', color: '#e8d5a3', outline: 'none', fontFamily: 'Crimson Text, serif', fontSize: '0.95rem', width: '100%', padding: '4px 0' };
const lbl: React.CSSProperties = { display: 'block', fontSize: '0.7rem', color: '#a08060', fontFamily: 'Cinzel, serif', letterSpacing: '0.05em', marginBottom: 4 };
const ta: React.CSSProperties = { ...inp, borderBottom: 'none', border: '1px solid #5a4020', padding: '8px', resize: 'vertical' as const };

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
      <button onClick={() => setOpen(true)}
        style={{ border: '1px solid #5a4020', color: '#a08060', backgroundColor: 'transparent', fontFamily: 'Cinzel, serif', fontSize: '0.75rem', padding: '7px 14px', cursor: 'pointer' }}>
        ⚙ Impostazioni
      </button>

      {open && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.75)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
          onClick={e => e.target === e.currentTarget && setOpen(false)}>
          <div style={{ backgroundColor: '#1a1410', border: '1px solid #c8922a', width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', padding: 32 }}>
            <div className="flex justify-between items-center mb-5">
              <h2 style={{ marginBottom: 0 }}>Impostazioni Campagna</h2>
              <button onClick={() => setOpen(false)} style={{ backgroundColor: 'transparent', border: 'none', color: '#5a4020', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
            </div>

            <div className="space-y-4">
              <div><label style={lbl}>Nome *</label><input value={name} onChange={e => setName(e.target.value)} style={inp} /></div>
              <div><label style={lbl}>Ambientazione</label><input value={setting} onChange={e => setSetting(e.target.value)} style={inp} /></div>
              <div><label style={lbl}>Descrizione</label><textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} style={ta} /></div>
              <div>
                <label style={lbl}>Immagine di copertina (URL)</label>
                <input value={coverUrl} onChange={e => setCoverUrl(e.target.value)} style={inp} placeholder="https://…" />
              </div>
              <div><label style={{ ...lbl, color: '#8b2020' }}>Note DM (private)</label><textarea value={dmNotes} onChange={e => setDmNotes(e.target.value)} rows={3} style={{ ...ta, border: '1px solid #8b2020', backgroundColor: '#1a0a0a' }} /></div>
            </div>

            <div className="flex items-center justify-between mt-6">
              <button onClick={handleArchive}
                style={{ border: '1px solid #5a4020', color: '#5a4020', backgroundColor: 'transparent', fontFamily: 'Cinzel, serif', padding: '6px 14px', cursor: 'pointer', fontSize: '0.75rem' }}>
                Archivia campagna
              </button>
              <div className="flex gap-2">
                <button onClick={() => setOpen(false)}
                  style={{ border: '1px solid #5a4020', color: '#a08060', backgroundColor: 'transparent', fontFamily: 'Cinzel, serif', padding: '8px 18px', cursor: 'pointer', fontSize: '0.8rem' }}>
                  Annulla
                </button>
                <button onClick={handleSave} disabled={saving || !name.trim()}
                  style={{ border: '1px solid #c8922a', color: '#c8922a', backgroundColor: 'transparent', fontFamily: 'Cinzel, serif', padding: '8px 22px', cursor: 'pointer', fontSize: '0.8rem' }}>
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
