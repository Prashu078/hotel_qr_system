require('dotenv').config();
const express = require('express');
const cors = require('cors');

const db = require('./config/db');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/test', (req, res) => {
  res.json({ message: 'Server chal raha hai!' });
});

app.get('/api/test-db', (req, res) => {
  db.query('SELECT * FROM menu_item', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
