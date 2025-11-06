import React, { useEffect, useMemo, useState, type CSSProperties } from 'react';
import type { ComboIntensity } from '../types/combo';

interface ConfettiPiece {
  id: string;
  left: string;
  backgroundColor: string;
  animationDuration: string;
  animationDelay: string;
  boxShadow?: string;
  size: string;
  rotationStart: string;
}

interface ConfettiBurstProps {
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

export const ConfettiBurst: React.FC<ConfettiBurstProps> = ({ trigger, intensity }) => {
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

    // Avoid calling setState synchronously inside an effect to prevent
    // cascading renders. Schedule the pieces creation on the next frame.
    const raf = window.requestAnimationFrame(() => setPieces(generatePieces()));
    const timeout = window.setTimeout(() => setPieces([]), 1800);
    return () => {
      window.cancelAnimationFrame(raf);
      window.clearTimeout(timeout);
    };
  }, [trigger, generatePieces]);

  if (!pieces.length) {
    return null;
  }

  return (
    <div className="confetti-container" aria-hidden="true">
      {pieces.map(piece => {
        const [width, height] = piece.size.split(' ');
        const pieceStyle: CSSProperties = {
          left: piece.left,
          backgroundColor: piece.backgroundColor,
          animationDuration: piece.animationDuration,
          animationDelay: piece.animationDelay,
          boxShadow: piece.boxShadow,
          width,
          height,
        };
        (pieceStyle as Record<string, string | number | undefined>)['--confetti-rotation-start'] = piece.rotationStart;

        return <span key={piece.id} className="confetti-piece" style={pieceStyle} />;
      })}
    </div>
  );
};
