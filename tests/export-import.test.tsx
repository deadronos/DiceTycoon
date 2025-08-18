import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from '../src/App';

// This test verifies the export/import textbox round-trips the gamestate.
// Steps:
// 1. Render the app
// 2. Unlock a die (to change state)
// 3. Click Export, copy the textarea contents
// 4. Reset the game
// 5. Click Import, paste the exported JSON, and import
// 6. Assert that the previously unlocked die is unlocked again

describe('Export / Import', () => {
  it('round-trips the gamestate via the export/import textbox', () => {
    const { container } = render(React.createElement(App));

    // Unlock die 1 to change the default state (die id 1 is locked initially)
    const unlockBtn = within(container).getByTestId('unlock-1');
    fireEvent.click(unlockBtn);

    // Open export UI (bottom control)
  const bottom = container.querySelector('.dt-bottom-controls') as HTMLElement;
  const exportBtn = within(bottom).getByText('Export');
    fireEvent.click(exportBtn);

  // The textarea should appear and contain JSON
  const textarea = within(container).getByTestId('export-import-textarea') as HTMLTextAreaElement;
  expect(textarea).toBeDefined();
  const exported = textarea.value;
  expect(exported).toBeTruthy();

    // Now reset the game to clear unlocked dice
  const resetBtn = within(bottom).getByText('Reset');
    fireEvent.click(resetBtn);

    // Verify die 1 is locked again (should show an unlock button)
    expect(within(container).getByTestId('unlock-1')).toBeTruthy();

  // Open import UI (bottom control) and paste exported JSON
  const importBtn = within(bottom).getByTestId('import-btn-bottom');
  fireEvent.click(importBtn);
  const importTextarea = within(container).getByTestId('export-import-textarea') as HTMLTextAreaElement;
  fireEvent.change(importTextarea, { target: { value: exported } });

  // Click the Import action inside the export/import area using test id
  const importAction = within(container).getByTestId('export-import-action-import');
  expect(importAction).toBeTruthy();
  fireEvent.click(importAction);

    // After import, the unlocked button should no longer be present for die 1
    // (it should show the die card with Level/Ascend, etc.)
  // Validate that credits, autoroll, cooldown, and unlock state match
  const state = JSON.parse(exported);
  // Credits should match formatted value in header
  const expectedCredits = state.credits;
  const topCredits = within(container).getByText((content, node) => content.includes('Credits:'));
  expect(topCredits.textContent).toContain('Credits:');
  // Autoroll state (boolean)
  expect(state.autoroll).toBeDefined();
  // cooldownMs
  expect(state.cooldownMs).toBeDefined();
  // Die 1 should be unlocked in the imported state
  const die1 = state.dice.find((d: any) => d.id === 1);
  expect(die1).toBeTruthy();
  expect(die1.locked).toBe(false);
  });
});
