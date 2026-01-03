import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import type { Order } from '../types';
import { Play, Check, Trash2, Clock } from 'lucide-react';

export const AdminDashboard: React.FC = () => {


    interface OrderWithItems extends Order {
        order_items?: {
            id: string;
            menu_item_id: string;
            customizations: string[];
            menu_items?: { name: string }; // Matches our API return structure
        }[];
    }

    const [fullOrders, setFullOrders] = useState<OrderWithItems[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();

        // Polling
        const interval = setInterval(() => {
            fetchOrders();
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    const fetchOrders = async () => {
        try {
            // Fetch orders
            const ordersData = await api.getOrders();
            // Filter out completed for the main board to keep it clean, or keep them if needed.
            // Let's filter out 'completed' to match previous logic logic.
            const activeOrders = ordersData.filter((o: Order) => o.status !== 'completed');

            // Fetch Items for these orders
            // Concurrent fetch
            const ordersWithItems = await Promise.all(activeOrders.map(async (order: Order) => {
                const items = await api.getOrderItems(order.id);
                return { ...order, order_items: items || [] };
            }));

            // Sort by oldest first (created_at is ISO string)
            ordersWithItems.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

            setFullOrders(ordersWithItems as OrderWithItems[]);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id: string, newStatus: string) => {
        try {
            await api.updateOrderStatus(id, newStatus);
            fetchOrders();
        } catch (e) {
            alert('Error updating status');
        }
    };

    const deleteOrder = async (id: string) => {
        if (!confirm('Cancel this order?')) return;
        await api.deleteOrder(id);
        fetchOrders();
    };

    if (loading) return <div className="p-4">Loading Admin...</div>;

    return (
        <div className="pb-20 px-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                Store Manager 👩‍💼
                <span className="text-sm font-normal bg-gray-200 px-2 py-1 rounded-full text-gray-600">{fullOrders.length} active</span>
            </h2>

            <div className="flex flex-col gap-4">
                {fullOrders.map(order => (
                    <div key={order.id} className="bg-white rounded-xl shadow-md border-l-4 border-l-smooth-purple overflow-hidden">
                        <div className="p-4 border-b border-gray-100 flex justify-between items-start">
                            <div>
                                <h3 className="font-bold text-lg">{order.customer_name}</h3>
                                <p className="text-xs text-gray-400">
                                    {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                            <div className="px-2 py-1 bg-gray-100 rounded text-xs font-bold uppercase tracking-wider text-gray-500">
                                {order.status}
                            </div>
                        </div>

                        <div className="p-4 bg-gray-50/50">
                            {order.order_items?.map(item => (
                                <div key={item.id} className="mb-2 last:mb-0">
                                    <p className="font-semibold text-gray-800">
                                        {item.menu_items?.name || 'Unknown Item'}
                                    </p>
                                    {item.customizations && item.customizations.length > 0 && (
                                        <p className="text-sm text-red-500 italic">
                                            + {item.customizations.join(', ')}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="p-3 bg-gray-50 flex gap-2 justify-end">
                            {/* Cancel/Reset */}
                            <button onClick={() => deleteOrder(order.id)} className="p-2 text-gray-400 hover:text-red-500">
                                <Trash2 size={20} />
                            </button>

                            {/* Status Workflow */}
                            {order.status === 'pending' && (
                                <button
                                    onClick={() => updateStatus(order.id, 'blending')}
                                    className="flex-1 bg-smooth-purple text-white py-2 px-4 rounded-lg font-bold flex items-center justify-center gap-2 shadow-sm"
                                >
                                    <Play size={18} fill="currentColor" /> Start Blending
                                </button>
                            )}

                            {order.status === 'blending' && (
                                <button
                                    onClick={() => updateStatus(order.id, 'ready')}
                                    className="flex-1 bg-smooth-green text-white py-2 px-4 rounded-lg font-bold flex items-center justify-center gap-2 shadow-sm"
                                >
                                    <Check size={18} strokeWidth={3} /> Mark Ready
                                </button>
                            )}

                            {order.status === 'ready' && (
                                <button
                                    onClick={() => updateStatus(order.id, 'completed')}
                                    className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg font-bold flex items-center justify-center gap-2 shadow-sm"
                                >
                                    Complete
                                </button>
                            )}
                        </div>
                    </div>
                ))}

                {fullOrders.length === 0 && (
                    <div className="text-center py-10 opacity-50">
                        <Clock size={48} className="mx-auto mb-2" />
                        <p>No active orders!</p>
                    </div>
                )}
            </div>
        </div>
    );
};
