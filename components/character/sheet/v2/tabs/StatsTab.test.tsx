import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatsTab from './StatsTab';

const stats = { str: 14, dex: 12, con: 15, int: 10, wis: 17, cha: 8 };
const savingThrows = { str: false, dex: false, con: true, int: false, wis: true, cha: false };
const skillMap = { religion: { proficient: true, expertise: true }, medicine: { proficient: true, expertise: false } };

describe('StatsTab', () => {
  it('renders all 6 ability score badges with their modifier', () => {
    render(<StatsTab stats={stats} savingThrows={savingThrows} skillMap={skillMap} level={6} />);
    expect(screen.getAllByText('FOR').length).toBeGreaterThan(0);
    expect(screen.getByTestId('ability-mod-str')).toHaveTextContent('+2');
    expect(screen.getByTestId('ability-mod-wis')).toHaveTextContent('+3');
  });

  it('renders all 6 saving throws with proficiency-adjusted bonus', () => {
    render(<StatsTab stats={stats} savingThrows={savingThrows} skillMap={skillMap} level={6} />);
    expect(screen.getByText('Costituzione')).toBeInTheDocument();
    expect(screen.getByText('Saggezza')).toBeInTheDocument();
  });

  it('renders all 18 skills', () => {
    render(<StatsTab stats={stats} savingThrows={savingThrows} skillMap={skillMap} level={6} />);
    expect(screen.getByText('Religione')).toBeInTheDocument();
    expect(screen.getByText('Medicina')).toBeInTheDocument();
    expect(screen.getByText('Atletica')).toBeInTheDocument();
  });
});
