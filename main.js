document.addEventListener('DOMContentLoaded', function () {
    const toggleButton = document.querySelector('[data-collapse-toggle="mobile-menu"]');
    const navbarMenu = document.getElementById('mobile-menu');
  
    toggleButton.addEventListener('click', function () {
      navbarMenu.classList.toggle('hidden');
    });
  });