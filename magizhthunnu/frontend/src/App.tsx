import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import MobileBottomNav from './components/layout/MobileBottomNav';
import Spinner from './components/ui/Spinner';
import type { UserRole } from './types';

const HomePage = lazy(() => import('./pages/HomePage'));
const RestaurantListPage = lazy(() => import('./pages/RestaurantListPage'));
const RestaurantDetailPage = lazy(() => import('./pages/RestaurantDetailPage'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const VerifyMobilePage = lazy(() => import('./pages/auth/VerifyMobilePage'));
const VerifyEmailPage = lazy(() => import('./pages/auth/VerifyEmailPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const OrderTrackingPage = lazy(() => import('./pages/OrderTrackingPage'));
const OrderHistoryPage = lazy(() => import('./pages/OrderHistoryPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const RestaurantDashboard = lazy(() => import('./pages/dashboard/RestaurantDashboard'));
const MenuManagement = lazy(() => import('./pages/dashboard/MenuManagement'));
const OrderManagement = lazy(() => import('./pages/dashboard/OrderManagement'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AnalyticsPage = lazy(() => import('./pages/admin/AnalyticsPage'));

interface PrivateRouteProps {
  children: React.JSX.Element;
  roles?: UserRole[];
}

const PrivateRoute = ({ children, roles }: PrivateRouteProps) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location.pathname }} replace />;
  }

  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const PageLoader = () => (
  <div className="flex justify-center py-20">
    <Spinner size="lg" />
  </div>
);

const AppRoutes = () => (
  <div className="flex flex-col min-h-screen bg-gray-50">
    <Navbar />
    <main className="flex-1 pb-16 md:pb-0">
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/restaurants" element={<RestaurantListPage />} />
          <Route path="/restaurants/:id" element={<RestaurantDetailPage />} />
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/register" element={<RegisterPage />} />
          <Route path="/auth/verify-mobile" element={<VerifyMobilePage />} />

          {/* Customer-only routes */}
          <Route
            path="/cart"
            element={
              <PrivateRoute roles={['customer']}>
                <CartPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <PrivateRoute roles={['customer']}>
                <CheckoutPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/orders/:id/track"
            element={
              <PrivateRoute>
                <OrderTrackingPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <PrivateRoute>
                <OrderHistoryPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <ProfilePage />
              </PrivateRoute>
            }
          />

          {/* Restaurant-owner routes */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute roles={['restaurant', 'admin']}>
                <RestaurantDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboard/menu"
            element={
              <PrivateRoute roles={['restaurant', 'admin']}>
                <MenuManagement />
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboard/orders"
            element={
              <PrivateRoute roles={['restaurant', 'admin']}>
                <OrderManagement />
              </PrivateRoute>
            }
          />

          {/* Admin-only routes */}
          <Route
            path="/admin"
            element={
              <PrivateRoute roles={['admin']}>
                <AdminDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/analytics"
            element={
              <PrivateRoute roles={['admin']}>
                <AnalyticsPage />
              </PrivateRoute>
            }
          />

          {/* Email verification link: /isValid=<token> */}
          <Route path="/:magicParam" element={<VerifyEmailPage />} />

          {/* Catch-all → home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </main>
    <Footer />
    <MobileBottomNav />
  </div>
);

const App = () => (
  <ThemeProvider>
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  </ThemeProvider>
);

export default App;
