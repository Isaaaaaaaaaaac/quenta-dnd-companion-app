import { card, sectionLabel } from './styles';
import AssignPlayerButton from '@/components/character/sheet/AssignPlayerButton';

export interface SidebarDmActionsProps {
  characterId: string;
  currentUserId: string | null;
  dmNotes?: string;
}

export default function SidebarDmActions({ characterId, currentUserId, dmNotes }: SidebarDmActionsProps) {
  return (
    <div style={card}>
      <div style={{ ...sectionLabel, display: 'flex', alignItems: 'center', gap: 'var(--s-1)', marginBottom: 'var(--s-1)' }}>
        Azioni DM
        <span style={{ flex: 1, height: '.5px', background: 'var(--border-leather-dim)' }} />
      </div>
      <AssignPlayerButton characterId={characterId} currentUserId={currentUserId} />
      {dmNotes && (
        <>
          <div style={{ height: 1, background: 'var(--border-leather-dim)', margin: 'var(--s-1) 0' }} />
          <div style={{ ...sectionLabel, marginBottom: 'var(--s-1)' }}>Note DM</div>
          <p style={{
            fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '11px',
            color: 'var(--fg-2)', whiteSpace: 'pre-wrap', margin: 0,
          }}>
            {dmNotes}
          </p>
        </>
      )}
    </div>
  );
}
