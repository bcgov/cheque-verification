import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../helpers/testHelpers';
import ChequeForm from '../../../src/components/ChequeForm';

describe('ChequeForm', () => {
  it('renders the required inputs and submit button', () => {
    renderWithProviders(<ChequeForm onSubmit={vi.fn()} loading={false} />);

    expect(screen.getByLabelText('Cheque Number')).toBeInTheDocument();
    expect(screen.getByLabelText('Payment Issue Date')).toBeInTheDocument();
    expect(screen.getByLabelText('Cheque Amount')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /verify cheque/i })
    ).toBeInTheDocument();
  });

  it('blocks submission and shows validation feedback when fields are empty', async () => {
    const handleSubmit = vi.fn();
    const user = userEvent.setup();

    renderWithProviders(<ChequeForm onSubmit={handleSubmit} loading={false} />);

    await user.click(screen.getByRole('button', { name: /verify cheque/i }));

    const alerts = screen.getAllByRole('alert');
    expect(alerts[0]).toHaveTextContent('Please enter a cheque number');
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it('submits the collected values when the form is valid', async () => {
    const handleSubmit = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();

    renderWithProviders(<ChequeForm onSubmit={handleSubmit} loading={false} />);

    await user.type(screen.getByLabelText('Cheque Number'), '123456');
    await user.type(screen.getByLabelText('Payment Issue Date'), '2024-01-15');
    await user.type(screen.getByLabelText('Cheque Amount'), '1000.50');
    await user.click(screen.getByRole('button', { name: /verify cheque/i }));

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith({
        chequeNumber: '123456',
        paymentIssueDate: '2024-01-15',
        appliedAmount: '1000.5',
      });
    });

    expect(
      screen.queryByText('Please enter a cheque number')
    ).not.toBeInTheDocument();
  });

  it('disables the submit button while loading', () => {
    renderWithProviders(<ChequeForm onSubmit={vi.fn()} loading={true} />);

    const submitButton = screen.getByRole('button', { name: /loading/i });
    expect(submitButton).toBeDisabled();
  });
});
