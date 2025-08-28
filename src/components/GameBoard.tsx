import React, { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import DiceContainer from './DiceContainer';
import ScoreSheet from './ScoreSheet';
import clsx from 'clsx';

const GameBoard: React.FC = () => {
  const { 
    gameStarted, 
    gameEnded, 
    players, 
    currentPlayerIndex, 
    currentRound,
    syncScoreToFirebase,
    resetGame 
  } = useGameStore();

  // Синхронизируем рекорды с Firebase при окончании игры
  useEffect(() => {
    if (gameEnded && players.length > 0) {
      console.log('🎯 Игра окончена, синхронизируем с Firebase...');
      console.log('Игроки:', players);
      
      const syncScores = async () => {
        try {
          for (const player of players) {
            if (player.totalScore > 0) {
              console.log(`📤 Синхронизируем игрока ${player.name} с очками ${player.totalScore}`);
              await syncScoreToFirebase(player);
            }
          }
          console.log('✅ Все рекорды синхронизированы с Firebase');
        } catch (error) {
          console.error('❌ Ошибка синхронизации с Firebase:', error);
        }
      };
      
      syncScores();
    }
  }, [gameEnded, players, syncScoreToFirebase]);

  if (!gameStarted) return null;

  const currentPlayer = players[currentPlayerIndex];
  const isGameOver = currentRound > 13 || gameEnded;

  if (isGameOver) {
    // Sort players by score for final ranking
    const sortedPlayers = [...players].sort((a, b) => b.totalScore - a.totalScore);
    
    return (
      <div className="game-board game-over">
        <h2>🎯 Игра окончена!</h2>
        <div className="final-results">
          <h3>Финальные результаты</h3>
          {sortedPlayers.map((player, index) => (
            <div key={player.id} className={clsx('final-player', index === 0 && 'winner')}>
              <span className="position">{index + 1}</span>
              <span className="name">{player.name}</span>
              <span className="score">{player.totalScore}</span>
            </div>
          ))}
        </div>
        
        <div className="game-actions">
          <button onClick={resetGame} className="new-game-btn">
            🎮 Новая игра
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="game-board">
      <div className="game-header">
        <h2>Раунд {currentRound} из 13</h2>
        <div className="current-player-info">
          <h3>Текущий игрок: {currentPlayer?.name}</h3>
        </div>
      </div>

      <div className="game-content">
        <div className="left-panel">
          <DiceContainer />
        </div>
        
        <div className="right-panel">
          <div className="score-sheets">
            {players.map((_, index) => (
              <ScoreSheet key={index} playerIndex={index} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameBoard;
