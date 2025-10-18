// ===========================
// CART PAGE FUNCTIONALITY
// ===========================

// Helper functions for localStorage
const getCart = () => {
  try {
    const cart = localStorage.getItem('cart');
    return cart ? JSON.parse(cart) : [];
  } catch (error) {
    console.error('Error reading cart:', error);
    return [];
  }
};

const setCart = cart => {
  try {
    localStorage.setItem('cart', JSON.stringify(cart));
  } catch (error) {
    console.error('Error saving cart:', error);
  }
};

// ===========================
// RENDER CART CONTENT
// ===========================
const renderCart = () => {
  const cart = getCart();
  const cartContainer = document.querySelector('.cart-container');

  if (!cartContainer) {
    console.error('Cart container not found!');
    return;
  }

  // Clear container
  cartContainer.innerHTML = '';

  if (cart.length === 0) {
    cartContainer.innerHTML = `
      <div class="empty-cart">
        <h2>Your cart is empty</h2>
        <p>Add some delicious items from our menu!</p>
        <a href="menu.html" class="btn">Browse Menu</a>
      </div>
    `;
    return;
  }

  // Cart items wrapper
  const itemsSection = document.createElement('div');
  itemsSection.className = 'cart-items-section';

  cart.forEach(item => {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'cart-item-card';
    itemDiv.dataset.id = item.id;

    const imgSrc = item.image || 'images/placeholder.jpg';

    itemDiv.innerHTML = `
      <img src="${imgSrc}" alt="${item.name}" class="cart-item-img">
      <div class="cart-item-details">
        <h3>${item.name}</h3>
        <p class="cart-item-price">₦${item.price.toLocaleString()} each</p>

        <div class="cart-controls">
          <button class="btn-small minus-btn" data-id="${item.id}">−</button>
          <span class="quantity">${item.quantity}</span>
          <button class="btn-small plus-btn" data-id="${item.id}">+</button>
        </div>

        <p class="item-subtotal">Subtotal: ₦${(item.price * item.quantity).toLocaleString()}</p>
        <button class="btn-remove remove-btn" data-id="${item.id}">Remove</button>
      </div>
    `;
    itemsSection.appendChild(itemDiv);
  });

  // ===========================
  // SUMMARY SECTION
  // ===========================
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal > 0 ? 1500 : 0;
  const total = subtotal + shipping;

  const summaryDiv = document.createElement('div');
  summaryDiv.className = 'cart-summary glass-card';
  summaryDiv.innerHTML = `
    <h2>Order Summary</h2>
    <div class="summary-row">
      <span>Subtotal:</span>
      <span>₦${subtotal.toLocaleString()}</span>
    </div>
    <div class="summary-row">
      <span>Delivery Fee:</span>
      <span>₦${shipping.toLocaleString()}</span>
    </div>
    <hr>
    <div class="summary-row total">
      <span>Total:</span>
      <span>₦${total.toLocaleString()}</span>
    </div>
    <button class="btn btn-checkout" id="proceedOrderBtn">Proceed to Checkout</button><br><br>
    <button class="btn btn-secondary" onclick="window.location.href='menu.html'">Continue Shopping</button>
  `;

  // Add sections to DOM
  cartContainer.appendChild(itemsSection);
  cartContainer.appendChild(summaryDiv);

  // Add interactions
  attachCartEvents();
};

// ===========================
// CART BUTTON EVENTS
// ===========================
const attachCartEvents = () => {
  // Remove old event listeners by cloning nodes
  const minusBtns = document.querySelectorAll('.minus-btn');
  minusBtns.forEach(btn => {
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
  });

  const plusBtns = document.querySelectorAll('.plus-btn');
  plusBtns.forEach(btn => {
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
  });

  const removeBtns = document.querySelectorAll('.remove-btn');
  removeBtns.forEach(btn => {
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
  });

  // Re-attach fresh listeners
  document.querySelectorAll('.minus-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      const id = parseInt(e.target.dataset.id);
      updateQuantity(id, -1);
    });
  });

  document.querySelectorAll('.plus-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      const id = parseInt(e.target.dataset.id);
      updateQuantity(id, 1);
    });
  });

  document.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      const id = parseInt(e.target.dataset.id);
      const itemName = e.target.closest('.cart-item-card').querySelector('h3').textContent;
      if (confirm(`Remove ${itemName} from cart?`)) {
        removeItem(id);
      }
    });
  });

  // Checkout button
  const checkoutBtn = document.getElementById('proceedOrderBtn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', e => {
      e.preventDefault();
      window.location.href = "order.html";
    });
  }
};

// ===========================
// CART OPERATIONS
// ===========================
const updateQuantity = (id, change) => {
  let cart = getCart();
  let item = cart.find(it => it.id === id);

  if (item) {
    item.quantity += change;
    if (item.quantity <= 0) {
      cart = cart.filter(it => it.id !== id);
    }
    setCart(cart);
    renderCart();
  }
};

const removeItem = id => {
  let cart = getCart().filter(it => it.id !== id);
  setCart(cart);
  renderCart();
};

// ===========================
// ADD TO CART FUNCTION (Prevents Duplicates)
// ===========================
window.addToCart = (item) => {
  if (!item || !item.id || !item.name || isNaN(item.price)) {
    console.error('Invalid item:', item);
    alert('Error: Invalid item data');
    return false;
  }

  let cart = getCart();
  const existingItem = cart.find(cartItem => cartItem.id === item.id);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image || '',
      quantity: 1
    });
  }

  setCart(cart);
  alert(`${item.name} added to cart!`);
  updateCartCount();
  return true;
};

// ===========================
// UPDATE CART COUNT BADGE
// ===========================
window.updateCartCount = () => {
  const cart = getCart();
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartCountElements = document.querySelectorAll('.cart-count, .cart-badge');

  cartCountElements.forEach(element => {
    element.textContent = totalItems;
    element.style.display = totalItems > 0 ? 'block' : 'none';
  });
};

// For testing
window.clearCart = () => {
  localStorage.removeItem('cart');
  renderCart();
  updateCartCount();
};

// ===========================
// HAMBURGER MENU TOGGLE
// ===========================
const hamburger = document.querySelector('.hamburger');
const mobileMenuOverlay = document.querySelector('.mobile-menu-overlay');
const body = document.body;

console.log('Hamburger found:', !!hamburger);
console.log('Mobile overlay found:', !!mobileMenuOverlay);

if (hamburger && mobileMenuOverlay) {
  hamburger.addEventListener('click', function(e) {
    e.preventDefault();
    console.log('Hamburger clicked!');

    mobileMenuOverlay.classList.toggle('active');
    hamburger.classList.toggle('active');
    body.classList.toggle('menu-open');

    console.log('Menu is now:', mobileMenuOverlay.classList.contains('active') ? 'OPEN' : 'CLOSED');
  });

  // Close menu when clicking on a link
  const mobileLinks = mobileMenuOverlay.querySelectorAll('a');
  mobileLinks.forEach(link => {
    link.addEventListener('click', function() {
      mobileMenuOverlay.classList.remove('active');
      hamburger.classList.remove('active');
      body.classList.remove('menu-open');
    });
  });

  // Close menu when clicking outside (on the overlay background)
  mobileMenuOverlay.addEventListener('click', function(e) {
    if (e.target.classList.contains('mobile-menu-overlay')) {
      mobileMenuOverlay.classList.remove('active');
      hamburger.classList.remove('active');
      body.classList.remove('menu-open');
    }
  });
} else {
  console.warn('Hamburger or mobile menu overlay not found!');
}

// Initialize cart
document.addEventListener('DOMContentLoaded', () => {
  renderCart();
  updateCartCount();
});

console.log('✅ Cart.js loaded successfully!');