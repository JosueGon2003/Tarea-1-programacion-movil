document.addEventListener('DOMContentLoaded', function () {
    const toggleButton = document.querySelector('[data-collapse-toggle="mobile-menu"]');
    const navbarMenu = document.getElementById('mobile-menu');
  
    toggleButton.addEventListener('click', function () {
      navbarMenu.classList.toggle('hidden');
    });
  });

  function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
  
    if (username === 'admin' && password === 'password123') {
      alert('Inicio de sesión exitoso');
      window.location.href = 'index.html'; 
    } else {
      alert('Usuario o contraseña incorrectos');
    }
  }


  