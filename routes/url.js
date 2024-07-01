// routes/url.js
const express = require('express');
const { shortenUrl, redirectUrl, getUrlStats, getDailyUrlCount, getMonthlyUrlCount } = require('../controllers/urlController');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware')

router.post('/shorten', authMiddleware,shortenUrl);
router.get('/stats', authMiddleware,getUrlStats);
router.get('/:shortUrl',authMiddleware, redirectUrl);
router.get('/count/daily', authMiddleware,getDailyUrlCount);
router.get('/count/monthly', authMiddleware,getMonthlyUrlCount);

module.exports = router;