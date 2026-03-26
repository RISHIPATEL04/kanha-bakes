// ============================================================
//  server.js — Khana Cakes & Chocolates
//  Express API server (Firebase Version)
// ============================================================

const express    = require('express');
const cors       = require('cors');
const cookieParser = require('cookie-parser');
const { register, login, logout, verifySession, updateUser, promoteToAdmin, requireAuth, requireAdmin } = require('./auth');
const { products, orders } = require('./queries');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(__dirname)); // Serve frontend static files (for local dev)

// ── Auth Routes ───────────────────────────────────────────────

// POST /api/auth/register
app.post('/api/auth/register', async (req, res) => {
    const { name, email, password, phone, address } = req.body;
    if (!name || !email || !password)
        return res.status(400).json({ error: 'name, email and password are required.' });

    try {
        const result = await register({ name, email, password, phone, address });
        if (!result.success) return res.status(409).json({ error: result.error });
        res.status(201).json({ message: 'Account created!', user: result.user });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password)
        return res.status(400).json({ error: 'email and password are required.' });

    try {
        const result = await login({ email, password });
        if (!result.success) return res.status(401).json({ error: result.error });

        res.cookie('session_token', result.token, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000   // 7 days
        });
        res.json({ message: 'Logged in!', token: result.token, user: result.user });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// POST /api/auth/logout
app.post('/api/auth/logout', requireAuth, async (req, res) => {
    try {
        await logout(req.token);
        res.clearCookie('session_token');
        res.json({ message: 'Logged out.' });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// GET /api/auth/me
app.get('/api/auth/me', requireAuth, (req, res) => {
    const { password_hash: _, token: __, ...safe } = req.user;
    res.json(safe);
});

// PATCH /api/users/me
app.patch('/api/users/me', requireAuth, async (req, res) => {
    try {
        await updateUser(req.user.user_id, req.body);
        res.json({ message: 'Profile updated successfully.' });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// GET /api/make-me-admin (Dev Helper)
app.get('/api/make-me-admin', requireAuth, async (req, res) => {
    try {
        await promoteToAdmin(req.user.user_id);
        res.send('<h2>Success!</h2><p>Your account is now an Admin.</p><p>Please <a href="/login.html">Logout and Log back in</a> to apply the changes!</p>');
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// ── Product Routes ────────────────────────────────────────────

// GET /api/products?category=Cakes
app.get('/api/products', async (req, res) => {
    try {
        res.json(await products.getAll(req.query.category || null));
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// GET /api/products/categories
app.get('/api/products/categories', async (req, res) => {
    try {
        res.json(await products.getCategories());
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// GET /api/products/:id
app.get('/api/products/:id', async (req, res) => {
    try {
        const product = await products.getById(req.params.id);
        if (!product) return res.status(404).json({ error: 'Product not found.' });
        res.json(product);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// POST /api/products  (admin only)
app.post('/api/products', requireAdmin, async (req, res) => {
    try {
        const product = await products.create(req.body);
        res.status(201).json(product);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

// PATCH /api/products/:id  (admin only)
app.patch('/api/products/:id', requireAdmin, async (req, res) => {
    try {
        const product = await products.update(req.params.id, req.body);
        if (!product) return res.status(404).json({ error: 'Product not found.' });
        res.json(product);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

// DELETE /api/products/:id  (admin only)
app.delete('/api/products/:id', requireAdmin, async (req, res) => {
    try {
        const result = await products.delete(req.params.id);
        res.json(result);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// ── Order Routes ──────────────────────────────────────────────

// GET /api/orders  (my orders)
app.get('/api/orders', requireAuth, async (req, res) => {
    try {
        res.json(await orders.getByUser(req.user.user_id));
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// POST /api/orders  (place order)
app.post('/api/orders', requireAuth, async (req, res) => {
    const { delivery_address, notes, payment_method, items } = req.body;
    if (!delivery_address || !items?.length)
        return res.status(400).json({ error: 'delivery_address and items are required.' });

    try {
        const order = await orders.create({
            user_id: req.user.user_id,
            delivery_address,
            notes,
            payment_method,
            items
        });
        res.status(201).json(order);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

// GET /api/orders/:id
app.get('/api/orders/:id', requireAuth, async (req, res) => {
    try {
        const order = await orders.getById(req.params.id);
        if (!order) return res.status(404).json({ error: 'Order not found.' });
        if (order.user_id !== req.user.user_id && req.user.role !== 'admin')
            return res.status(403).json({ error: 'Access denied.' });
        res.json(order);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// PATCH /api/orders/:id/status  (admin only)
app.patch('/api/orders/:id/status', requireAdmin, async (req, res) => {
    try {
        const order = await orders.updateStatus(req.params.id, req.body.status);
        res.json(order);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

// GET /api/admin/orders  (admin — all orders)
app.get('/api/admin/orders', requireAdmin, async (req, res) => {
    try {
        res.json(await orders.getAll(req.query.status || null));
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// ── Start ─────────────────────────────────────────────────────

app.listen(PORT, () => {
    console.log(`🎂 Khana Bakery API running at http://localhost:${PORT}`);
});
