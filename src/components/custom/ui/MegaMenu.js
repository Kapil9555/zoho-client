'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';

export default function MegaMenu({ categories = [], subcategories = [] }) {
  const [structuredMenu, setStructuredMenu] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (categories.length > 0) {
      const menu = categories.map((cat) => {
        const relatedSubs = subcategories.filter((sub) => sub.parent === cat._id);
        return {
          ...cat,
          subGroups: {
            [`All ${cat.name}`]: relatedSubs.map((sub) => ({
              name: sub.name,
              slug: sub.slug,
            })),
          },
        };
      });

      setStructuredMenu(menu);
      setActiveCategory(menu[0]);
    }
  }, [categories, subcategories]);

  if (!structuredMenu.length || !activeCategory) return null;

  console.log('Structured Menu:', activeCategory);

  return (
    <div
      className="absolute left-1/2 top-full transform -translate-x-1/2 w-[80vw] bg-white shadow-xl border border-gray-200 flex text-sm z-50"
      ref={containerRef}
      onMouseLeave={() => setActiveCategory(null)}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Left Panel: Parent Categories */}
      <div className="w-1/5 bg-gray-50 border-r p-4 space-y-2">
        {structuredMenu.map((cat) => (
          <div
            key={cat._id}
            className={`flex items-center gap-2 cursor-pointer px-3 py-2 rounded-md transition ${cat._id === activeCategory?._id
                ? 'bg-white font-bold text-blue-600'
                : 'hover:bg-white text-gray-700'
              }`}
            onMouseEnter={() => setActiveCategory(cat)}
          >
            {cat.icon && (
              <Image
                src={cat.icon}
                alt={cat.name}
                width={20}
                height={20}
                className="object-contain"
              />
            )}
            {cat.name}
          </div>
        ))}
      </div>

      {/* Middle Panel: Subcategory Groups */}

      <div className="w-3/5 p-6 grid grid-cols-2 gap-x-10 gap-y-6">
        {activeCategory &&
          Object.entries(activeCategory.subGroups).map(([group, items]) => (
            <div key={group}>
              <h4 className="text-sm font-semibold text-gray-800 mb-2">{group}</h4>
              <ul className="space-y-2 list-disc list-inside text-sm text-gray-700">
                {items.map((item) => (
                  <li key={item.slug}>
                    <Link
                      href={`/all-products/${item.slug}`}
                      className="hover:text-blue-600 transition"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
      </div>

      {/* Right Panel: Hovered Category Details */}
      <div className="w-1/5 bg-gradient-to-b from-blue-100 to-blue-200 p-6 flex flex-col justify-between text-blue-900">
        <div className="flex flex-col items-center text-center">
          {activeCategory.icon && (
            <Image
              src={activeCategory.icon}
              alt={activeCategory.name}
              width={100}
              height={100}
              className="object-contain mb-3 rounded shadow"
            />
          )}

          <h3 className="text-lg font-semibold">{activeCategory.name}</h3>

          {activeCategory.description && (
            <p className="text-sm text-blue-800 mt-2 line-clamp-3">
              {activeCategory.description}
            </p>
          )}

          {activeCategory.type && (
            <p className="text-xs mt-2 bg-white text-blue-700 px-2 py-1 rounded-full">
              Type: {activeCategory.type}
            </p>
          )}

          {activeCategory.status && (
            <p className="text-xs mt-1 bg-white text-blue-700 px-2 py-1 rounded-full">
              Status: {activeCategory.status}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
