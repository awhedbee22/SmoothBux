export interface MenuItem {
    id: string;
    name: string;
    description: string;
    image_url: string;
    ingredients: string[];
    is_available: boolean;
    category?: 'smoothie' | 'food';
}

export interface OrderItem {
    menu_item_id: string;
    name: string; // denormalized for easier display
    customizations: {
        size?: string;
        juice?: string;
        boosts?: string[];
        notes?: string;
    } | string[]; // Union for backward compatibility during dev, or just any
}

export interface Order {
    id: string;
    customer_name: string;
    status: 'pending' | 'blending' | 'ready' | 'completed';
    items: OrderItem[]; // We might need to fetch this from a separate table query in real app
    created_at: string;
}
