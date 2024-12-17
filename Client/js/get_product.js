document.addEventListener('DOMContentLoaded', () => {
    const productList = document.getElementById('product-list');
    const API_URL = 'backend/products.php';
    const url = 'http://localhost:3000/backend/products.php'; // Ajusta esta ruta

    async function loadProducts() {
        // Función para obtener los productos del servidor
        try {
            const response = await fetch(url, {
                method: 'GET',
                credentials: 'include'
            });
            console.error('mensaje:',response);

            if (response.ok) {
                const products = await response.json();
                console.log(products);

                renderProducts(products);
            } else {
                if (response.status === 401) {
                    // Redirigir a la página de inicio si no está autorizado
                    window.location.href = '/Client/index.html';
                } else {
                    console.error(`Error al obtener productos: ${response.status}`);
                }
            }
        } catch (err) {
            console.error(`Error de red al cargar productos: ${err.message}`);
        }
    }

    function renderProducts(products) {
        // Renderiza los productos en el DOM
        const productList = document.getElementById('product-list');
console.log(productList);
      /*   if (!productList) {
            console.error('Elemento con id "product-list" no encontrado.');
            return;
        } */
        
        productList.innerHTML = ''; // Limpia el contenido existente
    
        products.forEach(product => {
  
            // Crear el card del producto
            const productCard = document.createElement('div');
            productCard.className = 'col-md-4 mb-3';
            productCard.innerHTML = `
                <div class="card">
                    <div class="card-body">
                        <img src="${product.image_url}" class="mx-auto d-block" alt="${product.name}" >
                        <h5 class="card-title">${product.name}</h5>
                        <p class="card-text">${product.description}</p>
                        <p class="card-text"><strong>Precio:</strong> $${product.price || 'N/A'}</p>
                        <p class="card-text"><strong>Stock:</strong> $${product.stock || '0'}</p>
                    </div>
                    <div class="card-footer d-flex justify-content-between">
                        <button class="btn btn-success btn-xl add-product" data-id="${product.id}">Agregar</button>
                    </div>
                </div>
            `;
    
            productList.appendChild(productCard);
        });
    }
    
    loadProducts();

});
 