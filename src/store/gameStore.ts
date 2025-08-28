import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { addScore, getAllLeaderboards } from '../services/leaderboardService';
import type { LeaderboardEntry } from '../services/leaderboardService';
import { getTelegramUserId, getTelegramUserName, hapticFeedback, notificationFeedback } from '../services/telegramService';

export interface Player {
  id: string;
  name: string;
  telegramId?: string; // Telegram user ID
  scores: ScoreSheet;
  totalScore: number;
}

export interface ScoreSheet {
  ones: number | null;
  twos: number | null;
  threes: number | null;
  fours: number | null;
  fives: number | null;
  sixes: number | null;
  threeOfAKind: number | null;
  fourOfAKind: number | null;
  fullHouse: number | null;
  smallStraight: number | null;
  largeStraight: number | null;
  yahtzee: number | null;
  chance: number | null;
}

export interface Dice {
  id: number;
  value: number;
  isHeld: boolean;
}

export interface GameState {
  // Game mode
  gameMode: 'singleplayer' | 'multiplayer';
  
  // Players
  players: Player[];
  currentPlayerIndex: number;
  
  // Game state
  currentRound: number;
  rollsLeft: number;
  dice: Dice[];
  gameStarted: boolean;
  gameEnded: boolean;
  
  // Leaderboard
  leaderboard: {
    today: LeaderboardEntry[];
    week: LeaderboardEntry[];
    allTime: LeaderboardEntry[];
  };
  leaderboardLoading: boolean;
  
  // Actions
  startGame: (mode: 'singleplayer' | 'multiplayer', playerNames?: string[]) => void;
  rollDice: () => void;
  holdDice: (diceId: number) => void;
  scoreRoll: (category: keyof ScoreSheet) => void;
  nextPlayer: () => void;
  resetGame: () => void;
  addToLeaderboard: (player: Player) => void;
  loadLeaderboards: () => Promise<void>;
  syncScoreToFirebase: (player: Player) => Promise<void>;
}

const initialScoreSheet: ScoreSheet = {
  ones: null,
  twos: null,
  threes: null,
  fours: null,
  fives: null,
  sixes: null,
  threeOfAKind: null,
  fourOfAKind: null,
  fullHouse: null,
  smallStraight: null,
  largeStraight: null,
  yahtzee: null,
  chance: null,
};

const initialDice: Dice[] = Array.from({ length: 5 }, (_, i) => ({
  id: i,
  value: 1,
  isHeld: false,
}));

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      // Initial state
      gameMode: 'singleplayer',
      players: [],
      currentPlayerIndex: 0,
      currentRound: 1,
      rollsLeft: 3,
      dice: initialDice,
      gameStarted: false,
      gameEnded: false,
      leaderboard: {
        today: [],
        week: [],
        allTime: []
      },
      leaderboardLoading: false,

      // Actions
      startGame: (mode, playerNames) => {
        const telegramId = getTelegramUserId();
        const telegramName = getTelegramUserName();
        
        const players = mode === 'singleplayer' 
          ? [{ 
              id: '1', 
              name: telegramName, 
              telegramId: telegramId || undefined,
              scores: initialScoreSheet, 
              totalScore: 0 
            }]
          : (playerNames || ['Player 1', 'Player 2']).map((name, i) => ({
              id: String(i + 1),
              name: i === 0 ? telegramName : name, // Первый игрок - Telegram пользователь
              telegramId: i === 0 ? (telegramId || undefined) : undefined,
              scores: initialScoreSheet,
              totalScore: 0,
            }));

        set({
          gameMode: mode,
          players,
          currentPlayerIndex: 0,
          currentRound: 1,
          rollsLeft: 3,
          dice: initialDice.map(d => ({ ...d, value: Math.floor(Math.random() * 6) + 1 })),
          gameStarted: true,
          gameEnded: false,
        });
        
        hapticFeedback('light');
      },

      rollDice: () => {
        const { dice, rollsLeft } = get();
        if (rollsLeft <= 0) return;

        const newDice = dice.map(d => 
          d.isHeld ? d : { ...d, value: Math.floor(Math.random() * 6) + 1 }
        );

        set({
          dice: newDice,
          rollsLeft: rollsLeft - 1,
        });
        
        hapticFeedback('medium');
      },

      holdDice: (diceId) => {
        const { dice } = get();
        const newDice = dice.map(d => 
          d.id === diceId ? { ...d, isHeld: !d.isHeld } : d
        );
        set({ dice: newDice });
        
        hapticFeedback('light');
      },

      scoreRoll: (category) => {
        const { players, currentPlayerIndex, dice } = get();
        const diceValues = dice.map(d => d.value);
        
        let score = 0;
        
        switch (category) {
          case 'ones':
            score = diceValues.filter(v => v === 1).length * 1;
            break;
          case 'twos':
            score = diceValues.filter(v => v === 2).length * 2;
            break;
          case 'threes':
            score = diceValues.filter(v => v === 3).length * 3;
            break;
          case 'fours':
            score = diceValues.filter(v => v === 4).length * 4;
            break;
          case 'fives':
            score = diceValues.filter(v => v === 5).length * 5;
            break;
          case 'sixes':
            score = diceValues.filter(v => v === 6).length * 6;
            break;
          case 'threeOfAKind':
            const counts = diceValues.reduce((acc, val) => {
              acc[val] = (acc[val] || 0) + 1;
              return acc;
            }, {} as Record<number, number>);
            score = Object.values(counts).some(count => count >= 3) ? diceValues.reduce((a, b) => a + b, 0) : 0;
            break;
          case 'fourOfAKind':
            const counts4 = diceValues.reduce((acc, val) => {
              acc[val] = (acc[val] || 0) + 1;
              return acc;
            }, {} as Record<number, number>);
            score = Object.values(counts4).some(count => count >= 4) ? diceValues.reduce((a, b) => a + b, 0) : 0;
            break;
          case 'fullHouse':
            const countsFH = diceValues.reduce((acc, val) => {
              acc[val] = (acc[val] || 0) + 1;
              return acc;
            }, {} as Record<number, number>);
            const values = Object.values(countsFH);
            score = values.includes(3) && values.includes(2) ? 25 : 0;
            break;
          case 'smallStraight':
            const sorted = [...new Set(diceValues)].sort((a, b) => a - b);
            score = (sorted.length >= 4 && sorted[3] - sorted[0] <= 3) ? 30 : 0;
            break;
          case 'largeStraight':
            const sorted2 = [...new Set(diceValues)].sort((a, b) => a - b);
            score = (sorted2.length === 5 && sorted2[4] - sorted2[0] === 4) ? 40 : 0;
            break;
          case 'yahtzee':
            score = diceValues.every(v => v === diceValues[0]) ? 50 : 0;
            break;
          case 'chance':
            score = diceValues.reduce((a, b) => a + b, 0);
            break;
        }

        const updatedPlayers = players.map((player, index) => {
          if (index === currentPlayerIndex) {
            const newScores = { ...player.scores, [category]: score };
            const totalScore = Object.values(newScores).reduce((sum: number, val) => sum + (val || 0), 0);
            return { ...player, scores: newScores, totalScore: totalScore };
          }
          return player;
        });

        set({ players: updatedPlayers });
        
        if (score > 0) {
          notificationFeedback('success');
        }
      },

      nextPlayer: () => {
        const { players, currentPlayerIndex, currentRound } = get();
        const nextPlayerIndex = (currentPlayerIndex + 1) % players.length;
        
        if (nextPlayerIndex === 0) {
          // All players have played this round
          if (currentRound >= 13) {
            // Game is over
            set({ gameEnded: true });
            return;
          }
          set({ currentRound: currentRound + 1 });
        }

        set({
          currentPlayerIndex: nextPlayerIndex,
          rollsLeft: 3,
          dice: initialDice.map(d => ({ ...d, value: Math.floor(Math.random() * 6) + 1 })),
        });
      },

      resetGame: () => {
        set({
          players: [],
          currentPlayerIndex: 0,
          currentRound: 1,
          rollsLeft: 3,
          dice: initialDice,
          gameStarted: false,
          gameEnded: false,
        });
      },

      addToLeaderboard: (player) => {
        // Локальное добавление в лидерборд (для обратной совместимости)
        const { leaderboard } = get();
        const newEntry: LeaderboardEntry = {
          playerName: player.name,
          playerId: player.telegramId || player.id,
          score: player.totalScore,
          timestamp: new Date(),
          gameMode: get().gameMode
        };
        
        // Обновляем локальный лидерборд
        const updatedAllTime = [...leaderboard.allTime, newEntry]
          .sort((a, b) => b.score - a.score)
          .slice(0, 10);
        
        set({ 
          leaderboard: { 
            ...leaderboard, 
            allTime: updatedAllTime 
          } 
        });
      },

      loadLeaderboards: async () => {
        set({ leaderboardLoading: true });
        try {
          const leaderboardData = await getAllLeaderboards();
          set({ 
            leaderboard: leaderboardData,
            leaderboardLoading: false 
          });
        } catch (error) {
          console.error('Error loading leaderboards:', error);
          set({ leaderboardLoading: false });
        }
      },

      syncScoreToFirebase: async (player) => {
        try {
          await addScore({
            playerName: player.name,
            playerId: player.telegramId || player.id,
            score: player.totalScore,
            gameMode: get().gameMode
          });
          
          // Перезагружаем лидерборды после добавления нового рекорда
          get().loadLeaderboards();
          
          notificationFeedback('success');
        } catch (error) {
          console.error('Error syncing score to Firebase:', error);
          notificationFeedback('error');
        }
      },
    }),
    {
      name: 'yahtzee-game-storage',
      partialize: (state) => ({
        // Сохраняем только локальные данные, Firebase данные не сохраняем
        gameMode: state.gameMode,
        players: state.players,
        currentPlayerIndex: state.currentPlayerIndex,
        currentRound: state.currentRound,
        rollsLeft: state.rollsLeft,
        dice: state.dice,
        gameStarted: state.gameStarted,
        gameEnded: state.gameEnded,
      }),
    }
  )
);
