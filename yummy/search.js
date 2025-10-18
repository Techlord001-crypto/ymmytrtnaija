// search.js

document.addEventListener('DOMContentLoaded', function() {
  const searchInput = document.getElementById('searchInput');
  const menuContainer = document.getElementById('menuContainer');
  const noResults = document.getElementById('noResults');

  if (!searchInput) {
    console.log('Search input not found');
    return;
  }

  searchInput.addEventListener('keyup', function() {
    const searchTerm = searchInput.value.toLowerCase().trim();
   
    // Get all menu cards
    const menuCards = document.querySelectorAll('.menu-card');
   
    console.log('Search term:', searchTerm);
    console.log('Menu cards found:', menuCards.length);

    let visibleCount = 0;

    menuCards.forEach(card => {
      const cardTitle = card.querySelector('h3')?.textContent.toLowerCase() || '';
      const cardDescription = card.querySelector('p')?.textContent.toLowerCase() || '';

      // If search term is empty, show all
      if (searchTerm === '') {
        card.style.display = 'block';
        visibleCount++;
      }
      // Check if search term matches name or description
      else if (cardTitle.includes(searchTerm) || cardDescription.includes(searchTerm)) {
        card.style.display = 'block';
        visibleCount++;
        console.log('Match found:', cardTitle);
      }
      else {
        card.style.display = 'none';
      }
    });

    // Show "No Results" message if nothing matches and search term is not empty
    if (visibleCount === 0 && searchTerm !== '') {
      noResults.style.display = 'block';
      // Scroll to no results message
      noResults.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      noResults.style.display = 'none';
    }

    // If search term is not empty, scroll to top of menu container
    if (searchTerm !== '') {
      menuContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});