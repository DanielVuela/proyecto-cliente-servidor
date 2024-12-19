document.addEventListener("DOMContentLoaded", async () => {
  const purchaseHistoryItemsContainer = document.getElementById("purchase-history-items");

  const renderPurchaseHistory = async () => {
    purchaseHistoryItemsContainer.innerHTML = "";
    const response = await fetch("backend/invoice.php", {
      credentials: "include",
    });

    if (response.ok) {
      const purchaseHistory = await response.json();
      if( !purchaseHistory || purchaseHistory.length === 0){
        purchaseHistoryItemsContainer.innerHTML =
        `<img src="img/nodata_4x.png" alt="No se encontraron resultados" style="height = 70%; max-width: 100%;"></img>`;
        return;
      }
      purchaseHistory.forEach((order) => {
        const cardElement = document.createElement("div");
        cardElement.classList.add("card", "mb-4", "shadow-sm");

        // header
        const cardHeader = document.createElement("div");
        cardHeader.classList.add("card-header", "bg-primary", "text-white");
        cardHeader.innerHTML = `
          <h5 class="mb-0">Factura #${order.invoice_id}</h5>
          <small>Fecha: ${order.created_at}</small>
        `;
        cardElement.appendChild(cardHeader);

        // productos
        const table = document.createElement("table");
        table.classList.add("table", "table-hover", "table-bordered", "mb-0");

        // columnas
        const tableHeader = `
          <thead class="thead-dark">
            <tr>
              <th scope="col">Imagen</th>
              <th scope="col">Nombre</th>
              <th scope="col">Descripción</th>
              <th scope="col">Cantidad</th>
              <th scope="col">Subtotal</th>
            </tr>
          </thead>
          <tbody>
          </tbody>
        `;
        table.innerHTML = tableHeader;

        const tableBody = table.querySelector("tbody");
        // productos
        order.items.forEach((product) => {
          const row = document.createElement("tr");
          row.innerHTML = `
            <td>
              <img src="${product.image_url}" alt="${product.description}" class="img-fluid" style="max-width: 100px; height: auto;">
            </td>
            <td>${product.name}</td>
            <td>${product.description}</td>
            <td>${product.quantity}</td>
            <td>${product.subtotal}</td>
          `;
          tableBody.appendChild(row);
        });

        const cardBody = document.createElement("div");
        cardBody.classList.add("card-body", "p-0");
        cardBody.appendChild(table);
        cardElement.appendChild(cardBody);

        // el total
        const cardFooter = document.createElement("div");
        cardFooter.classList.add("card-footer", "text-end", "fw-bold");
        cardFooter.innerHTML = `Total: ${order.total}`;
        cardElement.appendChild(cardFooter);

        purchaseHistoryItemsContainer.appendChild(cardElement);
      });
    } else {
      alert("Oops, algo salió mal al cargar tu historial de compras.");
    }
  };

  await renderPurchaseHistory();
});