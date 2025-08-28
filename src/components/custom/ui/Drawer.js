'use client';
import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { H5 } from './text';

const Drawer = ({ isOpen, onClose, title = 'Drawer', children }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
    } else {
      // Delay unmount for animation
      const timeout = setTimeout(() => setVisible(false), 300);
      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!isOpen && !visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div
        className={`ml-auto w-full max-w-md bg-white h-full shadow-xl overflow-y-auto transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b gap-3">
          {/* <H5 className="text-lg font-semibold text-gray-800">{title}</H5> */}
          <H5 className="truncate whitespace-nowrap overflow-hidden text-gray-800">
            {title}
          </H5>


          <button
            onClick={onClose}
            className="text-gray-500 cursor-pointer hover:text-gray-800 focus:outline-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 h-full">{children}</div>
      </div>
    </div>
  );
};

export default Drawer;
