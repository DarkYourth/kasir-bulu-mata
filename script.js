// Inisialisasi data default jika kosong
let products = JSON.parse(localStorage.getItem('products')) || [
    { id: 1, name: 'Bulu Mata Natural', price: 50000, discount: 0, photo: 'data:image/svg+xml;base64,...', category: 'natural' },
    { id: 2, name: 'Bulu Mata Volume', price: 75000, discount: 10, photo: 'data:image/svg+xml;base64,...', category: 'dramatic' },
    { id: 3, name: 'Lem Bulu Mata', price: 25000, discount: 0, photo: 'data:image/svg+xml;base64,...', category: 'accessories' },
    { id: 4, name: 'Pembersih Bulu Mata', price: 15000, discount: 5, photo: 'data:image/svg+xml;base64,...', category: 'accessories' }
];

let cart = [];
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let currentCategory = 'Semua';

// ===== Utility: Format & Parse =====
function formatCurrency(num) {
    return new Intl.NumberFormat('id-ID').format(num || 0);
}

function parseCurrency(str) {
    if (typeof str === 'number') return Math.round(str);
    if (!str) return 0;
    const digits = String(str).replace(/[^\d]/g, '');
    return digits ? parseInt(digits, 10) : 0;
}

// ===== DOM =====
function getDOMElements() {
    return {
        adminBtn: document.getElementById('adminBtn'),
        adminPanel: document.getElementById('adminPanel'),
        productsGrid: document.getElementById('productsGrid'),
        cartList: document.getElementById('cartList'),
        cartEmpty: document.getElementById('cartEmpty'),
        totalEl: document.getElementById('total'),
        checkoutBtn: document.getElementById('checkoutBtn'),
        printBtn: document.getElementById('printBtn'),
        clearCartBtn: document.getElementById('clearCartBtn'),
        exportBtn: document.getElementById('exportBtn'),
        importBtn: document.getElementById('importBtn'),
        addProductBtn: document.getElementById('addProductBtn'),
        saveProductsBtn: document.getElementById('saveProductsBtn'),
        productList: document.getElementById('productList'),
        searchInput: document.querySelector('.search-input'),
        categories: document.querySelectorAll('.category'),
        tabs: document.querySelectorAll('.tab'),
        saveProductBtn: document.getElementById('save-product'),
        cancelEditBtn: document.getElementById('cancel-edit')
    };
}

// ===== Init Events =====
function initializeEventListeners() {
    const elements = getDOMElements();

    if (elements.adminBtn) {
        elements.adminBtn.addEventListener('click', () => {
            elements.adminPanel.classList.toggle('hidden');
            if (!elements.adminPanel.classList.contains('hidden')) {
                renderAdminProducts();
            }
        });
    }

    if (elements.tabs) {
        elements.tabs.forEach(tab => {
            tab.addEventListener('click', function() {
                elements.tabs.forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                this.classList.add('active');
                const tabId = this.getAttribute('data-tab');
                document.getElementById(tabId).classList.add('active');
            });
        });
    }

    if (elements.categories) {
        elements.categories.forEach(cat => {
            cat.addEventListener('click', function() {
                elements.categories.forEach(c => c.classList.remove('active'));
                this.classList.add('active');
                currentCategory = this.textContent;
                renderProducts();
            });
        });
    }

    if (elements.searchInput) {
        elements.searchInput.addEventListener('input', function() {
            renderProducts();
        });
    }

    if (elements.checkoutBtn) elements.checkoutBtn.addEventListener('click', checkout);
    if (elements.printBtn) elements.printBtn.addEventListener('click', printReceipt);
    if (elements.clearCartBtn) elements.clearCartBtn.addEventListener('click', clearCart);
    if (elements.exportBtn) elements.exportBtn.addEventListener('click', exportData);
    if (elements.importBtn) elements.importBtn.addEventListener('click', importData);
    if (elements.addProductBtn) elements.addProductBtn.addEventListener('click', addNewProduct);
    if (elements.saveProductsBtn) elements.saveProductsBtn.addEventListener('click', saveProducts);
    if (elements.saveProductBtn) elements.saveProductBtn.addEventListener('click', saveProductForm);
    if (elements.cancelEditBtn) elements.cancelEditBtn.addEventListener('click', cancelEdit);
}

// ===== Produk =====
function renderProducts() {
    const elements = getDOMElements();
    if (!elements.productsGrid) return;

    elements.productsGrid.innerHTML = '';
    const searchTerm = elements.searchInput ? elements.searchInput.value.toLowerCase() : '';

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm);
        const matchesCategory = currentCategory === 'Semua' || product.category === currentCategory.toLowerCase();
        return matchesSearch && matchesCategory;
    });

    if (filteredProducts.length === 0) {
        elements.productsGrid.innerHTML = '<div class="no-products">Tidak ada produk yang ditemukan</div>';
        return;
    }

    filteredProducts.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="product-image">
                <img src="${product.photo}" alt="${product.name}">
            </div>
            <div class="product-name">${product.name}</div>
            ${product.discount > 0 ? `<div class="product-discount">Diskon ${product.discount}%</div>` : ''}
            <button class="add-button" onclick="addToCart(${product.id})">Tambah</button>
        `;
        elements.productsGrid.appendChild(card);
    });
}

// ===== Keranjang =====
function addToCart(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    const base = product.price || 0;
    const discount = product.discount || 0;
    const eff = Math.round(base * (1 - discount / 100));

    const existing = cart.find(item => item.id === id);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ id: product.id, name: product.name, category: product.category, photo: product.photo, basePrice: base, discount: discount, price: eff, quantity: 1 });
    }
    renderCart();
}

function updateBasePrice(id, newPriceStr) {
    const item = cart.find(i => i.id === id);
    if (!item) return;
    const base = parseCurrency(newPriceStr);
    item.basePrice = base;
    item.price = Math.round(base * (1 - (item.discount || 0) / 100));
    renderCart();
}

let renderTimeout = null;
function renderCart() {
    if (renderTimeout) clearTimeout(renderTimeout);
    renderTimeout = setTimeout(() => {
        const elements = getDOMElements();
        if (!elements.cartList || !elements.cartEmpty || !elements.totalEl) return;

        elements.cartList.innerHTML = '';
        let total = 0;

        if (cart.length === 0) {
            elements.cartEmpty.style.display = 'block';
            elements.cartList.style.display = 'none';
        } else {
            elements.cartEmpty.style.display = 'none';
            elements.cartList.style.display = 'block';

            cart.forEach(item => {
                const itemTotal = item.price * item.quantity;
                total += itemTotal;

                const li = document.createElement('li');
                li.className = 'cart-item';
                li.innerHTML = `
                    <div class="cart-item-info">
                        <div class="cart-item-name">${item.name}</div>
                        <div class="cart-item-price-row">
                            <input type="text" value="${formatCurrency(item.basePrice)}"
                                   oninput="updateBasePriceDelayed(${item.id}, this.value)"
                                   class="cart-item-price-input">
                            <div class="cart-item-discount-note">${item.discount > 0 ? `Diskon ${item.discount}% → Rp ${formatCurrency(item.price)}` : `Rp ${formatCurrency(item.price)}`}</div>
                        </div>
                    </div>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn" onclick="decreaseQuantity(${item.id})">-</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-btn" onclick="increaseQuantity(${item.id})">+</button>
                        <button class="quantity-btn" onclick="removeFromCart(${item.id})" style="background:#e74c3c;color:white;margin-left:5px;">×</button>
                    </div>
                `;
                elements.cartList.appendChild(li);
            });
        }
        elements.totalEl.textContent = `Rp ${formatCurrency(total)}`;
    }, 100);
}

function updateBasePriceDelayed(id, newPriceStr) {
    if (renderTimeout) clearTimeout(renderTimeout);
    renderTimeout = setTimeout(() => {
        updateBasePrice(id, newPriceStr);
    }, 500);
}

function decreaseQuantity(id) {
    const item = cart.find(item => item.id === id);
    if (item && item.quantity > 1) item.quantity -= 1;
    else removeFromCart(id);
    renderCart();
}

function increaseQuantity(id) {
    const item = cart.find(item => item.id === id);
    if (item) item.quantity += 1;
    renderCart();
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    renderCart();
}

// ===== Checkout =====
function checkout() {
    if (cart.length === 0) {
        alert('Keranjang kosong!');
        return;
    }

    const customerName = document.querySelector('.customer-input input')?.value || 'Customer';
    const paymentAmount = parseCurrency(document.querySelector('.payment-input input')?.value || "0");
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    if (paymentAmount < total) {
        alert(`Jumlah bayar kurang! Total: Rp ${formatCurrency(total)}`);
        return;
    }

    const change = paymentAmount - total;
    const date = new Date().toLocaleString('id-ID');

    const transaction = { id: Date.now(), date, customerName, items: JSON.parse(JSON.stringify(cart)), total, paymentAmount, change };
    transactions.push(transaction);
    localStorage.setItem('transactions', JSON.stringify(transactions));

    showReceipt(transaction);
    cart = [];
    renderCart();

    if (document.querySelector('.customer-input input')) document.querySelector('.customer-input input').value = '';
    if (document.querySelector('.payment-input input')) document.querySelector('.payment-input input').value = '';
}

// ===== Struk =====
function showReceipt(transaction) {
    const receipt = document.getElementById('receipt');
    const receiptDate = document.getElementById('receiptDate');
    const receiptItems = document.getElementById('receiptItems');
    const receiptTotal = document.getElementById('receiptTotal');

    if (!receipt) return;

    receiptDate.textContent = transaction.date;
    receiptItems.innerHTML = '';

    transaction.items.forEach(item => {
        const itemTotal = item.price * item.quantity;
        const li = document.createElement('li');
        li.textContent = `${item.name} x${item.quantity} - Rp ${formatCurrency(itemTotal)}`;
        receiptItems.appendChild(li);
    });

    receiptTotal.textContent = formatCurrency(transaction.total);
    receipt.classList.remove('hidden');
}

// ✅ Perbaikan: print lebih kompatibel tablet & PC
function printReceipt() {
    if (cart.length === 0) {
        alert('Tidak ada transaksi untuk dicetak!');
        return;
    }

    const date = new Date().toLocaleString('id-ID');
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const transaction = { id: Date.now(), date, items: JSON.parse(JSON.stringify(cart)), total };

    showReceipt(transaction);

    const receiptContent = document.getElementById('receipt').outerHTML;
    const printWindow = window.open('', '', 'width=400,height=600');
    printWindow.document.write(`
        <html>
        <head>
            <title>Struk Uyunk Lashes</title>
            <link rel="stylesheet" href="style.css">
        </head>
        <body>
            ${receiptContent}
            <script>
                window.onload = function() {
                    window.print();
                    window.onafterprint = window.close;
                }
            <\/script>
        </body>
        </html>
    `);
    printWindow.document.close();

    document.getElementById('receipt').classList.add('hidden');
}

function clearCart() {
    if (cart.length === 0) {
        alert('Keranjang sudah kosong!');
        return;
    }
    if (confirm('Yakin ingin mengosongkan keranjang?')) {
        cart = [];
        renderCart();
    }
}

// ===== Admin =====
function renderAdminProducts() {
    const elements = getDOMElements();
    if (!elements.productList) return;

    elements.productList.innerHTML = '';
    products.forEach((product) => {
        const li = document.createElement('li');
        li.className = 'admin-product';
        li.innerHTML = `
            <img src="${product.photo}" alt="${product.name}">
            <input type="text" value="${product.name}" id="name-${product.id}" placeholder="Nama Produk">
            <input type="number" value="${product.price}" id="price-${product.id}" placeholder="Harga">
            <input type="number" value="${product.discount}" id="discount-${product.id}" placeholder="Diskon %" min="0" max="100">
            <input type="file" accept="image/*" onchange="updatePhoto(${product.id}, this)">
            <button onclick="deleteProduct(${product.id})">Hapus</button>
        `;
        elements.productList.appendChild(li);
    });
}

function updatePhoto(id, input) {
    const file = input.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const product = products.find(p => p.id === id);
            if (product) product.photo = e.target.result;
            const li = input.closest('li');
            if (li) {
                const img = li.querySelector('img');
                if (img) img.src = e.target.result;
            }
        };
        reader.readAsDataURL(file);
    }
}

function addNewProduct() {
    const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
    const newProduct = { id: newId, name: 'Produk Baru', price: 0, discount: 0, category: 'natural', photo: 'data:image/svg+xml;base64,...' };
    products.push(newProduct);
    localStorage.setItem('products', JSON.stringify(products));
    renderAdminProducts();
}

function deleteProduct(id) {
    if (confirm('Yakin hapus produk ini?')) {
        products = products.filter(p => p.id !== id);
        localStorage.setItem('products', JSON.stringify(products));
        renderAdminProducts();
        renderProducts();
    }
}

function saveProducts() {
    products.forEach(product => {
        const nameInput = document.getElementById(`name-${product.id}`);
        const priceInput = document.getElementById(`price-${product.id}`);
        const discountInput = document.getElementById(`discount-${product.id}`);

        if (nameInput) product.name = nameInput.value;
        if (priceInput) product.price = parseInt(priceInput.value) || 0;
        if (discountInput) product.discount = parseInt(discountInput.value) || 0;
    });

    localStorage.setItem('products', JSON.stringify(products));
    renderProducts();
    alert('Produk berhasil disimpan!');
}

function saveProductForm() {
    const name = document.getElementById('product-name').value;
    const price = parseInt(document.getElementById('product-price').value) || 0;
    const discount = parseInt(document.getElementById('product-discount').value) || 0;
    const category = document.getElementById('product-category').value;

    if (name) {
        const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
        const newProduct = { id: newId, name, price, discount, category, photo: 'data:image/svg+xml;base64,...' };
        products.push(newProduct);
        localStorage.setItem('products', JSON.stringify(products));
        renderProducts();

        if (!document.getElementById('adminPanel').classList.contains('hidden')) {
            renderAdminProducts();
        }

        alert(`Produk "${name}" berhasil ditambahkan!`);
        cancelEdit();
    } else {
        alert('Harap isi nama produk!');
    }
}

function cancelEdit() {
    document.getElementById('product-name').value = '';
    document.getElementById('product-price').value = '';
    document.getElementById('product-discount').value = '';
}

// ===== Export / Import =====
function exportData() {
    const data = { products: products, transactions: transactions, export_date: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'kasir-bulu-mata-backup.json';
    a.click();
    URL.revokeObjectURL(url);
    alert('Data berhasil di-export! File akan otomatis didownload.');
}

function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (data.products) {
                    products = data.products;
                    localStorage.setItem('products', JSON.stringify(products));
                }
                if (data.transactions) {
                    transactions = data.transactions;
                    localStorage.setItem('transactions', JSON.stringify(transactions));
                }
                renderProducts();
                const elements = getDOMElements();
                if (elements.adminPanel && !elements.adminPanel.classList.contains('hidden')) {
                    renderAdminProducts();
                }
                alert('Data berhasil diimport!');
            } catch (error) {
                alert('Error: File tidak valid!');
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

// ===== Init =====
if (typeof(Storage) === "undefined") {
    alert("Browser Anda tidak support localStorage! Beberapa fitur mungkin tidak bekerja.");
}

document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    renderProducts();
    renderCart();
});
