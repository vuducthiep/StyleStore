import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import AdminLayout from './layouts/AdminLayout';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Home from './pages/Customer/Home/Home.page';
import ProductDetail from './pages/Customer/ProductDetail/ProductDetail.page';
import CartPage from './pages/Customer/Cart/Cart.page';
import ProfilePage from './pages/Customer/Profile/Profile.page';
import UserManager from './pages/Admin/UserManage/UserManager.page';
import ProductManager from './pages/Admin/ProductManage/ProductManage.page';
import DashboardPage from './pages/Admin/Dashboard/Dashboard.page';
import OrderManage from './pages/Admin/OrderManage/OrderManage.page';
import OrderPage from './pages/Customer/Order/Order.page';
import OAuth2CallbackPage from './pages/Auth/OAuth2Callback';

const App: React.FC = () => {
  return (
    <GoogleOAuthProvider clientId="703295823587-dfr3saq3amv8s0on50caab431g0efl72.apps.googleusercontent.com">
      <BrowserRouter>
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Register />} />
          <Route path="/oauth2-callback" element={<OAuth2CallbackPage />} />

          {/* Admin Routes */}
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<DashboardPage />} />
            <Route path="/admin/user-manager" element={<UserManager />} />
            <Route path="/admin/product-manager" element={<ProductManager />} />
            <Route path="/admin/order-manager" element={<OrderManage />} />
          </Route>

          {/* Customer Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path='/orders' element={<OrderPage />} />
        </Routes>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
};

export default App;
