'use client'
import React from 'react';
import Image from 'next/image';
import { H5, Para } from './text';
import { useRouter } from 'next/navigation';

const ProductListingCatCard = ({ product }) => {
    const {
        _id,
        brand,
        srp,
        mrp,
        images,
        description,
        oem,
        gst,
        stock,
    } = product;

    const router = useRouter();

    const handleAddToCart = () => {
        console.log('Add to cart:', product); 
    };

    const handleViewDetails = () => {
        router.push(`/product/${_id}`);
    };

    return (
        <div className="bg-white rounded-xl cursor-pointer border border-gray-100 p-4 flex flex-col justify-between min-h-[360px] transition-transform hover:shadow-lg hover:-translate-y-1 duration-300">
            {/* Top section: image and OEM */}
            <div>
                <div className="relative h-40 w-full mb-3 rounded-md overflow-hidden bg-gray-50">
                    <Image
                        src={images?.[0] || '/placeholder.png'}
                        alt={brand}
                        fill
                        className="object-contain"
                    />
                </div>

                {oem && (
                    <span className="text-[13px] text-blue-700 py-0.5 rounded-full mb-1 inline-block">
                        {oem}
                    </span>
                )}

                <h6
                    className="text-sm font-semibold mb-1 truncate"
                    style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                >
                    {brand}
                </h6>

                <Para
                    className="text-sm text-gray-600 truncate mb-2"
                    style={{
                        maxWidth: '100%',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                    }}
                >
                    {description || 'No description available.'}
                </Para>
            </div>

            {/* Bottom section: price, GST, buttons */}
            <div className="">
                <div className="text-green-700 font-bold text-base">
                    ₹{srp?.toLocaleString()}
                    {mrp && (
                        <span className="ml-2 text-gray-400 line-through text-sm font-normal">
                            ₹{mrp?.toLocaleString()}
                        </span>
                    )}
                </div>

                {gst && (
                    <Para className="text-xs text-gray-400 mt-1">GST: {gst}%</Para>
                )}

                <div className="flex gap-2 mt-2">
                    <button
                        onClick={handleViewDetails}
                        className="w-1/2 text-xs cursor-pointer text-gray-600 border border-gray-300 rounded px-2 py-1.5 hover:bg-gray-100 transition"
                    >
                        View
                    </button>

                    {stock > 0 ? (
                        <button
                            onClick={handleAddToCart}
                            className="w-1/2 text-xs cursor-pointer text-white bg-[#3E57A7] hover:bg-[#3E57A7] rounded px-2 py-1.5 transition"
                        >
                            Add
                        </button>
                    ) : (
                        <button
                            disabled
                            className="w-1/2 text-xs cursor-pointer text-white bg-gray-400 cursor-not-allowed rounded px-2 py-1.5"
                        >
                            Out
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
};

export default ProductListingCatCard;
