import os

def replace_in_file(filepath, search, replace):
    with open(filepath, 'r') as f:
        content = f.read()
    new_content = content.replace(search, replace)
    with open(filepath, 'w') as f:
        f.write(new_content)

# Update AppContainer.tsx
replace_in_file('src/AppContainer.tsx',
    'import {\n    unlockDie,',
    'import {\n    unlockDie,\n    buyMaxAllDice,')

replace_in_file('src/AppContainer.tsx',
    '    const handleLevelUpDie = useCallback((dieId: number, amount: number = 1) => {\n        const newState = levelUpDie(gameState, dieId, amount);\n        if (newState) setGameState(newState);\n    }, [gameState, setGameState]);',
    '    const handleLevelUpDie = useCallback((dieId: number, amount: number = 1) => {\n        const newState = levelUpDie(gameState, dieId, amount);\n        if (newState) setGameState(newState);\n    }, [gameState, setGameState]);\n\n    const handleBuyMaxAllDice = useCallback(() => {\n        setGameState(prev => buyMaxAllDice(prev));\n    }, [setGameState]);')

replace_in_file('src/AppContainer.tsx',
    '            handleLevelUpDie={handleLevelUpDie}',
    '            handleLevelUpDie={handleLevelUpDie}\n            handleBuyMaxAllDice={handleBuyMaxAllDice}')

# Update AppPresenter.tsx
replace_in_file('src/AppPresenter.tsx',
    '    handleLevelUpDie: (dieId: number, amount?: number) => void;',
    '    handleLevelUpDie: (dieId: number, amount?: number) => void;\n    handleBuyMaxAllDice: () => void;')

replace_in_file('src/AppPresenter.tsx',
    '    handleLevelUpDie,',
    '    handleLevelUpDie,\n    handleBuyMaxAllDice,')

replace_in_file('src/AppPresenter.tsx',
    '                    onLevelUpDie={handleLevelUpDie}',
    '                    onLevelUpDie={handleLevelUpDie}\n                    onBuyMaxAllDice={handleBuyMaxAllDice}')

# Update CoreGameViewContainer.tsx
replace_in_file('src/components/CoreGameView/CoreGameViewContainer.tsx',
    '    onLevelUpDie: (dieId: number, amount?: number) => void;',
    '    onLevelUpDie: (dieId: number, amount?: number) => void;\n    onBuyMaxAllDice: () => void;')

replace_in_file('src/components/CoreGameView/CoreGameViewContainer.tsx',
    '    onUnlockAnimation: (dieId: number) => void;',
    '    onUnlockAnimation: (dieId: number) => void;\n    onBuyMaxAllDice: () => void;')

# Update CoreGameViewPresenter.tsx
replace_in_file('src/components/CoreGameView/CoreGameViewPresenter.tsx',
    '    onLevelUpDie: (dieId: number, amount?: number) => void;',
    '    onLevelUpDie: (dieId: number, amount?: number) => void;\n    onBuyMaxAllDice: () => void;')

replace_in_file('src/components/CoreGameView/CoreGameViewPresenter.tsx',
    '    onUnlockAnimation,',
    '    onUnlockAnimation,\n    onBuyMaxAllDice,')

replace_in_file('src/components/CoreGameView/CoreGameViewPresenter.tsx',
    '                    onUnlockAnimation={onUnlockAnimation}',
    '                    onUnlockAnimation={onUnlockAnimation}\n                    onBuyMaxAllDice={onBuyMaxAllDice}')
