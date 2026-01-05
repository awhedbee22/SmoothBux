import React from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, Citrus, User, LayoutDashboard, Menu as MenuIcon, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export const Layout: React.FC = () => {
    const { role, logout } = useAuth();
    const { cartItems } = useCart();
    const navigate = useNavigate();
    const location = useLocation();

    // Determine current section for header
    const getPageTitle = () => {
        if (location.pathname === '/menu') return 'SmoothBux';
        if (location.pathname === '/cart') return 'My Cart';
        if (location.pathname === '/orders') return 'My Orders';
        if (location.pathname === '/admin') return 'Dashboard';
        if (location.pathname === '/admin/menu') return 'Menu Mgr';
        return 'SmoothBux';
    };

    return (
        <div className="min-h-screen flex flex-col font-sans relative">

            {/* Glass Header (Sticky) */}
            <header className="sticky top-0 z-40 px-6 py-4 flex justify-between items-center bg-white/60 backdrop-blur-xl border-b border-white/40 shadow-sm">
                <div onClick={() => navigate('/')} className="flex items-center gap-2 cursor-pointer">
                    <div className="bg-gradient-to-br from-rose-500 to-orange-400 text-white p-1.5 rounded-lg shadow-lg shadow-rose-500/30">
                        <Citrus size={24} strokeWidth={2.5} />
                    </div>
                    <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                        {getPageTitle()}
                    </h1>
                </div>

                <div className="flex items-center gap-4">
                    {/* Cart Bubble */}
                    {role === 'customer' && (
                        <button
                            onClick={() => navigate('/cart')}
                            className="relative p-2 bg-white/50 rounded-full hover:bg-white transition-colors"
                        >
                            <ShoppingBag size={24} className="text-slate-700" />
                            {cartItems.length > 0 && (
                                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-md animate-bounce-short">
                                    {cartItems.length}
                                </span>
                            )}
                        </button>
                    )}

                    {/* User Avatar Stub */}
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-400 to-blue-500 p-[2px] shadow-md">
                        <div className="w-full h-full rounded-full bg-white/90 flex items-center justify-center text-sky-600 font-bold text-xs uppercase">
                            {role === 'admin' ? 'MGR' : 'YOU'}
                        </div>
                    </div>

                    {/* Logout Button */}
                    {role && (
                        <button
                            onClick={logout}
                            className="p-2 bg-white/50 rounded-full hover:bg-rose-50 text-slate-500 hover:text-rose-500 transition-colors"
                            title="Log Out"
                        >
                            <LogOut size={20} />
                        </button>
                    )}
                </div>
            </header>

            {/* Main Content (Scrollable) */}
            <main className="flex-1 overflow-y-auto pt-4 px-4 pb-24 md:px-0 md:max-w-2xl md:mx-auto w-full">
                <Outlet />
            </main>

            {/* Glass Bottom Nav */}
            <nav className="fixed bottom-6 left-4 right-4 bg-white/70 backdrop-blur-2xl border border-white/50 rounded-3xl shadow-2xl shadow-sky-900/10 z-50 md:max-w-md md:mx-auto">
                <div className="flex justify-around items-center p-2">
                    {role === 'admin' ? (
                        <>
                            <NavLink
                                to="/admin"
                                end
                                className={({ isActive }) =>
                                    `flex flex-col items-center gap-1 p-3 rounded-2xl transition-all duration-300 ${isActive ? 'text-rose-500 bg-white shadow-lg scale-105' : 'text-slate-400 hover:text-slate-600'
                                    }`
                                }
                            >
                                {({ isActive }) => (
                                    <LayoutDashboard size={24} strokeWidth={isActive ? 2.5 : 2} />
                                )}
                            </NavLink>
                            <NavLink
                                to="/admin/menu"
                                className={({ isActive }) =>
                                    `flex flex-col items-center gap-1 p-3 rounded-2xl transition-all duration-300 ${isActive ? 'text-rose-500 bg-white shadow-lg scale-105' : 'text-slate-400 hover:text-slate-600'
                                    }`
                                }
                            >
                                {({ isActive }) => (
                                    <MenuIcon size={24} strokeWidth={isActive ? 2.5 : 2} />
                                )}
                            </NavLink>
                        </>
                    ) : (
                        <>
                            <NavLink
                                to="/menu"
                                className={({ isActive }) =>
                                    `flex flex-col items-center gap-1 p-3 rounded-2xl transition-all duration-300 ${isActive ? 'text-rose-500 bg-white shadow-lg scale-105' : 'text-slate-400 hover:text-slate-600'
                                    }`
                                }
                            >
                                {({ isActive }) => (
                                    <Citrus size={24} strokeWidth={isActive ? 2.5 : 2} />
                                )}
                            </NavLink>
                            <NavLink
                                to="/cart"
                                className={({ isActive }) =>
                                    `flex flex-col items-center gap-1 p-3 rounded-2xl transition-all duration-300 ${isActive ? 'text-rose-500 bg-white shadow-lg scale-105' : 'text-slate-400 hover:text-slate-600'
                                    }`
                                }
                            >
                                {({ isActive }) => (
                                    <ShoppingBag size={24} strokeWidth={isActive ? 2.5 : 2} />
                                )}
                            </NavLink>
                            <NavLink
                                to="/orders"
                                className={({ isActive }) =>
                                    `flex flex-col items-center gap-1 p-3 rounded-2xl transition-all duration-300 ${isActive ? 'text-rose-500 bg-white shadow-lg scale-105' : 'text-slate-400 hover:text-slate-600'
                                    }`
                                }
                            >
                                {({ isActive }) => (
                                    <User size={24} strokeWidth={isActive ? 2.5 : 2} />
                                )}
                            </NavLink>
                        </>
                    )}
                </div>
            </nav>
        </div>
    );
};
