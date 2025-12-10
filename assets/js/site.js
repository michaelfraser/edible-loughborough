(function() {
  document.documentElement.classList.add('has-js');
  const topButton = document.querySelector('a.top');
  if (!topButton) {
    console.error('Back to top button not found');
    return;
  }
  const scrollThreshold = 400; // Show button after scrolling 400px down
  
  function updateButtonVisibility() {
    const scrolled = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    
    // Check if scrolled past threshold OR at bottom of page
    const pastThreshold = scrolled > scrollThreshold;
    const atBottom = (scrolled + windowHeight) >= documentHeight - 10;
    
    if (pastThreshold || atBottom) {
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
  
  // Check initial state on page load
  updateButtonVisibility();
})();