import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { ChatWidget } from '../components/assistant/ChatWidget';

export const RootLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#070A13] text-slate-100 selection:bg-violet-600/30 selection:text-violet-200">
      <Navbar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>
      <Footer />
      {/* Floating AI Assistant present on EVERY page */}
      <ChatWidget />
    </div>
  );
};
