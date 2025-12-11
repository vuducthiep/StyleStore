import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AdminLayout from './assets/Admin/AdminLayout';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AdminLayout />}>
          <Route path="/" element={<div>Dashboard Coming Soon...</div>} />
          <Route path="/admin/dashboard" element={<div>Dashboard Coming Soon...</div>} />
          <Route path="/admin/user-manager" element={<div>User Manager Coming Soon...</div>} />
          <Route path="/admin/product-manager" element={<div>Product Manager Coming Soon...</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
