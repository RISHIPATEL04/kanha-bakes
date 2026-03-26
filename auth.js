// ============================================================
//  auth.js — Khana Cakes & Chocolates
//  User registration, login & session helpers (Firebase Version)
// ============================================================

const db = require('./db');
const { collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc, query, where } = require('firebase/firestore');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const SALT_ROUNDS    = 12;
const SESSION_DAYS   = 7;

// ── Helpers ──────────────────────────────────────────────────

function generateToken() {
    return crypto.randomBytes(48).toString('hex');
}

function sessionExpiry() {
    const d = new Date();
    d.setDate(d.getDate() + SESSION_DAYS);
    return d.toISOString();
}

// ── Register ─────────────────────────────────────────────────

/**
 * Register a new customer.
 * @param {{ name, email, password, phone?, address? }} data
 * @returns {Promise<{ success, user?, error? }>}
 */
async function register({ name, email, password, phone = null, address = null }) {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) return { success: false, error: 'Email already registered.' };

    const password_hash = bcrypt.hashSync(password, SALT_ROUNDS);

    const newUser = {
        name,
        email,
        password_hash,
        phone,
        address,
        role: 'user', // default role
        created_at: new Date().toISOString()
    };

    const docRef = await addDoc(usersRef, newUser);
    return { 
        success: true, 
        user: { id: docRef.id, name, email, role: newUser.role, created_at: newUser.created_at } 
    };
}

// ── Login ────────────────────────────────────────────────────

/**
 * Authenticate a user and create a session.
 * @param {{ email, password }} credentials
 * @returns {Promise<{ success, token?, user?, error? }>}
 */
async function login({ email, password }) {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) return { success: false, error: 'Invalid email or password.' };

    const userDoc = snapshot.docs[0];
    const user = { id: userDoc.id, ...userDoc.data() };

    const valid = bcrypt.compareSync(password, user.password_hash);
    if (!valid) return { success: false, error: 'Invalid email or password.' };

    const token = generateToken();
    const sessionData = {
        user_id: user.id,
        token,
        expires_at: sessionExpiry()
    };
    
    await addDoc(collection(db, 'sessions'), sessionData);

    const { password_hash: _, ...safeUser } = user;
    return { success: true, token, user: safeUser };
}

// ── Session verification ──────────────────────────────────────

/**
 * Verify a session token. Returns the user if valid, null otherwise.
 * @param {string} token
 * @returns {Promise<object|null>}
 */
async function verifySession(token) {
    if (!token) return null;

    const sessionsRef = collection(db, 'sessions');
    const q = query(sessionsRef, where('token', '==', token));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) return null;

    const sessionData = snapshot.docs[0].data();
    if (new Date(sessionData.expires_at) <= new Date()) return null; // Expired

    // Get user details
    const userRef = doc(db, 'users', sessionData.user_id);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) return null;

    const user = { id: userSnap.id, ...userSnap.data() };
    return { ...sessionData, user_id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone || '', address: user.address || '' };
}

// ── Logout ───────────────────────────────────────────────────

/**
 * Delete a session (logout).
 * @param {string} token
 */
async function logout(token) {
    if (!token) return;
    const sessionsRef = collection(db, 'sessions');
    const q = query(sessionsRef, where('token', '==', token));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
        await deleteDoc(doc(db, 'sessions', snapshot.docs[0].id));
    }
}

// ── Update User ──────────────────────────────────────────────

/**
 * Update user details.
 * @param {string} userId
 * @param {{ name?, phone?, address? }} data
 */
async function updateUser(userId, data) {
    const userRef = doc(db, 'users', userId);
    const updates = {};
    if (data.name !== undefined) updates.name = data.name;
    if (data.phone !== undefined) updates.phone = data.phone;
    if (data.address !== undefined) updates.address = data.address;

    await updateDoc(userRef, updates);
    return true;
}

/**
 * Promote user to admin securely (not exposed to user PATCH)
 */
async function promoteToAdmin(userId) {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { role: 'admin' });
    return true;
}

/**
 * Promote a user to admin by email
 */
async function promoteUserByEmail(email) {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) return { success: false, error: 'User not found.' };
    
    const userDoc = snapshot.docs[0];
    await updateDoc(doc(db, 'users', userDoc.id), { role: 'admin' });
    return { success: true };
}

// ── Middleware (Express) ──────────────────────────────────────

/**
 * Express middleware — attach req.user if session is valid.
 */
async function requireAuth(req, res, next) {
    const token = req.headers['authorization']?.replace('Bearer ', '')
                || req.cookies?.session_token;

    try {
        const session = await verifySession(token);
        if (!session) return res.status(401).json({ error: 'Not authenticated.' });

        req.user  = session;
        req.token = token;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
}

/**
 * Express middleware — admin only.
 */
function requireAdmin(req, res, next) {
    requireAuth(req, res, () => {
        if (req.user.role !== 'admin')
            return res.status(403).json({ error: 'Admin access required.' });
        next();
    });
}

module.exports = { register, login, verifySession, logout, updateUser, promoteToAdmin, promoteUserByEmail, requireAuth, requireAdmin };
