'use client';

import { BarChart3, Building, ClipboardList, FileText, LayoutDashboard, Users, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import logo from '../../../../public/png/logo.png';
import { useGetSalesMeQuery } from '@/redux/features/api/zohoApi';



const menuItems = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'Sales Teams', icon: Users, href: '/dashboard/sales-team' },
  // { label: 'Products', icon: Boxes, href: '/admin/products' },
  // { label: 'Categories', icon: Tag, href: '/admin/categories' },
  //  { label: "Orders", icon: ShoppingCart, href: "/admin/orders" },
  // { label: "Inventory", icon: Package, href: "/admin/inventory" },
  // { label: "Settings", icon: Settings, href: "/admin/settings" },
  // { label: 'Business Profile', icon: Building, href: '/admin/business-profile' },
  { label: 'Invoices', icon: FileText, href: '/dashboard/invoices/All' },
  { label: 'Purchase Orders', icon: ClipboardList, href: '/dashboard/purchase-orders/All' },
  { label: 'Sales Report', icon: BarChart3, href: '/dashboard/sales-report/All' },

  // { label: 'Payment Settings', icon: Banknote, href: '/admin/settings/payment' },
];



export default function Sidebar({ sidebarOpen, setSidebarOpen }) {

  const { data: me } = useGetSalesMeQuery();

  const isAdmin = !!me?.isAdmin || me?.role === "admin";



  const router = useRouter();
  const pathname = usePathname();

  const sidebarContent = (
    <div className="w-64 h-full bg-white border-r border-gray-100 flex flex-col">
      {/* Logo and Close (Mobile Only) */}
      <div className="flex justify-between items-center px-4 py-3 md:justify-center md:py-[18px] border-b border-b-gray-100 cursor-pointer">
        <Image
          src={logo}
          alt="Logo"
          width={'auto'}
          height={35}
          onClick={() => router.push('/dashboard')}
        />
        <button
          onClick={() => setSidebarOpen(false)}
          className="text-gray-600 md:hidden"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Menu Items */}
      <div className="px-6 mt-10">
        <nav className="text-sm">
          <div className="text-gray-500 uppercase text-sm mb-3">Menu</div>
          <div className="space-y-3">
            {menuItems.map(({ label, icon: Icon, href }) => {
              const isActive = pathname === href;
              if(!isAdmin && label == 'Sales Teams') return
              return (
                <Link
                  key={label}
                  href={href}
                  onClick={() => setSidebarOpen(false)}
                  className={`px-3 py-2 rounded-lg flex items-center gap-2 cursor-pointer ${isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'hover:bg-gray-100 text-gray-700'
                    }`}
                >
                  <Icon className="w-5 h-5" /> {label}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:block">{sidebarContent}</aside>

      {/* Mobile Drawer Sidebar with slide effect */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden flex">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black opacity-30"
            onClick={() => setSidebarOpen(false)}
          />
          {/* Sliding Drawer */}
          <div
            className={`relative z-50 w-64 h-full bg-white shadow-lg transform transition-transform duration-300 ease-in-out translate-x-0`}
          >
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
