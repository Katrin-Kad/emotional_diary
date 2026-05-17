const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');

const AB_COOKIE_OPTIONS = {
  secure: process.env.COOKIE_SECURE === 'true',
  sameSite: 'Lax',
  maxAge: 365 * 24 * 60 * 60 * 1000,
  path: '/',
};

exports.register = async (req, res) => {
  const { email, password, name, gender } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  try {
    const existing = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length) return res.status(409).json({ error: 'Email already exists' });

    const password_hash = await bcrypt.hash(password, 10);
    const result = await db.query(
      'INSERT INTO users (email, password_hash, name, gender) VALUES ($1, $2, $3, $4) RETURNING id, email, name, gender',
      [email, password_hash, name || null, gender || null]
    );
    const user = result.rows[0];

    const ab_variant = user.id % 2 === 0 ? 'b' : 'a';
    await db.query('UPDATE users SET ab_variant = $1 WHERE id = $2', [ab_variant, user.id]);

    res.cookie('ab', ab_variant, AB_COOKIE_OPTIONS);
    res.status(201).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  try {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === 'true',
      sameSite: 'Lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.cookie('ab', user.ab_variant, AB_COOKIE_OPTIONS);
    res.json({ message: 'Logged in', name: user.name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.logout = (req, res) => {
  res.cookie('token', '', { httpOnly: true, maxAge: 0 });
  res.json({ message: 'Logged out' });
};
