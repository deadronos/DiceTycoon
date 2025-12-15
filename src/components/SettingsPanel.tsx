import React from 'react';

/**
 * Props for the SettingsPanel component.
 */
interface Props {
  /** Callback to export the save game string. */
  onExport: () => void;
  /** Callback to import a save game string. */
  onImport: () => void;
  /** Callback to hard reset the game. */
  onReset: () => void;
}

/**
 * Panel containing game settings and data management actions.
 */
export const SettingsPanel: React.FC<Props> = ({ onExport, onImport, onReset }) => {
  return (
    <div className="settings-section glass-card">
      <h3>⚙️ Settings</h3>
      <div className="settings-actions">
        <button className="btn btn-secondary btn-small" onClick={onExport}>
          🔗 Export Save
        </button>
        <button className="btn btn-secondary btn-small" onClick={onImport}>
          📂 Import Save
        </button>
        <button className="btn btn-danger btn-small" onClick={onReset}>
          🔄 Reset Game
        </button>
      </div>
    </div>
  );
};

export default SettingsPanel;
