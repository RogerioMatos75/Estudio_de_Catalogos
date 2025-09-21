
import React from 'react';

export const Loader: React.FC = () => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white bg-opacity-80 backdrop-blur-sm z-10 transition-opacity duration-300">
      <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-indigo-600"></div>
      <p className="mt-4 text-lg font-semibold text-indigo-700">A IA está trabalhando...</p>
      <p className="text-sm text-gray-600">Isso pode levar alguns instantes.</p>
    </div>
  );
};
