require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use('/auth', require('./routes/auth'));
app.use('/entries', require('./routes/entries'));
app.use('/tags', require('./routes/tags'));
app.use('/recommendation', require('./routes/recommendation'));
app.use('/ui-reaction', require('./routes/uiReaction'));
app.use('/analyze-emotion', require('./routes/analyzeEmotion'));
app.use('/stats', require('./routes/stats'));

app.use((req, res) => res.status(404).json({ error: 'Not found' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;
