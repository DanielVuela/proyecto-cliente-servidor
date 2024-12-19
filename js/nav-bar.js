document.addEventListener('DOMContentLoaded', async () => {
  fetch('components/nav-bar.html')
    .then(response => response.text())  
    .then(html => {
      document.getElementById('header-container').innerHTML = html;  

       checkSession();
    })
    .catch(error => {
      console.error('Error al cargar el encabezado:', error);
    });

  const updateNavBarCount = async () => {
    const response = await fetch("/backend/cart-item.php", {
      credentials: 'include'
    });
    if (response.ok) {
      if (response.status !== 200) {
        // improve alerts
        alert("please log in if you want to see your cart");
        return;
      }
      const cartInfo = await response.json();
      const counterElement = document.getElementById("cart-count");
      if(cartInfo && counterElement)
        counterElement.textContent = cartInfo.items.length;
      
    } else {
      // improve alerts
   //   alert("oops something went wrong loading your current cart");
    }
  };

  const checkSession = async () => {
    try {
      const response = await fetch("/backend/check-session.php", {
        credentials: 'include'
      });
      const data = await response.json();
      const historyButton = document.querySelector('.history');
      const loginButton = document.querySelector('.history#login');

      if (data.sessionActive) {
        historyButton.style.display = 'block'; // Muestra el botón
        loginButton.style.display = 'none'; // Oculta el botón
      } else {
        historyButton.style.display = 'none'; // Oculta el botón
        loginButton.style.display = 'block'; // Muestra el botón
      }
    } catch (error) {
      console.error("Error al verificar la sesión:", error);
    }
  };

  updateNavBarCount();
  window.refreshCartCount = updateNavBarCount;
})