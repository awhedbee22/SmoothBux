import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import type { MenuItem } from '../types';
import { Plus, Trash2, X, Image as ImageIcon } from 'lucide-react';
import Cropper from 'react-easy-crop';

// Types
interface MenuOption {
    id: string;
    name: string;
    category: 'boost' | 'juice';
    is_available: boolean;
}

export const AdminMenuManager: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'menu' | 'options'>('menu');

    // --- MENU STATE ---
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
    const [newItem, setNewItem] = useState({
        name: '', description: '', image_url: '', ingredients: '',
    });

    // Image Cropper State
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
    const [isCropping, setIsCropping] = useState(false);

    // --- OPTIONS STATE ---
    const [options, setOptions] = useState<MenuOption[]>([]);
    const [newOption, setNewOption] = useState({ name: '', category: 'boost' as 'boost' | 'juice' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [menuData, optionsData] = await Promise.all([
                api.getMenu(),
                api.getOptions()
            ]);
            setMenuItems(menuData || []);
            setOptions(optionsData || []);
        } catch (error) {
            console.error(error);
        }
    };

    // --- MENU HANDLERS ---

    const handleDeleteMenu = async (id: string) => {
        if (!confirm('Delete this smoothie?')) return;
        await api.deleteMenuItem(id);
        fetchData();
    };

    const handleToggleMenu = async (id: string, current: boolean) => {
        await api.toggleMenuItem(id, current);
        fetchData();
    };

    // Image Upload Helpers
    const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.addEventListener('load', () => {
                setImageSrc(reader.result as string);
                setIsCropping(true);
            });
            reader.readAsDataURL(file);
        }
    };

    const createImage = (url: string): Promise<HTMLImageElement> =>
        new Promise((resolve, reject) => {
            const image = new Image();
            image.addEventListener('load', () => resolve(image));
            image.addEventListener('error', (error) => reject(error));
            image.src = url;
        });

    const getCroppedImg = async (imageSrc: string, pixelCrop: any): Promise<string> => {
        const image = await createImage(imageSrc);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return '';

        canvas.width = pixelCrop.width;
        canvas.height = pixelCrop.height;

        ctx.drawImage(
            image,
            pixelCrop.x,
            pixelCrop.y,
            pixelCrop.width,
            pixelCrop.height,
            0,
            0,
            pixelCrop.width,
            pixelCrop.height
        );

        return canvas.toDataURL('image/jpeg', 0.8); // Compress to JPEG 80%
    };

    const handleCropComplete = useCallback((_: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const confirmCrop = async () => {
        try {
            if (imageSrc && croppedAreaPixels) {
                const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
                setNewItem({ ...newItem, image_url: croppedImage });
                setIsCropping(false);
                setImageSrc(null);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleSubmitMenu = async (e: React.FormEvent) => {
        e.preventDefault();
        const ingredientsArray = newItem.ingredients.split(',').map(s => s.trim()).filter(s => s);

        // Default placeholder if no image
        const imageToUse = newItem.image_url || 'https://placehold.co/600x400/orange/white?text=Smoothie';

        try {
            await api.addMenuItem({
                name: newItem.name,
                description: newItem.description,
                image_url: imageToUse,
                ingredients: ingredientsArray,
                is_available: true
            });
            setNewItem({ name: '', description: '', image_url: '', ingredients: '' });
            setIsMenuModalOpen(false);
            fetchData();
        } catch (error: any) {
            alert('Error: ' + error.message);
        }
    };

    // --- OPTIONS HANDLERS ---
    const handleAddOption = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.addOption(newOption);
            setNewOption({ name: '', category: 'boost' }); // Keep category same for ease of bulk entry
            fetchData();
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteOption = async (id: string) => {
        if (!confirm('Delete this option?')) return;
        await api.deleteOption(id);
        fetchData();
    };

    return (
        <div className="pb-20 px-4 relative min-h-screen">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Menu Manager 📝</h2>

            {/* Tabs */}
            <div className="flex p-1 bg-gray-100 rounded-xl mb-6">
                <button
                    onClick={() => setActiveTab('menu')}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'menu' ? 'bg-white shadow-sm text-smooth-purple' : 'text-gray-500'}`}
                >
                    Smoothies
                </button>
                <button
                    onClick={() => setActiveTab('options')}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'options' ? 'bg-white shadow-sm text-smooth-purple' : 'text-gray-500'}`}
                >
                    Options (Juice/Boosts)
                </button>
            </div>

            {/* --- MENU TAB --- */}
            {activeTab === 'menu' && (
                <div>
                    <button
                        onClick={() => setIsMenuModalOpen(true)}
                        className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-400 font-bold hover:border-smooth-green hover:text-smooth-green transition-colors mb-4 flex items-center justify-center gap-2"
                    >
                        <Plus size={20} /> Add New Smoothie
                    </button>

                    <div className="grid gap-4">
                        {menuItems.map(item => (
                            <div key={item.id} className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex gap-4 items-center">
                                <img src={item.image_url} alt={item.name} className="w-16 h-16 rounded-lg object-cover bg-gray-100" />
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-gray-800 truncate">{item.name}</h3>
                                    <p className="text-xs text-gray-500 truncate">{item.ingredients.join(', ')}</p>
                                    <div className="mt-1 flex items-center gap-2">
                                        <span className={`w-2 h-2 rounded-full ${item.is_available ? 'bg-green-500' : 'bg-red-500'}`} />
                                        <button onClick={() => handleToggleMenu(item.id, item.is_available)} className="text-xs underline text-gray-400">
                                            {item.is_available ? 'In Stock' : 'Out of Stock'}
                                        </button>
                                    </div>
                                </div>
                                <button onClick={() => handleDeleteMenu(item.id)} className="text-red-300 hover:text-red-500 p-2"><Trash2 size={18} /></button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* --- OPTIONS TAB --- */}
            {activeTab === 'options' && (
                <div>
                    <form onSubmit={handleAddOption} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex gap-2">
                        <select
                            value={newOption.category}
                            onChange={e => setNewOption({ ...newOption, category: e.target.value as any })}
                            className="p-2 border border-gray-200 rounded-lg text-sm focus:outline-none"
                        >
                            <option value="boost">Boost</option>
                            <option value="juice">Juice</option>
                        </select>
                        <input
                            placeholder="Option Name (e.g. Whey Protein)"
                            value={newOption.name}
                            onChange={e => setNewOption({ ...newOption, name: e.target.value })}
                            className="flex-1 p-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-smooth-purple"
                            required
                        />
                        <button type="submit" className="bg-smooth-purple text-white p-2 rounded-lg"><Plus size={20} /></button>
                    </form>

                    <div className="space-y-6">
                        {/* Juices */}
                        <div>
                            <h3 className="font-bold text-gray-500 uppercase tracking-wider text-xs mb-2 pl-1">Juice Mixers</h3>
                            <div className="flex flex-wrap gap-2">
                                {options.filter(o => o.category === 'juice').map(opt => (
                                    <div key={opt.id} className="bg-orange-50 text-orange-700 px-3 py-1.5 rounded-lg text-sm font-medium border border-orange-100 flex items-center gap-2">
                                        {opt.name}
                                        <button onClick={() => handleDeleteOption(opt.id)} className="hover:text-red-500"><X size={14} /></button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Boosts */}
                        <div>
                            <h3 className="font-bold text-gray-500 uppercase tracking-wider text-xs mb-2 pl-1">Boosts</h3>
                            <div className="flex flex-wrap gap-2">
                                {options.filter(o => o.category === 'boost').map(opt => (
                                    <div key={opt.id} className="bg-green-50 text-green-700 px-3 py-1.5 rounded-lg text-sm font-medium border border-green-100 flex items-center gap-2">
                                        {opt.name}
                                        <button onClick={() => handleDeleteOption(opt.id)} className="hover:text-red-500"><X size={14} /></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- ADD MENU ITEM MODAL --- */}
            {isMenuModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
                        <button
                            onClick={() => setIsMenuModalOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <X size={24} />
                        </button>

                        <h3 className="text-xl font-bold mb-4">Add New Drink</h3>

                        {!isCropping ? (
                            <form onSubmit={handleSubmitMenu} className="flex flex-col gap-3">
                                <div className="w-full h-40 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center relative overflow-hidden group">
                                    {newItem.image_url ? (
                                        <>
                                            <img src={newItem.image_url} alt="Preview" className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => setNewItem({ ...newItem, image_url: '' })}
                                                className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white font-bold"
                                            >
                                                Remove
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <ImageIcon size={32} className="text-gray-300 mb-2" />
                                            <p className="text-xs text-gray-400">Upload Photo</p>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={onFileChange}
                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                            />
                                        </>
                                    )}
                                </div>

                                <input
                                    className="p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-smooth-orange outline-none"
                                    placeholder="Name (e.g. Berry Blast)"
                                    value={newItem.name}
                                    onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                                    required
                                />
                                <textarea
                                    className="p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-smooth-orange outline-none resize-none"
                                    placeholder="Description"
                                    rows={2}
                                    value={newItem.description}
                                    onChange={e => setNewItem({ ...newItem, description: e.target.value })}
                                />
                                <input
                                    className="p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-smooth-orange outline-none"
                                    placeholder="Ingredients (comma separated)"
                                    value={newItem.ingredients}
                                    onChange={e => setNewItem({ ...newItem, ingredients: e.target.value })}
                                />

                                <button type="submit" className="bg-smooth-orange text-white py-3 rounded-xl font-bold mt-2 shadow-md active:scale-95">
                                    Add to Menu
                                </button>
                            </form>
                        ) : (
                            // CROPPER VIEW
                            <div className="h-[400px] relative flex flex-col">
                                <div className="relative flex-1 bg-black rounded-xl overflow-hidden mb-4">
                                    <Cropper
                                        image={imageSrc!}
                                        crop={crop}
                                        zoom={zoom}
                                        aspect={4 / 3}
                                        onCropChange={setCrop}
                                        onCropComplete={handleCropComplete}
                                        onZoomChange={setZoom}
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => { setIsCropping(false); setImageSrc(null); }}
                                        className="flex-1 py-3 rounded-xl bg-gray-100 font-bold text-gray-600"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={confirmCrop}
                                        className="flex-1 py-3 rounded-xl bg-smooth-green text-white font-bold"
                                    >
                                        Save Photo
                                    </button>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            )}
        </div>
    );
};
