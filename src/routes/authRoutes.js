const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const authController = new AuthController();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/logout', authController.logout);

module.exports = router;
