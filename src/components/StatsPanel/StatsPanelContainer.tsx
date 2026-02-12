import React, { useMemo } from 'react';
import Decimal from '../../utils/decimal';
import type { GameState } from '../../types/game';
import { formatFull, formatShort } from '../../utils/decimal';
import { StatsPanelPresenter } from './StatsPanelPresenter';

interface StatsPanelContainerProps {
    gameState: GameState;
}

export const StatsPanelContainer: React.FC<StatsPanelContainerProps> = ({ gameState }) => {
    const unlockedDiceCount = useMemo(() => gameState.dice.filter(d => d.unlocked).length, [gameState.dice]);
    const totalLevels = useMemo(() => gameState.dice.reduce((sum, d) => sum + d.level, 0), [gameState.dice]);
    const totalCreditsEarned = gameState.stats.totalCreditsEarned;

    const creditsPerRoll = useMemo(() => {
        return gameState.totalRolls > 0
            ? totalCreditsEarned.div(gameState.totalRolls)
            : new Decimal(0);
    }, [gameState.totalRolls, totalCreditsEarned]);

    const recentSampleSize = gameState.stats.recentRolls.length;
    const averageRecent = useMemo(() => {
        return recentSampleSize > 0
            ? gameState.stats.recentRolls.reduce((sum, value) => sum.plus(new Decimal(value)), new Decimal(0)).div(recentSampleSize)
            : new Decimal(0);
    }, [gameState.stats.recentRolls, recentSampleSize]);

    const bestRoll = gameState.stats.bestRoll;

    return (
        <StatsPanelPresenter
            unlockedDiceCount={unlockedDiceCount}
            totalDiceCount={gameState.dice.length}
            totalLevels={totalLevels}
            creditsPerRoll={formatShort(creditsPerRoll)}
            fullCreditsPerRoll={formatFull(creditsPerRoll)}
            bestRoll={formatShort(bestRoll)}
            fullBestRoll={formatFull(bestRoll)}
            averageRecent={formatShort(averageRecent)}
            fullAverageRecent={formatFull(averageRecent)}
            recentSampleSize={recentSampleSize}
            totalCreditsEarned={formatShort(totalCreditsEarned)}
            fullTotalCreditsEarned={formatFull(totalCreditsEarned)}
            totalPrestiges={gameState.prestige?.totalPrestiges ?? 0}
        />
    );
};
