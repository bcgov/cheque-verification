import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../helpers/testHelpers';
import TextField from '../../../src/components/TextField';
import { useState } from 'react';

describe('TextField', () => {
  const baseProps = {
    label: 'Cheque Number',
    value: '',
    onChange: vi.fn(),
  };

  it('renders the provided label and value', () => {
    renderWithProviders(<TextField {...baseProps} value='123456' />);
    expect(
      screen.getByRole('textbox', { name: /Cheque Number/ })
    ).toHaveValue('123456');
  });

  it('forwards changes to the supplied handler', async () => {
    const user = userEvent.setup();
    const changeSpy = vi.fn();

    const ControlledField = () => {
      const [value, setValue] = useState('');
      return (
        <TextField
          label='Cheque Number'
          value={value}
          onChange={(next) => {
            changeSpy(next);
            setValue(next);
          }}
        />
      );
    };

    renderWithProviders(<ControlledField />);

    const input = screen.getByRole('textbox', { name: /Cheque Number/ });
    await user.type(input, '42');

    expect(changeSpy).toHaveBeenCalled();
    expect(changeSpy).toHaveBeenLastCalledWith('42');
    expect(input).toHaveValue('42');
  });

  it('respects type and required props', () => {
    renderWithProviders(<TextField {...baseProps} type='number' required />);

    const input = screen.getByRole('spinbutton', { name: /Cheque Number/ });
    expect(input).toHaveAttribute('type', 'number');
    expect(input).toBeRequired();
  });

  it('provides error state information for assistive tech', () => {
    renderWithProviders(
      <TextField {...baseProps} errorMessage='This field is required' />
    );

    const input = screen.getByRole('textbox', { name: /Cheque Number/ });
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('alert')).toHaveTextContent('This field is required');
  });
});
