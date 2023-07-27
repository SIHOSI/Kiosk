const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const userController = new UserController();

// 상품 옵션 추가 API
router.post('/orders', userController.addOrderOption);

module.exports = router;
