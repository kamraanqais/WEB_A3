// routes/auth.js - FINAL VERSION - WORKS ON VERCEL
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Register GET
router.get('/register', (req, res) => {
  res.render('register', { error: null, username: '', email: '' });
});

// Register POST - GUARANTEED WORKING
router.post('/register', async (req, res) => {
  const { username, email, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return res.render('register', { error: 'Passwords do not match', username, email });
  }

  try {
    const existing = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username }]
    });

    if (existing) {
      return res.render('register', { error: 'User already exists', username, email });
    }

    const hashed = bcrypt.hashSync(password, 10);
    await User.create({
      username,
      email: email.toLowerCase(),
      password: hashed
    });

    res.redirect('/auth/login?msg=Registered! Please login.');
  } catch (err) {
    console.log('Register error:', err);
    res.render('error', { message: 'Registration failed. Try again.' });
  }
});

// Login GET
router.get('/login', (req, res) => {
  res.render('login', { error: null });
});

// Login POST
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.render('login', { error: 'Invalid email or password' });
    }

    req.session.user = { id: user._id, username: user.username, email: user.email };
    res.redirect('/tasks');
  } catch (err) {
    res.render('error', { message: 'Login failed' });
  }
});

router.get('/logout', (req, res) => {
  req.session.reset();
  res.redirect('/');
});

module.exports = router;