'use client';
import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';

import '@/app/globals.css';



export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <html lang="en">
      <body className="bg-[#f9fafb] text-gray-800">
        <div className="flex h-screen overflow-hidden">
          <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
            <Topbar setSidebarOpen={setSidebarOpen} />
            <main className="flex-1 overflow-y-auto p-6">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
