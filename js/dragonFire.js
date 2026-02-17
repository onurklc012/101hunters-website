// =====================================================
// DRAGON BACKGROUND — Warm glowing dragon watermark
// Matches the PWA dragon background style
// =====================================================

(function () {
    'use strict';

    // Create dragon wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'dragon-bg-wrapper';

    // Create glow layer
    const glow = document.createElement('div');
    glow.className = 'dragon-glow-layer';
    wrapper.appendChild(glow);

    // Create dragon image
    const img = document.createElement('img');
    img.src = 'assets/images/dragon.png';
    img.alt = '';
    img.className = 'dragon-bg-image';
    img.draggable = false;
    wrapper.appendChild(img);

    // Insert into DOM
    document.addEventListener('DOMContentLoaded', () => {
        document.body.appendChild(wrapper);
    });
})();
