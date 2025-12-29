import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AdminLayout from './assets/Admin/AdminLayout';
import Login from './assets/Auth/Login';
import Register from './assets/Auth/Register';
import Home from './assets/Customer/Home';
import UserManager from './assets/Admin/UserManage/UserManager.page';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Register />} />

        {/* Admin Routes */}
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<div>Dashboard Coming Soon...</div>} />
          <Route path="/admin/user-manager" element={<UserManager />} />
          <Route path="/admin/product-manager" element={<div>Product Manager Coming Soon...</div>} />
        </Route>

        {/* Customer Home */}
        <Route path="/" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
