const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const userController = new UserController();

// 주문 API
router.post('/orders', userController.createOrder);

// 최종 주문 API
router.post('/orders/:orderId', userController.completeOrder);

// 주문 취소 API
router.post('/orders/:orderId/cancel', userController.cancelOrder);

module.exports = router;
