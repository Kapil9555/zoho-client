'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Menu } from 'lucide-react';
import { useGetSalesMeQuery, useLogoutSalesMutation } from '@/redux/features/api/zohoApi';
import { showError, showSuccess } from '@/utils/customAlert';

export default function Topbar({ setSidebarOpen }) {
  const { data: me } = useGetSalesMeQuery();
  const [logoutZoho] = useLogoutSalesMutation();

  const router = useRouter();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Extract initials from user name
  const getInitials = (name = '') => {
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0][0]?.toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const initials = getInitials(me?.name);


  const handleLogout = async () => {
    try {
      await logoutZoho().unwrap();
      await showSuccess('Success', 'Logged out successfully!');
      router.push('/login'); 
    } catch (err) {
      const msg =
        err?.data?.message ||
        err?.error ||
        (typeof err === 'string' ? err : 'Logout failed');
      await showError('Error', msg);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between shadow-sm">
      {/* Left: Hamburger */}
      <div className="flex items-center gap-4">
        <button
          className="md:hidden text-gray-600"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Right: User Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => setDropdownOpen(!dropdownOpen)}
        >
          {/* Avatar with initials */}
          <div className="w-8 h-8 rounded-full bg-[#3E57A7] flex items-center justify-center text-white font-semibold">
            {initials}
          </div>
          <span
            className="text-sm font-medium max-w-[100px] truncate"
            title={me?.name}
          >
            {me?.name || ''} ▾
          </span>
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-40 bg-white border rounded-md shadow-md z-50">
            <button
              onClick={handleLogout}
              className="block w-full text-left px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-red-600"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
