document.addEventListener("DOMContentLoaded", function() {
    const cartItemsContainer = document.getElementById("cart-items");
    const cartTotalContainer = document.getElementById("cart-total");
    const checkoutButton = document.getElementById("checkout-button");

    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    function renderCart() {
        cartItemsContainer.innerHTML = "";
        let total = 0;

        cart.forEach((product, index) => {
            const productElement = document.createElement("tr");
            productElement.innerHTML = `
                <td><img src="${product.image}" alt="${product.title}" class="cart-item-image" style="width: 100px; height: 100px; object-fit: cover;"></td>
                <td>${product.title}</td>
                <td>${product.price}</td>
                <td><button class="btn btn-danger remove-item" data-index="${index}">Eliminar</button></td>
            `;
            cartItemsContainer.appendChild(productElement);

            total += parseFloat(product.price.replace("$", ""));
        });

        cartTotalContainer.innerHTML = `<h3>Total: $${total.toFixed(2)}</h3>`;
    }

    cartItemsContainer.addEventListener("click", function(event) {
        if (event.target.classList.contains("remove-item")) {
            const index = event.target.getAttribute("data-index");
            cart.splice(index, 1);
            localStorage.setItem("cart", JSON.stringify(cart));
            renderCart();
            updateCartCount();
        }
    });

    checkoutButton.addEventListener("click", function() {
        alert("Procediendo al pago...");
    });

    renderCart();
});

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    document.getElementById("cart-count").innerText = cart.length;
}