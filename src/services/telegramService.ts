declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initDataUnsafe?: {
          user?: TelegramUser;
          start_param?: string;
        };
        ready(): void;
        expand(): void;
        close(): void;
        MainButton?: {
          text: string;
          onClick: () => void;
          show(): void;
          hide(): void;
        };
        HapticFeedback?: {
          impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
        };
        NotificationHapticFeedback?: {
          impactOccurred: (style: 'success' | 'warning' | 'error') => void;
        };
      };
    };
  }
}

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

// Проверяем, находимся ли мы в Telegram Web App
export const isTelegramWebApp = (): boolean => {
  return typeof window !== 'undefined' && 
         window.Telegram?.WebApp !== undefined &&
         window.location.hostname !== 'localhost' && 
         window.location.hostname !== '127.0.0.1';
};

// Получить данные пользователя Telegram
export const getTelegramUser = (): TelegramUser | null => {
  if (isTelegramWebApp() && window.Telegram?.WebApp?.initDataUnsafe?.user) {
    return window.Telegram.WebApp.initDataUnsafe.user;
  }
  return null;
};

// Получить имя пользователя Telegram
export const getTelegramUserName = (): string => {
  const user = getTelegramUser();
  if (user) {
    if (user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    return user.first_name;
  }
  
  // Fallback для локальной разработки
  if (typeof window !== 'undefined' && 
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return 'Локальный Игрок';
  }
  
  return 'Player';
};

// Получить полное имя пользователя Telegram
export const getTelegramFullName = (): string => {
  const user = getTelegramUser();
  if (user) {
    let fullName = user.first_name;
    if (user.last_name) {
      fullName += ` ${user.last_name}`;
    }
    if (user.username) {
      fullName += ` (@${user.username})`;
    }
    return fullName;
  }
  
  // Fallback для локальной разработки
  if (typeof window !== 'undefined' && 
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return 'Локальный Игрок (Разработка)';
  }
  
  return 'Player';
};

// Получить Telegram User ID
export const getTelegramUserId = (): string | null => {
  const user = getTelegramUser();
  if (user) {
    return user.id.toString();
  }
  
  // Fallback для локальной разработки
  if (typeof window !== 'undefined' && 
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return 'local-dev-' + Date.now();
  }
  
  return null;
};

// Получить start_param
export const getStartParam = (): string | null => {
  if (isTelegramWebApp() && window.Telegram?.WebApp?.initDataUnsafe?.start_param) {
    return window.Telegram.WebApp.initDataUnsafe.start_param;
  }
  return null;
};

// Инициализировать Telegram Web App
export const initTelegramWebApp = (): void => {
  if (isTelegramWebApp() && window.Telegram?.WebApp) {
    try {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
      console.log('📱 Telegram Web App инициализирован');
    } catch (error) {
      console.error('❌ Ошибка инициализации Telegram Web App:', error);
    }
  } else {
    console.log('🌐 Локальная разработка - Telegram Web App недоступен');
  }
};

// Haptic feedback
export const hapticFeedback = (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'): void => {
  if (isTelegramWebApp() && window.Telegram?.WebApp?.HapticFeedback) {
    try {
      window.Telegram.WebApp.HapticFeedback.impactOccurred(style);
    } catch (error) {
      console.error('❌ Ошибка haptic feedback:', error);
    }
  } else {
    // Fallback для локальной разработки
    console.log(`📳 Haptic feedback: ${style}`);
  }
};

// Notification feedback
export const notificationFeedback = (style: 'success' | 'warning' | 'error'): void => {
  if (isTelegramWebApp() && window.Telegram?.WebApp?.NotificationHapticFeedback) {
    try {
      window.Telegram.WebApp.NotificationHapticFeedback.impactOccurred(style);
    } catch (error) {
      console.error('❌ Ошибка notification feedback:', error);
    }
  } else {
    // Fallback для локальной разработки
    console.log(`🔔 Notification feedback: ${style}`);
  }
};
