const db = require('../db');

// Все возможные трофеи с порогами
const TROPHIES = {
  tower: [
    { id: 'tower_5', name: 'Новичок', desc: 'Достиг 5 этажа в Башне', threshold: 5 },
    { id: 'tower_10', name: 'Высотник', desc: 'Достиг 10 этажа в Башне', threshold: 10 },
    { id: 'tower_20', name: 'Строитель', desc: 'Достиг 20 этажа в Башне', threshold: 20 },
    { id: 'tower_35', name: 'Архитектор', desc: 'Достиг 35 этажа в Башне', threshold: 35 },
    { id: 'tower_50', name: 'Легенда', desc: 'Достиг 50 этажа в Башне', threshold: 50 },
    { id: 'tower_100', name: 'Небоскрёб', desc: 'Достиг 100 этажа в Башне', threshold: 100 }
  ],
  sprint: [
    { id: 'sprint_100', name: 'Разминка', desc: 'Набрал 100 очков в Спринте', threshold: 100 },
    { id: 'sprint_300', name: 'Спринтер', desc: 'Набрал 300 очков в Спринте', threshold: 300 },
    { id: 'sprint_500', name: 'Ускоритель', desc: 'Набрал 500 очков в Спринте', threshold: 500 },
    { id: 'sprint_800', name: 'Вихрь', desc: 'Набрал 800 очков в Спринте', threshold: 800 },
    { id: 'sprint_1000', name: 'Ураган', desc: 'Набрал 1000 очков в Спринте', threshold: 1000 },
    { id: 'sprint_1500', name: 'Молния', desc: 'Набрал 1500 очков в Спринте', threshold: 1500 }
  ],
  duel: [
    { id: 'duel_first', name: 'Первый бой', desc: 'Выиграл первую дуэль', threshold: 1 },
    { id: 'duel_5', name: 'Победитель', desc: 'Выиграл 5 дуэлей', threshold: 5 },
    { id: 'duel_10', name: 'Чемпион', desc: 'Выиграл 10 дуэлей', threshold: 10 },
    { id: 'duel_25', name: 'Гладиатор', desc: 'Выиграл 25 дуэлей', threshold: 25 },
    { id: 'duel_50', name: 'Непобедимый', desc: 'Выиграл 50 дуэлей', threshold: 50 },
    { id: 'duel_master', name: 'Мастер дуэлей', desc: 'Победил всех ботов', threshold: 'all_bots' }
  ]
};

// Получить вопрос
// В controllers/gameController.js

// Получить вопрос
exports.getQuestion = (req, res) => {
  try {
    const { mode } = req.params;
    const level = parseInt(req.query.level) || 1;
    
    let question, answer;
    
    // Для башни максимальные числа растут с уровнем до 100 этажа
    let maxNum = 10;
    if (mode === 'tower') {
      // На 100 этаже числа могут быть до 30-40
      maxNum = Math.min(5 + Math.floor(level / 2), 40);
    } else if (mode === 'sprint') {
      maxNum = Math.min(8 + Math.floor(level / 3), 25);
    } else if (mode === 'duel') {
      maxNum = Math.min(12 + level, 20);
    }
    
    const num1 = Math.floor(Math.random() * maxNum) + 1;
    const num2 = Math.floor(Math.random() * maxNum) + 1;
    
    // Вероятность сложных операций растет с уровнем
    let ops = ['+'];
    if (level >= 5) ops = ['+', '-'];
    if (level >= 15) ops = ['+', '-', '×'];
    if (level >= 30) ops = ['+', '-', '×', '÷'];
    
    const op = ops[Math.floor(Math.random() * ops.length)];
    
    switch(op) {
      case '+':
        question = `${num1} + ${num2}`;
        answer = num1 + num2;
        break;
      case '-':
        if (num1 >= num2) {
          question = `${num1} - ${num2}`;
          answer = num1 - num2;
        } else {
          question = `${num2} - ${num1}`;
          answer = num2 - num1;
        }
        break;
      case '×':
        question = `${num1} × ${num2}`;
        answer = num1 * num2;
        break;
      case '÷':
        const product = num1 * num2;
        question = `${product} ÷ ${num1}`;
        answer = num2;
        break;
      default:
        question = `${num1} + ${num2}`;
        answer = num1 + num2;
    }
    
    
    res.json({ question, answer });
    
  } catch (error) {
    console.error('❌ Ошибка генерации вопроса:', error);
    res.status(500).json({ error: error.message });
  }
};

// Сохранить результат и проверить трофеи
exports.saveResult = async (req, res) => {
  try {
    const { userId, mode, score, level, correct, total } = req.body;
    
    
    
    // Сохраняем результат игры
    await db.runAsync(
      'INSERT INTO game_scores (user_id, game_type, score, level, correct, total) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, mode, score, level || 1, correct || 0, total || 0]
    );
    
    // Проверяем и выдаем трофеи
    const newTrophies = await checkAndAwardTrophies(userId, mode, score, level);
    
    res.json({ 
      success: true, 
      newTrophies: newTrophies 
    });
    
  } catch (error) {
    console.error('❌ Ошибка сохранения:', error);
    res.status(500).json({ error: error.message });
  }
};

// Проверка и выдача трофеев
async function checkAndAwardTrophies(userId, mode, score, level) {
  const awardedTrophies = [];
  
  // Получаем уже имеющиеся трофеи
  const earned = await db.allAsync(
    'SELECT trophy_id FROM trophies WHERE user_id = ?',
    [userId]
  );
  const earnedIds = earned.map(e => e.trophy_id);
  
  // Проверяем трофеи для данного режима
  const modeTrophies = TROPHIES[mode] || [];
  
  for (const trophy of modeTrophies) {
    if (earnedIds.includes(trophy.id)) continue;
    
    let earned = false;
    
    if (mode === 'tower') {
      // Для башни проверяем достигнутый этаж
      earned = level >= trophy.threshold;
    } 
    else if (mode === 'sprint') {
      // Для спринта проверяем набранные очки
      earned = score >= trophy.threshold;
    }
    else if (mode === 'duel') {
      // Для дуэли проверяем количество побед
      if (trophy.threshold === 'all_bots') {
        // Специальный трофей за победу над всеми ботами
        const winsCount = await db.getAsync(
          'SELECT COUNT(*) as count FROM duel_wins WHERE user_id = ? AND bot_id IN (?, ?, ?, ?)',
          [userId, 'rookie', 'experienced', 'master', 'champion']
        );
        earned = winsCount.count === 4;
      } else {
        const duelStats = await db.getAsync(
          'SELECT wins FROM duel_stats WHERE user_id = ?',
          [userId]
        );
        earned = (duelStats?.wins || 0) >= trophy.threshold;
      }
    }
    
    if (earned) {
      await db.runAsync(
        'INSERT INTO trophies (user_id, trophy_id, trophy_name) VALUES (?, ?, ?)',
        [userId, trophy.id, trophy.name]
      );
      awardedTrophies.push(trophy);
      
    }
  }
  
  return awardedTrophies;
}

// Сохранить результат дуэли
exports.saveDuelResult = async (req, res) => {
  try {
    const { userId, botId, won } = req.body;
    
    // Сохраняем результат дуэли
    await db.runAsync(
      'INSERT INTO duel_wins (user_id, bot_id, won, played_at) VALUES (?, ?, ?, ?)',
      [userId, botId, won ? 1 : 0, new Date().toISOString()]
    );
    
    // Обновляем общую статистику дуэлей
    const duelStats = await db.getAsync(
      'SELECT * FROM duel_stats WHERE user_id = ?',
      [userId]
    );
    
    if (duelStats) {
      await db.runAsync(
        'UPDATE duel_stats SET wins = ?, total = ? WHERE user_id = ?',
        [duelStats.wins + (won ? 1 : 0), duelStats.total + 1, userId]
      );
    } else {
      await db.runAsync(
        'INSERT INTO duel_stats (user_id, wins, total) VALUES (?, ?, ?)',
        [userId, won ? 1 : 0, 1]
      );
    }
    
    // Проверяем трофеи для дуэли
    const newTrophies = await checkAndAwardTrophies(userId, 'duel', 0, 0);
    
    res.json({ 
      success: true, 
      newTrophies: newTrophies 
    });
    
  } catch (error) {
    console.error('❌ Ошибка сохранения дуэли:', error);
    res.status(500).json({ error: error.message });
  }
};

// Получить статистику дуэлей
exports.getDuelStats = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    const duelStats = await db.getAsync(
      'SELECT wins, total FROM duel_stats WHERE user_id = ?',
      [userId]
    );
    
    const botWins = await db.allAsync(
      'SELECT bot_id, COUNT(*) as wins FROM duel_wins WHERE user_id = ? AND won = 1 GROUP BY bot_id',
      [userId]
    );
    
    res.json({
      wins: duelStats?.wins || 0,
      total: duelStats?.total || 0,
      botWins: botWins
    });
    
  } catch (error) {
    console.error('❌ Ошибка статистики дуэлей:', error);
    res.json({ wins: 0, total: 0, botWins: [] });
  }
};

// Получить статистику
exports.getStats = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    const stats = await db.getAsync(`
      SELECT 
        COUNT(*) as games,
        SUM(score) as score,
        SUM(correct) as correct,
        SUM(total) as total,
        MAX(CASE WHEN game_type = 'tower' THEN level ELSE 0 END) as max_tower_level,
        MAX(CASE WHEN game_type = 'sprint' THEN score ELSE 0 END) as max_sprint_score
      FROM game_scores 
      WHERE user_id = ?
    `, [userId]);
    
    const history = await db.allAsync(`
      SELECT game_type as mode, score, correct, total, level, played_at as date
      FROM game_scores 
      WHERE user_id = ?
      ORDER BY played_at DESC 
      LIMIT 10
    `, [userId]);
    
    res.json({
      stats: {
        score: stats?.score || 0,
        games: stats?.games || 0,
        correct: stats?.correct || 0,
        total: stats?.total || 0,
        maxTowerLevel: stats?.max_tower_level || 0,
        maxSprintScore: stats?.max_sprint_score || 0
      },
      history: history || []
    });
    
  } catch (error) {
    console.error('Ошибка:', error);
    res.status(500).json({ 
      stats: { score: 0, games: 0, correct: 0, total: 0 },
      history: [] 
    });
  }
};

// Таблица лидеров
exports.getLeaderboard = async (req, res) => {
  try {
    const rows = await db.allAsync(`
      SELECT 
        u.id,
        u.username,
        COALESCE(SUM(gs.score), 0) as total_score,
        COUNT(gs.id) as games_played,
        MAX(CASE WHEN gs.game_type = 'tower' THEN gs.level ELSE 0 END) as best_tower
      FROM users u
      LEFT JOIN game_scores gs ON u.id = gs.user_id
      WHERE u.is_guest = 0
      GROUP BY u.id
      ORDER BY total_score DESC
      LIMIT 20
    `);
    res.json(rows);
  } catch (error) {
    console.error('Ошибка:', error);
    res.status(500).json({ error: error.message });
  }
};
