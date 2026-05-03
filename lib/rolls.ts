// Logica di tiro dadi — eseguita client-side

export interface DiceRoll {
  dice: number[];    // 4 valori tirati
  dropped: number;   // indice del dado scartato
  total: number;     // somma dei 3 rimasti
}

export function roll4d6DropLowest(): DiceRoll {
  const dice = Array.from({ length: 4 }, () => Math.floor(Math.random() * 6) + 1);
  const minIndex = dice.indexOf(Math.min(...dice));
  const total = dice.reduce((s, d, i) => i === minIndex ? s : s + d, 0);
  return { dice, dropped: minIndex, total };
}

export function rollStatSet(): DiceRoll[] {
  return Array.from({ length: 6 }, () => roll4d6DropLowest());
}

export function rollHitDie(die: number): number {
  return Math.floor(Math.random() * die) + 1;
}

export function averageHitDie(die: number): number {
  return Math.floor(die / 2) + 1;
}
