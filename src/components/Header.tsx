import React from 'react';

export default function Header({ credits, className }: { credits: string; className?: string }) {
  return (
    <div className={className ?? ''}>
      <div className="dt-credits">Credits: <span data-testid="credits">{credits}</span></div>
    </div>
  );
}
