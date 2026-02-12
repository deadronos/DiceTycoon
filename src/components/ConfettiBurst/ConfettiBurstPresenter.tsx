import React, { type CSSProperties } from 'react';

export interface ConfettiPiece {
    id: string;
    left: string;
    backgroundColor: string;
    animationDuration: string;
    animationDelay: string;
    boxShadow?: string;
    size: string;
    rotationStart: string;
}

interface ConfettiBurstPresenterProps {
    pieces: ConfettiPiece[];
}

export const ConfettiBurstPresenter: React.FC<ConfettiBurstPresenterProps> = ({ pieces }) => {
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
