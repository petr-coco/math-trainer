const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const db = require('./db');
const authRoutes = require('./routes/auth');
const friendsRoutes = require('./routes/friends');
const gameRoutes = require('./routes/game');

const app = express();

// CORS для продакшена
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? ['https://ваш-домен.рф', 'http://localhost:3000']
  : ['http://localhost:3000'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json());

// Маршруты
app.use('/api/auth', authRoutes);
app.use('/api/friends', friendsRoutes);
app.use('/api/game', gameRoutes);

// ========== ПОИСК ПОЛЬЗОВАТЕЛЕЙ ==========
app.get('/api/users/search', async (req, res) => {
  try {
    const { query } = req.query;
    const users = await db.allAsync(
      'SELECT id, username FROM users WHERE username LIKE ? AND is_guest = 0 LIMIT 10',
      [`%${query}%`]
    );
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== ТАБЛИЦА ЛИДЕРОВ ==========
app.get('/api/leaderboard', async (req, res) => {
  try {
    const rows = await db.allAsync(`
      SELECT 
        u.id,
        u.username,
        COALESCE(SUM(gs.score), 0) as total_score,
        COUNT(gs.id) as games_played
      FROM users u
      LEFT JOIN game_scores gs ON u.id = gs.user_id
      WHERE u.is_guest = 0
      GROUP BY u.id, u.username
      ORDER BY total_score DESC
      LIMIT 20
    `);
    res.json(rows);
  } catch (error) {
    console.error('❌ Ошибка лидеров:', error);
    res.status(500).json({ error: error.message });
  }
});

// ========== ДРУЗЬЯ ==========
app.get('/api/friends/list/:userId', async (req, res) => {
  try {
    const friends = await db.allAsync(`
      SELECT u.id, u.username 
      FROM friends f
      JOIN users u ON f.friend_id = u.id
      WHERE f.user_id = ? AND f.status = 'accepted'
    `, [req.params.userId]);
    res.json(friends);
  } catch (error) {
    res.json([]);
  }
});

app.get('/api/friends/requests/:userId', async (req, res) => {
  try {
    const requests = await db.allAsync(`
      SELECT f.id, u.username as fromName
      FROM friends f
      JOIN users u ON f.user_id = u.id
      WHERE f.friend_id = ? AND f.status = 'pending'
    `, [req.params.userId]);
    res.json(requests);
  } catch (error) {
    res.json([]);
  }
});

app.get('/api/friends/outgoing/:userId', async (req, res) => {
  try {
    const requests = await db.allAsync(`
      SELECT f.id, u.username as toName
      FROM friends f
      JOIN users u ON f.friend_id = u.id
      WHERE f.user_id = ? AND f.status = 'pending'
    `, [req.params.userId]);
    res.json(requests);
  } catch (error) {
    res.json([]);
  }
});

app.post('/api/friends/request', async (req, res) => {
  try {
    const { userId, friendName } = req.body;
    const friend = await db.getAsync('SELECT id FROM users WHERE username = ?', [friendName]);
    if (!friend) return res.status(404).json({ error: 'Пользователь не найден' });
    
    const existing = await db.getAsync(
      'SELECT * FROM friends WHERE user_id = ? AND friend_id = ?',
      [userId, friend.id]
    );
    if (existing) return res.status(400).json({ error: 'Заявка уже существует' });
    
    await db.runAsync(
      'INSERT INTO friends (user_id, friend_id, status) VALUES (?, ?, ?)',
      [userId, friend.id, 'pending']
    );
    res.json({ success: true, message: 'Заявка отправлена' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/friends/accept/:requestId', async (req, res) => {
  try {
    await db.runAsync(
      'UPDATE friends SET status = ? WHERE id = ?',
      ['accepted', req.params.requestId]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/friends/:userId/:friendId', async (req, res) => {
  try {
    await db.runAsync(
      'DELETE FROM friends WHERE user_id = ? AND friend_id = ?',
      [req.params.userId, req.params.friendId]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== ТРОФЕИ ПОЛЬЗОВАТЕЛЯ ==========
app.get('/api/trophies/:userId', async (req, res) => {
  try {
    const trophies = await db.allAsync(
      'SELECT trophy_id, trophy_name, earned_at FROM trophies WHERE user_id = ? ORDER BY earned_at DESC',
      [req.params.userId]
    );
    res.json(trophies);
  } catch (error) {
    console.error('❌ Ошибка получения трофеев:', error);
    res.json([]);
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  
  
});
