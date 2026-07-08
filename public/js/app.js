const ICONS = {
  "tiered-cake": `<svg viewBox="0 0 100 100"><path d="M25 82 L25 66 Q25 60 33 60 L67 60 Q75 60 75 66 L75 82" fill="none" stroke-width="2.4" stroke-linecap="round"/><path d="M33 60 L37 40 Q38 35 44 35 L56 35 Q62 35 63 40 L67 60" fill="none" stroke-width="2.4" stroke-linecap="round"/><path d="M25 74 Q50 80 75 74" fill="none" stroke-width="2"/><path d="M33 50 Q50 55 67 50" fill="none" stroke-width="2"/><path d="M44 35 Q42 26 46 20" fill="none" stroke-width="2"/><path d="M56 35 Q58 26 54 20" fill="none" stroke-width="2"/><circle cx="50" cy="14" r="5" fill="none" stroke-width="2.2"/></svg>`,
  "bento-cake": `<svg viewBox="0 0 100 100"><rect x="28" y="42" width="44" height="34" rx="6" fill="none" stroke-width="2.4"/><path d="M28 58 Q50 64 72 58" fill="none" stroke-width="2"/><path d="M38 42 Q40 30 50 30 Q60 30 62 42" fill="none" stroke-width="2.4"/><circle cx="50" cy="24" r="4" fill="none" stroke-width="2"/></svg>`,
  "brownie-stack": `<svg viewBox="0 0 100 100"><rect x="26" y="52" width="20" height="20" rx="3" fill="none" stroke-width="2.2"/><rect x="52" y="52" width="20" height="20" rx="3" fill="none" stroke-width="2.2"/><rect x="26" y="28" width="20" height="20" rx="3" fill="none" stroke-width="2.2"/><rect x="52" y="28" width="20" height="20" rx="3" fill="none" stroke-width="2.2"/></svg>`,
  cupcake: `<svg viewBox="0 0 100 100"><path d="M32 55 L38 82 Q39 86 44 86 L56 86 Q61 86 62 82 L68 55" fill="none" stroke-width="2.4"/><path d="M28 55 Q50 66 72 55 Q68 40 50 40 Q32 40 28 55Z" fill="none" stroke-width="2.4"/><path d="M50 40 Q46 28 50 18" fill="none" stroke-width="2.2"/><circle cx="50" cy="13" r="4" fill="none" stroke-width="2"/></svg>`,
  cookie: `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="26" fill="none" stroke-width="2.4"/><circle cx="42" cy="42" r="2.6" fill="currentColor" stroke="none"/><circle cx="58" cy="46" r="2.6" fill="currentColor" stroke="none"/><circle cx="48" cy="58" r="2.6" fill="currentColor" stroke="none"/><circle cx="60" cy="60" r="2.6" fill="currentColor" stroke="none"/></svg>`,
  "dip-jar": `<svg viewBox="0 0 100 100"><path d="M36 30 L34 78 Q34 84 40 84 L60 84 Q66 84 66 78 L64 30" fill="none" stroke-width="2.4"/><path d="M34 30 L66 30" stroke-width="2.4"/><path d="M32 22 L68 22 Q70 22 70 24 L70 28 Q70 30 68 30 L32 30 Q30 30 30 28 L30 24 Q30 22 32 22Z" fill="none" stroke-width="2.2"/><path d="M40 46 Q50 40 60 46 Q50 52 40 46Z" fill="none" stroke-width="2"/></svg>`,
};

const state = {
  products: [],
  cart: JSON.parse(localStorage.getItem("jjbakes-cart") || "[]"),
  activeFilter: "All",
  user: null,
};

const BAKERY_WHATSAPP = "919344421237";

async function loadProducts() {
  const res = await fetch("/api/products");
  state.products = await res.json();
  renderFilters();
  renderMenu();
}

function renderFilters() {
  const categories = ["All", ...new Set(state.products.map((p) => p.category))];
  const box = document.getElementById("menuFilters");
  box.innerHTML = categories
    .map(
      (c) =>
        `<button class="filter-chip ${c === state.activeFilter ? "active" : ""}" data-cat="${c}">${c}</button>`
    )
    .join("");
  box.querySelectorAll(".filter-chip").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.activeFilter = btn.dataset.cat;
      renderFilters();
      renderMenu();
    });
  });
}

function renderMenu() {
  const grid = document.getElementById("menuGrid");
  const items =
    state.activeFilter === "All"
      ? state.products
      : state.products.filter((p) => p.category === state.activeFilter);

  grid.innerHTML = items
    .map((p) => {
      const media = p.image
        ? `<img src="${p.image}" alt="${p.name}" loading="lazy">`
        : ICONS[p.icon] || "";

      const priceBlock =
        p.price !== null
          ? `<span class="product-price">₹${p.price}<small> /${p.unit}</small></span>`
          : `<span class="product-price product-price-contact">Contact us</span>`;

      const actionBtn =
        p.price !== null
          ? `<button class="add-btn" data-id="${p.id}">Add</button>`
          : `<button class="enquire-btn" data-name="${p.name}">Enquire</button>`;

      return `
    <div class="product-card">
      <div class="product-photo">${media}</div>
      ${p.customizable ? '<span class="badge">Custom design available</span>' : ""}
      <h3>${p.name}</h3>
      <div class="product-foot">
        ${priceBlock}
        ${actionBtn}
      </div>
    </div>`;
    })
    .join("");

  grid.querySelectorAll(".add-btn").forEach((btn) => {
    btn.addEventListener("click", () => addToCart(btn.dataset.id));
  });
  grid.querySelectorAll(".enquire-btn").forEach((btn) => {
    btn.addEventListener("click", () => enquireOnWhatsApp(btn.dataset.name));
  });
}

function enquireOnWhatsApp(productName) {
  const text = `Hi JJ Bake's! I'd like to ask about: ${productName}`;
  window.open(`https://wa.me/${BAKERY_WHATSAPP}?text=${encodeURIComponent(text)}`, "_blank");
}

function saveCart() {
  localStorage.setItem("jjbakes-cart", JSON.stringify(state.cart));
  renderCart();
}

function addToCart(productId) {
  const product = state.products.find((p) => p.id === productId);
  const existing = state.cart.find((i) => i.id === productId);
  if (existing) {
    existing.qty += 1;
  } else {
    state.cart.push({ id: product.id, name: product.name, price: product.price, unit: product.unit, qty: 1 });
  }
  saveCart();
  showToast(`${product.name} added to cart`);
}

function changeQty(productId, delta) {
  const item = state.cart.find((i) => i.id === productId);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) state.cart = state.cart.filter((i) => i.id !== productId);
  saveCart();
}

function renderCart() {
  const box = document.getElementById("cartItems");
  const totalEl = document.getElementById("cartTotal");
  const countEl = document.getElementById("cartCount");

  if (state.cart.length === 0) {
    box.innerHTML = `<p class="cart-empty">Your cart is empty. Go add some cake! 🍰</p>`;
  } else {
    box.innerHTML = state.cart
      .map(
        (i) => `
      <div class="cart-line">
        <div>
          <strong>${i.name}</strong><br/>
          <small>₹${i.price} /${i.unit}</small>
        </div>
        <div class="cart-line-qty">
          <button data-id="${i.id}" data-d="-1">−</button>
          <span>${i.qty}</span>
          <button data-id="${i.id}" data-d="1">+</button>
        </div>
      </div>`
      )
      .join("");
    box.querySelectorAll("button[data-d]").forEach((btn) => {
      btn.addEventListener("click", () => changeQty(btn.dataset.id, Number(btn.dataset.d)));
    });
  }

  const total = state.cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  totalEl.textContent = `₹${total}`;
  const count = state.cart.reduce((sum, i) => sum + i.qty, 0);
  countEl.textContent = count;
}

document.getElementById("checkoutForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const msg = document.getElementById("checkoutMsg");

  if (state.cart.length === 0) {
    msg.textContent = "Your cart is empty.";
    return;
  }

  const form = new FormData(e.target);
  const payload = {
    items: state.cart,
    customerName: form.get("customerName"),
    phone: form.get("phone"),
    orderDate: form.get("orderDate"),
    deliveryType: form.get("deliveryType"),
    address: form.get("address"),
    notes: form.get("notes"),
  };

  const res = await fetch("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();

  if (!res.ok) {
    msg.textContent = data.error || "Something went wrong.";
    return;
  }

  // Also open a pre-filled WhatsApp message to the bakery, so the
  // order lands directly in your phone's WhatsApp too - not just the
  // orders.json file on the server.
  window.open(buildWhatsAppOrderLink(payload), "_blank");

  state.cart = [];
  saveCart();
  closeModal("checkoutModal");
  closeDrawer();
  showToast("Order placed! Confirm it by sending the WhatsApp message that just opened. 🎂");
  e.target.reset();
});

function buildWhatsAppOrderLink(payload) {
  const total = payload.items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const lines = [
    "New order from JJ Bake's website! 🎂",
    `Name: ${payload.customerName}`,
    `Phone: ${payload.phone}`,
    `Delivery: ${payload.deliveryType === "delivery" ? "Home delivery" : "Store pickup"}`,
    payload.deliveryType === "delivery" ? `Address: ${payload.address}` : null,
    `Order for: ${payload.orderDate}`,
    "",
    "Items:",
    ...payload.items.map((i) => `- ${i.name} x${i.qty} (₹${i.price * i.qty})`),
    "",
    `Total: ₹${total}`,
    payload.notes ? `Notes: ${payload.notes}` : null,
  ].filter(Boolean);

  return `https://wa.me/${BAKERY_WHATSAPP}?text=${encodeURIComponent(lines.join("\n"))}`;
}

document.querySelectorAll('input[name="deliveryType"]').forEach((radio) => {
  radio.addEventListener("change", () => {
    const addressField = document.getElementById("addressField");
    const isDelivery = document.querySelector('input[name="deliveryType"]:checked').value === "delivery";
    addressField.style.display = isDelivery ? "block" : "none";
    addressField.querySelector("textarea").required = isDelivery;
  });
});

async function checkSession() {
  const res = await fetch("/api/me");
  const data = await res.json();
  state.user = data.user;
  const label = document.getElementById("accountLabel");
  label.textContent = state.user ? state.user.name.split(" ")[0] : "Login";
}

document.getElementById("accountBtn").addEventListener("click", async () => {
  if (state.user) {
    await fetch("/api/logout", { method: "POST" });
    state.user = null;
    document.getElementById("accountLabel").textContent = "Login";
    showToast("Logged out.");
  } else {
    openModal("authModal");
  }
});

document.querySelectorAll(".auth-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".auth-tab").forEach((t) => t.classList.remove("active"));
    document.querySelectorAll(".auth-form").forEach((f) => f.classList.remove("active"));
    tab.classList.add("active");
    document.getElementById(tab.dataset.tab + "Form").classList.add("active");
  });
});

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = new FormData(e.target);
  const res = await fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: form.get("email"), password: form.get("password") }),
  });
  const data = await res.json();
  const msg = document.getElementById("loginMsg");
  if (!res.ok) { msg.textContent = data.error; return; }
  state.user = data.user;
  document.getElementById("accountLabel").textContent = state.user.name.split(" ")[0];
  closeModal("authModal");
  showToast(`Welcome back, ${state.user.name.split(" ")[0]}!`);
  e.target.reset();
});

document.getElementById("registerForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = new FormData(e.target);
  const res = await fetch("/api/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: form.get("name"),
      email: form.get("email"),
      phone: form.get("phone"),
      password: form.get("password"),
    }),
  });
  const data = await res.json();
  const msg = document.getElementById("registerMsg");
  if (!res.ok) { msg.textContent = data.error; return; }
  state.user = data.user;
  document.getElementById("accountLabel").textContent = state.user.name.split(" ")[0];
  closeModal("authModal");
  showToast(`Welcome, ${state.user.name.split(" ")[0]}! Account created.`);
  e.target.reset();
});

function openDrawer() {
  document.getElementById("cartDrawer").classList.add("open");
  document.getElementById("overlay").classList.add("show");
}
function closeDrawer() {
  document.getElementById("cartDrawer").classList.remove("open");
  document.getElementById("overlay").classList.remove("show");
}
function openModal(id) {
  document.getElementById(id).classList.add("open");
  document.getElementById("overlay").classList.add("show");
}
function closeModal(id) {
  document.getElementById(id).classList.remove("open");
  document.getElementById("overlay").classList.remove("show");
}
function showToast(text) {
  const toast = document.getElementById("toast");
  toast.textContent = text;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2600);
}

document.getElementById("cartBtn").addEventListener("click", openDrawer);
document.getElementById("closeCart").addEventListener("click", closeDrawer);
document.getElementById("checkoutBtn").addEventListener("click", () => {
  if (state.cart.length === 0) { showToast("Add something to your cart first!"); return; }
  closeDrawer();
  openModal("checkoutModal");
});
document.querySelectorAll(".modal-close").forEach((btn) => {
  btn.addEventListener("click", () => closeModal(btn.dataset.close));
});
document.getElementById("overlay").addEventListener("click", () => {
  closeDrawer();
  document.querySelectorAll(".modal.open").forEach((m) => closeModal(m.id));
});

document.getElementById("year").textContent = new Date().getFullYear();
loadProducts();
checkSession();
renderCart();
