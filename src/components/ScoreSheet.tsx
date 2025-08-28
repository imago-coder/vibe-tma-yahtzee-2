import React from 'react';
import { useGameStore } from '../store/gameStore';
import type { ScoreSheet as ScoreSheetType } from '../store/gameStore';
import clsx from 'clsx';

interface ScoreSheetProps {
  playerIndex: number;
}

const ScoreSheet: React.FC<ScoreSheetProps> = ({ playerIndex }) => {
  const { players, currentPlayerIndex, rollsLeft, scoreRoll, nextPlayer, gameEnded } = useGameStore();
  const player = players[playerIndex];
  
  if (!player) return null;

  const isCurrentPlayer = playerIndex === currentPlayerIndex;
  const canScore = rollsLeft < 3 && rollsLeft >= 0;

  const handleScore = (category: keyof ScoreSheetType) => {
    if (isCurrentPlayer && canScore && player.scores[category] === null) {
      scoreRoll(category);
      // Auto-advance to next player after scoring
      setTimeout(() => {
        nextPlayer();
      }, 500);
    }
  };

  const getCategoryScore = (category: keyof ScoreSheetType) => {
    const score = player.scores[category];
    if (score === null) return '-';
    return score;
  };

  const getUpperSectionTotal = () => {
    const upperCategories: (keyof ScoreSheetType)[] = ['ones', 'twos', 'threes', 'fours', 'fives', 'sixes'];
    return upperCategories.reduce((total, category) => {
      const score = player.scores[category];
      return total + (score || 0);
    }, 0);
  };

  const getBonus = () => {
    const upperTotal = getUpperSectionTotal();
    return upperTotal >= 63 ? 35 : 0;
  };

  const getUpperSectionWithBonus = () => {
    return getUpperSectionTotal() + getBonus();
  };

  const getLowerSectionTotal = () => {
    const lowerCategories: (keyof ScoreSheetType)[] = [
      'threeOfAKind', 'fourOfAKind', 'fullHouse', 'smallStraight', 
      'largeStraight', 'yahtzee', 'chance'
    ];
    return lowerCategories.reduce((total, category) => {
      const score = player.scores[category];
      return total + (score || 0);
    }, 0);
  };

  const getGrandTotal = () => {
    return getUpperSectionWithBonus() + getLowerSectionTotal();
  };

  const isCategoryClickable = (category: keyof ScoreSheetType) => {
    return isCurrentPlayer && 
           canScore && 
           player.scores[category] === null &&
           !gameEnded;
  };

  return (
    <div className={clsx('score-sheet', isCurrentPlayer && 'current-player')}>
      <h3 className="player-name">{player.name}</h3>
      
      <div className="score-sections">
        {/* Upper Section */}
        <div className="score-section">
          <h4>Upper Section</h4>
          <div className="score-row">
            <span>Ones</span>
            <span 
              className={clsx(
                'score-value',
                isCategoryClickable('ones') && 'clickable'
              )}
              onClick={() => handleScore('ones')}
            >
              {getCategoryScore('ones')}
            </span>
          </div>
          <div className="score-row">
            <span>Twos</span>
            <span 
              className={clsx(
                'score-value',
                isCategoryClickable('twos') && 'clickable'
              )}
              onClick={() => handleScore('twos')}
            >
              {getCategoryScore('twos')}
            </span>
          </div>
          <div className="score-row">
            <span>Threes</span>
            <span 
              className={clsx(
                'score-value',
                isCategoryClickable('threes') && 'clickable'
              )}
              onClick={() => handleScore('threes')}
            >
              {getCategoryScore('threes')}
            </span>
          </div>
          <div className="score-row">
            <span>Fours</span>
            <span 
              className={clsx(
                'score-value',
                isCategoryClickable('fours') && 'clickable'
              )}
              onClick={() => handleScore('fours')}
            >
              {getCategoryScore('fours')}
            </span>
          </div>
          <div className="score-row">
            <span>Fives</span>
            <span 
              className={clsx(
                'score-value',
                isCategoryClickable('fives') && 'clickable'
              )}
              onClick={() => handleScore('fives')}
            >
              {getCategoryScore('fives')}
            </span>
          </div>
          <div className="score-row">
            <span>Sixes</span>
            <span 
              className={clsx(
                'score-value',
                isCategoryClickable('sixes') && 'clickable'
              )}
              onClick={() => handleScore('sixes')}
            >
              {getCategoryScore('sixes')}
            </span>
          </div>
          <div className="score-row total">
            <span>Upper Total</span>
            <span>{getUpperSectionTotal()}</span>
          </div>
          <div className="score-row bonus">
            <span>Bonus (35 if ≥63)</span>
            <span>{getBonus()}</span>
          </div>
          <div className="score-row total">
            <span>Upper Section Total</span>
            <span>{getUpperSectionWithBonus()}</span>
          </div>
        </div>

        {/* Lower Section */}
        <div className="score-section">
          <h4>Lower Section</h4>
          <div className="score-row">
            <span>3 of a Kind</span>
            <span 
              className={clsx(
                'score-value',
                isCategoryClickable('threeOfAKind') && 'clickable'
              )}
              onClick={() => handleScore('threeOfAKind')}
            >
              {getCategoryScore('threeOfAKind')}
            </span>
          </div>
          <div className="score-row">
            <span>4 of a Kind</span>
            <span 
              className={clsx(
                'score-value',
                isCategoryClickable('fourOfAKind') && 'clickable'
              )}
              onClick={() => handleScore('fourOfAKind')}
            >
              {getCategoryScore('fourOfAKind')}
            </span>
          </div>
          <div className="score-row">
            <span>Full House</span>
            <span 
              className={clsx(
                'score-value',
                isCategoryClickable('fullHouse') && 'clickable'
              )}
              onClick={() => handleScore('fullHouse')}
            >
              {getCategoryScore('fullHouse')}
            </span>
          </div>
          <div className="score-row">
            <span>Small Straight</span>
            <span 
              className={clsx(
                'score-value',
                isCategoryClickable('smallStraight') && 'clickable'
              )}
              onClick={() => handleScore('smallStraight')}
            >
              {getCategoryScore('smallStraight')}
            </span>
          </div>
          <div className="score-row">
            <span>Large Straight</span>
            <span 
              className={clsx(
                'score-value',
                isCategoryClickable('largeStraight') && 'clickable'
              )}
              onClick={() => handleScore('largeStraight')}
            >
              {getCategoryScore('largeStraight')}
            </span>
          </div>
          <div className="score-row">
            <span>Yahtzee</span>
            <span 
              className={clsx(
                'score-value',
                isCategoryClickable('yahtzee') && 'clickable'
              )}
              onClick={() => handleScore('yahtzee')}
            >
              {getCategoryScore('yahtzee')}
            </span>
          </div>
          <div className="score-row">
            <span>Chance</span>
            <span 
              className={clsx(
                'score-value',
                isCategoryClickable('chance') && 'clickable'
              )}
              onClick={() => handleScore('chance')}
            >
              {getCategoryScore('chance')}
            </span>
          </div>
          <div className="score-row total">
            <span>Lower Section Total</span>
            <span>{getLowerSectionTotal()}</span>
          </div>
        </div>

        {/* Grand Total */}
        <div className="score-row grand-total">
          <span>GRAND TOTAL</span>
          <span>{getGrandTotal()}</span>
        </div>
      </div>
    </div>
  );
};

export default ScoreSheet;
