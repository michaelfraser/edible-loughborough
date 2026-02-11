import Collapse from './bootstrap/js/src/collapse.js';

(function() {
  document.documentElement.classList.add('has-js');
  const topButton = document.querySelector('a.back-to-top');
  if (!topButton) {
    console.error('Back to top button not found');
    return;
  }

  topButton.addEventListener('click', function(e) {
    e.preventDefault(); // Stop the default #top jump
    
    // Check if user prefers reduced motion
    const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches 
      ? 'auto' 
      : 'smooth';

    window.scrollTo({
      top: 0,
      behavior: behavior
    });
  });

  function updateButtonVisibility() {
    const scrollThreshold = 400; // Show button after scrolling 400px down
    const scrolled = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    
    const pastThreshold = scrolled > scrollThreshold;
    const atBottom = scrolled + windowHeight >= documentHeight - 10;
    const scrolledToBottom = (scrolled > 0 ) && atBottom;    
    if (pastThreshold || scrolledToBottom) {
      topButton.classList.add('visible');
    } else {
      topButton.classList.remove('visible');
    }
  }
  
  // Update on scroll with slight debouncing for performance
  let scrollTimeout;
  window.addEventListener('scroll', function() {
    if (scrollTimeout) {
      window.cancelAnimationFrame(scrollTimeout);
    }
    scrollTimeout = window.requestAnimationFrame(updateButtonVisibility);
  });
  
  updateButtonVisibility();
})();