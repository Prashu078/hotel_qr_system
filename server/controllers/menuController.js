const db = require('../config/db');

// Get all menu items (with category name)
exports.getAllItems = (req, res) => {
  const query = `
    SELECT mi.item_id, mi.name, mi.price, mi.image, mi.is_available, mc.name AS category
    FROM menu_item mi
    JOIN menu_category mc ON mi.cat_id = mc.cat_id
     WHERE mi.is_available = 1
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// Get items by category
exports.getItemsByCategory = (req, res) => {
  const { catId } = req.params;
  db.query('SELECT * FROM menu_item WHERE cat_id = ?', [catId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// Add new item (admin use)
exports.addItem = (req, res) => {
  const { cat_id, name, price, image } = req.body;
  const query = 'INSERT INTO menu_item (cat_id, name, price, image) VALUES (?, ?, ?, ?)';
  db.query(query, [cat_id, name, price, image], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Item added', item_id: result.insertId });
  });
};

// Update item (admin use)
exports.updateItem = (req, res) => {
  const { id } = req.params;
  const { name, price, is_available } = req.body;
  const query = 'UPDATE menu_item SET name = ?, price = ?, is_available = ? WHERE item_id = ?';
  db.query(query, [name, price, is_available, id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Item updated' });
  });
};

// Delete item (admin use)
// Soft delete - item ko unavailable mark karo, order history preserve rahegi
exports.deleteItem = (req, res) => {
  const { id } = req.params;
  const query = 'UPDATE menu_item SET is_available = 0 WHERE item_id = ?';
  db.query(query, [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Item marked as unavailable' });
  });
};