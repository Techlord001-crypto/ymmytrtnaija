(function() {
  'use strict';

  // Track which buttons have been processed
  const processedButtons = new WeakSet();
  let isProcessing = false;

  // ===============================
  // 🔧 LocalStorage Helper Functions
  // ===============================
  function getCart() {
    try {
      const cart = localStorage.getItem('cart');
      if (!cart) return [];
      const parsed = JSON.parse(cart);
      return Array.isArray(parsed) ? parsed.map(item => ({
        ...item,
        price: Number(item.price),
        quantity: Number(item.quantity)
      })) : [];
    } catch (error) {
      console.error('Error reading cart:', error);
      localStorage.removeItem('cart');
      return [];
    }
  }

  function setCart(cart) {
    try {
      localStorage.setItem('cart', JSON.stringify(cart));
      console.log('✅ Cart updated:', cart);
      return true;
    } catch (error) {
      console.error('Error saving cart:', error);
      return false;
    }
  }

  // ===============================
  // 🛒 Add Item to Cart
  // ===============================
  function addItemToCart(id, name, price, image) {
    if (!id || !name || isNaN(price) || price <= 0) {
      console.error('❌ Invalid item data:', { id, name, price, image });
      showNotification('Error: Invalid item data', 'error');
      return false;
    }

    let cart = getCart();
    const existingItem = cart.find(item => item.id === id);

    if (existingItem) {
      existingItem.quantity += 1;
      console.log(`📦 Increased quantity for ${name} to ${existingItem.quantity}`);
    } else {
      cart.push({ id, name, price, image, quantity: 1 });
      console.log(`🆕 Added new item: ${name}`);
    }

    return setCart(cart);
  }

  // ===============================
  // 📢 Notification Display
  // ===============================
  let lastNotificationTime = 0;
  const NOTIFICATION_DEBOUNCE = 500;

  function showNotification(message, type = 'success') {
    const now = Date.now();
   
    if (now - lastNotificationTime < NOTIFICATION_DEBOUNCE) {
      console.log('Notification throttled - too soon');
      return;
    }
   
    lastNotificationTime = now;

    // Remove any existing notifications
    const existingAlerts = document.querySelectorAll('[data-notification]');
    existingAlerts.forEach(alert => alert.remove());

    const alertDiv = document.createElement('div');
    alertDiv.setAttribute('data-notification', 'true');
    alertDiv.textContent = message;
    alertDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#e9ffe9' : '#ffdddd'};
      color: #111;
      padding: 15px 25px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 9999;
      font-size: 1rem;
      font-weight: 600;
      max-width: 300px;
      transition: all 0.4s ease;
      opacity: 1;
    `;

    document.body.appendChild(alertDiv);

    setTimeout(() => {
      alertDiv.style.opacity = '0';
      alertDiv.style.transform = 'translateX(400px)';
      setTimeout(() => {
        if (alertDiv.parentNode) {
          alertDiv.remove();
        }
      }, 400);
    }, 2500);
  }

  // ===============================
  // 🚀 Initialize Menu Functionality
  // ===============================
  document.addEventListener('DOMContentLoaded', function() {
    console.log('🍽 Menu page loaded');
    console.log('Current cart:', getCart());

    const cartButtons = document.querySelectorAll('.add-cart-btn');

    cartButtons.forEach(btn => {
      // Skip if button already has listener attached
      if (processedButtons.has(btn)) {
        console.log('Button already processed, skipping');
        return;
      }

      // Mark button as processed
      processedButtons.add(btn);

      btn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        // Prevent double submission
        if (isProcessing || btn.disabled) {
          console.log('Request already in progress, ignoring click');
          return;
        }

        isProcessing = true;
        btn.disabled = true;

        const card = e.target.closest('.menu-card');
        if (!card) {
          showNotification('Error: Menu card not found', 'error');
          isProcessing = false;
          btn.disabled = false;
          return;
        }

        const id = parseInt(card.dataset.id);
        const nameElement = card.querySelector('.item-name, h3');
        const priceElement = card.querySelector('.item-price, strong');
        const imgElement = card.querySelector('img');

        if (!id || !nameElement || !priceElement || !imgElement) {
          showNotification('Error: Missing product info', 'error');
          isProcessing = false;
          btn.disabled = false;
          return;
        }

        const name = nameElement.textContent.trim();
        const priceText = priceElement.textContent.trim();
        const image = imgElement.getAttribute('src') || imgElement.src;

        // Extract numeric price
        const numeric = priceText.replace(/[^\d.]/g, '');
        const price = parseFloat(numeric);

        if (isNaN(price) || price <= 0) {
          showNotification('Error: Invalid price', 'error');
          isProcessing = false;
          btn.disabled = false;
          return;
        }

        console.trace(`Adding item: ${name} (ID: ${id})`);
        const success = addItemToCart(id, name, price, image);

        if (success) {
          showNotification(`${name} added to cart!`, 'success');

          // Simple button text change without animation
          const originalText = btn.textContent;
          btn.textContent = "✓ Added!";
          btn.style.background = "#28a745";
          btn.style.color = "white";

          setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = "";
            btn.style.color = "";
            btn.disabled = false;
            isProcessing = false;
          }, 1500);
        } else {
          btn.disabled = false;
          isProcessing = false;
        }
      });
    });

    // ===============================
    // 🎬 GSAP 3D Hover Animation
    // ===============================
    if (typeof gsap !== 'undefined') {
      document.querySelectorAll('.menu-card').forEach(card => {
        card.addEventListener('mousemove', function(e) {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          gsap.to(card, {
            rotationY: ((x / rect.width) - 0.5) * 8,
            rotationX: ((y / rect.height) - 0.5) * -8,
            scale: 1.04,
            duration: 0.3,
            transformPerspective: 1000
          });
        });

        card.addEventListener('mouseleave', function() {
          gsap.to(card, { rotationY: 0, rotationX: 0, scale: 1, duration: 0.3 });
        });
      });
    }
  });

  // ===============================
  // 🧪 Debug Helpers (Console)
  // ===============================
  window.testCart = function() {
    console.log('🛒 Current cart:', getCart());
    console.log('Items count:', getCart().length);
  };

  window.clearTestCart = function() {
    localStorage.removeItem('cart');
    console.log('🧹 Cart cleared!');
  };

  console.log('✅ Menu.js loaded successfully!');
})();