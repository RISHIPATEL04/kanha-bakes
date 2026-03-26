// Navigation and authentication UI management

document.addEventListener('DOMContentLoaded', function() {
    updateAuthSection();
    
    // Update auth section based on login status
    function updateAuthSection() {
        const authSection = document.getElementById('authSection');
        if (!authSection) return;
        
        if (isLoggedIn()) {
            const isAdminUser = isAdmin();
            authSection.innerHTML = `
                <div class="auth-section" style="display: flex; align-items: center; gap: 10px;">
                    <button class="auth-btn user-profile-btn" id="userProfileBtn" title="Profile Settings" style="background: transparent; border: 2px solid #ff8c00; color: #ff8c00; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; cursor: pointer; padding: 0;">
                        👤
                    </button>
                    <button class="auth-btn logout-btn" id="logoutBtn" style="background: #ff6b35; color: white; border: none; cursor: pointer;">
                        Sign Out
                    </button>
                </div>
            `;
            
            // Add event listeners
            document.getElementById('userProfileBtn').addEventListener('click', toggleSettings);
            document.getElementById('logoutBtn').addEventListener('click', handleLogout);
        } else {
            authSection.innerHTML = `
                <a href="login.html" class="auth-btn">Login / Sign Up</a>
            `;
        }
    }
    
    function toggleSettings() {
        // Remove existing dropdown
        const existing = document.querySelector('.settings-dropdown');
        if (existing) {
            existing.remove();
            document.querySelector('.overlay')?.remove();
            return;
        }
        
        // Create overlay
        const overlay = document.createElement('div');
        overlay.className = 'overlay';
        overlay.addEventListener('click', () => {
            document.querySelector('.settings-dropdown')?.remove();
            overlay.remove();
        });
        document.body.appendChild(overlay);
        
        // Create dropdown
        const dropdown = document.createElement('div');
        dropdown.className = 'settings-dropdown';
        dropdown.innerHTML = `
            <h3>Settings</h3>
            <div class="user-status" style="margin-bottom: 15px;">
                Logged in as ${isAdmin() ? 'Admin' : 'User'}
            </div>
            ${isAdmin() ? `
            <a href="admin.html" style="display: block; margin-bottom: 15px; color: #10b981; text-decoration: none; font-weight: bold;">
                ⚙️ Admin Panel
            </a>` : ''}
            <a href="profile.html" style="display: block; margin-bottom: 15px; color: #ff8c00; text-decoration: none; font-weight: bold;">
                👤 My Profile
            </a>
            <button class="settings-logout" onclick="handleLogout()">
                🚪 Logout
            </button>
        `;
        
        // Position dropdown
        const settingsBtn = document.getElementById('userProfileBtn');
        if (settingsBtn) {
            const rect = settingsBtn.getBoundingClientRect();
            dropdown.style.position = 'fixed';
            dropdown.style.top = (rect.bottom + 5) + 'px';
            dropdown.style.right = '20px';
        }
        
        document.body.appendChild(dropdown);
    }
    
    function handleLogout() {
        logout();
        
        // Remove any dropdowns
        document.querySelector('.settings-dropdown')?.remove();
        document.querySelector('.overlay')?.remove();
        
        // Update UI
        updateAuthSection();
        
        // Redirect to home if on a protected page
        const protectedPages = ['order.html', 'menu.html'];
        const currentPage = window.location.pathname.split('/').pop();
        if (protectedPages.includes(currentPage)) {
            window.location.href = 'index.html';
        }
        
        console.log('User logged out');
    }
    
    // Mobile menu functionality
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navMenu = document.querySelector('.nav-menu');
    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            
            // Toggle hamburger to X
            if (navMenu.classList.contains('active')) {
                mobileMenuBtn.innerHTML = '✕';
            } else {
                mobileMenuBtn.innerHTML = '☰';
            }
        });
        
        // Close menu when clicking a link
        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                mobileMenuBtn.innerHTML = '☰';
            });
        });
    }
    
    // Make functions globally available
    window.handleLogout = handleLogout;
    window.toggleSettings = toggleSettings;
});