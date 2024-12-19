document.addEventListener("DOMContentLoaded", async () => {
  const cartItemsContainer = document.getElementById("cart-items");
  const cartTotalContainer = document.getElementById("cart-total");
  const checkoutButton = document.getElementById("checkout-button");
  let cartId;
  let isLoading;

  const deleteItem = (btn) => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();

      let target = e.target;
      while (target && !target.dataset.id) {
        target = target.parentElement;
      }

      const id = target.dataset.id;
      if (!id) {
        alert("No se pudo borrar el producto, favor refrescar la pagina.");
        return;
      }
      const response = await fetch("http://localhost:3000/backend/cart-item.php", {
        credentials: 'include',
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id }) // en json se envia el id
      });
      if (response.ok) {
        await renderCart(); // Recargar el carrito después de eliminar el producto
        await window.refreshCartCount();
        renderSuccess("Producto eliminado del carrito.");

      } else {
        alert("Error eliminando el producto del carrito.");
      }


    });
  };

  const updateQuantity = (btn) => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();

      let target = e.target;
      while (target && !target.dataset.id) {
        target = target.parentElement;
      }

      const { id, stock, quantity } = target.dataset;
      if (Number(stock) < Number(quantity) || Number(quantity) <= 0) return;
      if (!id) {
        alert("No se pudo borrar el producto, favor refrescar la pagina.");
        return;
      }
      const response = await fetch("http://localhost:3000/backend/cart-item.php", {
        credentials: 'include',
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id, quantity })
      });
      if (response.ok) {
        await renderCart(); // Recargar el carrito después de eliminar el producto
        await window.refreshCartCount();
        renderSuccess("Producto eliminado del carrito.");

      } else {
        alert("Error eliminando el producto del carrito.");
      }


    });
  };


  const renderCart = async () => {
    cartItemsContainer.innerHTML = "";
    const response = await fetch("backend/cart-item.php", {
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
      counterElement.textContent = cartInfo.items.length;
      cartId = cartInfo.cart.id;
      cartInfo.items.forEach((product) => {
        const productElement = document.createElement("tr");
        productElement.innerHTML = `
                    <td><img src="${product.product_image}" alt="${product.product_description}" class="cart-item-image" style="width: 100px; height: 100px; object-fit: cover;"></td>
                    <td>${product.product_name}</td>
                    <td>${product.product_price}</td>
                    <td>
                      <button class="btn ${product.quantity > 1 ? 'btn-primary' : 'btn-secondary'} substract-one" data-stock="${product.stock}" data-quantity="${product.quantity - 1}" data-id="${product.cart_item_id}">
                        <i class="fa-solid fa-minus"></i>
                      </button>
                      <span style="font-weight: bold; margin: 0 4px;"> ${product.quantity} </span>
                      <button class="btn ${product.quantity >= product.stock ? 'btn-secondary' : 'btn-primary'} add-one" data-stock="${product.stock}" data-quantity="${product.quantity + 1}" data-id="${product.cart_item_id}">
                        <i class="fa-solid fa-plus"></i>
                      </button>
                      <button class="btn btn-danger remove-item" data-id="${product.cart_item_id}">
                        <i class="fa-solid fa-trash-can"></i>
                      </button>
                    </td>
                `;
        cartItemsContainer.appendChild(productElement);
      });
      cartTotalContainer.innerHTML = `<h3>Total: $${cartInfo.items.reduce((accumulator, p) => accumulator + Number(p.product_price), 0)}</h3>`;
      document.querySelectorAll(".substract-one").forEach(updateQuantity);
      document.querySelectorAll(".add-one").forEach(updateQuantity);
      document.querySelectorAll(".remove-item").forEach(deleteItem);

    } else {
      // improve alerts
      alert("oops something went wrong loading your current cart");
    }
  };

  async function renderSuccess(message) {
    // Selecciona el contenedor donde se mostrará el mensaje
    const container = document.querySelector('.container');

    // Crea un elemento `div` con el mensaje
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-danger alert-dismissible fade show';
    alertDiv.role = 'alert';
    alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;

    // Agrega el mensaje al contenedor
    container.appendChild(alertDiv);
    //   await renderCart(); // Recargar el carrito después de eliminar el producto
    //   await   window.refreshCartCount();
    // Elimina la notificación automáticamente después de 3 segundos
    setTimeout(() => {
      alertDiv.classList.remove('show');
      alertDiv.classList.add('hide');
      setTimeout(() => alertDiv.remove(), 500); // Elimina el elemento del DOM
    }, 3000);
  }


  checkoutButton.addEventListener("click", async () => {
    const response = await fetch("backend/invoice.php", {
      'Content-Type': 'application/x-www-form-urlencoded',
      credentials: 'include',
      method: 'POST',
      body: new URLSearchParams({ cart_id: cartId })
    });
    if (response.ok) {
      const result = await response.json();
      console.log(result);
    } else {
      // TODO: hacer esto bonito
      alert("No se pudo proceder con la compra.")
    }
  });

  await renderCart();
});