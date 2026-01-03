import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import { Layout } from './components/Layout';
import { CustomerMenu } from './pages/CustomerMenu';
import { CustomerCart } from './pages/CustomerCart';
import { LoginScreen } from './pages/LoginScreen';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminMenuManager } from './pages/AdminMenuManager';
import { OrderStatus } from './pages/OrderStatus';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

function ClerkApp() {
  const navigate = useNavigate();

  return (
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      routerPush={(to) => navigate(to)}
      routerReplace={(to) => navigate(to, { replace: true })}
    >
      <AuthProvider>
        <CartProvider>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<LoginScreen />} />

              {/* Customer Routes */}
              <Route
                path="menu"
                element={
                  <>
                    <SignedIn><CustomerMenu /></SignedIn>
                    <SignedOut><RedirectToSignIn /></SignedOut>
                  </>
                }
              />
              <Route
                path="cart"
                element={
                  <>
                    <SignedIn><CustomerCart /></SignedIn>
                    <SignedOut><RedirectToSignIn /></SignedOut>
                  </>
                }
              />
              <Route
                path="orders"
                element={
                  <>
                    <SignedIn><OrderStatus /></SignedIn>
                    <SignedOut><RedirectToSignIn /></SignedOut>
                  </>
                }
              />

              {/* Admin Routes */}
              <Route
                path="admin"
                element={
                  <>
                    <SignedIn><AdminDashboard /></SignedIn>
                    <SignedOut><RedirectToSignIn /></SignedOut>
                  </>
                }
              />
              <Route
                path="admin/menu"
                element={
                  <>
                    <SignedIn><AdminMenuManager /></SignedIn>
                    <SignedOut><RedirectToSignIn /></SignedOut>
                  </>
                }
              />
            </Route>
          </Routes>
        </CartProvider>
      </AuthProvider>
    </ClerkProvider>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ClerkApp />
    </BrowserRouter>
  );
}

export default App;
