const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

// Регистрация
exports.register = async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ error: 'Заполните все поля' });
        }
        
        // Проверяем, есть ли уже такой пользователь
        const existing = await db.getAsync('SELECT * FROM users WHERE username = ?', [username]);
        
        if (existing) {
            return res.status(400).json({ error: 'Имя уже занято' });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const result = await db.runAsync(
            'INSERT INTO users (username, password, is_guest) VALUES (?, ?, ?)',
            [username, hashedPassword, 0]
        );
        
        const newUser = {
            id: result.lastID,
            username,
            isGuest: false
        };
        
        const token = jwt.sign(
            { id: newUser.id, username: newUser.username },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        res.json({ 
            success: true, 
            user: newUser,
            token 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

// Вход
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        
        const user = await db.getAsync('SELECT * FROM users WHERE username = ?', [username]);
        
        if (!user) {
            return res.status(401).json({ error: 'Неверный логин или пароль' });
        }
        
        const validPassword = await bcrypt.compare(password, user.password);
        
        if (!validPassword) {
            return res.status(401).json({ error: 'Неверный логин или пароль' });
        }
        
        const token = jwt.sign(
            { id: user.id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        res.json({ 
            success: true, 
            user: {
                id: user.id,
                username: user.username,
                isGuest: false
            },
            token 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

// Получить профиль
exports.getProfile = async (req, res) => {
    try {
        const user = await db.getAsync('SELECT * FROM users WHERE id = ?', [req.user.id]);
        
        if (!user) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }
        
        // Получаем статистику игр
        const stats = await db.getAsync(`
            SELECT 
                COUNT(*) as games,
                SUM(score) as score,
                SUM(correct) as correct,
                SUM(total) as total
            FROM game_scores 
            WHERE user_id = ?
        `, [user.id]);
        
        res.json({
            id: user.id,
            username: user.username,
            isGuest: false,
            stats: {
                score: stats?.score || 0,
                games: stats?.games || 0,
                correct: stats?.correct || 0,
                total: stats?.total || 0
            },
            createdAt: user.created_at
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};
