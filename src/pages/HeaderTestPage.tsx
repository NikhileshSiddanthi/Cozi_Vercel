import React from 'react';
import { Header } from '@/components/Header';

const HeaderTestPage = () => {
  return (
    <div>
      <Header />
      <div className="pt-20">
        <h1 className="text-2xl font-bold">Header Test Page</h1>
        <p>This page only renders the Header component for debugging purposes.</p>
      </div>
    </div>
  );
};

export default HeaderTestPage;