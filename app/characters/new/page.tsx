import CharacterWizard from '@/components/character/CharacterWizard';
import { requireDm } from '@/lib/auth-helpers';

export default async function NewCharacterPage() {
  await requireDm();
  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '40px 24px' }}>
      <div className="eyebrow" style={{ marginBottom: 10 }}>Dungeon Master</div>
      <h1 style={{ marginBottom: 40 }}>Nuovo Personaggio</h1>
      <CharacterWizard />
    </div>
  );
}
