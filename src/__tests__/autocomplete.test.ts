import './matchmedia.mock';

import { screen, waitFor } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';

import { startAutocomplete } from '../autocomplete';
import { SEARCH_INPUT_SELECTOR } from '../constants';
import * as utils from '../utils';
import { getContainerAndButton } from '../utils';

const setup = (): void => {
  document.body.innerHTML = `
            <form>
                <div>
                    <input id="query" />
                </div>
            </form>
        `;
  const [searchContainer] = getContainerAndButton(SEARCH_INPUT_SELECTOR);
  startAutocomplete(searchContainer);
};

describe('autocomplete works as expected', () => {
  afterEach(() => {
    document.getElementsByTagName('html')[0].innerHTML = '';
  });

  it('does not throw an error with correct dom node', () => {
    document.body.innerHTML = `
            <form>
                <div>
                    <input id="query" />
                </div>
            </form>
        `;
    expect(() => {
      const [searchContainer] = getContainerAndButton(SEARCH_INPUT_SELECTOR);
      startAutocomplete(searchContainer);
    }).not.toThrow();
  });

  it('renders correctly', async () => {
    setup();

    await waitFor(() => {
      expect(document.querySelector('[role="combobox"]')).toBeInTheDocument();
      expect(screen.queryByRole('combobox')).toContainElement(
        screen.getByText('Search', {
          exact: false,
        })
      );
    });
  });

  it('displays the correct number of hit with a good enough query', async () => {
    const spy = jest.spyOn(utils, 'parse');
    spy.mockReturnValue({ innerText: 'Test Text' } as HTMLElement);
    setup();
    const button = document.querySelector<HTMLButtonElement>(
      '.aa-DetachedSearchButton'
    );

    button.click();

    // console.log("button", button);

    await waitFor(async () => {
      const input = document.querySelector<HTMLInputElement>('.aa-Input');
      // console.log("INPUT", input);
      expect(input).toBeInTheDocument();
      expect(
        document.querySelector<HTMLElement>('.aa-Panel')
      ).toBeInTheDocument();
      await userEvent.type(input, 'How do i transfer ownership?');
      // // expect(await screen.findByText('Best answer')).toBeInTheDocument();
      // await waitFor(
      //   () => {
      //     expect([
      //       ...document.querySelectorAll('[data-testid="best-hit"]'),
      //     ]).toHaveLength(1);
      //   },
      //   {
      //     timeout: 5000,
      //   }
      // );
    });
  });

  it('throws an error with multiple correct dom node', () => {
    document.body.innerHTML = `
            <form>
                <div>
                    <input id="query" />
                    <input id="query" />
                </div>
            </form>
        `;
    expect(() => {
      const [searchContainer] = getContainerAndButton(SEARCH_INPUT_SELECTOR);
      startAutocomplete(searchContainer);
    }).toThrow(
      new Error(
        `Too many inputs (2) matching inputSelector '${SEARCH_INPUT_SELECTOR}'.`
      )
    );
  });

  it('throws an error with no correct dom node', () => {
    document.body.innerHTML = `
            <form>
                <div>
                    <input id="not_correct_id" />
                </div>
            </form>
        `;
    expect(() => {
      const [searchContainer] = getContainerAndButton(SEARCH_INPUT_SELECTOR);
      startAutocomplete(searchContainer);
    }).toThrow(
      new Error(
        `Couldn't find input matching inputSelector '${SEARCH_INPUT_SELECTOR}'.`
      )
    );
  });
});
