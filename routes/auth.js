// routes/auth.js — FIXED FOR SERVERLESS
const express = require('express');
const router = express.Router();

// Lazy-load User model
let User = null;
const initMongoose = async () => {
  if (!User) {
    const mongoose = require('mongoose');
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    User = require('../models/user');
  }
  return User;
};

router.get('/login', (req, res) => {
  if (req.session.user) return res.redirect('/dashboard');
  res.render('login', { title: 'Login' });
});

router.post('/login', async (req, res) => {
  try {
    const UserModel = await initMongoose();
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.render('login', { title: 'Login', error: 'Invalid credentials' });
    }
    req.session.user = { id: user._id, username: user.username, email: user.email };
    res.redirect('/dashboard');
  } catch (err) {
    console.error('Login error:', err);
    res.render('login', { title: 'Login', error: 'Login failed' });
  }
});

router.get('/register', (req, res) => {
  if (req.session.user) return res.redirect('/dashboard');
  res.render('register', { title: 'Register' });
});

router.post('/register', async (req, res) => {
  try {
    const UserModel = await initMongoose();
    const { username, email, password } = req.body;
    if (await UserModel.findOne({ $or: [{ email }, { username }] })) {
      return res.render('register', { title: 'Register', error: 'User already exists' });
    }
    await UserModel.create({ username, email, password });
    res.redirect('/login?success=Account created! Please login');
  } catch (err) {
    console.error('Register error:', err);
    res.render('register', { title: 'Register', error: 'Registration failed' });
  }
});

router.get('/dashboard', (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  res.render('dashboard', { title: 'Dashboard' });
});

router.get('/logout', (req, res) => {
  req.session.reset();
  res.redirect('/login');
});

module.exports = router;