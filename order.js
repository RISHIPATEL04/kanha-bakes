document.addEventListener('DOMContentLoaded', () => {
    
    // Auto-fill from menu logic (if they came from the Menu page)
    try {
        const selectedItemStr = localStorage.getItem('selectedMenuItem');
        if (selectedItemStr) {
            const item = JSON.parse(selectedItemStr);
            const cakeTypeSelect = document.getElementById('cType');
            
            if (cakeTypeSelect) {
                const name = item.name.toLowerCase();
                for (let i = 0; i < cakeTypeSelect.options.length; i++) {
                    if (cakeTypeSelect.options[i].value && name.includes(cakeTypeSelect.options[i].value.split(' ')[0].toLowerCase())) {
                        cakeTypeSelect.selectedIndex = i;
                        break;
                    }
                }
            }
            localStorage.removeItem('selectedMenuItem');
        }
    } catch(err) {
        console.log("No menu item found to autofill.");
    }

    // Capture the exact master form element
    const orderForm = document.getElementById('cleanOrderForm');
    const statusMsg = document.getElementById('statusMessage');
    const masterSubmitBtn = document.getElementById('masterSubmitBtn');

    if (!orderForm) {
        console.error("Critical DOM Error: The main order form cannot be found!");
        return; 
    }

    // Bind using the strict native onsubmit handler
    orderForm.onsubmit = async (event) => {
        // ALWAYS STOP THE BROWSER FROM REFRESHING THE PAGE!
        event.preventDefault();

        // Ensure user is logged in
        if (typeof isLoggedIn === 'function' && !isLoggedIn()) {
            alert('Please login to finalize your order securely.');
            window.location.href = 'login.html';
            return;
        }

        // Lock button to prevent double-spamming API
        if (masterSubmitBtn) {
            masterSubmitBtn.disabled = true;
            masterSubmitBtn.textContent = 'Processing Order...';
        }

        try {
            // Retrieve 100% strictly validated values (browsers 'required' tag prevents empties)
            const customerName = document.getElementById('cName').value.trim();
            const customerPhone = document.getElementById('cPhone').value.trim();
            const customerEmail = document.getElementById('cEmail').value.trim();
            const eventDate = document.getElementById('cDate').value.trim();
            const cakeType = document.getElementById('cType').value;
            const cakeWeight = document.getElementById('cWeight').value;
            const notes = document.getElementById('cNotes').value.trim();

            const pureNotesStr = `Name: ${customerName}, Date: ${eventDate}, Notes: ${notes}`;

            // Build payload exactly as backend expects
            const orderPayload = {
                delivery_address: 'Pickup Only',
                payment_method: 'Pay at Store',
                notes: pureNotesStr,
                items: [
                    { 
                        name: cakeType, 
                        weight: cakeWeight, 
                        quantity: 1 
                    }
                ]
            };

            const token = localStorage.getItem('session_token');
            const res = await fetch(`${API_BASE_URL}/api/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(orderPayload)
            });

            if (res.ok) {
                // Completely swap the UI block to a big success message instead of redirecting randomly
                orderForm.style.display = 'none';
                statusMsg.style.display = 'block';
                statusMsg.innerHTML = `
                    <div style="font-size: 3rem; margin-bottom: 1rem;">🎉</div>
                    <h2 style="color: #ff8c00; margin-bottom: 1rem;">Order Placed Successfully!</h2>
                    <p style="color: #4b5563; line-height: 1.6;">Thank you, ${customerName}! Your order has been secured in our database.</p>
                    <p style="color: #4b5563; line-height: 1.6;">Please pick up your order at our bakery on or before the event date.</p>
                    <button onclick="window.location.href='index.html'" style="margin-top: 2rem; background: #ff8c00; color: white; border: none; padding: 0.75rem 2rem; border-radius: 8px; font-weight: bold; cursor: pointer;">Return to Home</button>
                `;
            } else {
                const data = await res.json();
                alert('Order failed: ' + (data.error || 'The server rejected the order data.'));
            }

        } catch (error) {
            console.error('Fatal Frontend Error:', error);
            alert('A critical error occurred trying to connect to the bakery database.');
        } finally {
            if (masterSubmitBtn) {
                masterSubmitBtn.disabled = false;
                masterSubmitBtn.textContent = 'Place Order Now';
            }
        }
    };
});
