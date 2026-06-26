import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TabNav from './TabNav';

describe('TabNav', () => {
  it('renders all 5 tab labels', () => {
    render(<TabNav characterId="char-1" activeTab="stats" onChange={() => {}} />);
    expect(screen.getByText('Caratteristiche')).toBeInTheDocument();
    expect(screen.getByText('Combattimento')).toBeInTheDocument();
    expect(screen.getByText('Incantesimi')).toBeInTheDocument();
    expect(screen.getByText('Inventario')).toBeInTheDocument();
    expect(screen.getByText('Narrativa')).toBeInTheDocument();
  });

  it('calls onChange with the clicked tab id', () => {
    const onChange = vi.fn();
    render(<TabNav characterId="char-1" activeTab="stats" onChange={onChange} />);
    fireEvent.click(screen.getByText('Combattimento'));
    expect(onChange).toHaveBeenCalledWith('combat');
  });
});
