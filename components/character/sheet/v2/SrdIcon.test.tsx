import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import SrdIcon from './SrdIcon';

describe('SrdIcon', () => {
  it('renders an svg for a registered icon', () => {
    const { container } = render(<SrdIcon icon="daggers" />);
    expect(container.querySelector('svg')).not.toBeNull();
  });

  it('applies the requested size', () => {
    const { container } = render(<SrdIcon icon="shield" size={24} />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '24');
    expect(svg).toHaveAttribute('height', '24');
  });
});
