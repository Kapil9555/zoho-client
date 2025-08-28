// 'use client';

// import { Para } from '@/components/custom/ui/text';
// import Image from 'next/image';
// import Link from 'next/link';
// import {
//   FaFacebookF,
//   FaInstagram,
//   FaLinkedinIn
// } from 'react-icons/fa';
// import {
//   HiOutlineLocationMarker,
//   HiOutlineMail,
//   HiOutlinePhone,
// } from 'react-icons/hi';
// import logo from '../../../public/png/logowhite.png';

// export default function Footer() {
//   return (
//     <footer className="bg-neutral-700 text-white px-6 md:px-20 mt-15 py-12">
//       <div className="grid md:grid-cols-4 gap-10">
//         {/* Logo and Contact Info */}
//         <div>
//           <div className="mb-4">
//             <Image src={logo} alt="Tech4Logic Logo" width={160} height={60} />
//           </div>
//           <Para style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>
//             Tech4logic delivers genuine IT products and support, ensuring businesses get reliable technology with ease.
//           </Para>
//           <div className="text-sm space-y-2">
//             <div className="flex items-center gap-2">
//               <HiOutlinePhone className="text-brandGreen " />
//               <a href="tel:+919920599105" className="hover:underline">
//                 +91 - 9920 - 599 - 105
//               </a>
//             </div>
//             <div className="flex items-center gap-2">
//               <HiOutlineMail className="text-brandGreen" />
//               <a href="mailto:info@tech4logic.com" className="hover:underline">
//                 info@tech4logic.com
//               </a>
//             </div>
//             <div className="flex items-center gap-2">
//               <HiOutlineLocationMarker className="text-brandGreen w-5 h-5" />
//               <span>Gurugram, Mumbai, Pune, Bangalore, London (UK)</span>
//             </div>
//           </div>
//         </div>

//         {/* Quick Links */}
//         <div>
//           <h4 className="text-lg font-semibold mb-4">QUICK LINKS</h4>
//           <ul className="space-y-2 text-sm text-gray-300">
//             <li>
//               <Link href="/" legacyBehavior>
//                 <a>Home</a>
//               </Link>
//             </li>
//             <li>
//               <Link href="https://tech4logic.com/about-us/" legacyBehavior>
//                 <a target="_blank" rel="noopener noreferrer">About Us</a>
//               </Link>
//             </li>
//             <li>
//               <Link href="https://tech4logic.com/careers/" legacyBehavior>
//                 <a target="_blank" rel="noopener noreferrer">Careers</a>
//               </Link>
//             </li>
//             <li>
//               <Link href="/contact" legacyBehavior>
//                 <a>Partners & Certifications</a>
//               </Link>
//             </li>
//           </ul>
//         </div>

//         <div>
//           <h4 className="text-lg font-semibold mb-4">INFORMATION</h4>
//           <ul className="space-y-2 text-sm text-gray-300">
//             <li>
//               <Link href="https://tech4logic.com/blog/" legacyBehavior>
//                 <a target="_blank" rel="noopener noreferrer">Blog</a>
//               </Link>
//             </li>
//             <li>
//               <Link href="https://tech4logic.com/case-studies/" legacyBehavior>
//                 <a target="_blank" rel="noopener noreferrer">Case studies</a>
//               </Link>
//             </li>
//             <li>
//               <Link href="https://tech4logic.com/faq/" legacyBehavior>
//                 <a target="_blank" rel="noopener noreferrer">FAQ</a>
//               </Link>
//             </li>
//             <li>
//               <Link href="https://tech4logic.com/event/" legacyBehavior>
//                 <a target="_blank" rel="noopener noreferrer">Event</a>
//               </Link>
//             </li>
//           </ul>
//         </div>

//         {/* Tags */}
//         <div>
//           <h4 className="text-lg font-semibold mb-4">POPULAR TAGS</h4>
//           <div className="flex flex-wrap gap-2">
//             {[
//               'LAPTOPS',
//               'MONITORS',
//               'SERVERS',
//               'NETWORKING',
//               'STORAGE',
//               'SOFTWARE',
//               'SECURITY',
//               'CLOUD',
//               'SUPPORT',
//             ].map((tag, idx) => (
//               <span
//                 key={idx}
//                 className="bg-gray-700 text-xs px-3 py-1 rounded-full"
//               >
//                 {tag}
//               </span>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Bottom Row */}
//       <div className="mt-10 border-t border-gray-800 pt-6 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
//         <p>
//           &copy; {new Date().getFullYear()} All rights reserved. Development by{' '}
//           <span className="text-brandGreen">UnionAgency</span>
//         </p>
       

//         <div className="flex gap-4 mt-4 md:mt-0 text-white text-lg">
//           <a
//             href="https://www.facebook.com/tech4logic"
//             target="_blank"
//             rel="noreferrer"
//             className="hover:text-[#3E57A7] transition"
//           >
//             <FaFacebookF />
//           </a>
//           <a
//             href="https://www.instagram.com/tech4logic/"
//             target="_blank"
//             rel="noreferrer"
//             className="hover:text-[#3E57A7] transition"
//           >
//             <FaInstagram />
//           </a>
//           <a
//             href="https://www.linkedin.com/company/tech4logic1/"
//             target="_blank"
//             rel="noreferrer"
//             className="hover:text-[#3E57A7] transition"
//           >
//             <FaLinkedinIn />
//           </a>
//         </div>

//       </div>
//     </footer>
//   );
// }
