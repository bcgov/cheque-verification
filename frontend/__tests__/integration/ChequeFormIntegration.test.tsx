import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../helpers/testHelpers';
import ChequeForm from '../../src/components/ChequeForm';

describe('ChequeForm integration behaviour', () => {
  it('submits a valid payload exactly once', async () => {
    const handleSubmit = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();

    renderWithProviders(<ChequeForm onSubmit={handleSubmit} loading={false} />);

    await user.type(screen.getByLabelText('Cheque Number'), '123456');
    await user.type(screen.getByLabelText('Payment Issue Date'), '2024-01-15');
    await user.type(screen.getByLabelText('Cheque Amount'), '2500.75');
    await user.click(screen.getByRole('button', { name: /verify cheque/i }));

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledTimes(1);
      expect(handleSubmit).toHaveBeenCalledWith({
        chequeNumber: '123456',
        paymentIssueDate: '2024-01-15',
        appliedAmount: '2500.75',
      });
    });
  });

  it('prevents submission until required fields are provided', async () => {
    const handleSubmit = vi.fn();
    const user = userEvent.setup();

    renderWithProviders(<ChequeForm onSubmit={handleSubmit} loading={false} />);

    await user.click(screen.getByRole('button', { name: /verify cheque/i }));

    const alerts = screen.getAllByRole('alert');
    expect(alerts[0]).toHaveTextContent('Please enter a cheque number');
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it('reflects the loading state from the parent', () => {
    renderWithProviders(<ChequeForm onSubmit={vi.fn()} loading={true} />);

    const submitButton = screen.getByRole('button', { name: /loading/i });
    expect(submitButton).toBeDisabled();
  });
});
