/*
STUDENT API:
    - This API serve the request of 'api/student/'
*/

const express = require('express');

const router = express.Router();
const { signup, login } = require('../controller/auth');

router.post('/signup', signup);
router.post('/login', login);

module.exports = router;