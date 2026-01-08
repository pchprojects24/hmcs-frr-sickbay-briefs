/**
 * Accordion Toggle Functionality
 * Manages "Open all" / "Close all" button for details/summary elements
 */
(function() {
  'use strict';

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    const detailsList = Array.from(document.querySelectorAll('details'));
    const toggleAllButton = document.querySelector('.toggle-all');

    // Exit if no accordions or button found
    if (!toggleAllButton || detailsList.length === 0) {
      return;
    }

    /**
     * Update the toggle button label based on current state
     */
    function updateToggleLabel() {
      const openCount = detailsList.filter(d => d.open).length;
      const allOpen = openCount === detailsList.length && detailsList.length > 0;
      toggleAllButton.textContent = allOpen ? 'Close all' : 'Open all';
      toggleAllButton.setAttribute('aria-expanded', allOpen ? 'true' : 'false');
    }

    /**
     * Toggle all accordions open or closed
     */
    toggleAllButton.addEventListener('click', () => {
      const allOpen = detailsList.every(d => d.open);
      detailsList.forEach(d => {
        d.open = !allOpen;
      });
      updateToggleLabel();
    });

    // Initialize all accordions as closed
    detailsList.forEach(detail => {
      detail.open = false;
      detail.addEventListener('toggle', updateToggleLabel);
    });

    // Set initial button label
    updateToggleLabel();
  }
})();
