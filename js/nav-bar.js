document.addEventListener('DOMContentLoaded', async () => {
  fetch('components/nav-bar.html')
    .then(response => response.text())  // Convierte la respuesta en texto
    .then(html => {
      document.getElementById('header-container').innerHTML = html;  // Inserta el contenido en el contenedor
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
      alert("oops something went wrong loading your current cart");
    }
  };
  updateNavBarCount();
  window.refreshCartCount = updateNavBarCount;
})