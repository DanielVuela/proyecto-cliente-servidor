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
            console.error('mensaje:', response);

            if (response.ok) {
                const products = await response.json();
                //  console.log(products);

                renderProducts(products);
            } else {
                if (response.status === 401) {
                    // Redirigir a la página de inicio si no está autorizado
                    window.location.href = '/index.html';
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
        //console.log(productList);
        if (!productList) {
            console.error('Elemento con id "product-list" no encontrado.');
            return;
        }

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
                        <p class="card-text"><strong>Stock:</strong> ${product.stock || '0'} unidades</p>
                    </div>
                    <div class="card-footer d-flex justify-content-between">
                        <button class="btn btn-success btn-xl">Agregar</button>

                    </div>
                </div>
            `;

            productList.appendChild(productCard);

            // Asignar el evento al botón "Agregar"
            const button = productCard.querySelector('button');
            button.addEventListener('click', () => {
                viewProduct(product.id);  // Llama a viewProduct con el ID del producto
            });
        });
    }

    function viewProduct(productId) {
        //    window.location.href = `product.php?id=${productId}`; // Redirige a la página product.php con el ID del producto
        // Abre la página del producto en una nueva pestaña
        window.open(`/product-details.html?id=${productId}`, '_blank');
    }

    loadProducts();

});


document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');  // Obtiene el ID del producto desde la URL
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
    }

    function renderError(message) {
        const container = document.querySelector('.container');
        container.innerHTML = `<div class="alert alert-danger">${message}</div>`;
    }

    document.getElementById('add-to-cart-btn').addEventListener('click', async (event) => {
        event.preventDefault();
        const button = event.target;
        if (wasSubmit) return;

        const response = await fetch('http://localhost:3000/backend/cart-item.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({ productId, quantity: 1 }) // always create it with one
        });

        const result = await response.json();
        console.log(result);
        if (response.ok) {
            wasSubmit = true;
            button.textContent = "Thanks :)"
            if(window.refreshCartCount) window.refreshCartCount();
            // TODO: alerts
            // TODO: counter
        } else {
            alert("Item no se pudo agregar"); // error 500
            // loginError.style.display = 'block';
            // loginError.textContent = result.error || 'Invalid username/password';
        }
    });

    fetchProduct();
});
