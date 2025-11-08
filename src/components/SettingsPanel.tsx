import React from 'react';

interface Props {
  onExport: () => void;
  onImport: () => void;
  onReset: () => void;
}

export const SettingsPanel: React.FC<Props> = ({ onExport, onImport, onReset }) => {
  return (
    <div className="settings-section glass-card">
      <h3>⚙️ Settings</h3>
      <div className="settings-actions">
        <button className="btn btn-secondary btn-small" onClick={onExport}>
          ðŸ”— Export Save
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
