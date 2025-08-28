import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBnkgrV5_jFQ3aC6krTfeoHP51iVO1xVb0",
  authDomain: "vibe-tma-yahtzee.firebaseapp.com",
  projectId: "vibe-tma-yahtzee",
  storageBucket: "vibe-tma-yahtzee.firebasestorage.app",
  messagingSenderId: "705526426901",
  appId: "1:705526426901:web:6bbf5b95868f8141f30d1c",
  measurementId: "G-BCKWJJK0MN"
};

// Проверяем, находимся ли мы в браузере и доступен ли Firebase
const isFirebaseAvailable = () => {
  return typeof window !== 'undefined' && 
         typeof window.navigator !== 'undefined' && 
         window.location.hostname !== 'localhost' && 
         window.location.hostname !== '127.0.0.1';
};

let app: any = null;
let db: any = null;
let auth: any = null;

try {
  if (isFirebaseAvailable()) {
    // Инициализируем Firebase только в продакшене или в Telegram
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    console.log('🔥 Firebase инициализирован');
  } else {
    console.log('🌐 Локальная разработка - Firebase отключен');
  }
} catch (error) {
  console.error('❌ Ошибка инициализации Firebase:', error);
  console.log('🌐 Продолжаем без Firebase');
}

export { db, auth };
export default app;
