import React from 'react';

interface SettingsPanelPresenterProps {
    soundEnabled: boolean;
    onToggleSound: () => void;
    onExport: () => void;
    onImport: () => void;
    onReset: () => void;
}

export const SettingsPanelPresenter: React.FC<SettingsPanelPresenterProps> = ({
    soundEnabled,
    onToggleSound,
    onExport,
    onImport,
    onReset,
}) => {
    return (
        <div className="settings-section glass-card">
            <h3>⚙️ Settings</h3>
            <div className="settings-actions">
                <button
                    className="btn btn-secondary btn-small"
                    onClick={onToggleSound}
                    aria-pressed={soundEnabled ? 'true' : 'false'}
                >
                    {soundEnabled ? '🔊 Sound On' : '🔇 Sound Off'}
                </button>
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
