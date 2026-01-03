import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { api } from '../lib/api';
import { Trash2, Send, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const CustomerCart: React.FC = () => {
    const { cartItems, removeFromCart, clearCart } = useCart();
    const [customerName, setCustomerName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const handlePlaceOrder = async () => {
        if (!customerName.trim()) {
            alert('Please enter your name!');
            return;
        }
        if (cartItems.length === 0) return;

        setIsSubmitting(true);
        try {
            await api.createOrder(customerName, cartItems);

            clearCart();
            navigate('/orders');
        } catch (error) {
            console.error('Error placing order:', error);
            alert('Failed to place order. Try again!');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="pb-20 px-4">
            {/* Header */}
            <div className="mb-6">
                <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                    Your Cart <span className="text-rose-500 text-sm font-bold bg-rose-100 px-2 py-0.5 rounded-full">{cartItems.length} items</span>
                </h2>
            </div>


            {cartItems.length === 0 ? (
                <div className="text-center mt-20 bg-white/40 backdrop-blur-md p-10 rounded-3xl border border-white/50 shadow-sm">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                        <ShoppingBag size={32} />
                    </div>
                    <p className="text-slate-600 font-medium">Your cart is empty.</p>
                    <button
                        onClick={() => navigate('/menu')}
                        className="mt-6 text-white bg-rose-500 px-6 py-2 rounded-xl font-bold hover:bg-rose-600 transition shadow-lg shadow-rose-500/30"
                    >
                        Go to Menu
                    </button>
                </div>
            ) : (
                <>
                    <div className="flex flex-col gap-3 mb-8">
                        {cartItems.map((item, index) => (
                            <div key={index} className="bg-white/70 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-white/60 flex justify-between items-start animate-fade-in group">
                                <div className="flex-1">
                                    <h3 className="font-bold text-slate-800">{item.name}</h3>
                                    {/* Render Customizations */}
                                    <div className="text-xs text-slate-500 mt-2 space-y-1 bg-white/50 p-2 rounded-lg border border-white/50 inline-block min-w-[200px]">
                                        {(item.customizations as any).size && (
                                            <p className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-slate-400"></span> Size: <span className="font-semibold text-slate-700">{(item.customizations as any).size}</span></p>
                                        )}
                                        {(item.customizations as any).juice && (
                                            <p className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-slate-400"></span> Mixer: <span className="font-semibold text-slate-700">{(item.customizations as any).juice}</span></p>
                                        )}
                                        {(item.customizations as any).boosts?.length > 0 && (
                                            <p className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-slate-400"></span> Boosts: <span className="font-semibold text-slate-700">{(item.customizations as any).boosts.join(', ')}</span></p>
                                        )}
                                        {(item.customizations as any).notes && (
                                            <p className="italic text-slate-400 mt-1 border-t border-slate-200 pt-1">"{(item.customizations as any).notes}"</p>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={() => removeFromCart(index)}
                                    className="p-2 text-rose-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Checkout Card */}
                    <div className="mt-8 bg-white/80 backdrop-blur-xl p-6 rounded-3xl shadow-xl border border-white/60 sticky bottom-24">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Order For</label>
                        <input
                            type="text"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            placeholder="Enter your name (e.g. Dad)"
                            className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-rose-400 focus:bg-white outline-none transition-all font-medium text-slate-800 mb-6 placeholder:text-slate-300"
                        />

                        <button
                            onClick={handlePlaceOrder}
                            disabled={isSubmitting || cartItems.length === 0}
                            className="w-full bg-gradient-to-r from-rose-500 to-orange-500 text-white p-4 rounded-2xl font-bold text-lg shadow-lg shadow-rose-500/30 active:scale-95 transition flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl"
                        >
                            {isSubmitting ? 'Sending...' : (
                                <>
                                    <span>Place Order</span>
                                    <Send size={20} className="animate-pulse" />
                                </>
                            )}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};
