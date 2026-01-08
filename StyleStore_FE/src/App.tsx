import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Home from './pages/Customer/Home/Home.page';
import UserManager from './pages/Admin/UserManage/UserManager.page';
import ProductManager from './pages/Admin/ProductManage/ProductManage.page';
import DashboardPage from './pages/Admin/Dashboard/Dashboard.page';
import OrderManage from './pages/Admin/OrderManage/OrderManage.page';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Register />} />

        {/* Admin Routes */}
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<DashboardPage />} />
          <Route path="/admin/user-manager" element={<UserManager />} />
          <Route path="/admin/product-manager" element={<ProductManager />} />
          <Route path="/admin/order-manager" element={<OrderManage />} />
        </Route>

        {/* Customer Home */}
        <Route path="/" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
