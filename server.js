// server.js - Kamraan Qais - WEB322 Assignment 3 - FINAL WORKING
require('dotenv').config();
require('pg');

const express = require('express');
const mongoose = require('mongoose');
const { Sequelize } = require('sequelize');
const session = require('client-sessions');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB error:', err));

// PostgreSQL (Neon) - Minimal config
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectModule: require('pg'),
  logging: false
});

sequelize.authenticate()
  .then(() => console.log('PostgreSQL connected'))
  .catch(err => console.log('PostgreSQL error:', err));

// Middleware
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

app.use(session({
  cookieName: 'session',
  secret: process.env.SESSION_SECRET || 'supersecret123',
  duration: 30 * 60 * 1000,
  activeDuration: 5 * 60 * 1000,
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production'
}));

app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

// Routes
app.use('/auth', require('./routes/auth'));
app.use('/tasks', require('./routes/tasks'));
app.use('/', require('./routes/index'));

// Error page
app.use((req, res) => {
  res.status(404).render('error', { message: 'Page Not Found' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;