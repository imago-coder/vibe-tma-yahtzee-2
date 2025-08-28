# 🔥 Настройка Firebase для Yahtzee Game

## 📋 Предварительные требования

1. **Google аккаунт** для доступа к Firebase Console
2. **Проект Firebase** (можно создать бесплатно)

## 🚀 Пошаговая настройка

### 1. Создание проекта Firebase

1. Перейдите на [Firebase Console](https://console.firebase.google.com/)
2. Нажмите "Создать проект"
3. Введите название проекта (например: `yahtzee-game`)
4. Выберите, нужна ли Google Analytics (рекомендуется)
5. Нажмите "Создать проект"

### 2. Настройка Firestore Database

1. В левом меню выберите "Firestore Database"
2. Нажмите "Создать базу данных"
3. Выберите "Начать в тестовом режиме" (для разработки)
4. Выберите ближайший регион (например: `europe-west3`)
5. Нажмите "Готово"

### 3. Настройка правил безопасности

В Firestore Database → Правила добавьте:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Разрешаем чтение и запись для всех (только для разработки!)
    // В продакшене настройте более строгие правила
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

### 4. Получение конфигурации

1. В левом меню выберите "Настройки проекта" (⚙️)
2. Перейдите на вкладку "Общие"
3. Прокрутите вниз до "Ваши приложения"
4. Нажмите на иконку веб-приложения (</>)
5. Введите название приложения (например: `yahtzee-web`)
6. Скопируйте конфигурацию

### 5. Обновление конфигурации в проекте

Замените содержимое файла `src/config/firebase.ts`:

```typescript
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "ваш-api-key",
  authDomain: "ваш-project.firebaseapp.com",
  projectId: "ваш-project-id",
  storageBucket: "ваш-project.appspot.com",
  messagingSenderId: "ваш-sender-id",
  appId: "ваш-app-id"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;
```

## 🔐 Правила безопасности для продакшена

Когда будете готовы к продакшену, обновите правила Firestore:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Разрешаем чтение рекордов всем
    match /scores/{document} {
      allow read: if true;
      // Разрешаем запись только авторизованным пользователям
      allow write: if request.auth != null;
    }
  }
}
```

## 📊 Структура данных

После первого запуска игры в Firestore автоматически создастся коллекция `scores` со структурой:

```json
{
  "playerName": "Имя игрока",
  "playerId": "telegram-user-id",
  "score": 250,
  "timestamp": "2024-01-15T10:30:00Z",
  "gameMode": "singleplayer"
}
```

## 🧪 Тестирование

1. Запустите проект: `npm run dev`
2. Сыграйте в игру
3. Проверьте, что рекорды сохраняются в Firebase Console
4. Проверьте лидерборд с тремя вкладками

## ⚠️ Важные замечания

- **API ключи** - Не публикуйте их в публичных репозиториях
- **Правила безопасности** - В продакшене настройте строгие правила
- **Лимиты** - Бесплатный план Firebase имеет ограничения на количество запросов
- **Регион** - Выбирайте ближайший к вашим пользователям регион

## 🆘 Решение проблем

### Ошибка "Permission denied"
- Проверьте правила безопасности Firestore
- Убедитесь, что база данных создана

### Ошибка "API key not valid"
- Проверьте правильность конфигурации
- Убедитесь, что приложение добавлено в проект

### Медленная загрузка
- Проверьте выбранный регион
- Убедитесь, что индексы созданы автоматически

## 📱 Интеграция с Telegram

После настройки Firebase:

1. Создайте бота через @BotFather
2. Настройте Mini App
3. Укажите URL вашего приложения
4. Протестируйте интеграцию

Удачи с настройкой! 🎲✨
