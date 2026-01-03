import React, { useEffect } from 'react';
import { SignIn, useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { Citrus } from 'lucide-react';

export const LoginScreen: React.FC = () => {
    const { isSignedIn, user } = useUser();
    const navigate = useNavigate();

    useEffect(() => {
        if (isSignedIn) {
            const email = user.primaryEmailAddress?.emailAddress || '';
            if (email.includes('admin')) {
                navigate('/admin');
            } else {
                navigate('/menu');
            }
        }
    }, [isSignedIn, user, navigate]);

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

            {/* Clerk Box Container */}
            <div className="w-full max-w-md">
                <div className="bg-white/60 backdrop-blur-2xl p-2 rounded-3xl shadow-2xl shadow-rose-900/10 border border-white/60">
                    <SignIn
                        appearance={{
                            elements: {
                                rootBox: "w-full",
                                card: "shadow-none bg-transparent w-full",
                                headerTitle: "text-slate-800 font-bold",
                                headerSubtitle: "text-slate-500",
                                formButtonPrimary: "bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 !shadow-lg border-none",
                                formFieldInput: "bg-white/50 border-white/50 focus:border-rose-500 focus:ring-rose-500/20",
                                footerActionLink: "text-rose-500 hover:text-rose-600 font-bold"
                            }
                        }}
                    />
                </div>
            </div>

            <p className="mt-8 text-xs text-slate-500 font-medium text-center max-w-xs">
                Tip: Store Managers, use your admin email to access the dashboard.
            </p>
        </div>
    );
};
