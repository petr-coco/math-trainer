const express = require('express');
const router = express.Router();
const friendsController = require('../controllers/friendsController');
const authMiddleware = require('../middleware/auth');

// Все маршруты требуют авторизации
router.post('/request', authMiddleware, friendsController.sendRequest);
router.post('/accept/:requestId', authMiddleware, friendsController.acceptRequest);
router.post('/reject/:requestId', authMiddleware, friendsController.rejectRequest);
router.get('/requests', authMiddleware, friendsController.getRequests);
router.get('/list', authMiddleware, friendsController.getFriends);
router.delete('/:friendId', authMiddleware, friendsController.removeFriend);

module.exports = router;
