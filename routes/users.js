const express = require('express');
const controller = require('../controllers/users');
const isAuth = require('../middlewares/isAuth');

const router = express.Router();

router.post('/auth', controller.createUser);
router.post('/login', controller.loginUser);
router.post('/logout', isAuth, controller.logout);

module.exports = router;
