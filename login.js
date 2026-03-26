document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');
    const successModal = document.getElementById('successModal');
    const enterBakeryBtn = document.getElementById('enterBakery');

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        // Clear previous error
        errorMessage.style.display = 'none';
        
        // Attempt login using auth.js functions
        const success = attemptLogin(email, password);
        
        if (success) {
            successModal.style.display = 'flex';
        } else {
            errorMessage.textContent = 'Invalid email or password.';
            errorMessage.style.display = 'block';
        }
    });

    enterBakeryBtn.addEventListener('click', function() {
        successModal.style.display = 'none';
        window.location.href = 'index.html';
    });

    // Clear error when user types
    document.getElementById('email').addEventListener('input', function() {
        errorMessage.style.display = 'none';
    });

    document.getElementById('password').addEventListener('input', function() {
        errorMessage.style.display = 'none';
    });
});