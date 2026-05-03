import CharacterWizard from '@/components/character/CharacterWizard';

export default function NewCharacterPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="mb-6">Nuovo Personaggio</h1>
      <CharacterWizard />
    </div>
  );
}
