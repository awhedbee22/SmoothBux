import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import type { MenuItem } from '../types';
import { api } from '../lib/api';

interface MenuOption {
    id: string;
    name: string;
    category: 'boost' | 'juice';
    is_available: boolean;
}

interface ProductDetailModalProps {
    item: MenuItem | null;
    isOpen: boolean;
    onClose: () => void;
    onAddToCart: (item: MenuItem, customizations: any) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ item, isOpen, onClose, onAddToCart }) => {
    const [size, setSize] = useState<'Sm' | 'Md' | 'Lg'>('Md');
    const [selectedJuice, setSelectedJuice] = useState<string>('');
    const [selectedBoosts, setSelectedBoosts] = useState<string[]>([]);
    const [notes, setNotes] = useState('');

    // Data
    const [availableJuices, setAvailableJuices] = useState<MenuOption[]>([]);
    const [availableBoosts, setAvailableBoosts] = useState<MenuOption[]>([]);

    useEffect(() => {
        if (isOpen) {
            // Reset state
            setSize('Md');
            setSelectedJuice('');
            setSelectedBoosts([]);
            setNotes('');

            // Fetch options
            api.getOptions().then(options => {
                setAvailableJuices(options.filter((o: MenuOption) => o.category === 'juice' && o.is_available));
                setAvailableBoosts(options.filter((o: MenuOption) => o.category === 'boost' && o.is_available));
            }).catch(console.error);
        }
    }, [isOpen]);

    // Set default juice if available and none selected
    useEffect(() => {
        if (availableJuices.length > 0 && !selectedJuice) {
            // Default to Apple or Orange if found, else first one
            const defaultJuice = availableJuices.find(j => j.name.includes('Apple')) || availableJuices[0];
            setSelectedJuice(defaultJuice.name);
        }
    }, [availableJuices]);

    if (!isOpen || !item) return null;

    const toggleBoost = (boostName: string) => {
        if (selectedBoosts.includes(boostName)) {
            setSelectedBoosts(selectedBoosts.filter(b => b !== boostName));
        } else {
            setSelectedBoosts([...selectedBoosts, boostName]);
        }
    };

    const handleConfirm = () => {
        const customizations = {
            size,
            juice: selectedJuice,
            boosts: selectedBoosts,
            notes: notes.trim()
        };
        onAddToCart(item, customizations);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">

                {/* Header Image */}
                <div className="h-48 w-full relative shrink-0">
                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full backdrop-blur-md transition-colors"
                    >
                        <X size={20} />
                    </button>
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                        <h2 className="text-white text-2xl font-bold">{item.name}</h2>
                        <p className="text-white/90 text-sm mt-1">{item.description}</p>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1 space-y-6">

                    {/* Size Selection */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Size</h3>
                        <div className="flex bg-gray-100 p-1.5 rounded-xl">
                            {(['Sm', 'Md', 'Lg'] as const).map((s) => (
                                <button
                                    key={s}
                                    onClick={() => setSize(s)}
                                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${size === s
                                        ? 'bg-white text-smooth-purple shadow-sm ring-1 ring-gray-200'
                                        : 'text-gray-400 hover:text-gray-600'
                                        }`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Juice Selection */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Juice Mixer</h3>
                        <div className="grid grid-cols-2 gap-2">
                            {availableJuices.map(juice => (
                                <button
                                    key={juice.id}
                                    onClick={() => setSelectedJuice(juice.name)}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all text-left truncate ${selectedJuice === juice.name
                                        ? 'border-smooth-orange bg-orange-50 text-smooth-orange'
                                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                        }`}
                                >
                                    {juice.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Boosts Selection */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Boosts (Optional)</h3>
                        <div className="flex flex-wrap gap-2">
                            {availableBoosts.map(boost => {
                                const isSelected = selectedBoosts.includes(boost.name);
                                return (
                                    <button
                                        key={boost.id}
                                        onClick={() => toggleBoost(boost.name)}
                                        className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all flex items-center gap-1.5 ${isSelected
                                            ? 'bg-smooth-green/10 border-smooth-green text-smooth-green'
                                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                            }`}
                                    >
                                        {isSelected && <Check size={14} />}
                                        {boost.name}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Special Instructions</h3>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Less ice? Extra sweet?"
                            className="w-full text-sm p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-smooth-purple/50 bg-gray-50 resize-none h-20"
                        />
                    </div>

                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-gray-100 bg-white sticky bottom-0">
                    <button
                        onClick={handleConfirm}
                        className="w-full bg-smooth-purple text-white font-bold py-3.5 rounded-xl shadow-lg shadow-purple-200 active:scale-95 transition-transform flex items-center justify-center gap-2"
                    >
                        Add to Order
                    </button>
                </div>

            </div>
        </div>
    );
};
