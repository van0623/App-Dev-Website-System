import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';

const PublicLayout = () => (
  <>
    <Header />
    <main>
      <Outlet />
    </main>
  </>
);

export default PublicLayout;
