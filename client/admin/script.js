const API_BASE = 'http://localhost:5000/api';

// ===== TAB SWITCHING =====
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).classList.add('active');

    // Tab khulte hi fresh data load karo
    if (btn.dataset.tab === 'menuTab') loadMenu();
    if (btn.dataset.tab === 'tableTab') loadTables();
    if (btn.dataset.tab === 'ordersTab') loadOrders();
  });
});

// ===================== MENU =====================

async function loadMenu() {
  try {
    const res = await fetch(`${API_BASE}/menu`);
    const items = await res.json();

    const container = document.getElementById('menuList');
    container.innerHTML = '';

    items.forEach(item => {
      const div = document.createElement('div');
      div.className = 'item-card';
      div.innerHTML = `
        <div>
          <strong>${item.name}</strong> (${item.category || 'No category'})<br>
          ₹${item.price}
        </div>
        <div>
          <button class="delete-btn" onclick="deleteItem(${item.item_id})">Delete</button>
        </div>
      `;
      container.appendChild(div);
    });
  } catch (err) {
    console.error(err);
    document.getElementById('menuList').innerHTML = '<p>Failed to load menu</p>';
  }
}

document.getElementById('addItemForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('itemName').value;
  const price = document.getElementById('itemPrice').value;
  const cat_id = document.getElementById('itemCatId').value;

  try {
    const res = await fetch(`${API_BASE}/menu`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, price, cat_id, image: '' })
    });
    const data = await res.json();

    if (res.ok) {
      alert('Item added successfully');
      e.target.reset();
      loadMenu();
    } else {
      alert('Error: ' + data.error);
    }
  } catch (err) {
    console.error(err);
    alert('Failed to add item');
  }
});

async function deleteItem(id) {
  if (!confirm('Delete this item?')) return;

  try {
    const res = await fetch(`${API_BASE}/menu/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (res.ok) {
      loadMenu();
    } else {
      alert('Error: ' + data.error);
    }
  } catch (err) {
    console.error(err);
    alert('Failed to delete item');
  }
}

// ===================== TABLES & QR =====================

async function loadTables() {
  try {
    const res = await fetch(`${API_BASE}/tables`);
    const tables = await res.json();

    const container = document.getElementById('tableList');
    container.innerHTML = '';

    tables.forEach(table => {
      const div = document.createElement('div');
      div.className = 'table-card';
      div.innerHTML = `
        <div><strong>Table ${table.table_no}</strong></div>
        <div>
          <button class="qr-btn" onclick="showQR(${table.table_id})">Show QR</button>
        </div>
      `;
      container.appendChild(div);
    });
  } catch (err) {
    console.error(err);
    document.getElementById('tableList').innerHTML = '<p>Failed to load tables</p>';
  }
}

document.getElementById('addTableForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const table_no = document.getElementById('tableNo').value;

  try {
    const res = await fetch(`${API_BASE}/tables`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ table_no })
    });
    const data = await res.json();

    if (res.ok) {
      alert('Table added successfully');
      e.target.reset();
      loadTables();
    } else {
      alert('Error: ' + data.error);
    }
  } catch (err) {
    console.error(err);
    alert('Failed to add table');
  }
});

async function showQR(tableId) {
  try {
    const res = await fetch(`${API_BASE}/tables/${tableId}/qr`);
    const data = await res.json();

    document.getElementById('qrTableNo').textContent = `Table ${data.table_no}`;
    document.getElementById('qrImageDisplay').src = data.qrImage;
    document.getElementById('qrUrlText').textContent = data.menuUrl;
    document.getElementById('qrModal').classList.remove('hidden');
  } catch (err) {
    console.error(err);
    alert('Failed to load QR code');
  }
}

document.getElementById('closeQrBtn').addEventListener('click', () => {
  document.getElementById('qrModal').classList.add('hidden');
});

// ===================== ORDERS =====================

async function loadOrders() {
  try {
    const res = await fetch(`${API_BASE}/orders`);
    const orders = await res.json();

    const container = document.getElementById('orderList');
    container.innerHTML = '';

    if (orders.length === 0) {
      container.innerHTML = '<p>No orders yet</p>';
      return;
    }

    orders.forEach(order => {
      const div = document.createElement('div');
      div.className = 'order-card';
      div.innerHTML = `
        <div>
          <strong>Order #${order.order_id}</strong> - Table ${order.table_no}<br>
          Total: ₹${order.total}
          <span class="status-badge status-${order.status}">${order.status}</span>
        </div>
        <div>
          <select onchange="updateOrderStatus(${order.order_id}, this.value)">
            <option value="">Change status</option>
            <option value="pending">Pending</option>
            <option value="preparing">Preparing</option>
            <option value="served">Served</option>
          </select>
        </div>
      `;
      container.appendChild(div);
    });
  } catch (err) {
    console.error(err);
    document.getElementById('orderList').innerHTML = '<p>Failed to load orders</p>';
  }
}

async function updateOrderStatus(orderId, status) {
  if (!status) return;

  try {
    const res = await fetch(`${API_BASE}/orders/${orderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    const data = await res.json();
    if (res.ok) {
      loadOrders();
    } else {
      alert('Error: ' + data.error);
    }
  } catch (err) {
    console.error(err);
    alert('Failed to update status');
  }
}

// ===== INIT =====
loadMenu();