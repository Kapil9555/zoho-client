import React from 'react';

export const H1 = ({ children, style }) => (
  <h1 className="text-5xl md:text-6xl font-bold leading-tight" style={style}>
    {children}
  </h1>
);

export const H2 = ({ children, style }) => (
  <h2 className="text-4xl md:text-5xl font-semibold leading-snug" style={style}>
    {children}
  </h2>
);

export const H3 = ({ children, style }) => (
  <h3 className="text-3xl md:text-4xl font-semibold leading-snug" style={style}>
    {children}
  </h3>
);

export const H4 = ({ children, style }) => (
  <h4 className="text-2xl md:text-3xl font-medium leading-snug" style={style}>
    {children}
  </h4>
);

export const H5 = ({ children, className = '', style }) => (
  <h5
    className={`text-xl md:text-2xl font-medium leading-snug ${className}`}
    style={style}
  >
    {children}
  </h5>
);


export const H6 = ({ children, style }) => (
  <h6 className="text-lg md:text-xl font-medium leading-snug" style={style}>
    {children}
  </h6>
);

export const Para = ({ children, style }) => (
  <p className="text-sm md:text-base" style={style}>
    {children}
  </p>
);
