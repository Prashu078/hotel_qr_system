// ===== CONFIG =====
const API_BASE = 'http://localhost:5000/api';

// Table aur token URL se nikalo (QR scan karne par yeh milega)
const urlParams = new URLSearchParams(window.location.search);
const tableId = urlParams.get('table') || 1;   // testing ke liye default 1
const token = urlParams.get('token') || '';

document.getElementById('tableInfo').textContent = `Table: ${tableId}`;

// ===== CART STATE =====
let cart = []; // [{ item_id, name, price, quantity }]

// ===== FETCH MENU =====
async function loadMenu() {
  try {
    const res = await fetch(`${API_BASE}/menu`);
    const items = await res.json();

    const container = document.getElementById('menuContainer');
    container.innerHTML = '';

    items.forEach(item => {
      const div = document.createElement('div');
      div.className = 'menu-item';
      div.innerHTML = `
        <div>
          <h3>${item.name}</h3>
          <p>${item.category || ''}</p>
          <p class="price">₹${item.price}</p>
        </div>
        <button onclick="addToCart(${item.item_id}, '${item.name}', ${item.price})">Add</button>
      `;
      container.appendChild(div);
    });
  } catch (err) {
    console.error('Menu load error:', err);
    document.getElementById('menuContainer').innerHTML = '<p>Menu load nahi ho paya. Server check karo.</p>';
  }
}

// ===== CART FUNCTIONS =====
function addToCart(item_id, name, price) {
  const existing = cart.find(i => i.item_id === item_id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ item_id, name, price, quantity: 1 });
  }
  updateCartUI();
}

function removeFromCart(item_id) {
  cart = cart.filter(i => i.item_id !== item_id);
  updateCartUI();
  renderCartItems();
}

function getCartTotal() {
  return cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
}

function getCartCount() {
  return cart.reduce((sum, i) => sum + i.quantity, 0);
}

function updateCartUI() {
  document.getElementById('cartCount').textContent = `${getCartCount()} items`;
  document.getElementById('cartTotal').textContent = `₹${getCartTotal()}`;
}

function renderCartItems() {
  const container = document.getElementById('cartItems');
  container.innerHTML = '';

  if (cart.length === 0) {
    container.innerHTML = '<p>Cart is Empty!</p>';
  } else {
    cart.forEach(item => {
      const row = document.createElement('div');
      row.className = 'cart-item-row';
      row.innerHTML = `
        <span>${item.name} x ${item.quantity}</span>
        <span>₹${item.price * item.quantity} 
          <button onclick="removeFromCart(${item.item_id})">❌</button>
        </span>
      `;
      container.appendChild(row);
    });
  }

  document.getElementById('cartModalTotal').textContent = `Total: ₹${getCartTotal()}`;
}

// ===== MODAL OPEN/CLOSE =====
document.getElementById('viewCartBtn').addEventListener('click', () => {
  renderCartItems();
  document.getElementById('cartModal').classList.remove('hidden');
});

document.getElementById('closeCartBtn').addEventListener('click', () => {
  document.getElementById('cartModal').classList.add('hidden');
});

// ===== PLACE ORDER =====
document.getElementById('placeOrderBtn').addEventListener('click', async () => {
  if (cart.length === 0) {
    alert('Your cart is empty, please add items first');
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        table_id: tableId,
        items: cart.map(i => ({ item_id: i.item_id, quantity: i.quantity, price: i.price }))
      })
    });

    const data = await res.json();

    if (res.ok) {
      alert(`Order placed! Order ID: ${data.order_id}, Total: ₹${data.total}`);
      cart = [];
      updateCartUI();
      document.getElementById('cartModal').classList.add('hidden');
    } else {
      alert('Error: ' + data.error);
    }
  } catch (err) {
    console.error(err);
    alert('Failed to place order, please check the server');
  }
});

// ===== SERVICE REQUESTS =====
async function sendServiceRequest(type) {
  try {
    const res = await fetch(`${API_BASE}/service`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ table_id: tableId, type })
    });
    const data = await res.json();
    if (res.ok) {
      alert(type === 'waiter' ? 'Waiter has been called!' : 'Bill request sent!');
    } else {
      alert('Error: ' + data.error);
    }
  } catch (err) {
    console.error(err);
    alert('Failed to send request, please check the server');
  }
}

document.getElementById('callWaiterBtn').addEventListener('click', () => sendServiceRequest('waiter'));
document.getElementById('requestBillBtn').addEventListener('click', () => sendServiceRequest('bill'));

// ===== INIT =====
loadMenu();