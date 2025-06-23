import React from 'react';
import Header from '../organisms/Header';
import { Outlet } from 'react-router-dom';
export const PrivateLayout: React.FC<any> = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header>
      </Header>
      <main className="container mx-auto px-6 py-8">
      <Outlet />
      </main>
    </div>
  );
};

export default PrivateLayout