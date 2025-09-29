// Contoh data produk
const products = [
    { id: 1, name: "Bulu Mata Natural", price: 25000 },
    { id: 2, name: "Bulu Mata Volume", price: 40000 },
    { id: 3, name: "Lem Bulu Mata", price: 15000 }
];

// Render produk
const productList = document.getElementById("product-list");
products.forEach(p => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
        <div class="product-name">${p.name}</div>
        <div class="product-price">Rp ${p.price.toLocaleString()}</div>
        <button class="add-button" onclick="addToCart(${p.id})">Tambah</button>
    `;
    productList.appendChild(card);
});

// Keranjang
let cart = [];
function addToCart(id) {
    const product = products.find(p => p.id === id);
    cart.push(product);
    renderCart();
}

function renderCart() {
    const itemsEl = document.getElementById("items");
    const totalEl = document.getElementById("total");
    itemsEl.innerHTML = "";
    let total = 0;
    cart.forEach(item => {
        const li = document.createElement("li");
        li.textContent = `${item.name} - Rp ${item.price.toLocaleString()}`;
        itemsEl.appendChild(li);
        total += item.price;
    });
    totalEl.textContent = total.toLocaleString();
    document.getElementById("date").textContent = new Date().toLocaleString();
}

// --- Fungsi cetak popup ---
function printReceipt() {
    const receiptContent = document.getElementById("receipt").innerHTML;
    const printWindow = window.open("", "_blank", "width=400,height=600");
    printWindow.document.open();
    printWindow.document.write(`
        <html>
        <head>
            <title>Struk</title>
            <style>
                body { font-family: 'Courier New', monospace; padding: 20px; }
                h2 { text-align: center; }
                ul { list-style: none; padding: 0; }
                li { margin-bottom: 5px; }
            </style>
        </head>
        <body>
            ${receiptContent}
            <script>
                window.onload = function() { window.print(); window.close(); }
            <\/script>
        </body>
        </html>
    `);
    printWindow.document.close();
}