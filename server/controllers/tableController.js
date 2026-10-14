const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');

// Add new table
exports.addTable = (req, res) => {
  const { table_no } = req.body;
  const qr_token = uuidv4();
  const query = 'INSERT INTO tables_master (table_no, qr_token) VALUES (?, ?)';
  db.query(query, [table_no, qr_token], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Table added', table_id: result.insertId, qr_token });
  });
};

// Get all tables
exports.getAllTables = (req, res) => {
  db.query('SELECT * FROM tables_master', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// Generate QR code image for a table
exports.generateQR = (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM tables_master WHERE table_id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Table not found' });

    const table = results[0];
    const menuUrl = `http://localhost:3000/menu?table=${table.table_id}&token=${table.qr_token}`;

    QRCode.toDataURL(menuUrl, (err, qrImage) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ table_no: table.table_no, menuUrl, qrImage });
    });
  });
};

// Verify table when QR scan hoti hai (customer side)
exports.getTableByToken = (req, res) => {
  const { token } = req.params;
  db.query('SELECT * FROM tables_master WHERE qr_token = ?', [token], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Invalid table token' });
    res.json(results[0]);
  });
};