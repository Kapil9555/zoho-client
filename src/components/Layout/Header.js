// 'use client';

// import { useGetCategoriesQuery } from '@/redux/features/api/adminApi';
// import { useLazyLogoutQuery } from '@/redux/features/api/authApi';
// import { Menu, X } from 'lucide-react';
// import Image from 'next/image';
// import Link from 'next/link';
// import { usePathname, useRouter } from 'next/navigation';
// import { useEffect, useRef, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import defaultUser from '../../../public/png/default-user.webp';
// import logo from '../../../public/png/logo.png';
// import MegaMenu from '../custom/ui/MegaMenu';
// import BasketDropdown from './BasketDropdown';


// const Header = () => {
//   const router = useRouter();
//   const pathname = usePathname();
//   const dispatch = useDispatch();
//   const { userInfo } = useSelector((state) => state.auth);
//   const [logoutApi] = useLazyLogoutQuery();
//   const [showDropdown, setShowDropdown] = useState(false);
//   const [showMegaMenu, setShowMegaMenu] = useState(false);
//   const [drawerOpen, setDrawerOpen] = useState(false);
//   const dropdownRef = useRef(null);

//   const { data: categoryData, isLoading, isError } = useGetCategoriesQuery();
//   const allCategories = categoryData?.categories?.categories || [];
//   const parentCategories = allCategories.filter((cat) => !cat?.parent?.trim());
//   const subCategories = allCategories.filter((cat) => cat?.parent?.trim());

//   const handleLogout = async () => {
//   };

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//         setShowDropdown(false);
//       }
//     };
//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, []);
  

//   return (
//     <div className="relative z-50">
//       <header
//         className="fixed top-0 left-0 w-full z-50 bg-white shadow"
//         onMouseLeave={() => setShowMegaMenu(false)}
//       >
//         <div className="flex justify-between items-center px-6 md:px-20 py-3">
//           <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push('/')}>
//             <Image src={logo} alt="Logo" width="auto" height={50} />
//           </div>

//           <div className='flex gap-3'>
//             <nav className="hidden md:flex items-center gap-4 text-sm font-semibold uppercase text-gray-800 relative">
//               {userInfo?.kycStatus === 'approved' && (
//                 <>
//                   <span
//                     className={`px-4 py-1 rounded-full cursor-pointer ${pathname === '/' ? 'bg-[#3E57A7] text-white' : 'hover:text-blue-600'
//                       }`}
//                     onClick={() => router.push('/')}
//                   >
//                     Home
//                   </span>
//                   <div
//                     onMouseEnter={() => setShowMegaMenu(true)}
//                     onClick={() => router.push('/category/all')}
//                     className={`cursor-pointer px-4 py-1 rounded-full ${pathname.startsWith('/category') ? 'bg-[#3E57A7] text-white' : 'hover:text-blue-600'
//                       }`}
//                   >
//                     Browse
//                   </div>
//                   <BasketDropdown />
//                 </>
//               )}

//               {!userInfo ? (
//                 <Link href="/login" className="hover:underline">
//                   Login/Signup
//                 </Link>
//               ) : (
//                 <div className="relative" ref={dropdownRef}>
//                   <button className="flex items-center gap-2 cursor-pointer" onClick={() => setShowDropdown(!showDropdown)}>
//                     <Image
//                       src={userInfo?.profilePicture?.trim() ? userInfo.profilePicture : defaultUser}
//                       alt="User"
//                       width={32}
//                       height={32}
//                       className="w-8 h-8 rounded-full object-cover"
//                     />
//                     <span className="text-sm font-medium max-w-[100px] truncate" title={userInfo?.name}>
//                       {userInfo?.name || 'Guest'} ▾
//                     </span>
//                   </button>

//                   {showDropdown && (
//                     <div className="absolute right-0 w-40 bg-white border rounded-md shadow-md py-2 z-50">
//                       <button onClick={handleLogout} className="block w-full px-4 py-2 text-sm hover:bg-gray-100 text-left">
//                         Logout
//                       </button>
//                       <button
//                         onClick={() => router.push('/profile')}
//                         className="block w-full px-4 py-2 text-sm hover:bg-gray-100 text-left"
//                       >
//                         Profile
//                       </button>
//                     </div>
//                   )}
//                 </div>
//               )}
//             </nav>

//             <div className="hidden md:flex items-center gap-2">
//               <button onClick={() => setDrawerOpen(true)}>
//                 <Menu className="w-6 cursor-pointer h-6 text-gray-800" />
//               </button>
//             </div>

//           </div>

//           <div className="flex md:hidden items-center gap-2">
//             {userInfo?.kycStatus === 'approved' && <BasketDropdown />}
//             <button onClick={() => setDrawerOpen(true)}>
//               <Menu className="w-6 h-6 text-gray-800" />
//             </button>
//           </div>
//         </div>

//         {showMegaMenu && !isLoading && !isError && (
//           <MegaMenu categories={parentCategories} subcategories={subCategories} />
//         )}
//       </header>

//       {drawerOpen && (
//         <div className="fixed inset-0 z-50 flex">
//           <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />

//           <div className="relative w-80 bg-white h-full shadow-xl p-6 z-50 flex flex-col">
//             <button onClick={() => setDrawerOpen(false)} className="absolute cursor-pointer top-4 right-4 text-gray-500 hover:text-gray-700">
//               <X className="w-5 h-5" />
//             </button>

//             <div className="mb-4 mt-2 flex justify-center">
//               <Image src={logo} alt="Company Logo" width={120} height={40} className="object-contain" />
//             </div>

//             <h2 className="text-xl font-semibold text-[#3E57A7] mb-6 mt-3">Menu</h2>

//             <div className="flex flex-col gap-3 text-sm font-medium text-gray-800">
//               {userInfo?.kycStatus === 'approved' && (
//                 <>
//                   <button
//                     onClick={() => {
//                       router.push('/');
//                       setDrawerOpen(false);
//                     }}
//                     className={`w-full cursor-pointer px-4 py-2 rounded-md text-left ${pathname === '/' ? 'bg-[#3E57A7] text-white' : 'hover:bg-gray-100'
//                       }`}
//                   >
//                     Home
//                   </button>

//                   <button
//                     onClick={() => {
//                       router.push('/category/all');
//                       setDrawerOpen(false);
//                     }}
//                     className={`w-full cursor-pointer px-4 py-2 rounded-md text-left ${pathname.startsWith('/category') ? 'bg-[#3E57A7] text-white' : 'hover:bg-gray-100'
//                       }`}
//                   >
//                     Browse
//                   </button>
//                   <button
//                     onClick={() => {
//                       router.push('/purchase-history');
//                       setDrawerOpen(false);
//                     }}
//                     className={`w-full cursor-pointer px-4 py-2 rounded-md text-left ${pathname.startsWith('/category') ? 'bg-[#3E57A7] text-white' : 'hover:bg-gray-100'
//                       }`}
//                   >
//                     Purchase History
//                   </button>



//                   <button
//                     onClick={() => {
//                       window.open('https://tech4logic.com/blog/', '_blank', 'noopener,noreferrer');
//                       setDrawerOpen(false);
//                     }}
//                     className="w-full cursor-pointer px-4 py-2 rounded-md text-left hover:bg-gray-100"
//                   >
//                     Blog
//                   </button>

//                   <button
//                     onClick={() => {
//                       window.open('https://tech4logic.com/case-studies/', '_blank', 'noopener,noreferrer');
//                       setDrawerOpen(false);
//                     }}
//                     className="w-full cursor-pointer px-4 py-2 rounded-md text-left hover:bg-gray-100"
//                   >
//                     Case Studies
//                   </button>

//                   <button
//                     onClick={() => {
//                       window.open('https://tech4logic.com/faq/', '_blank', 'noopener,noreferrer');
//                       setDrawerOpen(false);
//                     }}
//                     className="w-full cursor-pointer px-4 py-2 rounded-md text-left hover:bg-gray-100"
//                   >
//                     FAQ
//                   </button>

//                   <button
//                     onClick={() => {
//                       window.open('https://tech4logic.com/event/', '_blank', 'noopener,noreferrer');
//                       setDrawerOpen(false);
//                     }}
//                     className="w-full cursor-pointer px-4 py-2 rounded-md text-left hover:bg-gray-100"
//                   >
//                     Event
//                   </button>

//                 </>
//               )}

//               {!userInfo ? (
//                 <button
//                   onClick={() => {
//                     router.push('/login');
//                     setDrawerOpen(false);
//                   }}
//                   className="w-full cursor-pointer bg-[#3E57A7] text-white px-4 py-2 rounded-md hover:bg-[#2e428c] text-center"
//                 >
//                   Login / Signup
//                 </button>
//               ) : (
//                 <button
//                   onClick={handleLogout}
//                   className="w-full cursor-pointer bg-red-100 text-red-600 px-4 py-2 rounded-md hover:bg-red-200"
//                 >
//                   Logout
//                 </button>
//               )}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Header;
