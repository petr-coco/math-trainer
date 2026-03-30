export const bots = [
  {
    id: 'rookie',
    name: '🤖 Новичок',
    avatar: '🟢',
    description: 'Только учится считать',
    speed: 3000,        
    accuracy: 0.6,      
    skillLevel: 1,      
    phraseWin: 'Повезло-повезло!',
    phraseLose: 'В следующий раз выиграю!'
  },
  {
    id: 'experienced',
    name: '⚙️ Опытный',
    avatar: '🔵',
    description: 'Уже многое умеет',
    speed: 2000,
    accuracy: 0.8,
    skillLevel: 2,
    phraseWin: 'Легко!',
    phraseLose: 'Хороший ход...'
  },
  {
    id: 'master',
    name: '🧠 Мастер',
    avatar: '🔴',
    description: 'Считает быстрее тени',
    speed: 1200,
    accuracy: 0.95,
    skillLevel: 3,
    phraseWin: 'Предсказуемо.',
    phraseLose: 'Ты достоин!'
  },
  {
    id: 'champion',
    name: '👑 Чемпион',
    avatar: '💀',
    description: 'Никто не побеждал его',
    speed: 600,
    accuracy: 0.99,
    skillLevel: 4,
    phraseWin: 'Ха! Слабовато...',
    phraseLose: 'НЕВОЗМОЖНО!!!'
  }
];

export const roundTypes = [
  {
    id: 'speed',
    name: '⚡ Скоростной',
    description: 'Кто быстрее решит',
    winScore: 10,
    loseScore: -5,
    timeLimit: 5000
  },
  {
    id: 'accuracy',
    name: '🎯 Точный',
    description: 'Цепочка из 3 примеров',
    winScore: 20,
    loseScore: -10
  },
  {
    id: 'hard',
    name: '💢 Сложный',
    description: 'Примеры повышенной сложности',
    winScore: 30,
    loseScore: -15
  },
  {
    id: 'allin',
    name: '🎲 Ва-банк',
    description: 'Удвоить или проиграть всё',
    multiplier: 2
  }
];

export const phrases = {
  start: ['Начинаем!', 'Погнали!', 'К бою!'],
  correct: ['Отлично!', 'В яблочко!', 'Есть!'],
  wrong: ['Ой...', 'Мимо!', 'Не угадал'],
  win: ['ПОБЕДА!', 'Ты лучший!', 'Красавчик!'],
  lose: ['Повезет в другой раз', 'Бот сильнее', 'Еще попытка']
};
