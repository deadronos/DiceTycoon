import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { App } from '../src/App';

// This test verifies the export/import functionality
describe('Export / Import', () => {
  it('exports and imports game state', () => {
    // Mock clipboard and prompt
    const clipboardData: string[] = [];
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn((text: string) => {
          clipboardData.push(text);
          return Promise.resolve();
        }),
      },
    });

    const promptSpy = vi.spyOn(window, 'prompt');
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    render(<App />);

    // Click Export Save button
    const exportBtn = screen.getByRole('button', { name: /export save/i });
    fireEvent.click(exportBtn);

    // Verify data was copied to clipboard
    expect(navigator.clipboard.writeText).toHaveBeenCalled();
    expect(clipboardData.length).toBeGreaterThan(0);
    expect(alertSpy).toHaveBeenCalledWith('Game state copied to clipboard!');

    // Simulate import with the exported data
    promptSpy.mockReturnValue(clipboardData[0]);
    const importBtn = screen.getByRole('button', { name: /import save/i });
    fireEvent.click(importBtn);

    // Verify successful import
    expect(promptSpy).toHaveBeenCalledWith('Paste your save data:');
    expect(alertSpy).toHaveBeenCalledWith('Game loaded successfully!');

    // Cleanup
    promptSpy.mockRestore();
    alertSpy.mockRestore();
  });
});
