const db = require('./db');
const { collection, addDoc, getDocs, doc, getDoc, updateDoc, query, where } = require('firebase/firestore');

const products = {
    async getAll(category = null) {
        let q = collection(db, 'products');
        if (category) {
            q = query(q, where('category', '==', category));
        }
        const snapshot = await getDocs(q);
        return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    },
    async getCategories() {
        const snapshot = await getDocs(collection(db, 'products'));
        const categories = new Set();
        snapshot.forEach(d => {
            if (d.data().category) {
                categories.add(d.data().category);
            }
        });
        return Array.from(categories);
    },
    async getById(id) {
        const productRef = doc(db, 'products', id);
        const snapshot = await getDoc(productRef);
        return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
    },
    async create(data) {
        const docRef = await addDoc(collection(db, 'products'), data);
        return { id: docRef.id, ...data };
    },
    async update(id, data) {
        const productRef = doc(db, 'products', id);
        await updateDoc(productRef, data);
        const snapshot = await getDoc(productRef);
        return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
    }
};

const orders = {
    async getByUser(userId) {
        const q = query(collection(db, 'orders'), where('user_id', '==', userId));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    },
    async create(data) {
        data.status = 'pending';
        data.created_at = new Date().toISOString();
        const docRef = await addDoc(collection(db, 'orders'), data);
        return { id: docRef.id, ...data };
    },
    async getById(id) {
        const orderRef = doc(db, 'orders', id);
        const snapshot = await getDoc(orderRef);
        return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
    },
    async updateStatus(id, status) {
        const orderRef = doc(db, 'orders', id);
        await updateDoc(orderRef, { status });
        const snapshot = await getDoc(orderRef);
        return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
    },
    async getAll(status = null) {
        let q = collection(db, 'orders');
        if (status) {
            q = query(q, where('status', '==', status));
        }
        const snapshot = await getDocs(q);
        return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    }
};

module.exports = { products, orders };
