// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const urlRoutes = require('./routes/url');
const dotenv=require('dotenv')
const cookieParser = require('cookie-parser');

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());



mongoose.connect(process.env.MONGODB_URL)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

  app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/url', urlRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));