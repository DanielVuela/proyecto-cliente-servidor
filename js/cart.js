document.addEventListener("DOMContentLoaded", async () => {
    const cartItemsContainer = document.getElementById("cart-items");
    const cartTotalContainer = document.getElementById("cart-total");
    const checkoutButton = document.getElementById("checkout-button");


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

            cartInfo.items.forEach((product) => {
                const productElement = document.createElement("tr");
                productElement.innerHTML = `
                    <td><img src="${product.product_image}" alt="${product.product_description}" class="cart-item-image" style="width: 100px; height: 100px; object-fit: cover;"></td>
                    <td>${product.product_name}</td>
                    <td>${product.product_price}</td>
                    <td><button class="btn btn-danger remove-item" data-index="${product.cart_item_id}">Eliminar</button></td>
                `;
                cartItemsContainer.appendChild(productElement);

            });
            console.log(cartInfo.items);
            cartTotalContainer.innerHTML = `<h3>Total: $${cartInfo.items.reduce((accumulator, p) => accumulator + Number(p.product_price), 0)}</h3>`;
            document.querySelectorAll(".remove-item").forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    e.preventDefault();
                    const id = e.target.dataset.index;
                    if(!id){
                        alert("No se pudo borrar el producto, favor refrescar la pagina.");
                        return;
                    }
                    const response = await fetch("backend/cart-item.php", {
                        credentials: 'include',
                        method: 'DELETE',
                        body: { id }
                    });

                    // window.refreshCartCount
                });
            });
        } else {
            // improve alerts
            alert("oops something went wrong loading your current cart");
        }
    };

    checkoutButton.addEventListener("click", function () {
        alert("Procediendo al pago...");
    });

    await renderCart();
});