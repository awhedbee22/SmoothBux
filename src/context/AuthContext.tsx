import React, { createContext, useContext, type ReactNode } from 'react';
import { useUser, useClerk } from '@clerk/clerk-react';

// Adapting our old AuthContext to use Clerk under the hood
// This minimizes refactoring in other components that might use useAuth()
// though we are mostly using direct routes now.

type UserRole = 'admin' | 'customer' | null;

interface AuthContextType {
    role: UserRole;
    loginAsAdmin: (pin: string) => boolean; // Legacy signature, will warn or no-op
    loginAsCustomer: () => void; // Legacy
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const { user, isLoaded } = useUser();
    const { signOut } = useClerk();

    // Derived role
    const role: UserRole = React.useMemo(() => {
        if (!user) return null;
        const email = user.primaryEmailAddress?.emailAddress || '';
        return email.includes('admin') ? 'admin' : 'customer';
    }, [user]);

    const loginAsAdmin = () => {
        alert('Please use the Clerk Login screen.');
        return false;
    };

    const loginAsCustomer = () => {
        // No-op
    };

    const logout = () => {
        signOut();
    };

    if (!isLoaded) return <div className="p-4">Loading Auth...</div>;

    return (
        <AuthContext.Provider value={{ role, loginAsAdmin, loginAsCustomer, logout }}>
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
