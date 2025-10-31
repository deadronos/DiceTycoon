import React, { useEffect, useMemo, useState } from 'react';
import type { ComboIntensity } from '../types/combo';

interface ConfettiPiece {
  id: string;
  left: string;
  backgroundColor: string;
  animationDuration: string;
  animationDelay: string;
}

interface ConfettiBurstProps {
  trigger: number | null;
  intensity: ComboIntensity;
}

const COLORS = ['#6c5ce7', '#00b894', '#fdcb6e', '#d63031', '#74b9ff'];

const INTENSITY_TO_PIECES: Record<ComboIntensity, number> = {
  low: 60,
  medium: 100,
  high: 160,
};

export const ConfettiBurst: React.FC<ConfettiBurstProps> = ({ trigger, intensity }) => {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);
  const pieceCount = INTENSITY_TO_PIECES[intensity];

  const generatePieces = useMemo(() => {
    return () =>
      Array.from({ length: pieceCount }, (_, index) => ({
        id: `${trigger}-${index}`,
        left: `${Math.random() * 100}%`,
        backgroundColor: COLORS[Math.floor(Math.random() * COLORS.length)],
        animationDuration: `${1.3 + Math.random() * 0.7}s`,
        animationDelay: `${Math.random() * 0.25}s`,
      }));
  }, [pieceCount, trigger]);

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
      {pieces.map(piece => (
        <span
          key={piece.id}
          className="confetti-piece"
          style={{
            left: piece.left,
            backgroundColor: piece.backgroundColor,
            animationDuration: piece.animationDuration,
            animationDelay: piece.animationDelay,
          }}
        />
      ))}
    </div>
  );
};
