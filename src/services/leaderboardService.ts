import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  limit, 
  getDocs, 
  where,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface LeaderboardEntry {
  id?: string;
  playerName: string;
  playerId: string; // Telegram user ID
  score: number;
  timestamp: Date;
  gameMode: 'singleplayer' | 'multiplayer';
}

export interface LeaderboardData {
  today: LeaderboardEntry[];
  week: LeaderboardEntry[];
  allTime: LeaderboardEntry[];
}

// Проверяем доступность Firebase
const isFirebaseAvailable = () => {
  return db !== null && typeof window !== 'undefined' && 
         window.location.hostname !== 'localhost' && 
         window.location.hostname !== '127.0.0.1';
};

// Получить начало дня (00:00:00)
const getStartOfDay = (date: Date): Date => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  return start;
};

// Получить начало недели (понедельник 00:00:00)
const getStartOfWeek = (date: Date): Date => {
  const start = new Date(date);
  const day = start.getDay();
  const diff = start.getDate() - day + (day === 0 ? -6 : 1); // Понедельник = 1
  start.setDate(diff);
  start.setHours(0, 0, 0, 0);
  return start;
};

// Добавить новый рекорд
export const addScore = async (entry: Omit<LeaderboardEntry, 'id' | 'timestamp'>): Promise<void> => {
  try {
    if (!isFirebaseAvailable()) {
      console.log('🌐 Локальная разработка - рекорд сохранен локально');
      // В локальной среде сохраняем в localStorage
      const localScores = JSON.parse(localStorage.getItem('yahtzee-local-scores') || '[]');
      const newScore = {
        ...entry,
        id: Date.now().toString(),
        timestamp: new Date()
      };
      localScores.push(newScore);
      localStorage.setItem('yahtzee-local-scores', JSON.stringify(localScores));
      return;
    }

    console.log('🔥 Добавляем рекорд в Firebase:', entry);
    
    const docData = {
      ...entry,
      timestamp: Timestamp.fromDate(new Date())
    };
    
    console.log('📝 Данные для записи:', docData);
    
    const docRef = await addDoc(collection(db, 'scores'), docData);
    console.log('✅ Рекорд успешно добавлен в Firebase с ID:', docRef.id);
  } catch (error) {
    console.error('❌ Ошибка добавления рекорда:', error);
    throw error;
  }
};

// Получить топ рекордов за день (упрощенный запрос)
export const getTodayScores = async (limitCount: number = 10): Promise<LeaderboardEntry[]> => {
  try {
    if (!isFirebaseAvailable()) {
      console.log('🌐 Локальная разработка - загружаем локальные рекорды');
      const localScores = JSON.parse(localStorage.getItem('yahtzee-local-scores') || '[]');
      const startOfDay = getStartOfDay(new Date());
      return localScores
        .filter((score: any) => new Date(score.timestamp) >= startOfDay)
        .sort((a: any, b: any) => b.score - a.score)
        .slice(0, limitCount);
    }

    const startOfDay = getStartOfDay(new Date());
    const q = query(
      collection(db, 'scores'),
      where('timestamp', '>=', Timestamp.fromDate(startOfDay)),
      orderBy('score', 'desc'), // Только по очкам
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp.toDate()
    })) as LeaderboardEntry[];
  } catch (error) {
    console.error('Error getting today scores:', error);
    return [];
  }
};

// Получить топ рекордов за неделю (упрощенный запрос)
export const getWeekScores = async (limitCount: number = 10): Promise<LeaderboardEntry[]> => {
  try {
    if (!isFirebaseAvailable()) {
      console.log('🌐 Локальная разработка - загружаем локальные рекорды за неделю');
      const localScores = JSON.parse(localStorage.getItem('yahtzee-local-scores') || '[]');
      const startOfWeek = getStartOfWeek(new Date());
      return localScores
        .filter((score: any) => new Date(score.timestamp) >= startOfWeek)
        .sort((a: any, b: any) => b.score - a.score)
        .slice(0, limitCount);
    }

    const startOfWeek = getStartOfWeek(new Date());
    const q = query(
      collection(db, 'scores'),
      where('timestamp', '>=', Timestamp.fromDate(startOfWeek)),
      orderBy('score', 'desc'), // Только по очкам
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp.toDate()
    })) as LeaderboardEntry[];
  } catch (error) {
    console.error('Error getting week scores:', error);
    return [];
  }
};

// Получить топ рекордов за все время
export const getAllTimeScores = async (limitCount: number = 10): Promise<LeaderboardEntry[]> => {
  try {
    if (!isFirebaseAvailable()) {
      console.log('🌐 Локальная разработка - загружаем все локальные рекорды');
      const localScores = JSON.parse(localStorage.getItem('yahtzee-local-scores') || '[]');
      return localScores
        .sort((a: any, b: any) => b.score - a.score)
        .slice(0, limitCount);
    }

    const q = query(
      collection(db, 'scores'),
      orderBy('score', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp.toDate()
    })) as LeaderboardEntry[];
  } catch (error) {
    console.error('Error getting all time scores:', error);
    return [];
  }
};

// Получить все рекорды (сегодня, неделя, все время)
export const getAllLeaderboards = async (): Promise<LeaderboardData> => {
  try {
    const [today, week, allTime] = await Promise.all([
      getTodayScores(10),
      getWeekScores(10),
      getAllTimeScores(10)
    ]);
    
    return { today, week, allTime };
  } catch (error) {
    console.error('Error getting all leaderboards:', error);
    return { today: [], week: [], allTime: [] };
  }
};

// Получить личные рекорды игрока
export const getPlayerScores = async (playerId: string): Promise<LeaderboardEntry[]> => {
  try {
    if (!isFirebaseAvailable()) {
      console.log('🌐 Локальная разработка - загружаем личные рекорды');
      const localScores = JSON.parse(localStorage.getItem('yahtzee-local-scores') || '[]');
      return localScores
        .filter((score: any) => score.playerId === playerId)
        .sort((a: any, b: any) => b.score - a.score)
        .slice(0, 5);
    }

    const q = query(
      collection(db, 'scores'),
      where('playerId', '==', playerId),
      orderBy('score', 'desc'),
      limit(5)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp.toDate()
    })) as LeaderboardEntry[];
  } catch (error) {
    console.error('Error getting player scores:', error);
    return [];
  }
};
