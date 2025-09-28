import React from 'react';

// Base shimmer animation styles
const shimmerStyles = {
  background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
  backgroundSize: '200% 100%',
  animation: 'shimmer 1.5s infinite',
};

// CSS keyframes for shimmer effect
const shimmerCSS = `
  @keyframes shimmer {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
`;

// Inject shimmer CSS if not already present
if (!document.querySelector('#shimmer-styles')) {
  const style = document.createElement('style');
  style.id = 'shimmer-styles';
  style.textContent = shimmerCSS;
  document.head.appendChild(style);
}

// Category skeleton loader
export const CategorySkeleton = () => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Image skeleton */}
      <div
        className="h-48 bg-gray-200"
        style={shimmerStyles}
      ></div>

      {/* Content skeleton */}
      <div className="p-4">
        {/* Title skeleton */}
        <div
          className="h-5 bg-gray-200 rounded mb-3"
          style={shimmerStyles}
        ></div>

        <div className="flex justify-between items-center">
          {/* Date skeleton */}
          <div
            className="h-3 bg-gray-200 rounded w-20"
            style={shimmerStyles}
          ></div>

          {/* Action buttons skeleton */}
          <div className="flex gap-2">
            <div
              className="h-6 w-6 bg-gray-200 rounded"
              style={shimmerStyles}
            ></div>
            <div
              className="h-6 w-6 bg-gray-200 rounded"
              style={shimmerStyles}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Photo skeleton loader
export const PhotoSkeleton = () => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Image skeleton */}
      <div
        className="h-48 bg-gray-200"
        style={shimmerStyles}
      ></div>

      {/* Content skeleton */}
      <div className="p-4">
        {/* Title skeleton */}
        <div
          className="h-4 bg-gray-200 rounded mb-2"
          style={shimmerStyles}
        ></div>

        {/* Date skeleton */}
        <div
          className="h-3 bg-gray-200 rounded w-24 mb-3"
          style={shimmerStyles}
        ></div>

        {/* Action buttons skeleton */}
        <div className="flex justify-end gap-2">
          <div
            className="h-6 w-6 bg-gray-200 rounded"
            style={shimmerStyles}
          ></div>
          <div
            className="h-6 w-6 bg-gray-200 rounded"
            style={shimmerStyles}
          ></div>
        </div>
      </div>
    </div>
  );
};

// Grid skeleton loaders
export const CategorySkeletonGrid = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <CategorySkeleton key={index} />
      ))}
    </div>
  );
};

export const PhotoSkeletonGrid = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <PhotoSkeleton key={index} />
      ))}
    </div>
  );
};

export default {
  CategorySkeleton,
  PhotoSkeleton,
  CategorySkeletonGrid,
  PhotoSkeletonGrid,
};