const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');
const authMiddleware = require('../middleware/auth');

router.get('/question/:mode', gameController.getQuestion);
router.post('/save', authMiddleware, gameController.saveResult);
router.get('/stats/:userId', gameController.getStats);
router.get('/leaderboard', gameController.getLeaderboard);
// Новый эндпоинт для дуэлей
router.post('/duel/result', authMiddleware, gameController.saveDuelResult);
router.get('/duel/stats/:userId', authMiddleware, gameController.getDuelStats);

module.exports = router;
