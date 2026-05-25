
const menuData = [
  // ---- Biryani ----
  { id: 'b1', name: 'Chicken Biryani',     category: 'biryani', price: 180, img: 'biryani.png',  desc: 'Aromatic basmati rice cooked with tender chicken & spices.', type: 'nonveg' },
  { id: 'b2', name: 'Veg Biryani',         category: 'biryani', price: 130, img: 'veg.png',  desc: 'Flavourful basmati rice with fresh seasonal vegetables.', type: 'veg' },
  { id: 'b3', name: 'Mutton Biryani',      category: 'biryani', price: 220, img: 'mutton.png',  desc: 'Slow-cooked mutton in rich dum biryani style.', type: 'nonveg' },

  // ---- Pizza ----
  { id: 'p1', name: 'Margherita Pizza',    category: 'pizza',   price: 160, img: 'pizza.png',    desc: 'Classic tomato base, fresh mozzarella & basil.', type: 'veg' },
  { id: 'p2', name: 'Paneer Pizza',        category: 'pizza',   price: 190, img: 'paneer.png',    desc: 'Spicy paneer tikka topping on cheesy crust.', type: 'veg' },
  { id: 'p3', name: 'Chicken Pizza',       category: 'pizza',   price: 210, img: 'pizza.png',    desc: 'Grilled chicken, peppers & extra cheese.', type: 'nonveg' },

  // ---- Burger ----
  { id: 'br1', name: 'Veg Burger',         category: 'burger',  price: 90,  img: 'burger.png',   desc: 'Crispy veg patty with lettuce, tomato & mayo.', type: 'veg' },
  { id: 'br2', name: 'Chicken Burger',     category: 'burger',  price: 120, img: 'burger.png',   desc: 'Juicy grilled chicken with special house sauce.', type: 'nonveg' },
  { id: 'br3', name: 'Double Patty Burger',category: 'burger',  price: 160, img: 'burger.png',   desc: 'Double the fun — two patties, extra cheese.', type: 'nonveg' },

  // ---- Chinese ----
  { id: 'c1', name: 'Veg Noodles',         category: 'chinese', price: 100, img: 'noodles.png',  desc: 'Hakka-style noodles tossed with fresh veggies.', type: 'veg' },
  { id: 'c2', name: 'Chicken Noodles',     category: 'chinese', price: 130, img: 'noodles.png',  desc: 'Stir-fried noodles with tender chicken strips.', type: 'nonveg' },
  { id: 'c3', name: 'Fried Rice',          category: 'chinese', price: 110, img: 'noodles.png',  desc: 'Egg fried rice with soy sauce & spring onions.', type: 'nonveg' },
  { id: 'c4', name: 'Chilli Paneer',       category: 'chinese', price: 150, img: 'noodles.png',  desc: 'Indo-Chinese crispy paneer in tangy chilli sauce.', type: 'veg' },

  // ---- Thali ----
  { id: 't1', name: 'Veg Thali',           category: 'thali',   price: 120, img: 'thali.png',    desc: 'Dal, sabzi, roti, rice, salad & papad — a full meal.', type: 'veg' },
  { id: 't2', name: 'Chicken Thali',       category: 'thali',   price: 170, img: 'thali.png',    desc: 'Chicken curry, roti, rice, dal & raita.', type: 'nonveg' },
  { id: 't3', name: 'Special Thali',       category: 'thali',   price: 200, img: 'thali.png',    desc: 'Premium thali with 2 curries, rice, bread & dessert.', type: 'nonveg' },
];


const categoryMeta = {
  biryani: { label: '🍛 Biryani',  },
  pizza:   { label: '🍕 Pizza',    },
  burger:  { label: '🍔 Burger',   },
  chinese: { label: '🥡 Chinese',  },
  thali:   { label: '🍱 Thali',    },
};

// ---- Render Menu ----
function renderMenu(filter = 'all') {
  const container = document.getElementById('menu');
  if (!container) return;

  // Get active categories
  const cats = filter === 'all'
    ? Object.keys(categoryMeta)
    : [filter];

  let html = '';
  cats.forEach(cat => {
    const items = menuData.filter(i => i.category === cat);
    if (!items.length) return;

    html += `<div class="menu-category-title">${categoryMeta[cat].label}</div>`;
    html += `<div class="menu-grid">`;
    items.forEach(item => {
      const inCart = getItemQtyInCart(item.id);
      html += `
        <div class="menu-card" id="mc-${item.id}">
          <img class="menu-card-img" src="images/${item.img}" alt="${item.name}"
               onerror="this.style.background='#f5e6d3';this.src=''">
          <div class="menu-card-body">
            <span class="menu-card-badge ${item.type}">${item.type === 'veg' ? '🟢 Veg' : '🔴 Non-Veg'}</span>
            <div class="menu-card-name">${item.name}</div>
            <div class="menu-card-desc">${item.desc}</div>
            <div class="menu-card-footer">
              <span class="menu-card-price">₹${item.price}</span>
              ${inCart === 0
                ? `<button class="add-to-cart-btn" onclick="handleAddToCart('${item.id}')">+ Add</button>`
                : `<div class="qty-control">
                     <button class="qty-btn" onclick="handleQtyChange('${item.id}', -1)">−</button>
                     <span class="qty-num" id="qty-${item.id}">${inCart}</span>
                     <button class="qty-btn" onclick="handleQtyChange('${item.id}', 1)">+</button>
                   </div>`
              }
            </div>
          </div>
        </div>
      `;
    });
    html += `</div>`;
  });

  container.innerHTML = html;
}

function getItemQtyInCart(id) {
  const cart = getCart();
  const item = cart.find(c => c.id === id);
  return item ? item.qty : 0;
}

function handleAddToCart(id) {
  const item = menuData.find(i => i.id === id);
  if (!item) return;
  addToCart(item);
  // Re-render just the card footer
  const qtyEl = document.getElementById(`qty-${id}`);
  if (!qtyEl) {
    // Refresh the card area
    const activeFilter = document.querySelector('.filter-btn.active')?.dataset.cat || 'all';
    renderMenu(activeFilter);
  }
}

function handleQtyChange(id, delta) {
  updateQty(id, delta);
  const newQty = getItemQtyInCart(id);
  const qtyEl = document.getElementById(`qty-${id}`);
  if (newQty <= 0) {
    // Replace qty control with Add button
    const activeFilter = document.querySelector('.filter-btn.active')?.dataset.cat || 'all';
    renderMenu(activeFilter);
  } else if (qtyEl) {
    qtyEl.textContent = newQty;
  }
}

// ---- Filter buttons ----
document.addEventListener('DOMContentLoaded', () => {
  // Check URL param
  const params = new URLSearchParams(window.location.search);
  const initCat = params.get('cat') || 'all';

  renderMenu(initCat);

  // Set active filter button
  const filterBar = document.getElementById('filterBar');
  if (filterBar) {
    filterBar.querySelectorAll('.filter-btn').forEach(btn => {
      if (btn.dataset.cat === initCat) btn.classList.add('active');
      else btn.classList.remove('active');

      btn.addEventListener('click', () => {
        filterBar.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderMenu(btn.dataset.cat);
      });
    });
  }
});
