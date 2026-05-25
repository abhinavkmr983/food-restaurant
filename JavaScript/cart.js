/* ============================================================
   cart.js — FoodieExpress Cart Logic
   Handles: add, remove, update qty, localStorage, summary
============================================================ */

// ---- Load cart from localStorage ----
function getCart() {
  return JSON.parse(localStorage.getItem('fe_cart')) || [];
}

function saveCart(cart) {
  localStorage.setItem('fe_cart', JSON.stringify(cart));
  updateCartCount();
}

// ---- Add item to cart ----
function addToCart(item) {
  const cart = getCart();
  const existing = cart.find(c => c.id === item.id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...item, qty: 1 });
  }
  saveCart(cart);
  showToast(`🛒 ${item.name} added to cart!`, 'success');
}

// ---- Remove item from cart ----
function removeFromCart(id) {
  let cart = getCart().filter(c => c.id !== id);
  saveCart(cart);
  if (typeof renderCartPage === 'function') renderCartPage();
}

// ---- Update item quantity ----
function updateQty(id, delta) {
  let cart = getCart();
  const item = cart.find(c => c.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter(c => c.id !== id);
  saveCart(cart);
  if (typeof renderCartPage === 'function') renderCartPage();
}

// ---- Clear entire cart ----
function clearCart() {
  localStorage.removeItem('fe_cart');
  updateCartCount();
  if (typeof renderCartPage === 'function') renderCartPage();
}

// ---- Update cart badge in header ----
function updateCartCount() {
  const cart = getCart();
  const total = cart.reduce((sum, c) => sum + c.qty, 0);
  const badge = document.getElementById('cartCount');
  if (!badge) return;
  if (total > 0) {
    badge.textContent = total;
    badge.style.display = 'flex';
  } else {
    badge.style.display = 'none';
  }
}

// ---- Calculate totals ----
function calcTotals(cart) {
  const subtotal = cart.reduce((sum, c) => sum + c.price * c.qty, 0);
  const gst = Math.round(subtotal * 0.05);
  const total = subtotal + gst;
  return { subtotal, gst, total };
}

// ---- Render Cart Page ----
function renderCartPage() {
  const cart = getCart();
  const itemsDiv  = document.getElementById('cartItems');
  const emptyDiv  = document.getElementById('cartEmpty');
  const summaryDiv = document.getElementById('cartSummary');
  if (!itemsDiv) return;

  if (cart.length === 0) {
    itemsDiv.innerHTML = '';
    if (emptyDiv) emptyDiv.style.display = 'block';
    if (summaryDiv) summaryDiv.style.display = 'none';
    return;
  }

  if (emptyDiv) emptyDiv.style.display = 'none';
  if (summaryDiv) summaryDiv.style.display = 'block';

  itemsDiv.innerHTML = cart.map(item => `
    <div class="cart-item" id="cart-item-${item.id}">
      <img class="cart-item-img" src="images/${item.img}" alt="${item.name}" onerror="this.style.background='#f5e6d3';this.src=''">
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">₹${item.price * item.qty}</div>
      </div>
      <div class="cart-item-controls">
        <div class="qty-control">
          <button class="qty-btn" onclick="updateQty('${item.id}', -1)">−</button>
          <span class="qty-num">${item.qty}</span>
          <button class="qty-btn" onclick="updateQty('${item.id}', 1)">+</button>
        </div>
        <button class="cart-remove-btn" onclick="removeFromCart('${item.id}')" title="Remove">
          <i class="fas fa-trash-alt"></i>
        </button>
      </div>
    </div>
  `).join('');

  const { subtotal, gst, total } = calcTotals(cart);
  const fmt = n => '₹' + n.toLocaleString('en-IN');

  const sub = document.getElementById('subtotal');
  const gstEl = document.getElementById('gst');
  const totEl = document.getElementById('totalAmount');
  if (sub) sub.textContent = fmt(subtotal);
  if (gstEl) gstEl.textContent = fmt(gst);
  if (totEl) totEl.textContent = fmt(total);
}

// ---- Clear cart button ----
document.addEventListener('DOMContentLoaded', () => {
  updateCartCount();

  const clearBtn = document.getElementById('clearCartBtn');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (confirm('Clear entire cart?')) clearCart();
    });
  }

  const checkoutBtn = document.getElementById('checkoutBtn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      if (getCart().length === 0) {
        showToast('Cart is empty!', 'error');
        return;
      }
      window.location.href = 'checkout.html';
    });
  }

  // If on cart page, render it
  if (document.getElementById('cartItems')) renderCartPage();
});

// ---- Toast notification ----
function showToast(msg, type = 'success') {
  let toast = document.getElementById('fe-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'fe-toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.className = `toast ${type}`;
  // force reflow
  void toast.offsetWidth;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 2800);
}
