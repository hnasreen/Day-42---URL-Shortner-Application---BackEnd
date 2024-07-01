// routes/url.js
const express = require('express');
const { shortenUrl, redirectUrl, getUrlStats, getDailyUrlCount, getMonthlyUrlCount } = require('../controllers/urlController');
const router = express.Router();

router.post('/shorten', shortenUrl);
router.get('/stats', getUrlStats);
router.get('/:shortUrl', redirectUrl);
router.get('/count/daily', getDailyUrlCount);
router.get('/count/monthly', getMonthlyUrlCount);

module.exports = router;