const db = require('../config/db');

// Create new order (customer places order)
exports.createOrder = (req, res) => {
  const { table_id, items } = req.body; 
  // items = [{ item_id: 1, quantity: 2, price: 220 }, { item_id: 2, quantity: 1, price: 40 }]

  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'Cart is empty' });
  }

  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const orderQuery = 'INSERT INTO orders (table_id, total) VALUES (?, ?)';
  db.query(orderQuery, [table_id, total], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    const order_id = result.insertId;
    const orderItemsData = items.map(item => [order_id, item.item_id, item.quantity, item.price]);

    const itemQuery = 'INSERT INTO order_item (order_id, item_id, quantity, price) VALUES ?';
    db.query(itemQuery, [orderItemsData], (err2) => {
      if (err2) return res.status(500).json({ error: err2.message });
      res.json({ message: 'Order placed successfully', order_id, total });
    });
  });
};

// Get all orders (admin/kitchen use)
exports.getAllOrders = (req, res) => {
  const query = `
    SELECT o.order_id, o.table_id, t.table_no, o.status, o.total, o.created_at
    FROM orders o
    JOIN tables_master t ON o.table_id = t.table_id
    ORDER BY o.created_at DESC
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// Get single order with items (order details)
exports.getOrderById = (req, res) => {
  const { id } = req.params;
  const query = `
    SELECT oi.id, oi.quantity, oi.price, mi.name
    FROM order_item oi
    JOIN menu_item mi ON oi.item_id = mi.item_id
    WHERE oi.order_id = ?
  `;
  db.query(query, [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// Update order status (kitchen/admin use)
exports.updateOrderStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'pending' | 'preparing' | 'served'
  db.query('UPDATE orders SET status = ? WHERE order_id = ?', [status, id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Order status updated' });
  });
};

// Get orders by table (customer tracking)
exports.getOrdersByTable = (req, res) => {
  const { tableId } = req.params;
  db.query('SELECT * FROM orders WHERE table_id = ? ORDER BY created_at DESC', [tableId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};