document.addEventListener("DOMContentLoaded", async () => {
    const purchaseHistoryItemsContainer = document.getElementById("purchase-history-items");

    const renderPurchaseHistory = async () => {
        purchaseHistoryItemsContainer.innerHTML = "";
        const response = await fetch("backend/purchase-history.php", {
            credentials: 'include'
        });
        if (response.ok) {
            const purchaseHistory = await response.json();
            purchaseHistory.forEach((order) => {
                order.items.forEach((product) => {
                    const productElement = document.createElement("tr");
                    productElement.innerHTML = `
            <td><img src="${product.product_image}" alt="${product.product_description}" class="cart-item-image" style="width: 100px; height: 100px; object-fit: cover;"></td>
            <td>${product.product_name}</td>
            <td>${product.product_price}</td>
            <td>${product.quantity}</td>
            <td>${product.subtotal}</td>
            <td><button class="btn btn-danger remove-item" data-index="${product.invoice_detail_id}">Eliminar</button></td>
          `;
                    purchaseHistoryItemsContainer.appendChild(productElement);
                });
            });

            document.querySelectorAll(".remove-item").forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    e.preventDefault();
                    const id = e.target.dataset.index;
                    if (!id) {
                        alert("No se pudo borrar el producto, favor refrescar la pagina.");
                        return;
                    }
                    const response = await fetch("backend/purchase-history.php", {
                        credentials: 'include',
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ id }) // en json se envia el id
                    });
                    if (response.ok) {
                        await renderPurchaseHistory(); // Recargar el historial después de eliminar el producto
                    } else {
                        alert("Error eliminando el producto del historial.");
                    }
                });
            });
        } else {
            alert("Oops, algo salió mal al cargar tu historial de compras.");
        }
    };

    await renderPurchaseHistory();
});