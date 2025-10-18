;


// main.js - Hamburger menu and shared functionality

document.addEventListener('DOMContentLoaded', function() {
 
  // Hamburger Menu Toggle
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

    // Close menu when clicking outside
    mobileMenuOverlay.addEventListener('click', function(e) {
      if (e.target === mobileMenuOverlay) {
        mobileMenuOverlay.classList.remove('active');
        hamburger.classList.remove('active');
        body.classList.remove('menu-open');
      }
    });
  } else {
    console.error('Hamburger or mobile menu overlay not found!');
  }

  console.log('Main.js loaded successfully!');
});
