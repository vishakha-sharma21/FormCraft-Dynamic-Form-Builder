// routes/auth.js - Authentication routes
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db/db');

require('dotenv').config();

const router = express.Router();

// Input validation middleware
const validateInput = (req, res, next) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address' });
  }
  
  // Password length validation
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long' });
  }
  
  next();
};

// Middleware to authenticate JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

// Sign up
router.post('/signup', validateInput, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user already exists
    const [users] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (users.length > 0) {
      return res.status(409).json({ error: 'User already exists with this email' });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Insert new user
    const [result] = await db.execute(
      'INSERT INTO users (email, password, created_at) VALUES (?, ?, NOW())', 
      [email, hashedPassword]
    );

    // Generate JWT token for immediate login
    const token = jwt.sign(
      { 
        id: result.insertId, 
        email: email 
      }, 
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({ 
      message: 'User created successfully',
      token,
      user: {
        id: result.insertId,
        email: email
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Sign in
router.post('/signin', validateInput, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    const user = users[0];
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email 
      }, 
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Update last login
    await db.execute(
      'UPDATE users SET last_login = NOW() WHERE id = ?', 
      [user.id]
    );

    res.json({ 
      message: 'Login successful', 
      token,
      user: {
        id: user.id,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user profile (protected route)
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const [users] = await db.execute(
      'SELECT id, email, created_at, last_login FROM users WHERE id = ?', 
      [req.user.id]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ user: users[0] });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Change password (protected route)
router.post('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long' });
    }

    // Get current user
    const [users] = await db.execute('SELECT password FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found. Please Sign Up first.' });
    }

    // Verify current password
    const validPassword = await bcrypt.compare(currentPassword, users[0].password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);
    
    // Update password
    await db.execute('UPDATE users SET password = ? WHERE id = ?', [hashedNewPassword, req.user.id]);

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;