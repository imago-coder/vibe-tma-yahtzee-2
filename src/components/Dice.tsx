import React from 'react';
import type { Dice as DiceType } from '../store/gameStore';
import clsx from 'clsx';

interface DiceProps {
  dice: DiceType;
  onHold: (diceId: number) => void;
  disabled?: boolean;
}

const Dice: React.FC<DiceProps> = ({ dice, onHold, disabled }) => {
  const getDiceFace = (value: number) => {
    return (
      <div className="dice-face">
        <div className="dice-number">{value}</div>
      </div>
    );
  };

  return (
    <div
      className={clsx(
        'dice',
        dice.isHeld && 'held',
        disabled && 'disabled'
      )}
      onClick={() => !disabled && onHold(dice.id)}
    >
      {getDiceFace(dice.value)}
      {dice.isHeld && <div className="hold-indicator">HOLD</div>}
    </div>
  );
};

export default Dice;
