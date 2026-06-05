import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import { useCart } from './context/CartContext.jsx';
import HomePage from './pages/HomePage.jsx';
import ProductsPage from './pages/ProductsPage.jsx';
import ProductDetailsPage from './pages/ProductDetailsPage.jsx';
import CartPage from './pages/CartPage.jsx';
import CheckoutPage from './pages/CheckoutPage.jsx';
import OrderConfirmationPage from './pages/OrderConfirmationPage.jsx';
import OrderDetailsPage from './pages/OrderDetailsPage.jsx';
import OrderHistoryPage from './pages/OrderHistoryPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import AdminDashboardPage from './pages/AdminDashboardPage.jsx';
import AdminProductsPage from './pages/AdminProductsPage.jsx';
import AdminProductFormPage from './pages/AdminProductFormPage.jsx';
import AdminSinglesListingPage from './pages/AdminSinglesListingPage.jsx';
import AdminOrdersPage from './pages/AdminOrdersPage.jsx';
import AdminOrderDetailsPage from './pages/AdminOrderDetailsPage.jsx';
import AdminLayout from './components/AdminLayout.jsx';
import CookieNotice from './components/CookieNotice.jsx';
import Footer from './components/Footer.jsx';
import LegalPage from './pages/LegalPage.jsx';
import logoUrl from '../images/logo.png';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <main className="page"><div className="empty-state">Loading account...</div></main>;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return children;
}

function AdminRoute({ children }) {
  const { user, isAdmin, loading } = useAuth();

  if (loading) return <main className="page"><div className="empty-state">Loading account...</div></main>;
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
}

function AdminScreen({ children }) {
  return (
    <AdminRoute>
      <AdminLayout>{children}</AdminLayout>
    </AdminRoute>
  );
}

function Shell() {
  const { user, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const productType = searchParams.get('type');
  const isProductsPath = location.pathname === '/products';
  const navClass = (active) => active ? 'is-active' : undefined;

  return (
    <>
      <header className="site-header">
        <div className="site-header__inner">
          <Link className="brand" to="/" aria-label="Cannon Cards TCG home">
            <img src={logoUrl} alt="Cannon Cards TCG" />
          </Link>
          <div className="site-nav-shell">
            <nav className="site-nav site-nav--shop" aria-label="Shop">
              <Link className={navClass(isProductsPath && !productType)} to="/products">All products</Link>
              <Link className={navClass(isProductsPath && productType === 'sealed_product')} to="/products?type=sealed_product">Sealed</Link>
              <Link className={navClass(isProductsPath && productType === 'single_card')} to="/products?type=single_card">Singles</Link>
              <Link className={navClass(isProductsPath && productType === 'code_card')} to="/products?type=code_card">Code cards</Link>
            </nav>
            <nav className="site-nav site-nav--account" aria-label="Account">
              {user && <Link className={navClass(location.pathname.startsWith('/orders'))} to="/orders">Orders</Link>}
              {isAdmin && <Link className={navClass(location.pathname.startsWith('/admin'))} to="/admin">Admin</Link>}
              <Link className={`cart-link ${location.pathname === '/cart' ? 'is-active' : ''}`} to="/cart">
                Basket <span>{itemCount}</span>
              </Link>
              {user ? (
                <button className="link-button" onClick={logout}>Sign out</button>
              ) : (
                <Link className={navClass(location.pathname === '/login')} to="/login">Sign in</Link>
              )}
            </nav>
          </div>
        </div>
      </header>

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:id" element={<ProductDetailsPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
        <Route path="/orders" element={<ProtectedRoute><OrderHistoryPage /></ProtectedRoute>} />
        <Route path="/orders/:id" element={<ProtectedRoute><OrderDetailsPage /></ProtectedRoute>} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/legal/terms" element={<LegalPage page="terms" />} />
        <Route path="/legal/privacy" element={<LegalPage page="privacy" />} />
        <Route path="/legal/cookies" element={<LegalPage page="cookies" />} />
        <Route path="/legal/returns" element={<LegalPage page="returns" />} />
        <Route path="/legal/shipping" element={<LegalPage page="shipping" />} />
        <Route path="/legal/product-warnings" element={<LegalPage page="product-warnings" />} />
        <Route path="/legal/contact" element={<LegalPage page="contact" />} />

        <Route path="/admin" element={<AdminScreen><AdminDashboardPage /></AdminScreen>} />
        <Route path="/admin/products" element={<AdminScreen><AdminProductsPage /></AdminScreen>} />
        <Route path="/admin/products/new" element={<AdminScreen><AdminProductFormPage /></AdminScreen>} />
        <Route path="/admin/code-cards/new" element={<AdminScreen><AdminProductFormPage defaultType="code_card" /></AdminScreen>} />
        <Route path="/admin/products/:id/edit" element={<AdminScreen><AdminProductFormPage /></AdminScreen>} />
        <Route path="/admin/singles/new" element={<AdminScreen><AdminSinglesListingPage /></AdminScreen>} />
        <Route path="/admin/orders" element={<AdminScreen><AdminOrdersPage queue="all" /></AdminScreen>} />
        <Route path="/admin/orders/new-orders" element={<AdminScreen><AdminOrdersPage queue="new" /></AdminScreen>} />
        <Route path="/admin/orders/to-ship" element={<AdminScreen><AdminOrdersPage queue="to_ship" /></AdminScreen>} />
        <Route path="/admin/orders/:id" element={<AdminScreen><AdminOrderDetailsPage /></AdminScreen>} />
      </Routes>

      <Footer />
      <CookieNotice />
    </>
  );
}

export default function App() {
  return <Shell />;
}
