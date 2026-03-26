document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    const errorMessage = document.getElementById('errorMessage');

    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        // Clear previous error
        errorMessage.style.display = 'none';
        
        // Validate passwords match
        if (password !== confirmPassword) {
            errorMessage.textContent = 'Passwords do not match.';
            errorMessage.style.display = 'block';
            return;
        }
        
        // Attempt registration using auth.js functions
        const success = attemptRegister(name, email, password, confirmPassword);
        
        if (success) {
            alert('Registration successful! Please login with your credentials.');
            window.location.href = 'login.html';
        } else {
            errorMessage.textContent = 'A user with this email already exists. Please use a different email or login instead.';
            errorMessage.style.display = 'block';
        }
    });

    // Clear error when user types
    const inputs = ['name', 'email', 'password', 'confirmPassword'];
    inputs.forEach(inputId => {
        document.getElementById(inputId).addEventListener('input', function() {
            errorMessage.style.display = 'none';
        });
    });
});