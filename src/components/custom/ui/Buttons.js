// components/custom/ui/Buttons.js

import React from 'react';
import clsx from 'clsx';

export const Button = ({
  children,
  variant = 'primary',
  onClick,
  className = '',
  type = 'button',
  bgColor,
  textColor,
}) => {
  const baseStyles =
    'px-6 py-2 text-sm font-semibold cursor-pointer rounded-full transition focus:outline-none focus:ring-2 focus:ring-offset-2';

  const variants = {
    primary: 'bg-white text-[#3E57A7] hover:bg-gray-100 focus:ring-[#3E57A7]',
    secondary: 'bg-[#333333] text-white hover:bg-[#444444] focus:ring-white',
  };

  const isCustom = bgColor && textColor;

  return (
    <button
      type={type}
      onClick={onClick}
      className={clsx(
        baseStyles,
        !isCustom && variants[variant],
        className
      )}
      style={isCustom ? { backgroundColor: bgColor, color: textColor } : {}}
    >
      {children}
    </button>
  );
};


export const OutlineButton = ({ children = 'Learn More', className = '', ...props }) => (
  <Button
    bgColor="#ffffff"
    textColor="#3E57A7"
    className={`border border-[#3E57A7] hover:bg-[#f0f4ff] ${className}`}
    {...props}
  >
    {children}
  </Button>
);

export const ContainedButton = ({ children = 'Add to Cart', ...props }) => (
  <Button
    bgColor="#3E57A7"
    textColor="#ffffff"
    className="hover:brightness-110"
    {...props}
  >
    {children}
  </Button>
);
