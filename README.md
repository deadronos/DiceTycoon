# Dice Tycoon

A React-based incremental idle game where you roll dice, earn credits, and build an empire of upgrading dice.

## 📖 Overview

Dice Tycoon is a game about exponential growth. Players start with a single die and manual rolls, earning credits to unlock more dice, upgrade their multipliers, and automate the process. As you progress, you'll unlock prestige layers, powerful shop upgrades, and the mystical Ascension system.

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm (v7 or higher)

### Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    cd dice-tycoon
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```

### Development

Start the development server with hot-reloading:

```bash
npm run dev
```

Open your browser to `http://localhost:5173` (or the port shown in your terminal).

### Building for Production

Build the project for deployment:

```bash
npm run build
```

The output will be in the `dist/` directory.

To preview the production build locally:

```bash
npm run preview
```

### Testing

Run the test suite using Vitest:

```bash
npm run test
```

To run type checking:

```bash
npm run typecheck
```

## 🏗️ Project Structure

The codebase is organized for scalability and separation of concerns:

-   `src/components/`: React UI components.
    -   `app/`: High-level application layout components.
    -   `ascension/`: Components related to the Ascension system.
    -   `prestige/`: Components for the Prestige shop and mechanics.
    -   Root components handle atomic UI elements like `DieCard`, `RollButton`, etc.
-   `src/utils/`: Core game logic and helper functions.
    -   `game-*.ts`: Main gameplay loops (rolling, prestige, logic).
    -   `decimal.ts`: Wrapper for big number arithmetic (`break_eternity.js`).
    -   `storage.ts`: Save/load system and serialization.
    -   `combos.ts`: Logic for detecting dice patterns.
-   `src/types/`: TypeScript definitions and interfaces.
    -   `game.ts`: The central `GameState` interface.
    -   `combo.ts`: Combo result types.

## 🎮 Key Features

### Core Loop
-   **Roll**: Generate credits based on face value, multipliers, and combos.
-   **Upgrade**: Spend credits to level up dice and unlock new slots.
-   **Automate**: Unlock the Auto-roller to play for you.

### Combo System
Rolling specific patterns (Pairs, Straights, Flushes) grants bonus multipliers.
-   **Pair**: +5%
-   **Royal Flush**: +100%

### Prestige (Layer 1)
Reset your progress to earn **Luck Points**.
-   **Luck Points**: Provide a permanent global multiplier.
-   **Shop**: Buy powerful upgrades like "Fortune Amplifier" or "Autoroll Accelerator".

### Ascension (Layer 2)
Unlock the **Resonant Forge** after reaching Prestige 2.
-   **Stardust**: Generated over time to unlock and upgrade Ascension Dice.
-   **Resonance**: Boosts your core game credits multiplicatively.

## 🛠️ Tech Stack

-   **React 19**: UI Framework.
-   **TypeScript**: Type safety.
-   **Vite**: Build tool.
-   **break_eternity.js**: Library for handling large numbers.
-   **Vitest**: Testing framework.

## 🤝 Contributing

1.  Fork the repository.
2.  Create a feature branch (`git checkout -b feature/amazing-feature`).
3.  Commit your changes.
4.  Push to the branch.
5.  Open a Pull Request.

Please ensure all tests pass and code is formatted before submitting.
