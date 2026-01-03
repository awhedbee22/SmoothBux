import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { OrderItem, MenuItem } from '../types';

interface CartContextType {
    cartItems: OrderItem[];
    addToCart: (item: MenuItem, customizations?: string[]) => void;
    removeFromCart: (index: number) => void;
    clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [cartItems, setCartItems] = useState<OrderItem[]>(() => {
        const saved = localStorage.getItem('smoothbux_cart');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('smoothbux_cart', JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (item: MenuItem, customizations: string[] = []) => {
        const newItem: OrderItem = {
            menu_item_id: item.id,
            name: item.name,
            customizations: customizations,
        };
        setCartItems([...cartItems, newItem]);
    };

    const removeFromCart = (index: number) => {
        const newCart = [...cartItems];
        newCart.splice(index, 1);
        setCartItems(newCart);
    };

    const clearCart = () => {
        setCartItems([]);
    };

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
