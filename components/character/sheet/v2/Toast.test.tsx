import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { ToastProvider } from './Toast';
import { useToast } from './useToast';

function Consumer() {
  const { show } = useToast();
  return <button onClick={() => show('Ciao')}>trigger</button>;
}

describe('ToastProvider', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders no toast initially', () => {
    render(<ToastProvider><Consumer /></ToastProvider>);
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('shows a message when show() is called', () => {
    render(<ToastProvider><Consumer /></ToastProvider>);
    act(() => { screen.getByText('trigger').click(); });
    expect(screen.getByRole('status')).toHaveTextContent('Ciao');
  });

  it('auto-dismisses after 1.8s', () => {
    vi.useFakeTimers();
    render(<ToastProvider><Consumer /></ToastProvider>);
    act(() => { screen.getByText('trigger').click(); });
    expect(screen.getByRole('status')).toBeInTheDocument();
    act(() => { vi.advanceTimersByTime(1800); });
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('replaces the current message instead of stacking', () => {
    vi.useFakeTimers();
    function DoubleConsumer() {
      const { show } = useToast();
      return (
        <>
          <button onClick={() => show('Primo')}>first</button>
          <button onClick={() => show('Secondo')}>second</button>
        </>
      );
    }
    render(<ToastProvider><DoubleConsumer /></ToastProvider>);
    act(() => { screen.getByText('first').click(); });
    act(() => { vi.advanceTimersByTime(500); });
    act(() => { screen.getByText('second').click(); });
    expect(screen.getAllByRole('status')).toHaveLength(1);
    expect(screen.getByRole('status')).toHaveTextContent('Secondo');
  });

  it('throws if useToast is used outside a ToastProvider', () => {
    function Orphan() { useToast(); return null; }
    expect(() => render(<Orphan />)).toThrow('useToast must be used within a ToastProvider');
  });
});
