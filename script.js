// Inisialisasi data default jika kosong
let products = JSON.parse(localStorage.getItem('products')) || [
    { id: 1, name: 'Bulu Mata Natural', price: 50000, photo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZmZiNmMxIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iI2ZmMTQ5MyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkJ1bHUgTWF0YTwvdGV4dD48L3N2Zz4=', category: 'natural', stock: 50, discount: 0 },
    { id: 2, name: 'Bulu Mata Volume', price: 75000, photo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZmZiNmMxIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iI2ZmMTQ5MyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlZvbHVtZTwvdGV4dD48L3N2Zz4=', category: 'dramatic', stock: 30, discount: 10 },
    { id: 3, name: 'Lem Bulu Mata', price: 25000, photo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZmZiNmMxIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iI2ZmMTQ5MyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkxlbcKuPC90ZXh0Pjwvc3ZnPg==', category: 'accessories', stock: 100, discount: 0 },
    { id: 4, name: 'Pembersih Bulu Mata', price: 15000, photo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZmZiNmMxIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iI2ZmMTQ5MyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkNsZWFuZXI8L3RleHQ+PC9zdmc+', category: 'accessories', stock: 80, discount: 5 }
];

let cart = [];
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let currentCategory = 'Semua';

// Fungsi untuk mendapatkan elemen DOM setelah halaman dimuat
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

// Inisialisasi event listeners setelah DOM dimuat
function initializeEventListeners() {
    const elements = getDOMElements();
    
    // Toggle Admin Mode
    if (elements.adminBtn) {
        elements.adminBtn.addEventListener('click', () => {
            elements.adminPanel.classList.toggle('hidden');
            if (!elements.adminPanel.classList.contains('hidden')) {
                renderAdminProducts();
            }
        });
    }

    // Tab Navigation
    if (elements.tabs) {
        elements.tabs.forEach(tab => {
            tab.addEventListener('click', function() {
                // Hapus kelas active dari semua tab dan konten
                elements.tabs.forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                
                // Tambah kelas active ke tab yang diklik
                this.classList.add('active');
                
                // Tampilkan konten yang sesuai
                const tabId = this.getAttribute('data-tab');
                document.getElementById(tabId).classList.add('active');
            });
        });
    }

    // Kategori produk
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

    // Pencarian produk
    if (elements.searchInput) {
        elements.searchInput.addEventListener('input', function() {
            renderProducts();
        });
    }

    // Checkout
    if (elements.checkoutBtn) {
        elements.checkoutBtn.addEventListener('click', checkout);
    }

    // Print struk
    if (elements.printBtn) {
        elements.printBtn.addEventListener('click', printReceipt);
    }

    // Kosongkan keranjang
    if (elements.clearCartBtn) {
        elements.clearCartBtn.addEventListener('click', clearCart);
    }

    // Export data
    if (elements.exportBtn) {
        elements.exportBtn.addEventListener('click', exportData);
    }

    // Import data
    if (elements.importBtn) {
        elements.importBtn.addEventListener('click', importData);
    }

    // Tambah produk baru (admin)
    if (elements.addProductBtn) {
        elements.addProductBtn.addEventListener('click', addNewProduct);
    }

    // Simpan perubahan produk (admin)
    if (elements.saveProductsBtn) {
        elements.saveProductsBtn.addEventListener('click', saveProducts);
    }

    // Simpan produk (form admin)
    if (elements.saveProductBtn) {
        elements.saveProductBtn.addEventListener('click', saveProductForm);
    }

    // Batal edit (form admin)
    if (elements.cancelEditBtn) {
        elements.cancelEditBtn.addEventListener('click', cancelEdit);
    }
}

// Render Produk di Grid
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
        const discountedPrice = product.price * (1 - product.discount / 100);
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="product-image">
                <img src="${product.photo}" alt="${product.name}">
            </div>
            <div class="product-name">${product.name}</div>
            <div class="product-price">Rp ${product.price.toLocaleString('id-ID')}</div>
            ${product.discount > 0 ? `<div class="product-discount">Diskon ${product.discount}%: Rp ${discountedPrice.toLocaleString('id-ID')}</div>` : ''}
            <div class="product-stock">Stok: ${product.stock}</div>
            <button class="add-button" onclick="addToCart(${product.id})">Tambah</button>
        `;
        elements.productsGrid.appendChild(card);
    });
}

// Tambah ke Keranjang
function addToCart(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;
    
    const existing = cart.find(item => item.id === id);
    if (existing) {
        if (existing.quantity < product.stock) {
            existing.quantity += 1;
        } else {
            alert('Stok tidak mencukupi!');
            return;
        }
    } else {
        if (product.stock > 0) {
            cart.push({ ...product, quantity: 1 });
        } else {
            alert('Stok habis!');
            return;
        }
    }
    renderCart();
}

// Render Keranjang
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
            const itemTotal = item.price * item.quantity * (1 - item.discount / 100);
            total += itemTotal;
            
            const li = document.createElement('li');
            li.className = 'cart-item';
            li.innerHTML = `
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">Rp ${itemTotal.toLocaleString('id-ID')}</div>
                </div>
                <div class="cart-item-quantity">
                    <button class="quantity-btn" onclick="decreaseQuantity(${item.id})">-</button>
                    <span>${item.quantity}</span>
                    <button class="quantity-btn" onclick="increaseQuantity(${item.id})">+</button>
                    <button class="quantity-btn" onclick="removeFromCart(${item.id})" style="background: #e74c3c; color: white; margin-left: 5px;">×</button>
                </div>
            `;
            elements.cartList.appendChild(li);
        });
    }
    
    elements.totalEl.textContent = `Rp ${total.toLocaleString('id-ID')}`;
}

// Kurangi jumlah item
function decreaseQuantity(id) {
    const item = cart.find(item => item.id === id);
    if (item && item.quantity > 1) {
        item.quantity -= 1;
    } else {
        removeFromCart(id);
    }
    renderCart();
}

// Tambah jumlah item
function increaseQuantity(id) {
    const item = cart.find(item => item.id === id);
    const product = products.find(p => p.id === id);
    
    if (item && product && item.quantity < product.stock) {
        item.quantity += 1;
    } else {
        alert('Stok tidak mencukupi!');
    }
    renderCart();
}

// Hapus dari Keranjang
function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    renderCart();
}

// Checkout
function checkout() {
    if (cart.length === 0) {
        alert('Keranjang kosong!');
        return;
    }
    
    const customerName = document.querySelector('.customer-input input')?.value || 'Customer';
    const paymentAmount = parseFloat(document.querySelector('.payment-input input')?.value) || 0;
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity * (1 - item.discount / 100)), 0);
    
    if (paymentAmount < total) {
        alert(`Jumlah bayar kurang! Total: Rp ${total.toLocaleString('id-ID')}`);
        return;
    }
    
    const change = paymentAmount - total;
    const date = new Date().toLocaleString('id-ID');
    
    // Simpan transaksi
    const transaction = { 
        id: Date.now(), 
        date, 
        customerName,
        items: [...cart], 
        total,
        paymentAmount,
        change
    };
    transactions.push(transaction);
    localStorage.setItem('transactions', JSON.stringify(transactions));
    
    // Update stok produk
    cart.forEach(cartItem => {
        const product = products.find(p => p.id === cartItem.id);
        if (product) {
            product.stock -= cartItem.quantity;
        }
    });
    localStorage.setItem('products', JSON.stringify(products));
    
    // Tampilkan struk
    showReceipt(transaction);
    
    // Kosongkan keranjang
    cart = [];
    renderCart();
    
    // Reset form
    if (document.querySelector('.customer-input input')) {
        document.querySelector('.customer-input input').value = '';
    }
    if (document.querySelector('.payment-input input')) {
        document.querySelector('.payment-input input').value = '';
    }
}

// Tampilkan struk
function showReceipt(transaction) {
    const receipt = document.getElementById('receipt');
    const receiptDate = document.getElementById('receiptDate');
    const receiptItems = document.getElementById('receiptItems');
    const receiptTotal = document.getElementById('receiptTotal');
    
    if (!receipt || !receiptDate || !receiptItems || !receiptTotal) return;
    
    receiptDate.textContent = transaction.date;
    receiptItems.innerHTML = '';
    
    transaction.items.forEach(item => {
        const itemTotal = item.price * item.quantity * (1 - item.discount / 100);
        const li = document.createElement('li');
        li.textContent = `${item.name} x${item.quantity} - Rp ${itemTotal.toLocaleString('id-ID')}`;
        receiptItems.appendChild(li);
    });
    
    receiptTotal.textContent = transaction.total.toLocaleString('id-ID');
    
    receipt.classList.remove('hidden');
}

// Print struk
function printReceipt() {
    if (cart.length === 0) {
        alert('Tidak ada transaksi untuk dicetak!');
        return;
    }
    
    // Buat transaksi sementara untuk print
    const date = new Date().toLocaleString('id-ID');
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity * (1 - item.discount / 100)), 0);
    const transaction = { id: Date.now(), date, items: [...cart], total };
    
    showReceipt(transaction);
    
    setTimeout(() => {
        window.print();
        document.getElementById('receipt').classList.add('hidden');
    }, 500);
}

// Kosongkan Keranjang
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

// Admin: Render Daftar Produk untuk Edit
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
            <input type="number" value="${product.stock}" id="stock-${product.id}" placeholder="Stok">
            <input type="file" accept="image/*" onchange="updatePhoto(${product.id}, this)">
            <button onclick="deleteProduct(${product.id})">Hapus</button>
        `;
        elements.productList.appendChild(li);
    });
}

// Update Foto (Base64)
function updatePhoto(id, input) {
    const file = input.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const product = products.find(p => p.id === id);
            product.photo = e.target.result;
            // Update preview
            const img = input.previousElementSibling.previousElementSibling.previousElementSibling;
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

// Tambah Produk Baru
function addNewProduct() {
    const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
    const newProduct = { 
        id: newId, 
        name: 'Produk Baru', 
        price: 0, 
        photo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZmZiNmMxIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iI2ZmMTQ5MyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5ldzwvdGV4dD48L3N2Zz4=',
        category: 'natural',
        stock: 0,
        discount: 0
    };
    products.push(newProduct);
    renderAdminProducts();
}

// Hapus Produk
function deleteProduct(id) {
    if (confirm('Yakin hapus produk ini?')) {
        products = products.filter(p => p.id !== id);
        renderAdminProducts();
        renderProducts();
        localStorage.setItem('products', JSON.stringify(products));
    }
}

// Simpan Perubahan Produk (Admin Panel)
function saveProducts() {
    products.forEach(product => {
        const nameInput = document.getElementById(`name-${product.id}`);
        const priceInput = document.getElementById(`price-${product.id}`);
        const discountInput = document.getElementById(`discount-${product.id}`);
        const stockInput = document.getElementById(`stock-${product.id}`);
        
        if (nameInput) product.name = nameInput.value;
        if (priceInput) product.price = parseInt(priceInput.value) || 0;
        if (discountInput) product.discount = parseInt(discountInput.value) || 0;
        if (stockInput) product.stock = parseInt(stockInput.value) || 0;
    });
    
    localStorage.setItem('products', JSON.stringify(products));
    renderProducts();
    alert('Produk berhasil disimpan!');
}

// Simpan Produk (Form Admin)
function saveProductForm() {
    const name = document.getElementById('product-name').value;
    const price = parseInt(document.getElementById('product-price').value) || 0;
    const discount = parseInt(document.getElementById('product-discount').value) || 0;
    const stock = parseInt(document.getElementById('product-stock').value) || 0;
    const category = document.getElementById('product-category').value;
    
    if (name && price > 0) {
        const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
        const newProduct = {
            id: newId,
            name,
            price,
            discount,
            stock,
            category,
            photo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZmZiNmMxIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iI2ZmMTQ5MyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5ldzwvdGV4dD48L3N2Zz4='
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
        alert('Harap isi nama dan harga produk dengan benar!');
    }
}

// Batal edit (Form Admin)
function cancelEdit() {
    document.getElementById('product-name').value = '';
    document.getElementById('product-price').value = '';
    document.getElementById('product-discount').value = '';
    document.getElementById('product-stock').value = '';
    document.getElementById('product-description').value = '';
}

// Export Data
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

// Import Data
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

// Test local storage sebelum load
if (typeof(Storage) === "undefined") {
    alert("Browser Anda tidak support localStorage! Beberapa fitur mungkin tidak bekerja.");
}

// Inisialisasi App saat halaman load
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    renderProducts();
    renderCart();
});
