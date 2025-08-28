'use client';

import React, { useRef, useState } from 'react';

const MagnifierLensImage = ({ src, alt = 'Product Image', zoom = 2 }) => {
  const containerRef = useRef();
  const lensRef = useRef();
  const [showLens, setShowLens] = useState(false);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

  const handleMouseMove = (e) => {
    const container = containerRef.current;
    const lens = lensRef.current;
    const rect = container.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const lensSize = lens.offsetWidth / 2;

    const posX = Math.max(lensSize, Math.min(x, rect.width - lensSize));
    const posY = Math.max(lensSize, Math.min(y, rect.height - lensSize));

    lens.style.left = `${posX - lensSize}px`;
    lens.style.top = `${posY - lensSize}px`;

    const bgX = ((posX / rect.width) * imageSize.width * zoom - lens.offsetWidth / 2) * -1;
    const bgY = ((posY / rect.height) * imageSize.height * zoom - lens.offsetHeight / 2) * -1;

    lens.style.backgroundPosition = `${bgX}px ${bgY}px`;
  };

  const handleImageLoad = (e) => {
    setImageSize({
      width: e.target.naturalWidth,
      height: e.target.naturalHeight,
    });
  };

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setShowLens(true)}
      onMouseLeave={() => setShowLens(false)}
      onMouseMove={handleMouseMove}
      className="relative w-full max-h-[400px] border border-gray-300 rounded-lg overflow-hidden"
    >
      {/* Use regular img instead of next/image */}
      <img
        src={src}
        alt={alt}
        onLoad={handleImageLoad}
        className="w-full h-full object-contain"
      />

      {showLens && (
        <div
          ref={lensRef}
          className="absolute pointer-events-none rounded-full border border-gray-300 shadow-lg"
          style={{
            width: '120px',
            height: '120px',
            backgroundImage: `url(${src})`,
            backgroundRepeat: 'no-repeat',
            backgroundSize: `${imageSize.width * zoom}px ${imageSize.height * zoom}px`,
            zIndex: 10,
          }}
        />
      )}
    </div>
  );
};

export default MagnifierLensImage;
