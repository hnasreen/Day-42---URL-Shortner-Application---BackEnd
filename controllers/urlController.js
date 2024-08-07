// controllers/urlController.js
const Url = require('../models/Url');
const shortid = require('shortid');

// Shorten URL
exports.shortenUrl = async (req, res) => {
  const { longUrl } = req.body;

  try {
    const shortUrl = shortid.generate();
    const newUrl = new Url({ longUrl, shortUrl });
    await newUrl.save();

    res.status(200).json(newUrl);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Redirect to Long URL
exports.redirectUrl = async (req, res) => {
  const { shortUrl } = req.params;
  console.log("ShortUrl:",shortUrl)

  try {
    const url = await Url.findOne({ shortUrl });

    if (!url) {
      return res.status(404).json({ message: 'URL not found' });
    }

    url.clickCount++;
    await url.save();

    // res.status(200).redirect(url.longUrl);
    console.log("url:",url.longUrl)
    return res.status(200).redirect(url.longUrl);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get URL Stats
exports.getUrlStats = async (req, res) => {
  try {
    const urls = await Url.find().sort({ createdAt: -1 });

    res.status(200).json(urls);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get Daily URL Creation Count
exports.getDailyUrlCount = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const dailyCount = await Url.countDocuments({
      createdAt: { $gte: startOfDay, $lt: endOfDay }
    });

    res.json({ count: dailyCount });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch daily count' });
  }
};

// Get Monthly URL Creation Count
exports.getMonthlyUrlCount = async (req, res) => {
  try {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const endOfMonth = new Date();
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);
    endOfMonth.setDate(0);
    endOfMonth.setHours(23, 59, 59, 999);

    const monthlyCount = await Url.countDocuments({
      createdAt: { $gte: startOfMonth, $lt: endOfMonth }
    });

    res.json({ count: monthlyCount });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch monthly count' });
  }
};