// Barrel file aggregating split game logic modules.
// This replaces the previous monolithic implementation with focused modules.
// Keeping export surface identical for compatibility with existing imports/tests.

export * from './game-roll';
export * from './game-autoroll';
export * from './game-prestige';
export * from './dice-upgrades';
export * from './offline-progress';
export * from './reroll';
export * from './roll-helpers';
export * from './ascension';

// (Intentionally no additional logic here.)
