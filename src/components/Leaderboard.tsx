import React, { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import type { LeaderboardEntry } from '../services/leaderboardService';
import clsx from 'clsx';

type LeaderboardTab = 'today' | 'week' | 'allTime';

const Leaderboard: React.FC = () => {
  const { leaderboard, leaderboardLoading, loadLeaderboards } = useGameStore();
  const [activeTab, setActiveTab] = useState<LeaderboardTab>('allTime');

  useEffect(() => {
    loadLeaderboards();
  }, [loadLeaderboards]);

  const getTabLabel = (tab: LeaderboardTab): string => {
    switch (tab) {
      case 'today': return 'Сегодня';
      case 'week': return 'Неделя';
      case 'allTime': return 'Все время';
      default: return '';
    }
  };

  const getActiveData = (): LeaderboardEntry[] => {
    return leaderboard[activeTab] || [];
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getEmptyMessage = (): string => {
    switch (activeTab) {
      case 'today': return 'Сегодня еще нет рекордов. Будьте первым!';
      case 'week': return 'На этой неделе еще нет рекордов. Будьте первым!';
      case 'allTime': return 'Рекордов пока нет. Будьте первым!';
      default: return '';
    }
  };

  if (leaderboardLoading) {
    return (
      <div className="leaderboard">
        <h3>Загрузка рекордов...</h3>
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="leaderboard">
      <h3>🏆 Таблица рекордов</h3>
      
      {/* Tabs */}
      <div className="leaderboard-tabs">
        {(['today', 'week', 'allTime'] as LeaderboardTab[]).map((tab) => (
          <button
            key={tab}
            className={clsx('leaderboard-tab', activeTab === tab && 'active')}
            onClick={() => setActiveTab(tab)}
          >
            {getTabLabel(tab)}
          </button>
        ))}
      </div>

      {/* Active Tab Content */}
      <div className="leaderboard-content">
        <h4>{getTabLabel(activeTab)}</h4>
        
        {getActiveData().length === 0 ? (
          <div className="empty-leaderboard">
            <p>{getEmptyMessage()}</p>
          </div>
        ) : (
          <div className="leaderboard-list">
            {getActiveData().map((entry, index) => (
              <div key={entry.id || index} className="leaderboard-item">
                <span className="rank">{index + 1}</span>
                <div className="player-info">
                  <span className="name">{entry.playerName}</span>
                  <span className="timestamp">{formatDate(entry.timestamp)}</span>
                </div>
                <span className="score">{entry.score}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Refresh Button */}
      <div className="leaderboard-actions">
        <button 
          onClick={loadLeaderboards} 
          className="refresh-btn"
          disabled={leaderboardLoading}
        >
          {leaderboardLoading ? 'Обновление...' : '🔄 Обновить'}
        </button>
      </div>
    </div>
  );
};

export default Leaderboard;
