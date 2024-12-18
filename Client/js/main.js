document.addEventListener("DOMContentLoaded", function() {
    console.log("Página cargada correctamente.");
    updateCartCount();

    const addToCartButtons = document.querySelectorAll("#add-to-cart");
    addToCartButtons.forEach(button => {
        button.addEventListener("click", function(event) {
            event.preventDefault();
            const productCard = this.closest(".card");
            const product = {
                title: productCard.querySelector(".card-title").innerText,
                price: productCard.querySelector(".card-text").innerText,
                image: productCard.querySelector("img").src
            };
            addToCart(product);
        });
    });
});

function addToCart(product) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart.push(product);
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount();
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    document.getElementById("cart-count").innerText = cart.length;
}