import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Citrus } from 'lucide-react';

export const LoginScreen: React.FC = () => {
    const { login, isAuthenticated, user } = useAuth();
    const navigate = useNavigate();
    const [username, setUsername] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [error, setError] = React.useState('');
    const [loading, setLoading] = React.useState(false);

    useEffect(() => {
        if (isAuthenticated && user) {
            if (user.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/menu');
            }
        }
    }, [isAuthenticated, user, navigate]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        const success = await login(username, password);
        setLoading(false);
        if (!success) {
            setError('Invalid credentials');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] w-full px-4 animate-in fade-in zoom-in duration-500">

            {/* Logo / Hero */}
            <div className="text-center mb-8 relative">
                <div className="absolute inset-0 bg-rose-400 blur-3xl opacity-20 rounded-full animate-pulse-slow"></div>
                <div className="relative bg-white/40 backdrop-blur-md p-6 rounded-[2rem] shadow-xl border border-white/50 inline-block mb-4">
                    <Citrus size={64} className="text-rose-500 drop-shadow-sm" />
                </div>
                <h1 className="text-4xl font-black text-slate-800 tracking-tight">
                    Smooth<span className="text-rose-500">Bux</span>
                </h1>
                <p className="text-slate-600 font-medium mt-2">Sip. Smile. Repeat. 🥤</p>
            </div>

            {/* Custom Auth Form */}
            <div className="w-full max-w-md">
                <div className="bg-white/60 backdrop-blur-2xl p-8 rounded-3xl shadow-2xl shadow-rose-900/10 border border-white/60">
                    <form onSubmit={handleLogin} className="flex flex-col gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-white/50 border border-white/50 rounded-lg p-3 focus:border-rose-500 focus:ring-rose-500/20 outline-none transition-all"
                                placeholder="Enter username"
                                disabled={loading}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-white/50 border border-white/50 rounded-lg p-3 focus:border-rose-500 focus:ring-rose-500/20 outline-none transition-all"
                                placeholder="Enter password"
                                disabled={loading}
                            />
                        </div>

                        {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white font-bold py-3 rounded-xl shadow-lg transform active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>
                </div>
            </div>

            <p className="mt-8 text-xs text-slate-500 font-medium text-center max-w-xs">
                Tip: Store Managers, use "manager" to access the dashboard.
            </p>
        </div>
    );
};
