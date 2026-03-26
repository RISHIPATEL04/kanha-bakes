document.addEventListener('DOMContentLoaded', function() {
    // Menu filtering functionality
    const filterButtons = document.querySelectorAll('.filter-btn');
    const menuItems = document.querySelectorAll('.menu-item');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Filter menu items
            menuItems.forEach(item => {
                const itemCategory = item.getAttribute('data-category');
                
                if (category === 'all' || itemCategory === category) {
                    item.style.display = 'block';
                    item.classList.add('fade-in');
                    item.classList.remove('fade-out');
                } else {
                    item.classList.add('fade-out');
                    item.classList.remove('fade-in');
                    setTimeout(() => {
                        item.style.display = 'none';
                    }, 300);
                }
            });
        });
    });
    
    // Order button functionality
    const orderButtons = document.querySelectorAll('.order-btn');
    
    orderButtons.forEach(button => {
        button.addEventListener('click', function() {
            const itemName = this.closest('.menu-item').querySelector('.item-name').textContent;
            const itemPrice = this.closest('.menu-item').querySelector('.item-price').textContent;
            
            // Check if user is logged in
            if (typeof isLoggedIn === 'function' && isLoggedIn()) {
                // Redirect to order page with pre-filled information
                const orderUrl = `order.html?item=${encodeURIComponent(itemName)}&price=${encodeURIComponent(itemPrice)}`;
                window.location.href = orderUrl;
            } else {
                // Show login prompt
                const shouldLogin = confirm('You need to be logged in to place an order. Would you like to login now?');
                if (shouldLogin) {
                    window.location.href = 'login.html';
                }
            }
        });
    });
    
    // Handle contact button clicks
    const contactButtons = document.querySelectorAll('.contact-btn');
    
    contactButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = 'contact.html';
        });
    });
    
    // Add animation on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe menu items for animation
    menuItems.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
    
    // Add hover effects for menu items
    menuItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.02)';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Pre-fill order form if coming from menu
    const urlParams = new URLSearchParams(window.location.search);
    const selectedItem = urlParams.get('item');
    const selectedPrice = urlParams.get('price');
    
    if (selectedItem && selectedPrice) {
        // Store the selected item info for the order page
        localStorage.setItem('selectedMenuItem', JSON.stringify({
            name: selectedItem,
            price: selectedPrice
        }));
    }
});
