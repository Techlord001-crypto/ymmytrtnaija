// order.js - Complete Paystack checkout with EmailJS integration

// Initialize EmailJS once at load time
if (typeof emailjs !== 'undefined') {
  emailjs.init("YOUR_EMAILJS_USER_ID"); // Replace with your EmailJS User ID
  console.log('✅ EmailJS initialized');
} else {
  console.warn('⚠️ EmailJS library not loaded');
}

document.addEventListener('DOMContentLoaded', () => {
  // Get cart from localStorage
  const cart = JSON.parse(localStorage.getItem('cart')) || [];

  console.log('Cart loaded:', cart);

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = subtotal > 0 ? 1500 : 0;
  const total = subtotal + deliveryFee;

  // Fill order summary section
  const orderSummaryContainer = document.getElementById('orderSummaryContainer');

  if (orderSummaryContainer) {
    if (cart.length > 0) {
      let summaryHTML = '<div class="order-summary-box"><h3>Your Order</h3>';

      cart.forEach(item => {
        summaryHTML += `
          <div class="summary-item">
            <span>${item.quantity} x ${item.name}</span>
            <span>₦${(item.price * item.quantity).toLocaleString()}</span>
          </div>
        `;
      });

      summaryHTML += `
        <hr>
        <div class="summary-item">
          <span>Subtotal:</span>
          <span>₦${subtotal.toLocaleString()}</span>
        </div>
        <div class="summary-item">
          <span>Delivery Fee:</span>
          <span>₦${deliveryFee.toLocaleString()}</span>
        </div>
        <hr>
        <div class="summary-item total">
          <strong>Total:</strong>
          <strong>₦${total.toLocaleString()}</strong>
        </div>
      </div>`;

      orderSummaryContainer.innerHTML = summaryHTML;
    } else {
      orderSummaryContainer.innerHTML = `
        <div class="empty-cart">
          <p>Your cart is empty</p>
          <a href="menu.html" class="btn">Browse Menu</a>
        </div>
      `;
    }
  }

  // Update hidden form fields if they exist
  const cartSummaryField = document.getElementById('cartSummary');
  const totalAmountField = document.getElementById('totalAmount');

  if (cartSummaryField) {
    if (cart.length > 0) {
      cartSummaryField.value = cart.map(item =>
        `${item.quantity} x ${item.name} - ₦${(item.price * item.quantity).toLocaleString()}`
      ).join('\n');
    } else {
      cartSummaryField.value = "Cart is empty";
    }
  }

  if (totalAmountField) {
    totalAmountField.value = `₦${total.toLocaleString()}`;
  }

  // Disable checkout if cart empty
  if (cart.length === 0) {
    const submitBtn = document.querySelector('.btn[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Cart is Empty";
      submitBtn.style.opacity = "0.5";
      submitBtn.style.cursor = "not-allowed";
    }
  }

  // Handle form submission
  const orderForm = document.getElementById('orderForm');
  if (!orderForm) {
    console.warn('Order form not found!');
    return;
  }

  orderForm.addEventListener('submit', function(e) {
    e.preventDefault();

    if (cart.length === 0) {
      alert("Your cart is empty. Please add items before checking out.");
      return;
    }

    // Get form values
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const addressInput = document.getElementById('address');
    const landmarkInput = document.getElementById('landmark');
    const deliveryOptionInput = document.getElementById('deliveryOption');
    const confirmCheckbox = document.getElementById('confirm');

    if (!nameInput || !emailInput || !phoneInput || !addressInput) {
      alert("Form fields missing! Please check your HTML.");
      return;
    }

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const phone = phoneInput.value.trim();
    const address = addressInput.value.trim();
    const landmark = landmarkInput ? landmarkInput.value.trim() : '';
    const deliveryOption = deliveryOptionInput ? deliveryOptionInput.value : 'Standard';

    // Validate required fields
    if (!name || !email || !phone || !address) {
      alert("Please fill in all required fields.");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("Please enter a valid email address.");
      return;
    }

    // Validate phone
    if (phone.length < 10) {
      alert("Please enter a valid phone number.");
      return;
    }

    // Validate confirmation
    if (confirmCheckbox && !confirmCheckbox.checked) {
      alert("Please confirm your order details.");
      return;
    }

    // Generate unique order number
    const orderNumber = 'YT' + Date.now().toString().slice(-10);

    // Prepare order details
    const orderItems = cart.map(item =>
      `${item.quantity} x ${item.name} - ₦${(item.price * item.quantity).toLocaleString()}`
    ).join('\n');

    // Check if Paystack is available
    if (typeof PaystackPop === 'undefined') {
      alert('Payment service not available. Please try again later.');
      console.error('PaystackPop not loaded');
      return;
    }

    // Initialize Paystack
    const handler = PaystackPop.setup({
      key: 'YOUR_PAYSTACK_PUBLIC_KEY', // Replace with your Paystack public key
      email: email,
      amount: total * 100, // Convert to kobo
      currency: 'NGN',
      ref: orderNumber,
      metadata: {
        custom_fields: [
          {
            display_name: "Customer Name",
            variable_name: "customer_name",
            value: name
          },
          {
            display_name: "Phone Number",
            variable_name: "phone_number",
            value: phone
          },
          {
            display_name: "Delivery Address",
            variable_name: "delivery_address",
            value: address
          },
          {
            display_name: "Delivery Option",
            variable_name: "delivery_option",
            value: deliveryOption
          }
        ]
      },
      callback: function(response) {
        console.log('Payment successful. Reference: ' + response.reference);

        // Send confirmation email
        sendOrderConfirmationEmail({
          orderNumber: orderNumber,
          name: name,
          email: email,
          phone: phone,
          address: address,
          landmark: landmark,
          deliveryOption: deliveryOption,
          orderItems: orderItems,
          totalAmount: total,
          paymentReference: response.reference,
          paymentStatus: 'Paid'
        });
      },
      onClose: function() {
        alert('Payment window closed. Your order was not completed.');
      }
    });

    handler.openIframe();
  });
});

// Function to send order confirmation email
function sendOrderConfirmationEmail(orderData) {
  if (typeof emailjs === 'undefined') {
    console.error('EmailJS not loaded');
    alert(`✓ Payment Successful!\n\nOrder Number: ${orderData.orderNumber}\nPayment Reference: ${orderData.paymentReference}\n\nEmailJS service unavailable, but your payment was processed.`);
    handleSuccessfulOrder();
    return;
  }

  const templateParams = {
    order_number: orderData.orderNumber,
    customer_name: orderData.name,
    customer_email: orderData.email,
    customer_phone: orderData.phone,
    delivery_address: orderData.address,
    landmark: orderData.landmark || 'N/A',
    delivery_option: orderData.deliveryOption,
    order_items: orderData.orderItems,
    total_amount: `₦${orderData.totalAmount.toLocaleString()}`,
    payment_reference: orderData.paymentReference,
    payment_status: orderData.paymentStatus,
    order_date: new Date().toLocaleString('en-NG', {
      dateStyle: 'full',
      timeStyle: 'short'
    })
  };

  emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', templateParams)
    .then(function(response) {
      console.log('Email sent successfully!', response.status, response.text);
      alert(`✅ Order Confirmed!\n\nOrder Number: ${orderData.orderNumber}\nPayment Reference: ${orderData.paymentReference}\n\nA confirmation email has been sent to ${orderData.email}`);
      handleSuccessfulOrder();
    })
    .catch(function(error) {
      console.error('Email sending failed:', error);
      alert(`✅ Payment Successful!\n\nOrder Number: ${orderData.orderNumber}\nPayment Reference: ${orderData.paymentReference}\n\nConfirmation email could not be sent. Please contact us with your order number.`);
      handleSuccessfulOrder();
    });
}

// Handle successful order completion
function handleSuccessfulOrder() {
  localStorage.removeItem('cart');
  setTimeout(() => {
    window.location.href = 'index.html';
  }, 3000);
}