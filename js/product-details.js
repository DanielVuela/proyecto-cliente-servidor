document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');
  const apiUrl = `http://localhost:3000/backend/products.php?id=${productId}`;
  let wasSubmit = false;
  if (!productId) {
    console.error('No se proporcionó un ID de producto.');
    return;
  }

  async function fetchProduct() {
    try {
      const response = await fetch(apiUrl);

      if (response.ok) {
        const product = await response.json();
        renderProduct(product);
      } else if (response.status === 404) {
        console.error('Producto no encontrado.');
        renderError('Producto no encontrado.');
      } else {
        console.error(`Error al cargar el producto: ${response.status}`);
        renderError('Error al cargar el producto.');
      }
    } catch (error) {
      console.error('Error de red:', error.message);
      renderError('Error de red. Intente más tarde.');
    }
  }

  function renderProduct(product) {
    // Rellena los elementos con los datos del producto
    document.getElementById('product-name').textContent = product.name;
    document.getElementById('product-description').textContent = product.description;
    document.getElementById('product-price').textContent = `$${product.price}`;
    document.getElementById('product-stock').textContent = `${product.stock} unidades`;
    const productImage = document.getElementById('product-image');
    productImage.src = product.image_url;
    productImage.alt = product.name;


    // input para seleccionar la cantidad
    const quantityInput = document.createElement('input');
    quantityInput.type = 'number';
    quantityInput.min = 1;
    quantityInput.max = product.stock;
    quantityInput.value = 1;
    quantityInput.id = 'quantity';
    document.getElementById('quantityData').appendChild(quantityInput);

    const addToCartBtn = document.getElementById('add-to-cart-btn');
    addToCartBtn.addEventListener('click', async (event) => {
      event.preventDefault();
      const button = event.target;
      if (wasSubmit) return;

      const quantity = parseInt(quantityInput.value);
      if (quantity < 1 || quantity > product.stock) {
        alert(`Por favor, selecciona una cantidad entre 1 y ${product.stock}.`);
        return;
      }

      const response = await fetch('http://localhost:3000/backend/cart-item.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ productId, quantity }),
      });

      const result = await response.json();
      if (response.ok) {
        wasSubmit = true;
        button.textContent = "Thanks :)"
        renderSuccess("Producto Agregado al carrito.");

        if (window.refreshCartCount) window.refreshCartCount();
      } else {
        container.innerHTML = `<div class="alert alert-danger">Item no se pudo agregar</div>`;
      }
    });

  }

  async function renderSuccess(message) {
    const container = document.querySelector('.container');

    // Crea un elemento div con el mensaje
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-success alert-dismissible fade show';
    alertDiv.role = 'alert';
    alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;

    // Agrega el mensaje al contenedor
    container.appendChild(alertDiv);
    //   await   window.refreshCartCount();

    setTimeout(() => {
      alertDiv.classList.remove('show');
      alertDiv.classList.add('hide');
      setTimeout(() => alertDiv.remove(), 500); // Elimina el elemento del DOM
    }, 3000);
  }

  function renderError(message) {
    const container = document.querySelector('.container');
    container.innerHTML = `<div class="alert alert-danger">${message}</div>`;
  }
  fetchProduct();
});
