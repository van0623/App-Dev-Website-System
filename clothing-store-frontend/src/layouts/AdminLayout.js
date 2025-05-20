import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminHeader from '../components/AdminHeader';

const AdminLayout = () => (
  <>
    <AdminHeader />
    <main>
      <Outlet />
    </main>
  </>
);

export default AdminLayout;
