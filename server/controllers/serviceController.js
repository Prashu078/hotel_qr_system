const db = require('../config/db');

// Create a service request (customer side - Call Waiter, Request Bill, etc.)
exports.createRequest = (req, res) => {
  const { table_id, type } = req.body; // type: 'waiter' | 'bill' | 'water' etc.

  if (!table_id || !type) {
    return res.status(400).json({ error: 'table_id and type are required' });
  }

  const query = 'INSERT INTO service_request (table_id, type) VALUES (?, ?)';
  db.query(query, [table_id, type], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Request sent', req_id: result.insertId });
  });
};

// Get all pending requests (admin/staff view)
exports.getAllRequests = (req, res) => {
  const query = `
    SELECT sr.req_id, sr.table_id, t.table_no, sr.type, sr.status, sr.created_at
    FROM service_request sr
    JOIN tables_master t ON sr.table_id = t.table_id
    ORDER BY sr.created_at DESC
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// Update request status (staff marks it as done)
exports.updateRequestStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'pending' | 'done'
  db.query('UPDATE service_request SET status = ? WHERE req_id = ?', [status, id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Request status updated' });
  });
};