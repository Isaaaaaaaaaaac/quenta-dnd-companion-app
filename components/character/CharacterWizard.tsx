'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createCharacter } from '@/lib/db/actions';
import { CLASSES } from '@/lib/srd/classes';
import { needsSubclass } from '@/lib/srd/subclasses';
import type { CharacterSheet, CharacterClass } from '@/lib/db/schema';

import StepIdentity from './wizard/StepIdentity';
import StepRace from './wizard/StepRace';
import StepSubclass from './wizard/StepSubclass';
import StepStats from './wizard/StepStats';
import StepHP from './wizard/StepHP';
import StepSkills from './wizard/StepSkills';
import StepSpells from './wizard/StepSpells';
import StepReview from './wizard/StepReview';
import { applyRacialBonuses, type StatKey } from '@/lib/srd/races';

export type WizardStep = 'identity' | 'race' | 'subclass' | 'stats' | 'hp' | 'skills' | 'spells' | 'review';

export interface WizardData {
  name: string;
  type: 'pc' | 'npc_major' | 'npc_minor';
  race: string;
  subrace: string;
  classKey: string;
  subclass: string;
  level: number;
  background: string;
  backgroundKey: string;
  alignment: string;
  personality: string;
  ideals: string;
  bonds: string;
  flaws: string;
  stats: { str: number; dex: number; con: number; int: number; wis: number; cha: number };
  hpMax: number;
  hpRolls: number[];
  skillProficiencies: string[];
  spellsKnown: string[];
  cantripsKnown: string[];
  portraitUrl: string;
  portraitDescription: string;
  backstory: string;
  dmNotes: string;
}

const ALL_STEPS: WizardStep[] = ['identity', 'race', 'subclass', 'stats', 'hp', 'skills', 'spells', 'review'];

const STEP_LABELS: Record<WizardStep, string> = {
  identity: 'Identità',
  race:     'Razza',
  subclass: 'Archetipo',
  stats:    'Caratteristiche',
  hp:       'PF',
  skills:   'Competenze',
  spells:   'Immagine',
  review:   'Riepilogo',
};

const defaultData: WizardData = {
  name: '', type: 'pc', race: '', subrace: '', classKey: 'fighter',
  subclass: '', level: 1, background: '', backgroundKey: '', alignment: '',
  personality: '', ideals: '', bonds: '', flaws: '',
  stats: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
  hpMax: 0, hpRolls: [],
  skillProficiencies: [],
  spellsKnown: [], cantripsKnown: [],
  portraitUrl: '', portraitDescription: '',
  backstory: '', dmNotes: '',
};

export default function CharacterWizard({ campaignId }: { campaignId?: string }) {
  const router = useRouter();
  const [step, setStep] = useState<WizardStep>('identity');
  const [data, setData] = useState<WizardData>(defaultData);
  const [saving, setSaving] = useState(false);

  const selectedClass = CLASSES.find(c => c.key === data.classKey);
  const isSpellcaster = selectedClass?.spellcastingType !== 'none';
  const hasSubclass = needsSubclass(data.classKey, data.level);

  // Calcola i passi effettivi in base alle scelte
  function getActiveSteps(): WizardStep[] {
    return ALL_STEPS.filter(s => {
      if (s === 'subclass' && !hasSubclass) return false;
      return true;
    });
  }

  const activeSteps = getActiveSteps();
  const currentIndex = activeSteps.indexOf(step);

  function update(partial: Partial<WizardData>) {
    setData(prev => ({ ...prev, ...partial }));
  }

  function next() {
    const nextStep = activeSteps[currentIndex + 1];
    if (nextStep) setStep(nextStep);
  }

  function back() {
    const prevStep = activeSteps[currentIndex - 1];
    if (prevStep) setStep(prevStep);
  }

  async function handleSave() {
    setSaving(true);
    const cls = CLASSES.find(c => c.key === data.classKey);
    const classes: CharacterClass[] = [{
      classKey: data.classKey,
      level: data.level,
      subclass: data.subclass || undefined,
    }];

    const skillMap: Record<string, { proficient: boolean; expertise: boolean }> = {};
    data.skillProficiencies.forEach(k => { skillMap[k] = { proficient: true, expertise: false }; });

    // Applica bonus razziali alle stat finali
    const raceData = (data as unknown as Record<string, unknown>);
    const finalStats = applyRacialBonuses(
      data.stats,
      data.race,
      (raceData._subraceKey as string) ?? '',
      (raceData._raceChoiceKeys as StatKey[]) ?? [],
    );

    const sheet: CharacterSheet = {
      race: data.race || undefined,
      subrace: data.subrace || undefined,
      classes,
      background: data.backgroundKey || data.background || undefined,
      alignment: data.alignment || undefined,
      stats: finalStats,
      portraitUrl: data.portraitUrl || undefined,
      savingThrowProficiencies: {
        str: cls?.savingThrows.includes('str') ?? false,
        dex: cls?.savingThrows.includes('dex') ?? false,
        con: cls?.savingThrows.includes('con') ?? false,
        int: cls?.savingThrows.includes('int') ?? false,
        wis: cls?.savingThrows.includes('wis') ?? false,
        cha: cls?.savingThrows.includes('cha') ?? false,
      },
      skills: skillMap,
      hitDice: [{ die: `d${cls?.hitDie ?? 8}`, total: data.level, used: 0 }],
      inventory: [],
      money: { pp: 0, gp: 0, ep: 0, sp: 0, cp: 0 },
      spellsKnown: data.spellsKnown,
      personality: data.personality || undefined,
      ideals: data.ideals || undefined,
      bonds: data.bonds || undefined,
      flaws: data.flaws || undefined,
      backstory: data.backstory || undefined,
      dmNotes: data.dmNotes || undefined,
    };

    await createCharacter({
      name: data.name,
      type: data.type,
      level: data.level,
      xp: 0,
      hpCurrent: data.hpMax,
      hpMax: data.hpMax,
      hpTemp: 0,
      sheet,
      campaignId: campaignId ?? null,
    });

    router.push(campaignId ? `/campaigns/${campaignId}` : '/campaigns');
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress */}
      <div className="flex gap-1 mb-8">
        {activeSteps.map((s, i) => {
          const done = currentIndex > i;
          const active = s === step;
          return (
            <div key={s} className="flex-1 text-center">
              <div className="h-1 mb-1" style={{
                backgroundColor: done ? '#c8922a' : active ? '#8a6010' : '#5a4020',
              }} />
              <span style={{
                fontFamily: 'Cinzel, serif', fontSize: '0.6rem', letterSpacing: '0.04em',
                color: active ? '#c8922a' : done ? '#a08060' : '#5a4020',
              }}>
                {STEP_LABELS[s]}
              </span>
            </div>
          );
        })}
      </div>

      <div style={{ backgroundColor: '#221c14', border: '1px solid #5a4020', padding: '24px' }}>
        {step === 'identity'  && <StepIdentity  data={data} update={update} onNext={next} />}
        {step === 'race'      && <StepRace      data={data} update={update} onNext={next} onBack={back} />}
        {step === 'subclass'  && <StepSubclass  data={data} update={update} onNext={next} onBack={back} />}
        {step === 'stats'     && <StepStats     data={data} update={update} onNext={next} onBack={back} />}
        {step === 'hp'        && <StepHP        data={data} update={update} onNext={next} onBack={back} />}
        {step === 'skills'    && <StepSkills    data={data} update={update} onNext={next} onBack={back} />}
        {step === 'spells'    && <StepSpells    data={data} update={update} onNext={next} onBack={back} />}
        {step === 'review'    && <StepReview    data={data} onBack={back} onSave={handleSave} saving={saving} />}
      </div>
    </div>
  );
}
