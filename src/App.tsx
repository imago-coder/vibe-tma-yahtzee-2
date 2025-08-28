import { useState, useEffect } from 'react';
import { useGameStore } from './store/gameStore';
import GameSetup from './components/GameSetup';
import GameBoard from './components/GameBoard';
import Leaderboard from './components/Leaderboard';
import { initTelegramWebApp, isTelegramWebApp } from './services/telegramService';
import './App.css';

function App() {
  const { gameStarted, gameEnded, resetGame } = useGameStore();
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  useEffect(() => {
    console.log('🚀 App компонент загружен');
    console.log('📍 Текущий URL:', window.location.href);
    console.log('🌐 Hostname:', window.location.hostname);
    console.log('📱 Telegram Web App доступен:', isTelegramWebApp());
    
    if (isTelegramWebApp()) {
      console.log('📱 Инициализируем Telegram Web App...');
      initTelegramWebApp();
    } else {
      console.log('🌐 Локальная разработка');
    }
  }, []);

  const handleBackToMenu = () => {
    setShowLeaderboard(false);
    resetGame();
  };

  const handleShowLeaderboard = () => {
    setShowLeaderboard(true);
  };

  console.log('🎮 App рендерится, gameStarted:', gameStarted, 'gameEnded:', gameEnded);

  return (
    <div className="app">
      <header className="app-header">
        <h1>🎲 Yahtzee</h1>
        {gameStarted && !gameEnded && (
          <div className="header-actions">
            <button onClick={handleShowLeaderboard} className="leaderboard-btn">
              🏆 Рекорды
            </button>
          </div>
        )}
      </header>
      <main className="app-main">
        {!gameStarted && !showLeaderboard && (
          <GameSetup />
        )}
        {gameStarted && !gameEnded && !showLeaderboard && (
          <GameBoard />
        )}
        {showLeaderboard && (
          <Leaderboard />
        )}
        {(gameEnded || showLeaderboard) && (
          <div className="menu-actions">
            <button onClick={handleBackToMenu} className="menu-btn">
              ← Назад в меню
            </button>
          </div>
        )}
      </main>
      <footer className="app-footer">
        <p>Telegram Mini App - Yahtzee Game</p>
      </footer>
    </div>
  );
}

export default App;
