import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../helpers/testHelpers';
import Button from '../../../src/components/Button';

describe('Button', () => {
  it('invokes onPress when clicked', async () => {
    const handlePress = vi.fn();
    const user = userEvent.setup();

    renderWithProviders(<Button onPress={handlePress}>Click me</Button>);

    await user.click(screen.getByRole('button', { name: /click me/i }));
    expect(handlePress).toHaveBeenCalledTimes(1);
  });

  it('disables interaction when disabled or loading', async () => {
    const handlePress = vi.fn();
    const user = userEvent.setup();

    const { rerender } = renderWithProviders(
      <Button onPress={handlePress} disabled>
        Save
      </Button>
    );

    await user.click(screen.getByRole('button', { name: /save/i }));
    expect(handlePress).not.toHaveBeenCalled();

    rerender(
      <Button onPress={handlePress} isLoading>
        Save
      </Button>
    );

    expect(screen.getByRole('button', { name: /loading/i })).toBeDisabled();
  });

  it('defaults to type="button" and can be overridden', () => {
    const { rerender } = renderWithProviders(<Button>Action</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');

    rerender(<Button type='submit'>Submit</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
  });
});
