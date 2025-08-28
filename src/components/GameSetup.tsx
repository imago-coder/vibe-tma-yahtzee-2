import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';

const GameSetup: React.FC = () => {
  const { startGame } = useGameStore();
  const [gameMode, setGameMode] = useState<'singleplayer' | 'multiplayer'>('singleplayer');
  const [playerNames, setPlayerNames] = useState(['Player 1', 'Player 2']);
  const [showMultiplayerSetup, setShowMultiplayerSetup] = useState(false);

  const handleModeChange = (mode: 'singleplayer' | 'multiplayer') => {
    setGameMode(mode);
    if (mode === 'multiplayer') {
      setShowMultiplayerSetup(true);
    } else {
      setShowMultiplayerSetup(false);
    }
  };

  const handlePlayerNameChange = (index: number, name: string) => {
    const newNames = [...playerNames];
    newNames[index] = name;
    setPlayerNames(newNames);
  };

  const handleStartGame = () => {
    if (gameMode === 'singleplayer') {
      startGame('singleplayer');
    } else {
      const names = playerNames.filter(name => name.trim() !== '');
      if (names.length >= 2) {
        startGame('multiplayer', names);
      }
    }
  };

  const canStartGame = () => {
    if (gameMode === 'singleplayer') return true;
    return playerNames.filter(name => name.trim() !== '').length >= 2;
  };

  return (
    <div className="game-setup">
      <h2>Yahtzee Game Setup</h2>
      
      <div className="setup-section">
        <h3>Choose Game Mode</h3>
        <div className="mode-selection">
          <label className="mode-option">
            <input
              type="radio"
              name="gameMode"
              value="singleplayer"
              checked={gameMode === 'singleplayer'}
              onChange={() => handleModeChange('singleplayer')}
            />
            <span className="mode-label">Single Player</span>
          </label>
          
          <label className="mode-option">
            <input
              type="radio"
              name="gameMode"
              value="multiplayer"
              checked={gameMode === 'multiplayer'}
              onChange={() => handleModeChange('multiplayer')}
            />
            <span className="mode-label">Multi Player (2 Players)</span>
          </label>
        </div>
      </div>

      {showMultiplayerSetup && (
        <div className="setup-section">
          <h3>Player Names</h3>
          <div className="player-names">
            {playerNames.map((name, index) => (
              <div key={index} className="player-name-input">
                <label htmlFor={`player-${index + 1}`}>
                  Player {index + 1}:
                </label>
                <input
                  id={`player-${index + 1}`}
                  type="text"
                  value={name}
                  onChange={(e) => handlePlayerNameChange(index, e.target.value)}
                  placeholder={`Player ${index + 1} Name`}
                  maxLength={20}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="setup-section">
        <h3>Game Rules</h3>
        <div className="rules">
          <ul>
            <li>Roll 5 dice up to 3 times per turn</li>
            <li>Click dice to hold them between rolls</li>
            <li>Score your roll in one of 13 categories</li>
            <li>Upper section: Score dice by number (1s, 2s, 3s, etc.)</li>
            <li>Lower section: Score special combinations</li>
            <li>Get 35 bonus points if upper section totals 63 or more</li>
            <li>Game ends after 13 rounds</li>
            <li>Highest total score wins!</li>
          </ul>
        </div>
      </div>

      <div className="setup-actions">
        <button
          className="start-game-btn"
          onClick={handleStartGame}
          disabled={!canStartGame()}
        >
          Start Game
        </button>
      </div>
    </div>
  );
};

export default GameSetup;
