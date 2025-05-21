import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Public Pages
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OrderHistory from './pages/OrderHistory';
import OrderDetail from './pages/OrderDetail';
import OrderConfirmation from './pages/OrderConfirmation';
import UserProfile from './pages/UserProfile';

// Admin Pages
import AdminLanding from './pages/AdminLanding';
import AdminDashboard from './pages/AdminDashboard';
import AdminProducts from './pages/AdminProducts';
import AdminOrders from './pages/AdminOrders';
import AdminUsers from './pages/AdminUsers';
import AdminSettings from './pages/AdminSettings';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';

// Context Providers
import { UserProvider } from './context/UserContext';
import { CartProvider } from './context/CartContext';
import { NotificationProvider } from './context/NotificationContext';
import { SettingsProvider } from './context/SettingsContext';

function App() {
  useEffect(() => {
    console.log('App initialization - Checking for legacy cart data');
    if (localStorage.getItem('cart')) {
      console.log('Found legacy cart data, removing it');
      localStorage.removeItem('cart');
    }
    console.log('All localStorage keys on startup:', Object.keys(localStorage));
  }, []);

  return (
    <Router>
      <UserProvider>
        <NotificationProvider>
          <CartProvider>
            <SettingsProvider>
              <div className="App">
                <Routes>
                  {/* Admin Layout */}
                  <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<AdminLanding />} />
                    <Route path="landing" element={<AdminLanding />} />
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="products" element={<AdminProducts />} />
                    <Route path="orders" element={<AdminOrders />} />
                    <Route path="users" element={<AdminUsers />} />
                    <Route path="settings" element={<AdminSettings />} />
                  </Route>

                  {/* Public Layout */}
                  <Route path="/" element={<PublicLayout />}>
                    <Route index element={<HomePage />} />
                    <Route path="shop" element={<ShopPage />} />
                    <Route path="product/:id" element={<ProductDetailPage />} />
                    <Route path="cart" element={<CartPage />} />
                    <Route path="checkout" element={<CheckoutPage />} />
                    <Route path="login" element={<LoginPage />} />
                    <Route path="register" element={<RegisterPage />} />
                    <Route path="order-history" element={<OrderHistory />} />
                    <Route path="order/:id" element={<OrderDetail />} />
                    <Route path="order-confirmation/:id" element={<OrderConfirmation />} />
                    <Route path="profile" element={<UserProfile />} />
                  </Route>
                </Routes>
              </div>
            </SettingsProvider>
          </CartProvider>
        </NotificationProvider>
      </UserProvider>
    </Router>
  );
}

export default App;
