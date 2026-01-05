import React, { createContext, useContext, type ReactNode } from 'react';


// Adapting our old AuthContext to use Clerk under the hood
// This minimizes refactoring in other components that might use useAuth()
// though we are mostly using direct routes now.

type UserRole = 'admin' | 'customer' | null;

interface AuthContextType {
    role: UserRole;
    loginAsAdmin: (pin: string) => Promise<boolean>;
    loginAsCustomer: () => void;
    logout: () => void;
    login: (username: string, password: string) => Promise<boolean>;
    user: any;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    interface User {
        id: string;
        username: string;
        role: UserRole;
    }

    const [user, setUser] = React.useState<User | null>(null);
    const [token, setToken] = React.useState<string | null>(localStorage.getItem('token'));
    const [loading, setLoading] = React.useState<boolean>(true);

    // Initial check
    React.useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            fetch('/api/auth/me', {
                headers: { 'Authorization': `Bearer ${storedToken}` }
            })
                .then(res => {
                    if (res.ok) return res.json();
                    throw new Error('Invalid token');
                })
                .then(data => {
                    setUser(data.user);
                    setToken(storedToken);
                })
                .catch(() => {
                    localStorage.removeItem('token');
                    setToken(null);
                    setUser(null);
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const role = user?.role || null;

    const loginAsAdmin = async (password: string) => {
        // Legacy adapter for specific component usage if any
        // But we should prefer the full login function exposed below
        return await login('manager', password);
    };

    const loginAsCustomer = () => {
        // Legacy
    };

    const login = async (username: string, password: string): Promise<boolean> => {
        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            if (res.ok) {
                const data = await res.json();
                localStorage.setItem('token', data.token);
                setToken(data.token);
                setUser(data.user);
                return true;
            }
            return false;
        } catch (e) {
            console.error(e);
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        // Force reload to clear any state if needed, or just let React handle it
        // window.location.href = '/'; 
    };

    if (loading) return <div className="p-4">Loading Auth...</div>;

    return (
        <AuthContext.Provider value={{ role, loginAsAdmin, loginAsCustomer, logout, login, user, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
