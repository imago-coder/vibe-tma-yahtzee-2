import React from 'react';
import { useGameStore } from '../store/gameStore';
import Dice from './Dice';
import clsx from 'clsx';

const DiceContainer: React.FC = () => {
  const { dice, rollsLeft, rollDice, holdDice, gameStarted, gameEnded } = useGameStore();

  const handleRoll = () => {
    if (rollsLeft > 0 && gameStarted && !gameEnded) {
      rollDice();
    }
  };

  if (!gameStarted) return null;

  return (
    <div className="dice-container">
      <div className="dice-info">
        <h3>Rolls Left: {rollsLeft}</h3>
        <button
          className={clsx(
            'roll-button',
            rollsLeft <= 0 && 'disabled',
            gameEnded && 'disabled'
          )}
          onClick={handleRoll}
          disabled={rollsLeft <= 0 || gameEnded}
        >
          {rollsLeft > 0 ? 'Roll Dice' : 'No Rolls Left'}
        </button>
      </div>
      
      <div className="dice-grid">
        {dice.map((diceItem) => (
          <Dice
            key={diceItem.id}
            dice={diceItem}
            onHold={holdDice}
            disabled={rollsLeft === 3 || gameEnded}
          />
        ))}
      </div>
      
      <div className="dice-instructions">
        <p>Click on dice to hold them before rolling</p>
        <p>You have 3 rolls per turn</p>
      </div>
    </div>
  );
};

export default DiceContainer;
