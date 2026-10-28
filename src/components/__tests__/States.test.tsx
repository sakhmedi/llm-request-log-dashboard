import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EmptyState } from '../EmptyState';
import { ErrorState } from '../ErrorState';

describe('EmptyState', () => {
  it('показывает сообщение и сбрасывает фильтры по кнопке', async () => {
    const onReset = vi.fn();
    render(<EmptyState onReset={onReset} />);

    expect(screen.getByText('Нет запросов по выбранным фильтрам')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Сбросить фильтры' }));
    expect(onReset).toHaveBeenCalledOnce();
  });
});

describe('ErrorState', () => {
  it('показывает текст ошибки и вызывает повтор', async () => {
    const onRetry = vi.fn();
    render(<ErrorState message="HTTP 500" onRetry={onRetry} />);

    expect(screen.getByRole('alert')).toHaveTextContent('HTTP 500');
    await userEvent.click(screen.getByRole('button', { name: 'Повторить' }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('блокирует кнопку во время повторной загрузки', () => {
    render(<ErrorState message="x" onRetry={() => {}} isRetrying />);
    expect(screen.getByRole('button', { name: 'Загрузка…' })).toBeDisabled();
  });
});
