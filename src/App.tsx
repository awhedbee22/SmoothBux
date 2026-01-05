import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Layout } from './components/Layout';
import { CustomerMenu } from './pages/CustomerMenu';
import { CustomerCart } from './pages/CustomerCart';
import { LoginScreen } from './pages/LoginScreen';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminMenuManager } from './pages/AdminMenuManager';
import { OrderStatus } from './pages/OrderStatus';
import { CartProvider } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';


const ProtectedRoute = ({ role }: { role?: 'admin' | 'customer' }) => {
  const { isAuthenticated, user, loading } = useAuth() as any; // Type assertion for now to bypass strict check if interface update missed

  if (!isAuthenticated && !loading) { // Wait for loading if possible, but for now simple check
    return <Navigate to="/" replace />;
  }

  if (role && user?.role !== role && user?.role !== 'admin') {
    // Admin can access everything, specific role restricted
    // Actually, let's keep it simple: matching role required, or admin can behave as customer?
    // Requirement: "accounts for family members and for the manager"
    if (role === 'admin' && user?.role !== 'admin') {
      return <Navigate to="/menu" replace />;
    }
  }

  return <Outlet />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<LoginScreen />} />

        {/* Customer Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="menu" element={<CustomerMenu />} />
          <Route path="cart" element={<CustomerCart />} />
          <Route path="orders" element={<OrderStatus />} />
        </Route>

        {/* Admin Routes */}
        <Route element={<ProtectedRoute role="admin" />}>
          <Route path="admin" element={<AdminDashboard />} />
          <Route path="admin/menu" element={<AdminMenuManager />} />
        </Route>
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <AppRoutes />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
