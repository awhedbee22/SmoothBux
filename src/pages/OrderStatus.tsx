import React, { useEffect, useState, useRef } from 'react';
import { api } from '../lib/api';
import type { Order } from '../types';
import { Clock, CheckCircle, Loader, Coffee } from 'lucide-react';
import confetti from 'canvas-confetti';

export const OrderStatus: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const prevOrdersRef = useRef<Order[]>([]);

    useEffect(() => {
        fetchOrders();

        // POLLING (Every 2 seconds)
        const interval = setInterval(async () => {
            await fetchOrders();
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    const fetchOrders = async () => {
        try {
            const data = await api.getOrders();
            const newOrders = data as Order[];

            // Check for status changes to trigger confetti
            // We look for any order that is 'ready' in newOrders but was NOT 'ready' (or didn't exist) in prevOrders.
            const hasNewReadyOrder = newOrders.some(newOrder => {
                if (newOrder.status !== 'ready') return false;
                const oldOrder = prevOrdersRef.current.find(o => o.id === newOrder.id);
                // Trigger if it wasn't ready before
                return !oldOrder || oldOrder.status !== 'ready';
            });

            if (hasNewReadyOrder) {
                confetti({
                    particleCount: 150,
                    spread: 80,
                    origin: { y: 0.6 },
                    colors: ['#f97316', '#4ade80', '#9333ea']
                });
            }

            setOrders(newOrders);
            prevOrdersRef.current = newOrders;
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const statusConfig = {
        pending: { color: 'text-gray-500', bg: 'bg-gray-100', icon: Clock, label: 'Received' },
        blending: { color: 'text-smooth-purple', bg: 'bg-purple-100', icon: Loader, label: 'Blending...' },
        ready: { color: 'text-smooth-green', bg: 'bg-green-100', icon: CheckCircle, label: 'Ready!', animate: true },
        completed: { color: 'text-gray-400', bg: 'bg-gray-50', icon: Coffee, label: 'Picked Up' },
    };

    if (loading) return <div className="p-4">Loading status...</div>;

    return (
        <div className="pb-20 px-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Order Board 📋</h2>

            <div className="flex flex-col gap-4">
                {orders.slice(0, 10).map((order) => {
                    const statusKey = (order.status in statusConfig) ? order.status : 'pending';
                    const config = statusConfig[statusKey as keyof typeof statusConfig];
                    const Icon = config.icon;

                    return (
                        <div key={order.id} className={`p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between ${config.bg} transition-all duration-500`}>
                            <div>
                                <p className="font-bold text-lg text-gray-800">{order.customer_name}</p>
                                <p className="text-xs text-gray-500">Order #{order.id.slice(0, 4)}</p>
                            </div>

                            <div className={`flex items-center gap-2 ${config.color} font-bold`}>
                                <Icon size={24} className={order.status === 'blending' ? 'animate-spin' : (order.status === 'ready' ? 'animate-bounce' : '')} strokeWidth={2.5} />
                                <span>{config.label}</span>
                            </div>
                        </div>
                    );
                })}

                {orders.length === 0 && (
                    <div className="text-center text-gray-400 mt-10">
                        <p>No active orders.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
