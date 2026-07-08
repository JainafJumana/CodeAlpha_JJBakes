const express = require("express");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

const PRODUCTS_FILE = path.join(__dirname, "data", "products.json");
const USERS_FILE = path.join(__dirname, "data", "users.json");
const ORDERS_FILE = path.join(__dirname, "data", "orders.json");

[USERS_FILE, ORDERS_FILE].forEach((file) => {
  if (!fs.existsSync(file)) fs.writeFileSync(file, "[]", "utf-8");
});

function readJSON(file) {
  return JSON.parse(fs.readFileSync(file, "utf-8"));
}
function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf-8");
}

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: "jjbakes-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 },
  })
);

app.get("/api/products", (req, res) => {
  const products = readJSON(PRODUCTS_FILE);
  res.json(products);
});

app.post("/api/register", async (req, res) => {
  const { name, email, phone, password } = req.body;

  if (!name || !email || !phone || !password) {
    return res.status(400).json({ error: "All fields are required." });
  }

  const users = readJSON(USERS_FILE);
  const alreadyExists = users.some((u) => u.email === email);
  if (alreadyExists) {
    return res.status(409).json({ error: "An account with this email already exists." });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const newUser = {
    id: "user-" + Date.now(),
    name,
    email,
    phone,
    passwordHash,
  };

  users.push(newUser);
  writeJSON(USERS_FILE, users);

  req.session.user = { id: newUser.id, name: newUser.name, email: newUser.email };
  res.json({ message: "Account created!", user: req.session.user });
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  const users = readJSON(USERS_FILE);
  const user = users.find((u) => u.email === email);

  if (!user) {
    return res.status(401).json({ error: "No account found with that email." });
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) {
    return res.status(401).json({ error: "Incorrect password." });
  }

  req.session.user = { id: user.id, name: user.name, email: user.email };
  res.json({ message: "Logged in!", user: req.session.user });
});

app.post("/api/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ message: "Logged out." });
  });
});

app.get("/api/me", (req, res) => {
  res.json({ user: req.session.user || null });
});

app.post("/api/orders", (req, res) => {
  const { items, customerName, phone, address, deliveryType, orderDate, notes } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ error: "Your cart is empty." });
  }
  if (!customerName || !phone || !deliveryType || !orderDate) {
    return res.status(400).json({ error: "Please fill all the required order details." });
  }
  if (deliveryType === "delivery" && !address) {
    return res.status(400).json({ error: "Please enter a delivery address." });
  }

  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);

  const order = {
    id: "order-" + Date.now(),
    userId: req.session.user ? req.session.user.id : null,
    items,
    total,
    customerName,
    phone,
    address: deliveryType === "delivery" ? address : null,
    deliveryType,
    orderDate,
    notes: notes || "",
    placedAt: new Date().toISOString(),
    status: "Pending Confirmation",
  };

  const orders = readJSON(ORDERS_FILE);
  orders.push(order);
  writeJSON(ORDERS_FILE, orders);

  res.status(201).json({ message: "Order placed!", order });
});

app.get("/api/orders/mine", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "Please log in to view your orders." });
  }
  const orders = readJSON(ORDERS_FILE);
  const mine = orders.filter((o) => o.userId === req.session.user.id);
  res.json(mine);
});

app.listen(PORT, () => {
  console.log(`JJ Bake's server running -> http://localhost:${PORT}`);
});
