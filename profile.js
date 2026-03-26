document.addEventListener('DOMContentLoaded', async () => {
    if (typeof isLoggedIn === 'function' && !isLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }

    const nameInput = document.getElementById('profileName');
    const emailInput = document.getElementById('profileEmail');
    const phoneInput = document.getElementById('profilePhone');
    const addressInput = document.getElementById('profileAddress');
    const form = document.getElementById('profileForm');
    const messageEl = document.getElementById('profileMessage');

    // Fetch latest user data from server
    try {
        const token = localStorage.getItem('session_token');
        const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (res.ok) {
            const data = await res.json();
            nameInput.value = data.name || '';
            emailInput.value = data.email || '';
            phoneInput.value = data.phone || '';
            addressInput.value = data.address || '';
        } else {
            console.error('Failed to load profile');
        }
    } catch(e) {
        console.error('Error fetching profile:', e);
    }

    // Handle profile update
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const saveBtn = document.getElementById('saveProfileBtn');
        saveBtn.disabled = true;
        saveBtn.textContent = 'Saving...';
        
        try {
            const token = localStorage.getItem('session_token');
            const res = await fetch(`${API_BASE_URL}/api/users/me`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: nameInput.value,
                    phone: phoneInput.value,
                    address: addressInput.value
                })
            });

            const data = await res.json();
            
            messageEl.classList.remove('hidden', 'error', 'success');
            if (res.ok) {
                messageEl.textContent = 'Profile updated successfully!';
                messageEl.classList.add('success');
                
                // Update local storage user just in case
                try {
                    const localUser = JSON.parse(localStorage.getItem('user'));
                    localUser.name = nameInput.value;
                    localStorage.setItem('user', JSON.stringify(localUser));
                } catch(e){}
            } else {
                messageEl.textContent = data.error || 'Failed to update profile.';
                messageEl.classList.add('error');
            }
        } catch(err) {
            messageEl.classList.remove('hidden', 'success');
            messageEl.textContent = 'Network error. Please try again.';
            messageEl.classList.add('error');
        } finally {
            saveBtn.disabled = false;
            saveBtn.textContent = 'Save Changes';
            
            // hide message after 4s
            setTimeout(() => {
                messageEl.classList.add('hidden');
            }, 4000);
        }
    });
});
