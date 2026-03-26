import React from 'react';
import { SettingsPanelPresenter } from './SettingsPanelPresenter';

interface SettingsPanelContainerProps {
    soundEnabled: boolean;
    onToggleSound: () => void;
    onExport: () => void;
    onImport: () => void;
    onReset: () => void;
}

export const SettingsPanelContainer: React.FC<SettingsPanelContainerProps> = (props) => {
    return <SettingsPanelPresenter {...props} />;
};
