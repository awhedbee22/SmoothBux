export const API_URL = 'http://localhost:3000/api';

export const api = {
    // Menu
    getMenu: async () => {
        const res = await fetch(`${API_URL}/menu`);
        if (!res.ok) throw new Error('Failed to fetch menu');
        return res.json();
    },

    addMenuItem: async (item: any) => {
        const res = await fetch(`${API_URL}/menu`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item)
        });
        if (!res.ok) throw new Error('Failed to add item');
        return res.json();
    },

    deleteMenuItem: async (id: string) => {
        await fetch(`${API_URL}/menu/${id}`, { method: 'DELETE' });
    },

    toggleMenuItem: async (id: string, is_available: boolean) => {
        await fetch(`${API_URL}/menu/${id}/toggle`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ is_available: !is_available })
        });
    },

    // Orders
    getOrders: async () => {
        const res = await fetch(`${API_URL}/orders`);
        if (!res.ok) throw new Error('Failed to fetch orders');
        return res.json();
    },

    createOrder: async (customer_name: string, items: any[]) => {
        const res = await fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ customer_name, items })
        });
        if (!res.ok) throw new Error('Failed to create order');
        return res.json();
    },

    updateOrderStatus: async (id: string, status: string) => {
        const res = await fetch(`${API_URL}/orders/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        if (!res.ok) throw new Error('Failed to update status');
        return res.json();
    },

    deleteOrder: async (id: string) => {
        await fetch(`${API_URL}/orders/${id}`, { method: 'DELETE' });
    },

    // Options
    getOptions: async () => {
        const res = await fetch(`${API_URL}/options`);
        if (!res.ok) throw new Error('Failed to fetch options');
        return res.json();
    },
    addOption: async (data: { name: string; category: string }) => {
        const res = await fetch(`${API_URL}/options`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('Failed to add option');
        return res.json();
    },
    deleteOption: async (id: string) => {
        const res = await fetch(`${API_URL}/options/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to delete option');
        return res.json();
    },

    // For Admin Detail View
    getOrderItems: async (order_id: string) => {
        const res = await fetch(`${API_URL}/order_items?order_id=${order_id}`);
        if (!res.ok) throw new Error('Failed to fetch items');
        return res.json();
    }
};
