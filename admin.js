document.addEventListener('DOMContentLoaded', async () => {
    // Security Check
    if (typeof isAdmin === 'function' && !isAdmin()) {
        alert('Access Denied. You must be an administrator to view this page.');
        window.location.href = 'index.html';
        return;
    }

    const tableBody = document.getElementById('ordersTableBody');
    const loadingMessage = document.getElementById('loadingMessage');
    const emptyMessage = document.getElementById('emptyMessage');
    const exportBtn = document.getElementById('exportCsvBtn');
    
    let allOrders = [];

    // Fetch Orders
    async function loadOrders() {
        try {
            const token = localStorage.getItem('session_token');
            const res = await fetch(`${API_BASE_URL}/api/admin/orders`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (!res.ok) throw new Error('Failed to fetch orders');
            
            allOrders = await res.json();
            renderTable();
        } catch (err) {
            console.error(err);
            loadingMessage.textContent = 'Error loading orders. Please check your connection and admin status.';
        }
    }

    function renderTable() {
        loadingMessage.classList.add('hidden');
        
        if (allOrders.length === 0) {
            emptyMessage.classList.remove('hidden');
            return;
        }

        tableBody.innerHTML = '';
        allOrders.forEach(order => {
            const date = new Date(order.created_at).toLocaleString();
            
            // Extract info from notes which was loosely stored earlier
            const rawNotes = order.notes || '';
            const isCustomExtracted = rawNotes.includes('Name:');
            
            let displayName = 'Unknown';
            let displayNotes = rawNotes;
            
            if (isCustomExtracted) {
                const parts = rawNotes.split(', ');
                displayName = parts[0] ? parts[0].replace('Name: ', '') : 'Unknown';
                displayNotes = parts[2] ? parts[2].replace('Notes: ', '') : rawNotes;
            }

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>#${order.id.substring(0,6)}</strong></td>
                <td>${date}</td>
                <td class="customer-info">
                    <strong>${displayName}</strong>
                    <span>UserId: ${order.user_id.substring(0,8)}...</span>
                </td>
                <td class="order-details">
                    <strong>${order.items && order.items[0] ? order.items[0].name : 'Custom Item'}</strong>
                    <span>Weight: ${order.items && order.items[0] ? order.items[0].weight || '1' : 'N/A'}</span>
                    <span>Notes: ${displayNotes}</span>
                </td>
                <td>
                    <span class="status-badge status-${order.status.toLowerCase()}">${order.status}</span>
                </td>
                <td>
                    <select class="status-select" onchange="window.updateOrderStatus('${order.id}', this.value)">
                        <option value="Pending"   ${order.status === 'Pending'     ? 'selected' : ''}>Pending</option>
                        <option value="Confirmed" ${order.status === 'Confirmed'   ? 'selected' : ''}>Confirmed</option>
                        <option value="In Progress" ${order.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                        <option value="Ready"     ${order.status === 'Ready'       ? 'selected' : ''}>Ready for Pickup</option>
                        <option value="Completed" ${order.status === 'Completed'   ? 'selected' : ''}>Completed</option>
                        <option value="Cancelled" ${order.status === 'Cancelled'   ? 'selected' : ''}>Cancelled</option>
                    </select>
                </td>
            `;
            tableBody.appendChild(tr);
        });
    }

    // Universal status updater
    window.updateOrderStatus = async (orderId, newStatus) => {
        try {
            const token = localStorage.getItem('session_token');
            const res = await fetch(`${API_BASE_URL}/api/orders/${orderId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (res.ok) {
                const index = allOrders.findIndex(o => o.id === orderId);
                if (index !== -1) {
                    allOrders[index].status = newStatus;
                    renderTable();
                }
            } else {
                alert('Failed to update status. Please try again.');
                renderTable(); // revert the dropdown visually
            }
        } catch (e) {
            alert('Network error updating order status.');
            renderTable();
        }
    };

    // CSV Export functionality
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            if (allOrders.length === 0) {
                alert('No orders to export.');
                return;
            }

            // Define CVS headers
            let csvContent = "data:text/csv;charset=utf-8,";
            csvContent += "Order ID,Date,User ID,Customer Name,Cake Type,Weight,Notes,Status\n";

            allOrders.forEach(order => {
                const date = new Date(order.created_at).toLocaleString();
                const rawNotes = order.notes || '';
                const parts = rawNotes.split(', ');
                const displayName = parts[0] && parts[0].includes('Name:') ? parts[0].replace('Name: ', '') : 'Unknown';
                const pureNotes = parts[2] && parts[2].includes('Notes:') ? parts[2].replace('Notes: ', '') : rawNotes;
                
                const itemName = order.items && order.items[0] ? order.items[0].name : '';
                const itemWeight = order.items && order.items[0] ? order.items[0].weight || '' : '';

                // Escape commas for standard CSV protocol
                const row = [
                    order.id,
                    `"${date}"`,
                    order.user_id,
                    `"${displayName}"`,
                    `"${itemName}"`,
                    `"${itemWeight}"`,
                    `"${pureNotes.replace(/"/g, '""')}"`,
                    order.status
                ].join(',');
                
                csvContent += row + "\r\n";
            });

            // Trigger actual download securely
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `khana_bakery_orders_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    }

    loadOrders();
});
