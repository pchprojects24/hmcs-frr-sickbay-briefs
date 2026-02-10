/* accordion.js - shared controls for brief-page details accordions. */
(function () {
  'use strict';

  function getTargetDetail(hash) {
    if (!hash || !hash.startsWith('#')) return null;
    const target = document.getElementById(hash.slice(1));
    if (!target) return null;
    return target.tagName === 'DETAILS' ? target : target.closest('details');
  }

  function initAccordionControls() {
    const accordionRoot = document.querySelector('[data-accordion-root]') || document.querySelector('main');
    if (!accordionRoot) return;

    const detailsList = Array.from(accordionRoot.querySelectorAll('details'));
    if (detailsList.length === 0) return;

    const toggleAllButton = document.querySelector('[data-accordion-toggle], .toggle-all');

    const updateToggleLabel = () => {
      if (!toggleAllButton) return;
      const allOpen = detailsList.every((detail) => detail.open);
      toggleAllButton.textContent = allOpen ? 'Collapse all' : 'Expand all';
      toggleAllButton.setAttribute('aria-expanded', allOpen ? 'true' : 'false');
      toggleAllButton.setAttribute(
        'aria-label',
        allOpen ? 'Collapse all accordion sections' : 'Expand all accordion sections'
      );
    };

    const openHashTarget = () => {
      const targetDetail = getTargetDetail(window.location.hash);
      if (targetDetail && !targetDetail.open) {
        targetDetail.open = true;
      }
    };

    if (toggleAllButton) {
      toggleAllButton.addEventListener('click', () => {
        const allOpen = detailsList.every((detail) => detail.open);
        detailsList.forEach((detail) => {
          detail.open = !allOpen;
        });
        updateToggleLabel();
      });
    }

    detailsList.forEach((detail) => {
      detail.addEventListener('toggle', updateToggleLabel);
    });

    document.querySelectorAll('[data-jump-link]').forEach((link) => {
      link.addEventListener('click', () => {
        const href = link.getAttribute('href') || '';
        const targetDetail = getTargetDetail(href);
        if (targetDetail && !targetDetail.open) {
          targetDetail.open = true;
        }
      });
    });

    window.addEventListener('hashchange', openHashTarget);
    openHashTarget();
    updateToggleLabel();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAccordionControls);
  } else {
    initAccordionControls();
  }
})();
