import React from "react";

// Optional: You can replace this with 'clsx' or write styles directly
function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

// Main Card wrapper
export const Card = React.forwardRef(function Card({ className = "", ...props }, ref) {
  return (
    <div
      ref={ref}
      className={cn("rounded-2xl bg-white text-black shadow", className)}
      {...props}
    />
  );
});

// Card content area (padding, spacing inside card)
export const CardContent = React.forwardRef(function CardContent({ className = "", ...props }, ref) {
  return (
    <div
      ref={ref}
      className={cn("p-4", className)}
      {...props}
    />
  );
});
