const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const router = express.Router();

// Login GET
router.get('/login', (req, res) => {
    res.render('login', { 
        title: 'Login', 
        user: req.session.user || null, 
        error: null 
    });
});

// Login POST
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user || !(await user.comparePassword(password))) {
            return res.render('login', { 
                title: 'Login', 
                user: req.session.user || null, 
                error: 'Invalid email or password' 
            });
        }

        req.session.user = {
            id: user._id.toString(),
            username: user.username,
            email: user.email
        };

        res.redirect('/dashboard');
    } catch (err) {
        console.error(err);
        res.render('login', { 
            title: 'Login', 
            user: req.session.user || null, 
            error: 'Login failed. Try again.' 
        });
    }
});

// Register GET
router.get('/register', (req, res) => {
    res.render('register', { 
        title: 'Register', 
        user: req.session.user || null, 
        errors: [], 
        userData: {} 
    });
});

// Register POST
router.post('/register', async (req, res) => {
  const { username, email, password, confirmPassword } = req.body;

  if (!username || !email || !password) {
    return res.render('register', { error: 'All fields are required', username, email });
  }
  if (password !== confirmPassword) {
    return res.render('register', { error: 'Passwords do not match', username, email });
  }
  if (password.length < 6) {
    return res.render('register', { error: 'Password must be at least 6 characters', username, email });
  }

  try {
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.render('register', { error: 'User already exists', username, email });
    }

    const hashedPassword = await require('bcryptjs').hash(password, 10);

    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    res.redirect('/auth/login?success=Registered successfully! Please login.');
  } catch (err) {
    console.error('Register error:', err);
    res.render('register', { error: 'Registration failed. Try again.', username, email });
  }
});

// Logout
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/auth/login');
});

module.exports = router;