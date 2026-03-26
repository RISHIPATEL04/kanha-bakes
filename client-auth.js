// client-auth.js
// Provides client-side helpers to verify login state via localStorage

function isLoggedIn() {
    return !!localStorage.getItem('session_token');
}

function isAdmin() {
    const userStr = localStorage.getItem('user');
    if (!userStr) return false;
    try {
        const user = JSON.parse(userStr);
        return user.role === 'admin';
    } catch (e) {
        return false;
    }
}

function logout() {
    localStorage.removeItem('session_token');
    localStorage.removeItem('user');
    
    // Attempt backend logout as well
    fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include' // sends cookies
    }).catch(console.error);
}
