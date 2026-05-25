/* ============================================================
   checkout.js — FoodieExpress Checkout Logic
   Handles: render order summary, payment selection, place order
============================================================ */

let selectedPayment = 'cod';

function selectPayment(el) {
  document.querySelectorAll('.payment-class').forEach(p => p.classList.remove('selected'));
  el.classList.add('selected');
  selectedPayment = el.dataset.method;
}

function renderCheckoutSummary() {
  const cart = getCart();
  const itemsDiv = document.getElementById('checkoutItems');
  if (!itemsDiv) return;

  if (cart.length === 0) {
    window.location.href = 'cart.html';
    return;
  }

  itemsDiv.innerHTML = cart.map(item => `
    <div class="checkout-item">
      <img src="images/${item.img}" alt="${item.name}"
           onerror="this.style.background='#f5e6d3';this.src=''">
      <div class="checkout-item-info">
        <div class="checkout-item-name">${item.name}</div>
        <div class="checkout-item-qty">x${item.qty}</div>
      </div>
      <div class="checkout-item-price">₹${item.price * item.qty}</div>
    </div>
  `).join('');

  const { subtotal, gst, total } = calcTotals(cart);
  const fmt = n => '₹' + n.toLocaleString('en-IN');

  const coSub = document.getElementById('coSubtotal');
  const coGst = document.getElementById('coGst');
  const coTot = document.getElementById('coTotal');
  if (coSub) coSub.textContent = fmt(subtotal);
  if (coGst) coGst.textContent = fmt(gst);
  if (coTot) coTot.textContent = fmt(total);
}

function validateCheckout() {
  const name    = document.getElementById('co_name')?.value.trim();
  const phone   = document.getElementById('co_phone')?.value.trim();
  const address = document.getElementById('co_address')?.value.trim();
  const city    = document.getElementById('co_city')?.value.trim();
  const pincode = document.getElementById('co_pincode')?.value.trim();

  if (!name)    { showToast('Please enter your full name.', 'error'); return false; }
  if (!phone || phone.length < 10) { showToast('Please enter a valid phone number.', 'error'); return false; }
  if (!address) { showToast('Please enter your full address.', 'error'); return false; }
  if (!city)    { showToast('Please enter your city.', 'error'); return false; }
  if (!pincode || pincode.length !== 6) { showToast('Please enter a valid 6-digit pincode.', 'error'); return false; }
  return true;
}

function placeOrder() {
  if (!validateCheckout()) return;

  const btn = document.getElementById('placeOrderBtn');
  btn.textContent = 'Placing Order...';
  btn.disabled = true;

  // Simulate placing order
  setTimeout(() => {
    clearCart();
    window.location.href = 'confirm.html';
  }, 1200);
}

document.addEventListener('DOMContentLoaded', () => {
  renderCheckoutSummary();

  const placeBtn = document.getElementById('placeOrderBtn');
  if (placeBtn) placeBtn.addEventListener('click', placeOrder);
});
