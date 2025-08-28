'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import {
  useGetCartQuery,
  useCreateBasketMutation,
  useDeleteBasketMutation,
  useSelectBasketMutation,
} from '@/redux/features/api/basketApi';
import {
  setBaskets,
  setSelectedBasket,
} from '@/redux/features/slices/basketSlice';
import {
  ShoppingCart,
  Trash2,
  ChevronDown,
  PlusCircle,
  X,
} from 'lucide-react';

const BasketDropdown = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const dropdownRef = useRef(null);

  const { selectedBasketId, baskets = [] } = useSelector((state) => state.basket || {});
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newBasketName, setNewBasketName] = useState('');

  const { data } = useGetCartQuery();
  const [createBasket] = useCreateBasketMutation();
  const [deleteBasket] = useDeleteBasketMutation();
  const [selectBasket] = useSelectBasketMutation();

  useEffect(() => {
    if (data?.baskets) {
      dispatch(setBaskets(data.baskets));
      dispatch(setSelectedBasket(data.selectedBasketId));
    }
  }, [data, dispatch]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  const handleSelect = async (basketId) => {
    await selectBasket(basketId);
    dispatch(setSelectedBasket(basketId));
    localStorage.setItem('b2b_selected_basket', basketId);
    setShowDropdown(false);
    router.push(`/cart/${basketId}`);
  };

  const handleCreateBasket = async () => {
    if (!newBasketName.trim()) return;
    await createBasket({ name: newBasketName });
    setNewBasketName('');
    setShowCreate(false);
    setShowDropdown(false);
  };

  // const handleDelete = async (id) => {
  //   await deleteBasket(id);
  // };

  const handleDelete = async (id) => {
    try {
      await deleteBasket(id).unwrap();

      if (id === selectedBasketId) {
        dispatch(setSelectedBasket(null));
        localStorage.removeItem('b2b_selected_basket');
        router.push('/');
      }
    } catch (error) {
      console.error('Failed to delete basket:', error);
    }
  };


  const currentBasket = baskets?.find((b) => b._id === selectedBasketId);

  return (
    <div className="relative z-50" ref={dropdownRef}>
      {/* Desktop Button */}
      <button
        onClick={() => setShowDropdown((prev) => !prev)}
        className="hidden md:flex items-center cursor-pointer gap-2 border border-gray-300 px-4 py-1.5 rounded-full text-sm text-[#3E57A7] bg-white"
      >
        <ShoppingCart size={16} />
        {currentBasket?.name || 'Select Basket'}
        {typeof currentBasket?.items?.length === 'number' && (
          <span className="ml-1 text-xs text-gray-500 font-medium">
            ({currentBasket.items.length} item{currentBasket.items.length !== 1 ? 's' : ''})
          </span>
        )}
        <ChevronDown size={14} />
      </button>

      {/* Mobile Button */}
      <button
        onClick={() => setShowDropdown((prev) => !prev)}
        className="flex md:hidden items-center p-2 rounded-full bg-white text-[#3E57A7]"
      >
        <ShoppingCart size={22} />
      </button>

      {/* Dropdown Menu */}
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-xl p-3 space-y-2">
          <div className="max-h-60 overflow-y-auto pr-1 space-y-1">
            {baskets?.map((b) => (
              <div
                key={b._id}
                className={`flex justify-between items-center px-2 py-2 rounded-md cursor-pointer ${b._id === selectedBasketId
                    ? 'bg-[#3E57A7]/10 font-medium text-[#3E57A7]'
                    : 'hover:bg-gray-50'
                  }`}
              >
                <button
                  onClick={() => handleSelect(b._id)}
                  className="text-left cursor-pointer flex-1 truncate"
                  title={b.name}
                >
                  <span className="block truncate">
                    {b.name}
                    {b.isDefault && (
                      <span className="ml-1 text-xs text-gray-400">(Default)</span>
                    )}
                    {typeof b.items?.length === 'number' && (
                      <span className="ml-1 text-xs text-gray-500">
                        ({b.items.length} item{b.items.length !== 1 ? 's' : ''})
                      </span>
                    )}
                  </span>
                </button>

                {!b.isDefault && (
                  <button
                    onClick={() => handleDelete(b._id)}
                    className="ml-2 text-red-500 hover:text-red-700"
                    title="Delete Basket"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>

          <hr className="border-gray-200" />

          {showCreate ? (
            <div className="space-y-2">
              <input
                type="text"
                value={newBasketName}
                onChange={(e) => setNewBasketName(e.target.value)}
                placeholder="New Basket Name"
                className="w-full border border-gray-300 px-3 py-1.5 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#3E57A7]"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleCreateBasket}
                  className="flex-1 bg-[#3E57A7] text-white px-3 py-1.5 rounded-md text-sm hover:bg-[#2f428e] flex items-center justify-center gap-1"
                >
                  <PlusCircle size={16} /> Create
                </button>
                <button
                  onClick={() => {
                    setShowCreate(false);
                    setNewBasketName('');
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 px-3 py-1.5 rounded-md text-sm hover:bg-gray-300 flex items-center justify-center gap-1"
                >
                  <X size={16} /> Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowCreate(true)}
              className="w-full text-left text-sm text-[#3E57A7] hover:bg-gray-50 px-2 py-1.5 rounded-md flex items-center gap-1"
            >
              <PlusCircle size={16} /> Create New Basket
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default BasketDropdown;
