

import React from 'react';

const AdBanner: React.FC = () => {
  return (
    <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-4 my-4 mx-4 sm:mx-0 flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
      <div className="w-full sm:w-auto">
        <span className="text-xs font-semibold bg-yellow-200 text-yellow-800 py-1 px-2 rounded-full mb-2 inline-block">Hirdetés</span>
        <img 
          src="https://picsum.photos/seed/adbanner/400/400" 
          alt="Sponsored product" 
          className="w-32 h-32 object-cover rounded-md mx-auto" 
        />
      </div>
      <div className="flex-grow text-center sm:text-left">
        <h4 className="text-lg font-bold text-gray-800">Kiemelt Ajánlat: Prémium Kávé</h4>
        <p className="text-sm text-gray-600 mt-1">
          Fedezze fel a gazdag aromájú, frissen pörkölt kávénkat! Most bevezető áron, csak online.
        </p>
        <button className="mt-3 bg-primary-teal text-white text-sm font-semibold py-2 px-4 rounded-lg hover:bg-teal-700 transition-colors">
          Megnézem
        </button>
      </div>
    </div>
  );
};

export default AdBanner;