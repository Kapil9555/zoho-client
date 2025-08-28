'use client';

import Image from 'next/image';
import { X, Package, Tag, List } from 'lucide-react';
import { useGetProductByIdQuery } from '@/redux/features/api/adminApi';

export default function ProductViewModal({ productId, onClose }) {
  const { data: product, isLoading, error } = useGetProductByIdQuery(productId, {
    skip: !productId,
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center px-4 animate-fadeIn">
      <div className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-xl border border-gray-200 animate-slideUp">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 bg-gradient-to-r from-blue-700 to-blue-500 rounded-t-2xl shadow">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2 tracking-wide">
            <Package className="w-5 h-5" />
            Product Details
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:text-red-300 transition duration-200"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 text-gray-700 space-y-10">
          {isLoading && <p className="text-center text-gray-500">Loading product...</p>}
          {error && <p className="text-center text-red-600">Failed to load product.</p>}

          {product && (
            <>
              {/* Info + Images */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Product Info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {[
                    ['Name', product.name],
                    ['Brand', product.brand],
                    ['Model Number', product.modelNumber],
                    ['OEM', product.oem],
                    ['MFR Part Number', product.mfrPartNumber],
                    ['Our Part Number', product.ourPartNumber],
                    ['Category', product.category?.name || '-'],
                    ['Subcategory', product.subcategory?.name || '-'],
                    ['Mrp', `₹${product?.mrp?.toLocaleString() || '-'}`],
                    ['Srp', `₹${product?.srp?.toLocaleString() || '-'}`],
                    [
                      'Stock',
                      product.stock > 0 ? (
                        <span className="text-green-600 font-semibold">In Stock</span>
                      ) : (
                        <span className="text-red-600 font-semibold">Out of Stock</span>
                      ),
                    ],
                    ['Rating', `${product.rating} ⭐ (${product.numReviews})`],
                    ['Created At', new Date(product.createdAt).toLocaleString()],
                    ['Updated At', new Date(product.updatedAt).toLocaleString()],
                  ].map(([label, value], i) => (
                    <div
                      key={i}
                      className={`rounded-xl p-4 shadow-sm transition ${
                        i % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                      } col-span-${i >= 12 ? '2' : '1'}`}
                    >
                      <p className="text-xs text-gray-500 mb-1">{label}</p>
                      <p className="text-gray-800 font-medium">{value}</p>
                    </div>
                  ))}
                </div>

                {/* Images */}
                <div>
                  <p className="font-semibold text-gray-800 mb-2">Images</p>
                  <div className="flex flex-wrap gap-4">
                    {(product.images ?? []).map((url, idx) => (
                      <div
                        key={idx}
                        className="w-24 h-24 relative rounded-xl overflow-hidden shadow hover:shadow-md hover:scale-105 transition-transform duration-200"
                      >
                        <Image
                          src={url}
                          alt={`Image ${idx + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Specs Section */}
              {product.specifications?.length > 0 && (
                <div>
                  <h3 className="text-md font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <List className="w-4 h-4 text-blue-600" />
                    Specifications
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {product.specifications.map((spec, idx) => (
                      <div key={idx} className="bg-gray-50 border rounded-lg p-3 shadow-sm">
                        <p className="text-xs text-gray-500">{spec.title}</p>
                        <p className="text-sm font-medium text-gray-800">{spec.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Feature Highlights */}
              {product.featureHighlights?.length > 0 && (
                <div>
                  <h3 className="text-md font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <List className="w-4 h-4 text-blue-600" />
                    Feature Highlights
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {product.featureHighlights.map((item, idx) => (
                      <div key={idx} className="bg-gray-50 border rounded-lg p-3 shadow-sm">
                        <p className="text-xs text-gray-500">{item.title}</p>
                        <p className="text-sm font-medium text-gray-800">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <h3 className="text-md font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-blue-600" />
                  Description
                </h3>
                <div className="text-sm leading-relaxed text-gray-700 bg-gray-50 border border-gray-100 rounded-xl p-4 shadow-sm max-h-40 overflow-y-auto whitespace-pre-line">
                  {product.description}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
