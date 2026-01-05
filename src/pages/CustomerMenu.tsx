import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import type { MenuItem } from '../types';
import { Plus, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { ProductDetailModal } from '../components/ProductDetailModal';

export const CustomerMenu: React.FC = () => {
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);
    const { addToCart } = useCart();

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

    useEffect(() => {
        fetchMenu();
    }, []);

    const fetchMenu = async () => {
        try {
            const data = await api.getMenu();
            setMenuItems(data.filter((i: any) => i.is_available));
        } catch (error) {
            console.error('Error fetching menu:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleItemClick = (item: MenuItem) => {
        setSelectedItem(item);
        setIsModalOpen(true);
    };

    const handleAddToCart = (item: MenuItem, customizations: any) => {
        addToCart(item, customizations);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64 text-rose-500">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-current"></div>
            </div>
        );
    }

    return (
        <div className="pb-20">
            {/* Header Section */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                        Fresh Menu <Sparkles size={20} className="text-yellow-500 animate-pulse" />
                    </h2>
                    <p className="text-sm text-slate-600 font-medium bg-white/40 inline-block px-2 py-1 rounded-lg mt-1 backdrop-blur-sm">
                        Handcrafted just for you
                    </p>
                </div>
            </div>

            {/* Smoothies Section */}
            <h3 className="text-lg font-bold text-slate-700 mb-3 px-1">Smoothies</h3>
            <div className="grid grid-cols-2 gap-4 mb-8">
                {menuItems.filter(i => !i.category || i.category === 'smoothie').map((item) => (
                    <div
                        key={item.id}
                        onClick={() => handleItemClick(item)}
                        className="group bg-white/60 backdrop-blur-md rounded-3xl p-3 shadow-lg hover:shadow-xl hover:shadow-rose-500/10 hover:scale-[1.02] transition-all duration-300 border border-white/60 cursor-pointer flex flex-col h-full"
                    >
                        {/* Image Container with Soft Shadow */}
                        <div className="aspect-[4/3] w-full bg-white rounded-2xl relative overflow-hidden mb-3 shadow-sm group-hover:shadow-md transition-shadow">
                            <img
                                src={item.image_url}
                                alt={item.name}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://placehold.co/600x400/orange/white?text=Smoothie';
                                }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-2">
                                <span className="text-white text-xs font-bold bg-rose-500 px-2 py-0.5 rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                    Customize
                                </span>
                            </div>

                            <button className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-full shadow-sm text-rose-500 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                <Plus size={16} strokeWidth={3} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 flex flex-col">
                            <h3 className="font-bold text-slate-800 leading-tight mb-1 text-sm md:text-base group-hover:text-rose-600 transition-colors">
                                {item.name}
                            </h3>
                            <p className="text-[10px] md:text-xs text-slate-500 line-clamp-2 leading-relaxed font-medium">
                                {item.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Food Section */}
            {menuItems.some(i => i.category === 'food') && (
                <>
                    <h3 className="text-lg font-bold text-slate-700 mb-3 px-1 mt-6">Food & Snacks</h3>
                    <div className="grid grid-cols-2 gap-4">
                        {menuItems.filter(i => i.category === 'food').map((item) => (
                            <div
                                key={item.id}
                                onClick={() => handleItemClick(item)}
                                className="group bg-white/60 backdrop-blur-md rounded-3xl p-3 shadow-lg hover:shadow-xl hover:shadow-orange-500/10 hover:scale-[1.02] transition-all duration-300 border border-white/60 cursor-pointer flex flex-col h-full"
                            >
                                {/* Image Container */}
                                <div className="aspect-[4/3] w-full bg-white rounded-2xl relative overflow-hidden mb-3 shadow-sm group-hover:shadow-md transition-shadow">
                                    <img
                                        src={item.image_url}
                                        alt={item.name}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'https://placehold.co/600x400/orange/white?text=Food';
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-2">
                                        <span className="text-white text-xs font-bold bg-orange-500 px-2 py-0.5 rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                            Add
                                        </span>
                                    </div>
                                    <button className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-full shadow-sm text-orange-500 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Plus size={16} strokeWidth={3} />
                                    </button>
                                </div>

                                {/* Content */}
                                <div className="flex-1 flex flex-col">
                                    <h3 className="font-bold text-slate-800 leading-tight mb-1 text-sm md:text-base group-hover:text-orange-600 transition-colors">
                                        {item.name}
                                    </h3>
                                    <p className="text-[10px] md:text-xs text-slate-500 line-clamp-2 leading-relaxed font-medium">
                                        {item.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {menuItems.length === 0 && (
                <div className="text-center bg-white/40 backdrop-blur-sm p-8 rounded-3xl border border-white/50 mt-10">
                    <p className="text-slate-500 font-medium">No smoothies available right now!</p>
                    <p className="text-xs text-rose-500 mt-2 font-bold uppercase tracking-wide">Check back soon</p>
                </div>
            )}

            <ProductDetailModal
                item={selectedItem}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAddToCart={handleAddToCart}
            />
        </div>
    );
};
