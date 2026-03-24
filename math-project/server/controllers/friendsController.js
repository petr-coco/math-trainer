const db = require('../db');

// Отправить заявку в друзья
exports.sendRequest = async (req, res) => {
  try {
    const { friendName } = req.body;
    const userId = req.user.id;
    
    // Находим друга по имени
    const friend = await db.getAsync('SELECT id FROM users WHERE username = ?', [friendName]);
    
    if (!friend) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    if (userId === friend.id) {
      return res.status(400).json({ error: 'Нельзя добавить себя' });
    }
    
    // Проверяем существующую заявку
    const existing = await db.getAsync(
      'SELECT * FROM friends WHERE user_id = ? AND friend_id = ?',
      [userId, friend.id]
    );
    
    if (existing) {
      if (existing.status === 'pending') {
        return res.status(400).json({ error: 'Заявка уже отправлена' });
      }
      if (existing.status === 'accepted') {
        return res.status(400).json({ error: 'Уже в друзьях' });
      }
    }
    
    // Проверяем, не отправлял ли друг заявку нам
    const reverseRequest = await db.getAsync(
      'SELECT * FROM friends WHERE user_id = ? AND friend_id = ?',
      [friend.id, userId]
    );
    
    if (reverseRequest && reverseRequest.status === 'pending') {
      // Если друг уже отправил заявку, автоматически принимаем её
      await db.runAsync(
        'UPDATE friends SET status = ? WHERE user_id = ? AND friend_id = ?',
        ['accepted', friend.id, userId]
      );
      
      // Добавляем зеркальную запись
      await db.runAsync(
        'INSERT INTO friends (user_id, friend_id, status) VALUES (?, ?, ?)',
        [userId, friend.id, 'accepted']
      );
      
      return res.json({ success: true, message: 'Друг добавлен!', autoAccepted: true });
    }
    
    // Создаем новую заявку
    await db.runAsync(
      'INSERT INTO friends (user_id, friend_id, status) VALUES (?, ?, ?)',
      [userId, friend.id, 'pending']
    );
    
    res.json({ success: true, message: 'Заявка отправлена' });
    
  } catch (error) {
    console.error('❌ Ошибка отправки заявки:', error);
    res.status(500).json({ error: error.message });
  }
};

// Принять заявку
exports.acceptRequest = async (req, res) => {
  try {
    const requestId = parseInt(req.params.requestId);
    const userId = req.user.id;
    
    // Находим заявку
    const request = await db.getAsync(
      'SELECT * FROM friends WHERE id = ?',
      [requestId]
    );
    
    if (!request) {
      return res.status(404).json({ error: 'Заявка не найдена' });
    }
    
    if (request.friend_id !== userId) {
      return res.status(403).json({ error: 'Это не ваша заявка' });
    }
    
    if (request.status !== 'pending') {
      return res.status(400).json({ error: 'Заявка уже обработана' });
    }
    
    // Обновляем статус заявки
    await db.runAsync(
      'UPDATE friends SET status = ? WHERE id = ?',
      ['accepted', requestId]
    );
    
    // Создаем зеркальную запись для друга
    await db.runAsync(
      'INSERT INTO friends (user_id, friend_id, status) VALUES (?, ?, ?)',
      [userId, request.user_id, 'accepted']
    );
    
    res.json({ success: true });
    
  } catch (error) {
    console.error('❌ Ошибка принятия заявки:', error);
    res.status(500).json({ error: error.message });
  }
};

// Отклонить заявку
exports.rejectRequest = async (req, res) => {
  try {
    const requestId = parseInt(req.params.requestId);
    const userId = req.user.id;
    
    const request = await db.getAsync(
      'SELECT * FROM friends WHERE id = ?',
      [requestId]
    );
    
    if (!request) {
      return res.status(404).json({ error: 'Заявка не найдена' });
    }
    
    if (request.friend_id !== userId) {
      return res.status(403).json({ error: 'Это не ваша заявка' });
    }
    
    // Удаляем заявку
    await db.runAsync('DELETE FROM friends WHERE id = ?', [requestId]);
    
    res.json({ success: true });
    
  } catch (error) {
    console.error('❌ Ошибка отклонения заявки:', error);
    res.status(500).json({ error: error.message });
  }
};

// Получить список входящих заявок
exports.getRequests = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const requests = await db.allAsync(`
      SELECT 
        f.id,
        u.id as fromId,
        u.username as fromName,
        f.created_at as date
      FROM friends f
      JOIN users u ON f.user_id = u.id
      WHERE f.friend_id = ? AND f.status = 'pending'
    `, [userId]);
    
    res.json(requests);
    
  } catch (error) {
    console.error('❌ Ошибка получения заявок:', error);
    res.status(500).json({ error: error.message });
  }
};

// Получить список друзей
exports.getFriends = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const friends = await db.allAsync(`
      SELECT 
        u.id,
        u.username,
        COALESCE(SUM(gs.score), 0) as total_score,
        COUNT(gs.id) as games_played
      FROM friends f
      JOIN users u ON f.friend_id = u.id
      LEFT JOIN game_scores gs ON u.id = gs.user_id
      WHERE f.user_id = ? AND f.status = 'accepted'
      GROUP BY u.id
      ORDER BY u.username
    `, [userId]);
    
    res.json(friends);
    
  } catch (error) {
    console.error('❌ Ошибка получения друзей:', error);
    res.json([]);
  }
};

// Удалить из друзей
exports.removeFriend = async (req, res) => {
  try {
    const friendId = parseInt(req.params.friendId);
    const userId = req.user.id;
    
    // Удаляем запись, где пользователь = userId, друг = friendId
    await db.runAsync(
      'DELETE FROM friends WHERE user_id = ? AND friend_id = ?',
      [userId, friendId]
    );
    
    // Удаляем зеркальную запись, где пользователь = friendId, друг = userId
    await db.runAsync(
      'DELETE FROM friends WHERE user_id = ? AND friend_id = ?',
      [friendId, userId]
    );
    
    res.json({ success: true });
    
  } catch (error) {
    console.error('❌ Ошибка удаления друга:', error);
    res.status(500).json({ error: error.message });
  }
};
