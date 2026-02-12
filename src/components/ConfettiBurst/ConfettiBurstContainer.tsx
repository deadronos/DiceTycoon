import React, { useState, useEffect, useMemo } from 'react';
import type { ComboIntensity } from '../../types/combo';
import { ConfettiBurstPresenter, type ConfettiPiece } from './ConfettiBurstPresenter';

interface ConfettiBurstContainerProps {
    trigger: number | null;
    intensity: ComboIntensity;
}

const INTENSITY_CONFIG: Record<ComboIntensity, { pieces: number; colors: string[]; glow?: boolean }> = {
    low: {
        pieces: 50,
        colors: ['#a29bfe', '#81ecec', '#ffeaa7'],
    },
    medium: {
        pieces: 90,
        colors: ['#55efc4', '#74b9ff', '#fab1a0', '#ffeaa7'],
    },
    high: {
        pieces: 140,
        colors: ['#00cec9', '#0984e3', '#fd79a8', '#ffeaa7', '#6c5ce7'],
        glow: true,
    },
    legendary: {
        pieces: 220,
        colors: ['#f4ff81', '#ff7675', '#00cec9', '#a29bfe', '#ffeaa7', '#d63031'],
        glow: true,
    },
};

export const ConfettiBurstContainer: React.FC<ConfettiBurstContainerProps> = ({ trigger, intensity }) => {
    const [pieces, setPieces] = useState<ConfettiPiece[]>([]);
    const config = INTENSITY_CONFIG[intensity];
    const pieceCount = config.pieces;

    const generatePieces = useMemo(() => {
        return () =>
            Array.from({ length: pieceCount }, (_, index) => {
                const backgroundColor = config.colors[Math.floor(Math.random() * config.colors.length)];
                const width = 8 + Math.random() * 8;
                const height = 12 + Math.random() * 14;
                return {
                    id: `${trigger}-${index}`,
                    left: `${Math.random() * 100}%`,
                    backgroundColor,
                    animationDuration: `${1.3 + Math.random() * 0.7}s`,
                    animationDelay: `${Math.random() * 0.3}s`,
                    boxShadow: config.glow ? `0 0 12px ${backgroundColor}` : undefined,
                    size: `${width}px ${height}px`,
                    rotationStart: `${Math.random() * 360}deg`,
                };
            });
    }, [pieceCount, trigger, config]);

    useEffect(() => {
        if (!trigger) {
            return;
        }

        const raf = window.requestAnimationFrame(() => setPieces(generatePieces()));
        const timeout = window.setTimeout(() => setPieces([]), 1800);
        return () => {
            window.cancelAnimationFrame(raf);
            window.clearTimeout(timeout);
        };
    }, [trigger, generatePieces]);

    return <ConfettiBurstPresenter pieces={pieces} />;
};
