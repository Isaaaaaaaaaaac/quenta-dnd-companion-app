import CharacterWizard from '@/components/character/CharacterWizard';
import { requireDm } from '@/lib/auth-helpers';

export default async function NewCharacterPage() {
  await requireDm();
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="mb-6">Nuovo Personaggio</h1>
      <CharacterWizard />
    </div>
  );
}
