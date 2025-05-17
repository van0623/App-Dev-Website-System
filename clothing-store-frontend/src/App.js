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
import UserProfile from './pages/UserProfile';

// Admin Pages
import AdminLanding from './pages/AdminLanding';
import AdminDashboard from './pages/AdminDashboard';
import AdminProducts from './pages/AdminProducts';
import AdminOrders from './pages/AdminOrders';
import AdminUsers from './pages/AdminUsers';
import AdminSettings from './pages/AdminSettings';

// Components
import Header from './components/Header';
import AdminHeader from './components/AdminHeader';

// Context Providers
import { UserProvider } from './context/UserContext';
import { CartProvider } from './context/CartContext';
import { NotificationProvider } from './context/NotificationContext';
import { SettingsProvider } from './context/SettingsContext';

function App() {
  // Clean up old cart storage format on application start
  useEffect(() => {
    console.log('App initialization - Checking for legacy cart data');
    
    // Remove the old cart storage key if it exists
    if (localStorage.getItem('cart')) {
      console.log('Found legacy cart data, removing it');
      localStorage.removeItem('cart');
    }
    
    // Log all localStorage keys for debugging
    const storageKeys = Object.keys(localStorage);
    console.log('All localStorage keys on startup:', storageKeys);
  }, []);
  
  // Debug notification rendering
  console.log('App component rendering');

  return (
    <Router>
      <UserProvider>
        <CartProvider>
          <NotificationProvider>
            <SettingsProvider>
              <div className="App">
                <Routes>
                  {/* Admin Routes */}
                  <Route path="/admin/*" element={
                    <>
                      <AdminHeader />
                      <main>
                        <Routes>
                          <Route path="/" element={<AdminLanding />} />
                          <Route path="/landing" element={<AdminLanding />} />
                          <Route path="/dashboard" element={<AdminDashboard />} />
                          <Route path="/products" element={<AdminProducts />} />
                          <Route path="/orders" element={<AdminOrders />} />
                          <Route path="/users" element={<AdminUsers />} />
                          <Route path="/settings" element={<AdminSettings />} />
                        </Routes>
                      </main>
                    </>
                  } />
                  
                  {/* Public Routes */}
                  <Route path="/*" element={
                    <>
                      <Header />
                      <main>
                        <Routes>
                          <Route index element={<HomePage />} />
                          <Route path="/shop" element={<ShopPage />} />
                          <Route path="/product/:id" element={<ProductDetailPage />} />
                          <Route path="/cart" element={<CartPage />} />
                          <Route path="/checkout" element={<CheckoutPage />} />
                          <Route path="/login" element={<LoginPage />} />
                          <Route path="/register" element={<RegisterPage />} />
                          <Route path="/orders" element={<OrderHistory />} />
                          <Route path="/order/:id" element={<OrderDetail />} />
                          <Route path="/profile" element={<UserProfile />} />
                        </Routes>
                      </main>
                    </>
                  } />
                </Routes>
              </div>
            </SettingsProvider>
          </NotificationProvider>
        </CartProvider>
      </UserProvider>
    </Router>
  );
}

export default App;
