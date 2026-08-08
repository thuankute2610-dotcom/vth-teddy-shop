// ===== VTH Thiên Đường Gấu Bông - Frontend Logic =====

const API_URL = '/api';

// State
let products = [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let currentCategory = 'all';
let currentUser = JSON.parse(localStorage.getItem('user')) || null;
let token = localStorage.getItem('token') || null;

// ===== DOM Elements =====
const productGrid = document.getElementById('productGrid');
const loading = document.getElementById('loading');
const cartCount = document.getElementById('cartCount');
const cartSidebar = document.getElementById('cartSidebar');
const cartOverlay = document.getElementById('cartOverlay');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const cartBtn = document.getElementById('cartBtn');
const cartClose = document.getElementById('cartClose');
const checkoutBtn = document.getElementById('checkoutBtn');
const checkoutModal = document.getElementById('checkoutModal');
const checkoutClose = document.getElementById('checkoutClose');
const checkoutForm = document.getElementById('checkoutForm');
const productModal = document.getElementById('productModal');
const modalClose = document.getElementById('modalClose');
const modalBody = document.getElementById('modalBody');
const toast = document.getElementById('toast');
const menuToggle = document.getElementById('menuToggle');
const nav = document.querySelector('.nav');

// ===== Format VND =====
function formatVND(price) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

// ===== Category names =====
const categoryNames = {
  'gau-mini': 'Gấu Mini',
  'gau-nho': 'Gấu Nhỏ',
  'gau-lon': 'Gấu Lớn',
  'qua-tang': 'Quà Tặng',
  'combo': 'Combo',
};

// ===== Fetch products =====
async function fetchProducts() {
  try {
    loading.style.display = 'block';
    productGrid.innerHTML = '';
    const res = await fetch(`${API_URL}/products`);
    if (!res.ok) throw new Error('Không thể tải sản phẩm');
    products = await res.json();
    renderProducts();
  } catch (err) {
    loading.innerHTML = `❌ ${err.message}`;
    console.error(err);
  } finally {
    loading.style.display = 'none';
  }
}

// ===== Render products =====
function renderProducts() {
  const filtered = currentCategory === 'all'
    ? products
    : products.filter((p) => p.category === currentCategory);

  if (filtered.length === 0) {
    productGrid.innerHTML = '<p class="loading">Không có sản phẩm nào trong danh mục này 😢</p>';
    return;
  }

  productGrid.innerHTML = filtered.map((product) => `
    <div class="product-card" data-id="${product._id}">
      <div class="product-image">
        <img src="${product.image}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/400x400/F8C8DC/ffffff?text=🧸'" />
        ${product.oldPrice ? `<span class="product-badge">-${Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}%</span>` : ''}
      </div>
      <div class="product-info">
        <div class="product-category">${categoryNames[product.category] || product.category}</div>
        <div class="product-name">${product.name}</div>
        <div class="product-price">
          <span class="price">${formatVND(product.price)}</span>
          ${product.oldPrice ? `<span class="old-price">${formatVND(product.oldPrice)}</span>` : ''}
        </div>
        <button class="add-to-cart" onclick="addToCart('${product._id}')">
          <i class="fas fa-shopping-cart"></i> Thêm vào giỏ
        </button>
      </div>
    </div>
  `).join('');
}

// ===== Cart functions =====
function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartUI();
}

function updateCartUI() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCount.textContent = totalItems;
  renderCart();
}

function addToCart(productId) {
  const product = products.find((p) => p._id === productId);
  if (!product) return;

  const existingItem = cart.find((item) => item.productId === productId);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      productId: product._id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
    });
  }

  saveCart();
  showToast(`Đã thêm "${product.name}" vào giỏ hàng! 🧸`);
}

function removeFromCart(productId) {
  cart = cart.filter((item) => item.productId !== productId);
  saveCart();
}

function changeQuantity(productId, delta) {
  const item = cart.find((i) => i.productId === productId);
  if (!item) return;
  item.quantity += delta;
  if (item.quantity <= 0) {
    removeFromCart(productId);
    return;
  }
  saveCart();
}

function renderCart() {
  if (cart.length === 0) {
    cartItems.innerHTML = '<p class="cart-empty">Giỏ hàng đang trống 🛒</p>';
    cartTotal.textContent = '0₫';
    checkoutBtn.disabled = true;
    checkoutBtn.style.opacity = '0.5';
    return;
  }

  checkoutBtn.disabled = false;
  checkoutBtn.style.opacity = '1';

  cartItems.innerHTML = cart.map((item) => `
    <div class="cart-item">
      <div class="cart-item-image">
        <img src="${item.image}" alt="${item.name}" /> 
      </div>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">${formatVND(item.price)}</div>
        <div class="cart-item-controls">
          <button class="qty-btn" onclick="changeQuantity('${item.productId}', -1)">−</button>
          <span class="cart-item-qty">${item.quantity}</span>
          <button class="qty-btn" onclick="changeQuantity('${item.productId}', 1)">+</button>
          <button class="remove-item" onclick="removeFromCart('${item.productId}')">
            <i class="fas fa-trash-alt"></i>
          </button>
        </div>
      </div>
    </div>
  `).join('');

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  cartTotal.textContent = formatVND(total);
}

// ===== Cart Sidebar =====
function openCart() {
  cartSidebar.classList.add('active');
  cartOverlay.classList.add('active');
  renderCart();
}

function closeCart() {
  cartSidebar.classList.remove('active');
  cartOverlay.classList.remove('active');
}

// ===== Checkout =====
async function handleCheckout(e) {
  e.preventDefault();

  const name = document.getElementById('customerName').value.trim();
  const phone = document.getElementById('customerPhone').value.trim();
  const email = document.getElementById('customerEmail').value.trim();
  const address = document.getElementById('customerAddress').value.trim();

  if (!name || !phone || !address) {
    showToast('Vui lòng điền đầy đủ thông tin! ⚠️');
    return;
  }

  const orderData = {
    customer: { name, phone, email, address },
    items: cart.map((item) => ({
      productId: item.productId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image,
    })),
    totalAmount: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
  };

  try {
    const res = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });

    if (!res.ok) throw new Error('Đặt hàng thất bại');

    cart = [];
    saveCart();
    checkoutModal.classList.remove('active');
    closeCart();
    checkoutForm.reset();
    showToast('Đặt hàng thành công! Cảm ơn bạn đã mua hàng 🎉🧸');
  } catch (err) {
    showToast(`❌ ${err.message}`);
    console.error(err);
  }
}

// ===== Product detail modal =====
function showProductModal(productId) {
  const product = products.find((p) => p._id === productId);
  if (!product) return;

  modalBody.innerHTML = `
    <div class="modal-image">
      <img src="${product.image}" alt="${product.name}" />
    </div>
    <div class="modal-info">
      <div class="product-category">${categoryNames[product.category] || product.category}</div>
      <h2>${product.name}</h2>
      <div class="price">${formatVND(product.price)}</div>
      ${product.oldPrice ? `<div class="old-price">${formatVND(product.oldPrice)}</div>` : ''}
      <p class="modal-desc">${product.description || 'Chú gấu bông đáng yêu, mềm mại.'}</p>
      <div class="stock-info">${product.stock > 0 ? `Còn ${product.stock} sản phẩm` : 'Hết hàng'}</div>
      <button class="btn btn-primary btn-full" onclick="addToCart('${product._id}')">
        <i class="fas fa-shopping-cart"></i> Thêm vào giỏ hàng
      </button>
    </div>
  `;
  productModal.classList.add('active');
}

// ===== Toast =====
let toastTimeout;
function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// ===== Auth functions =====
async function registerUser(name, email, password, phone, address) {
  try {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, phone, address }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Đăng ký thất bại');
    return data;
  } catch (err) {
    throw err;
  }
}

async function loginUser(email, password) {
  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Đăng nhập thất bại');
    return data;
  } catch (err) {
    throw err;
  }
}

function logoutUser() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  currentUser = null;
  token = null;
  updateAuthUI();
  showToast('Đã đăng xuất thành công! 👋');
}

function updateAuthUI() {
  const userName = document.getElementById('userName');
  const userFullName = document.getElementById('userFullName');
  const userEmail = document.getElementById('userEmail');
  const loginLink = document.getElementById('loginLink');
  const registerLink = document.getElementById('registerLink');
  const logoutLink = document.getElementById('logoutLink');

  if (currentUser) {
    userName.textContent = currentUser.name.split(' ')[0];
    userFullName.textContent = currentUser.name;
    userEmail.textContent = currentUser.email;
    loginLink.style.display = 'none';
    registerLink.style.display = 'none';
    logoutLink.style.display = 'flex';

    // Tự động điền thông tin thanh toán nếu đã đăng nhập
    const customerName = document.getElementById('customerName');
    const customerEmail = document.getElementById('customerEmail');
    const customerPhone = document.getElementById('customerPhone');
    if (customerName && !customerName.value) customerName.value = currentUser.name;
    if (customerEmail && !customerEmail.value) customerEmail.value = currentUser.email;
    if (customerPhone && currentUser.phone && !customerPhone.value) customerPhone.value = currentUser.phone;
  } else {
    userName.textContent = 'Tài khoản';
    userFullName.textContent = 'Khách';
    userEmail.textContent = 'Chưa đăng nhập';
    loginLink.style.display = 'flex';
    registerLink.style.display = 'flex';
    logoutLink.style.display = 'none';
  }
}

function openLoginModal() {
  document.getElementById('loginModal').classList.add('active');
  document.getElementById('userDropdown').classList.remove('show');
}

function openRegisterModal() {
  document.getElementById('registerModal').classList.add('active');
  document.getElementById('userDropdown').classList.remove('show');
}

function closeLoginModal() {
  document.getElementById('loginModal').classList.remove('active');
}

function closeRegisterModal() {
  document.getElementById('registerModal').classList.remove('active');
}

// ===== Event Listeners =====
// Auth handlers
document.getElementById('userBtn').addEventListener('click', (e) => {
  e.stopPropagation();
  document.getElementById('userDropdown').classList.toggle('show');
});

document.addEventListener('click', (e) => {
  const dropdown = document.getElementById('userDropdown');
  const userMenu = document.getElementById('userMenu');
  if (!userMenu.contains(e.target)) {
    dropdown.classList.remove('show');
  }
});

document.getElementById('loginLink').addEventListener('click', (e) => {
  e.preventDefault();
  openLoginModal();
});

document.getElementById('registerLink').addEventListener('click', (e) => {
  e.preventDefault();
  openRegisterModal();
});

document.getElementById('logoutLink').addEventListener('click', (e) => {
  e.preventDefault();
  logoutUser();
});

document.getElementById('loginClose').addEventListener('click', closeLoginModal);
document.getElementById('registerClose').addEventListener('click', closeRegisterModal);

document.getElementById('loginModal').addEventListener('click', (e) => {
  if (e.target === document.getElementById('loginModal')) closeLoginModal();
});
document.getElementById('registerModal').addEventListener('click', (e) => {
  if (e.target === document.getElementById('registerModal')) closeRegisterModal();
});

// Switch between login and register
document.getElementById('switchToRegister').addEventListener('click', (e) => {
  e.preventDefault();
  closeLoginModal();
  openRegisterModal();
});
document.getElementById('switchToLogin').addEventListener('click', (e) => {
  e.preventDefault();
  closeRegisterModal();
  openLoginModal();
});

// Register form submit
document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('registerName').value.trim();
  const email = document.getElementById('registerEmail').value.trim();
  const password = document.getElementById('registerPassword').value;
  const phone = document.getElementById('registerPhone').value.trim();
  const address = document.getElementById('registerAddress').value.trim();

  if (!name || !email || !password) {
    showToast('Vui lòng điền đầy đủ thông tin! ⚠️');
    return;
  }
  if (password.length < 6) {
    showToast('Mật khẩu phải có ít nhất 6 ký tự! ⚠️');
    return;
  }

  try {
    const data = await registerUser(name, email, password, phone, address);
    token = data.token;
    currentUser = data.user;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(currentUser));
    closeRegisterModal();
    e.target.reset();
    updateAuthUI();
    showToast(`Chào mừng ${currentUser.name}! Đăng ký thành công 🎉🧸`);
  } catch (err) {
    showToast(`❌ ${err.message}`);
  }
});

// Login form submit
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  if (!email || !password) {
    showToast('Vui lòng nhập email và mật khẩu! ⚠️');
    return;
  }

  try {
    const data = await loginUser(email, password);
    token = data.token;
    currentUser = data.user;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(currentUser));
    closeLoginModal();
    e.target.reset();
    updateAuthUI();
    showToast(`Xin chào ${currentUser.name}! Đăng nhập thành công 🧸💕`);
  } catch (err) {
    showToast(`❌ ${err.message}`);
  }
});

cartBtn.addEventListener('click', openCart);
cartClose.addEventListener('click', closeCart);
cartOverlay.addEventListener('click', closeCart);

modalClose.addEventListener('click', () => productModal.classList.remove('active'));
productModal.addEventListener('click', (e) => {
  if (e.target === productModal) productModal.classList.remove('active');
});

checkoutBtn.addEventListener('click', () => {
  if (cart.length === 0) {
    showToast('Giỏ hàng đang trống! 🛒');
    return;
  }
  checkoutModal.classList.add('active');
});
checkoutClose.addEventListener('click', () => checkoutModal.classList.remove('active'));
checkoutModal.addEventListener('click', (e) => {
  if (e.target === checkoutModal) checkoutModal.classList.remove('active');
});
checkoutForm.addEventListener('submit', handleCheckout);

menuToggle.addEventListener('click', () => nav.classList.toggle('active'));

// Category filtering
document.querySelectorAll('.category-card').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.category-card').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    currentCategory = btn.dataset.category;
    renderProducts();
  });
});

// Active nav link on scroll
const sections = document.querySelectorAll('section[id]');
window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;
  sections.forEach((section) => {
    const sectionTop = section.offsetTop - 100;
    const sectionBottom = sectionTop + section.offsetHeight;
    if (scrollY >= sectionTop && scrollY < sectionBottom) {
      const currentId = section.getAttribute('id');
      document.querySelectorAll('.nav-link').forEach((link) => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentId}`) {
          link.classList.add('active');
        }
      });
    }
  });
});

// Newsletter form
document.getElementById('newsletterForm').addEventListener('submit', (e) => {
  e.preventDefault();
  e.target.reset();
  showToast('Cảm ơn bạn đã đăng ký! Ưu đãi đang đến 🎉');
});

// Contact form
document.getElementById('contactForm').addEventListener('submit', (e) => {
  e.preventDefault();
  e.target.reset();
  showToast('Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm 💖');
});

// ===== Init =====
document.addEventListener('DOMContentLoaded', () => {
  fetchProducts();
  updateCartUI();
  updateAuthUI();
});
