import React from 'react';

interface StatsPanelPresenterProps {
    unlockedDiceCount: number;
    totalDiceCount: number;
    totalLevels: number;
    creditsPerRoll: string;
    fullCreditsPerRoll: string;
    bestRoll: string;
    fullBestRoll: string;
    averageRecent: string;
    fullAverageRecent: string;
    recentSampleSize: number;
    totalCreditsEarned: string;
    fullTotalCreditsEarned: string;
    totalPrestiges: number;
}

export const StatsPanelPresenter: React.FC<StatsPanelPresenterProps> = ({
    unlockedDiceCount,
    totalDiceCount,
    totalLevels,
    creditsPerRoll,
    fullCreditsPerRoll,
    bestRoll,
    fullBestRoll,
    averageRecent,
    fullAverageRecent,
    recentSampleSize,
    totalCreditsEarned,
    fullTotalCreditsEarned,
    totalPrestiges,
}) => {
    return (
        <div className="stats-section glass-card">
            <h3>📊 Stats</h3>
            <div className="stat-grid">
                <div className="stat-item">
                    <div className="stat-label">Unlocked Dice</div>
                    <div className="stat-value">
                        {unlockedDiceCount} / {totalDiceCount}
                    </div>
                </div>
                <div className="stat-item">
                    <div className="stat-label">Total Levels</div>
                    <div className="stat-value">{totalLevels}</div>
                </div>
                <div className="stat-item">
                    <div className="stat-label">Credits / Roll</div>
                    <div className="stat-value" title={fullCreditsPerRoll}>
                        {creditsPerRoll}
                    </div>
                </div>
                <div className="stat-item">
                    <div className="stat-label">Best Roll Ever</div>
                    <div className="stat-value" title={fullBestRoll}>
                        {bestRoll}
                    </div>
                </div>
                <div className="stat-item">
                    <div className="stat-label">{`Average Roll ${recentSampleSize > 0 ? `(last ${recentSampleSize})` : ''}`}</div>
                    <div className="stat-value" title={fullAverageRecent}>
                        {recentSampleSize > 0 ? averageRecent : '—'}
                    </div>
                </div>
                <div className="stat-item">
                    <div className="stat-label">Total Credits Earned</div>
                    <div className="stat-value" title={fullTotalCreditsEarned}>
                        {totalCreditsEarned}
                    </div>
                </div>
                <div className="stat-item">
                    <div className="stat-label">Prestiges Performed</div>
                    <div className="stat-value">{totalPrestiges}</div>
                </div>
            </div>
        </div>
    );
};
