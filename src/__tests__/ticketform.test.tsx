import { render, screen, waitFor } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import { h } from 'preact';

import { REQUEST_INPUT_SELECTOR } from '../constants';
import { startTicketForm, TicketFormApp } from '../ticketForm';
import { getElement } from '../utils';

describe('ticket form works as expected', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('renders correctly', async () => {
    render(<TicketFormApp />);

    await waitFor(() => {
      expect(screen.getByTestId('input-element')).toBeInTheDocument();
    });
  });

  it('does not throw an error with correct dom', () => {
    document.body.innerHTML = `
            <input type="text" id="request_subject" />
        `;
    expect(() => {
      try {
        const input = getElement<HTMLInputElement>(REQUEST_INPUT_SELECTOR);
        startTicketForm(input);
      } catch (error) {
        console.error(error); // eslint-disable-line no-console
      }
    }).not.toThrow();
  });

  it('does not throw an error with incorrect dom', () => {
    document.body.innerHTML = `
            <input type="text" id="not_request_subject" />
        `;
    expect(() => {
      try {
        const input = getElement<HTMLInputElement>(REQUEST_INPUT_SELECTOR);
        startTicketForm(input);
      } catch (error) {
        console.error(error); // eslint-disable-line no-console
      }
    }).not.toThrow();
  });

  it('displays the results correctly', async () => {
    render(<TicketFormApp />);

    await userEvent.type(
      screen.getByTestId('input-element'),
      'How do you transfer ownership'
    );

    await waitFor(
      () => {
        expect(screen.getByTestId('results-container')).toBeInTheDocument();
        expect(screen.getByText('Community')).toBeInTheDocument();
        expect(screen.getByText('Documentation')).toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });

  it('does not display anything if no results', async () => {
    render(<TicketFormApp />);

    await userEvent.type(
      screen.getByTestId('input-element'),
      'ioqlsuekhjf zriqlugk jehrqsidug'
    );

    await waitFor(
      () => {
        expect(
          screen.queryByTestId('results-container')
        ).not.toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });
});
