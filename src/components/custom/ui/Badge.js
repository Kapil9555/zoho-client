import React from "react";
import clsx from "clsx";

export const Badge = ({ className, variant = "default", ...props }) => {
  return (
    <div
      className={clsx(
        "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium",
        {
          "bg-blue-100 text-blue-800": variant === "default",
          "border border-gray-300 text-gray-800 bg-white": variant === "outline",
          "bg-gray-100 text-gray-700": variant === "secondary",
        },
        className
      )}
      {...props}
    />
  );
};
