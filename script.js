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
    // Hapus semua yang bukan digit
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
        cancelEditBtn: document.getElementById('cancel-edit'),
        // History elements
        periodFilter: document.getElementById('periodFilter'),
        customDateRange: document.getElementById('customDateRange'),
        startDate: document.getElementById('startDate'),
        endDate: document.getElementById('endDate'),
        transactionsContainer: document.getElementById('transactionsContainer'),
        totalTransactions: document.getElementById('totalTransactions'),
        totalRevenue: document.getElementById('totalRevenue'),
        averageTransaction: document.getElementById('averageTransaction')
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
                
                // Jika pindah ke tab history, render history
                if (tabId === 'history') {
                    renderHistory();
                }
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
    
    // History event listeners
    if (elements.periodFilter) {
        elements.periodFilter.addEventListener('change', function() {
            if (this.value === 'custom') {
                elements.customDateRange.classList.remove('hidden');
            } else {
                elements.customDateRange.classList.add('hidden');
                renderHistory();
            }
        });
    }
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
            <div class="product-price">Rp ${formatCurrency(product.price)}</div>
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
        cart.push({ 
            id: product.id, 
            name: product.name, 
            category: product.category, 
            photo: product.photo, 
            basePrice: base, 
            discount: discount, 
            price: eff, 
            quantity: 1 
        });
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

function renderCart() {
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
}

function decreaseQuantity(id) {
    const item = cart.find(item => item.id === id);
    if (item && item.quantity > 1) {
        item.quantity -= 1;
    } else {
        removeFromCart(id);
    }
    renderCart();
}

function increaseQuantity(id) {
    const item = cart.find(item => item.id === id);
    if (item) {
        item.quantity += 1;
    }
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

    const transaction = { 
        id: Date.now(), 
        date, 
        customerName,
        items: JSON.parse(JSON.stringify(cart)),
        total,
        paymentAmount,
        change
    };
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
    const receiptCustomer = document.getElementById('receiptCustomer');
    const receiptItems = document.getElementById('receiptItems');
    const receiptTotal = document.getElementById('receiptTotal');
    const receiptPayment = document.getElementById('receiptPayment');
    const receiptChange = document.getElementById('receiptChange');

    if (!receipt) return;

    receiptDate.textContent = transaction.date;
    receiptCustomer.textContent = transaction.customerName;
    receiptItems.innerHTML = '';

    transaction.items.forEach(item => {
        const itemTotal = item.price * item.quantity;
        const li = document.createElement('li');
        li.textContent = `${item.name} x${item.quantity} - Rp ${formatCurrency(itemTotal)}`;
        receiptItems.appendChild(li);
    });

    receiptTotal.textContent = formatCurrency(transaction.total);
    receiptPayment.textContent = formatCurrency(transaction.paymentAmount);
    receiptChange.textContent = formatCurrency(transaction.change);
    receipt.classList.remove('hidden');
}

function printReceipt() {
    if (cart.length === 0) {
        alert('Tidak ada transaksi untuk dicetak!');
        return;
    }

    const customerName = document.querySelector('.customer-input input')?.value || 'Customer';
    const paymentAmount = parseCurrency(document.querySelector('.payment-input input')?.value || "0");
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const change = paymentAmount - total;
    const date = new Date().toLocaleString('id-ID');

    const transaction = { 
        id: Date.now(), 
        date, 
        customerName,
        items: JSON.parse(JSON.stringify(cart)), 
        total,
        paymentAmount,
        change
    };

    showReceipt(transaction);

    setTimeout(() => {
        window.print();
        setTimeout(() => {
            document.getElementById('receipt').classList.add('hidden');
        }, 100);
    }, 500);
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

// ===== History Transaksi =====
function renderHistory() {
    const elements = getDOMElements();
    if (!elements.transactionsContainer) return;

    const period = elements.periodFilter ? elements.periodFilter.value : 'day';
    let filteredTransactions = [];

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    switch (period) {
        case 'day':
            filteredTransactions = transactions.filter(t => {
                const transactionDate = new Date(t.date);
                return transactionDate >= today;
            });
            break;
        case 'week':
            filteredTransactions = transactions.filter(t => {
                const transactionDate = new Date(t.date);
                return transactionDate >= startOfWeek;
            });
            break;
        case 'month':
            filteredTransactions = transactions.filter(t => {
                const transactionDate = new Date(t.date);
                return transactionDate >= startOfMonth;
            });
            break;
        case 'custom':
            if (elements.startDate && elements.endDate && elements.startDate.value && elements.endDate.value) {
                const start = new Date(elements.startDate.value);
                const end = new Date(elements.endDate.value);
                end.setHours(23, 59, 59, 999);
                
                filteredTransactions = transactions.filter(t => {
                    const transactionDate = new Date(t.date);
                    return transactionDate >= start && transactionDate <= end;
                });
            } else {
                filteredTransactions = transactions;
            }
            break;
        default:
            filteredTransactions = transactions;
    }

    // Update summary
    const totalTransactions = filteredTransactions.length;
    const totalRevenue = filteredTransactions.reduce((sum, t) => sum + t.total, 0);
    const averageTransaction = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

    if (elements.totalTransactions) elements.totalTransactions.textContent = totalTransactions;
    if (elements.totalRevenue) elements.totalRevenue.textContent = `Rp ${formatCurrency(totalRevenue)}`;
    if (elements.averageTransaction) elements.averageTransaction.textContent = `Rp ${formatCurrency(Math.round(averageTransaction))}`;

    // Render transactions list
    elements.transactionsContainer.innerHTML = '';

    if (filteredTransactions.length === 0) {
        elements.transactionsContainer.innerHTML = '<div class="no-transactions">Tidak ada transaksi ditemukan</div>';
        return;
    }

    filteredTransactions.sort((a, b) => new Date(b.date) - new Date(a.date)).forEach(transaction => {
        const transactionEl = document.createElement('div');
        transactionEl.className = 'transaction-item';
        transactionEl.innerHTML = `
            <div class="transaction-header">
                <div class="transaction-id">#${transaction.id}</div>
                <div class="transaction-date">${transaction.date}</div>
            </div>
            <div class="transaction-customer">Customer: ${transaction.customerName}</div>
            <div class="transaction-details">
                <div class="transaction-items">${transaction.items.length} item(s)</div>
                <div class="transaction-total">Total: Rp ${formatCurrency(transaction.total)}</div>
            </div>
            <div class="transaction-actions">
                <button class="btn btn-primary" onclick="viewTransaction(${transaction.id})">Lihat Detail</button>
                <button class="btn btn-secondary" onclick="reprintReceipt(${transaction.id})">Cetak Ulang</button>
            </div>
        `;
        elements.transactionsContainer.appendChild(transactionEl);
    });
}

function applyCustomFilter() {
    renderHistory();
}

function viewTransaction(transactionId) {
    const transaction = transactions.find(t => t.id === transactionId);
    if (transaction) {
        showReceipt(transaction);
        setTimeout(() => {
            alert(`Detail Transaksi #${transactionId}\nCustomer: ${transaction.customerName}\nTotal: Rp ${formatCurrency(transaction.total)}\nTanggal: ${transaction.date}`);
            document.getElementById('receipt').classList.add('hidden');
        }, 100);
    }
}

function reprintReceipt(transactionId) {
    const transaction = transactions.find(t => t.id === transactionId);
    if (transaction) {
        showReceipt(transaction);
        setTimeout(() => {
            window.print();
            setTimeout(() => {
                document.getElementById('receipt').classList.add('hidden');
            }, 100);
        }, 500);
    }
}

function printHistoryReport() {
    const elements = getDOMElements();
    const period = elements.periodFilter ? elements.periodFilter.value : 'day';
    const periodText = elements.periodFilter ? elements.periodFilter.options[elements.periodFilter.selectedIndex].text : 'Hari Ini';
    
    let reportContent = `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="color: #ff1493; text-align: center;">Laporan Transaksi Uyunk Lashes</h2>
            <p style="text-align: center;">Periode: ${periodText}</p>
            <p style="text-align: center;">Tanggal Cetak: ${new Date().toLocaleString('id-ID')}</p>
            <hr>
    `;

    const filteredTransactions = transactions; // Sesuaikan dengan filter yang aktif
    
    if (filteredTransactions.length > 0) {
        reportContent += `
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <thead>
                    <tr style="background-color: #ffb6c1;">
                        <th style="border: 1px solid #ddd; padding: 8px;">No</th>
                        <th style="border: 1px solid #ddd; padding: 8px;">Tanggal</th>
                        <th style="border: 1px solid #ddd; padding: 8px;">Customer</th>
                        <th style="border: 1px solid #ddd; padding: 8px;">Total</th>
                    </tr>
                </thead>
                <tbody>
        `;

        filteredTransactions.forEach((transaction, index) => {
            reportContent += `
                <tr>
                    <td style="border: 1px solid #ddd; padding: 8px;">${index + 1}</td>
                    <td style="border: 1px solid #ddd; padding: 8px;">${transaction.date}</td>
                    <td style="border: 1px solid #ddd; padding: 8px;">${transaction.customerName}</td>
                    <td style="border: 1px solid #ddd; padding: 8px;">Rp ${formatCurrency(transaction.total)}</td>
                </tr>
            `;
        });

        const totalRevenue = filteredTransactions.reduce((sum, t) => sum + t.total, 0);
        
        reportContent += `
                </tbody>
                <tfoot>
                    <tr style="background-color: #ffe6f2;">
                        <td colspan="3" style="border: 1px solid #ddd; padding: 8px; text-align: right; font-weight: bold;">Total Pendapatan:</td>
                        <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">Rp ${formatCurrency(totalRevenue)}</td>
                    </tr>
                </tfoot>
            </table>
        `;
    } else {
        reportContent += `<p style="text-align: center; color: #666;">Tidak ada transaksi pada periode ini.</p>`;
    }

    reportContent += `</div>`;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
            <head>
                <title>Laporan Transaksi Uyunk Lashes</title>
            </head>
            <body onload="window.print(); window.close();">
                ${reportContent}
            </body>
        </html>
    `);
    printWindow.document.close();
}

function showHistoryTab() {
    // Switch to history tab
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    
    document.querySelector('.tab[data-tab="history"]').classList.add('active');
    document.getElementById('history').classList.add('active');
    
    renderHistory();
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
    const newProduct = { 
        id: newId, 
        name: 'Produk Baru', 
        price: 0, 
        discount: 0,
        category: 'natural',
        photo: 'data:image/svg+xml;base64,...'
    };
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
        const newProduct = {
            id: newId,
            name,
            price,
            discount,
            category,
            photo: 'data:image/svg+xml;base64,...'
        };

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
    const data = {
        products: products,
        transactions: transactions,
        export_date: new Date().toISOString()
    };

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

// ===== Optimasi Render =====
let renderTimeout = null;

function updateBasePriceDelayed(id, newPriceStr) {
    if (renderTimeout) {
        clearTimeout(renderTimeout);
    }
    
    renderTimeout = setTimeout(() => {
        updateBasePrice(id, newPriceStr);
    }, 500);
}

// ===== Init =====
if (typeof(Storage) === "undefined") {
    alert("Browser Anda tidak support localStorage! Beberapa fitur mungkin tidak bekerja.");
}

document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    renderProducts();
    renderCart();
    
    // Set default dates for custom filter
    const today = new Date().toISOString().split('T')[0];
    const startDate = document.getElementById('startDate');
    const endDate = document.getElementById('endDate');
    if (startDate) startDate.value = today;
    if (endDate) endDate.value = today;
});