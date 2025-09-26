// Inisialisasi data default jika kosong
let products = JSON.parse(localStorage.getItem('products')) || [
    { id: 1, name: 'Bulu Mata Natural', price: 50000, photo: 'https://via.placeholder.com/80?text=Natural' },
    { id: 2, name: 'Bulu Mata Volume', price: 75000, photo: 'https://via.placeholder.com/80?text=Volume' },
    { id: 3, name: 'Lem Bulu Mata', price: 25000, photo: 'https://via.placeholder.com/80?text=Lem' },
    { id: 4, name: 'Pembersih Bulu Mata', price: 15000, photo: 'https://via.placeholder.com/80?text=Cleaner' }
];

let cart = [];
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

// Elemen DOM
const adminBtn = document.getElementById('adminBtn');
const adminPanel = document.getElementById('adminPanel');
const productsGrid = document.getElementById('productsGrid');
const cartList = document.getElementById('cartList');
const totalEl = document.getElementById('total');
const checkoutBtn = document.getElementById('checkoutBtn');
const clearCartBtn = document.getElementById('clearCartBtn');
const exportBtn = document.getElementById('exportBtn');
const importBtn = document.getElementById('importBtn');
const addProductBtn = document.getElementById('addProductBtn');
const saveProductsBtn = document.getElementById('saveProductsBtn');
const productList = document.getElementById('productList');

// Toggle Admin Mode
adminBtn.addEventListener('click', () => {
    adminPanel.classList.toggle('hidden');
    if (!adminPanel.classList.contains('hidden')) {
        renderAdminProducts();
    }
});

// Render Produk di Grid
function renderProducts() {
    productsGrid.innerHTML = '';
    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <img src="${product.photo}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p>Rp ${product.price.toLocaleString('id-ID')}</p>
            <button onclick="addToCart(${product.id})">Tambah ke Keranjang</button>
        `;
        productsGrid.appendChild(card);
    });
}

// Tambah ke Keranjang
function addToCart(id) {
    const product = products.find(p => p.id === id);
    const existing = cart.find(item => item.id === id);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    renderCart();
}

// Render Keranjang
function renderCart() {
    cartList.innerHTML = '';
    let total = 0;
    cart.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `
            ${item.name} x${item.quantity} - Rp ${(item.price * item.quantity).toLocaleString('id-ID')}
            <button onclick="removeFromCart(${item.id})" style="background: #ff5722; margin-left: 10px;">Hapus</button>
        `;
        cartList.appendChild(li);
        total += item.price * item.quantity;
    });
    totalEl.textContent = total.toLocaleString('id-ID');
}

// Hapus dari Keranjang
function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    renderCart();
}

// Checkout & Cetak Struk
checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0) return alert('Keranjang kosong!');
    
    const date = new Date().toLocaleString('id-ID');
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Simpan transaksi
    const transaction = { id: Date.now(), date, items: [...cart], total };
    transactions.push(transaction);
    localStorage.setItem('transactions', JSON.stringify(transactions));
    
    // Render Struk
    document.getElementById('receiptDate').textContent = date;
    const receiptItems = document.getElementById('receiptItems');
    receiptItems.innerHTML = '';
    cart.forEach(item => {
        const li = document.createElement('li');
        li.textContent = `${item.name} x${item.quantity} - Rp ${(item.price * item.quantity).toLocaleString('id-ID')}`;
        receiptItems.appendChild(li);
    });
    document.getElementById('receiptTotal').textContent = total.toLocaleString('id-ID');
    
    // Print
    window.print();
    
    // Kosongkan keranjang
    cart = [];
    renderCart();
});

// Kosongkan Keranjang
clearCartBtn.addEventListener('click', () => {
    cart = [];
    renderCart();
});

// Admin: Render Daftar Produk untuk Edit
function renderAdminProducts() {
    productList.innerHTML = '';
    products.forEach((product) => {
        const li = document.createElement('li');
        li.className = 'admin-product';
        li.innerHTML = `
            <img src="${product.photo}" alt="${product.name}" style="width: 50px; height: 50px;">
            <input type="text" value="${product.name}" id="name-${product.id}" placeholder="Nama Produk">
            <input type="number" value="${product.price}" id="price-${product.id}" placeholder="Harga">
            <input type="file" accept="image/*" onchange="updatePhoto(${product.id}, this)">
            <button onclick="deleteProduct(${product.id})">Hapus</button>
        `;
        productList.appendChild(li);
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
            // Preview foto baru
            const img = input.previousElementSibling.previousElementSibling;
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

// Tambah Produk Baru
addProductBtn.addEventListener('click', () => {
    const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
    const newProduct = { 
        id: newId, 
        name: 'Produk Baru', 
        price: 0, 
        photo: 'https://via.placeholder.com/80?text=New' 
    };
    products.push(newProduct);
    renderAdminProducts();
});

// Hapus Produk
function deleteProduct(id) {
    if (confirm('Yakin hapus produk ini?')) {
        products = products.filter(p => p.id !== id);
        renderAdminProducts();
        renderProducts();
    }
}

// Simpan Perubahan Produk
saveProductsBtn.addEventListener('click', () => {
    products.forEach(product => {
        const nameInput = document.getElementById(`name-${product.id}`);
        const priceInput = document.getElementById(`price-${product.id}`);
        
        if (nameInput) product.name = nameInput.value;
        if (priceInput) product.price = parseInt(priceInput.value) || 0;
    });
    
    localStorage.setItem('products', JSON.stringify(products));
    renderProducts();
    alert('Produk berhasil disimpan!');
});

// Export Data (untuk backup ke GitHub)
exportBtn.addEventListener('click', () => {
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
});

// Import Data
importBtn.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                if (data.products) products = data.products;
                if (data.transactions) transactions = data.transactions;
                
                localStorage.setItem('products', JSON.stringify(products));
                localStorage.setItem('transactions', JSON.stringify(transactions));
                
                renderProducts();
                if (!adminPanel.classList.contains('hidden')) {
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
});

// Test local storage sebelum load
if (typeof(Storage) === "undefined") {
    alert("Browser Anda tidak support localStorage! Beberapa fitur mungkin tidak bekerja.");
}

// Inisialisasi App saat halaman load
document.addEventListener('DOMContentLoaded', function() {
    renderProducts();
    renderCart();
});