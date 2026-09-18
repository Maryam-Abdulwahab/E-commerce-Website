let cart = [];
let currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;
let users = JSON.parse(localStorage.getItem("users")) || [];
let isSignUpMode = false;

const dummyProducts = [
  { id: 1, title: "Backpack", price: 109.95, image: "https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg" },
  { id: 2, title: "Mens Casual T-Shirt", price: 22.3, image: "https://fakestoreapi.com/img/71-3HjGNDUL._AC_SY879._SX._UX._SY._UY_.jpg" },
  { id: 3, title: "Cotton Jacket", price: 55.99, image: "https://fakestoreapi.com/img/71li-ujtlUL._AC_UX679_.jpg" }
];

const productsGrid = document.getElementById("productsGrid");
const cartSidebar = document.getElementById("cartSidebar");
const cartBtn = document.getElementById("cartBtn");
const closeCartBtn = document.getElementById("closeCartBtn");
const authModal = document.getElementById("authModal");
const loginModalBtn = document.getElementById("loginModalBtn");
const closeAuthModal = document.getElementById("closeAuthModal");
const authForm = document.getElementById("authForm");
const usernameInput = document.getElementById("usernameInput");
const passwordInput = document.getElementById("passwordInput");
const logoutBtn = document.getElementById("logoutBtn");

function checkUserSession() {
  const userInfo = document.getElementById("userInfo");
  const usernameDisplay = document.getElementById("usernameDisplay");
  if (!userInfo) return;
  if (currentUser) {
    userInfo.style.display = "inline";
    if (usernameDisplay) usernameDisplay.innerText = currentUser.username;
    if (logoutBtn) logoutBtn.style.display = "inline-block";
    if (loginModalBtn) loginModalBtn.style.display = "none";
  } else {
    userInfo.style.display = "none";
    if (logoutBtn) logoutBtn.style.display = "none";
    if (loginModalBtn) loginModalBtn.style.display = "inline-block";
  }
}

function displayProducts(products) {
  if (!productsGrid) return;
  productsGrid.innerHTML = "";
  products.forEach(function (product) {
    const productCard = document.createElement("div");
    productCard.classList.add("product-card");
    const cleanTitle = product.title.replace(/'/g, "");

    productCard.innerHTML =
      '<img src="' + product.image + '" alt="' + cleanTitle + '">' +
      '<div class="product-title">' + product.title.slice(0, 25) + '...</div>' +
      '<div class="product-price">$' + product.price.toFixed(2) + '</div>' +
      '<button class="add-btn" onclick="addToCart(' + product.id + ', \'' + cleanTitle + '\', ' + product.price + ')">Add to Cart</button>';

    productsGrid.appendChild(productCard);
  });
}

async function fetchProducts() {
  try {
    const response = await fetch("https://fakestoreapi.com/products?limit=8");
    if (!response.ok) throw new Error("Network error");
    const products = await response.json();
    displayProducts(products);
  } catch (error) {
    displayProducts(dummyProducts);
  }
}

if (authForm) {
  authForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const username = usernameInput ? usernameInput.value.trim() : "";
    const password = passwordInput ? passwordInput.value.trim() : "";

    if (isSignUpMode) {
      const newUser = { username: username, password: password };
      users.push(newUser);
      localStorage.setItem("users", JSON.stringify(users));
      currentUser = newUser;
    } else {
      currentUser = { username: username };
    }

    localStorage.setItem("currentUser", JSON.stringify(currentUser));
    if (authModal) authModal.classList.remove("active");
    checkUserSession();
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener("click", function () {
    currentUser = null;
    localStorage.removeItem("currentUser");
    checkUserSession();
  });
}

if (loginModalBtn) loginModalBtn.addEventListener("click", function () { if (authModal) authModal.classList.add("active"); });
if (closeAuthModal) closeAuthModal.addEventListener("click", function () { if (authModal) authModal.classList.remove("active"); });

fetchProducts();
checkUserSession();
function addToCart(id, title, price) {
  const existingItem = cart.find(function(item) { return item.id === id; });
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ id: id, title: title, price: price, quantity: 1 });
  }
  updateCartUI();
  if (cartSidebar) cartSidebar.classList.add("open");
}

function updateCartUI() {
  const cartItemsContainer = document.getElementById("cartItems");
  const cartCount = document.getElementById("cartCount");
  const cartTotal = document.getElementById("cartTotal");

  if (!cartItemsContainer) return;
  cartItemsContainer.innerHTML = "";

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = '<p class="empty-msg">Your cart is empty.</p>';
    if (cartCount) cartCount.innerText = "0";
    if (cartTotal) cartTotal.innerText = "0.00";
    return;
  }

  let total = 0;
  let totalItemsCount = 0;

  cart.forEach(function(item) {
    total += item.price * item.quantity;
    totalItemsCount += item.quantity;

    const cartItem = document.createElement("div");
    cartItem.classList.add("cart-item");

    cartItem.innerHTML = 
      '<div>' +
        '<strong>' + item.title.slice(0, 15) + '...</strong>' +
        '<div>$' + item.price + ' x ' + item.quantity + '</div>' +
      '</div>';

    cartItemsContainer.appendChild(cartItem);
  });

  if (cartCount) cartCount.innerText = totalItemsCount;
  if (cartTotal) cartTotal.innerText = total.toFixed(2);
}
// ==========================================
// 1. Checkout Modal Elements
// ==========================================
const checkoutModal = document.getElementById("checkoutModal");
const closeCheckout = document.getElementById("closeCheckout");
const checkoutForm = document.getElementById("checkoutForm");
const checkoutBtn = document.getElementById("checkoutBtn");

// ==========================================
// 2. Handle Checkout Logic
// ==========================================
function handleCheckout() {
  if (cart.length === 0) {
    alert("Your cart is empty! Add some products first.");
    return;
  }

  if (!currentUser) {
    alert("Please sign in first to complete your purchase!");
    if (authModal) authModal.classList.add("active");
    if (cartSidebar) cartSidebar.classList.remove("open");
    return;
  }

  // Close cart sidebar and open checkout modal
  if (cartSidebar) cartSidebar.classList.remove("open");
  if (checkoutModal) checkoutModal.classList.add("active");
}

// ==========================================
// 3. Event Listeners
// ==========================================

// Open checkout modal
if (checkoutBtn) {
  checkoutBtn.addEventListener("click", handleCheckout);
}

// Close checkout modal
if (closeCheckout) {
  closeCheckout.addEventListener("click", function () {
    checkoutModal.classList.remove("active");
  });
}

// Submit checkout form
if (checkoutForm) {
  checkoutForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const shippingAddress = document.getElementById("shipAddress").value;
    
    alert("Thank you, " + currentUser.username + "! Your order will be shipped to " + shippingAddress + " 🎉");

    // Clear cart and reset form
    cart = [];
    updateCartUI();
    checkoutModal.classList.remove("active");
    checkoutForm.reset();
  });
}