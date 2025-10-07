import React, { useState } from 'react';
import { Product } from '../types';
import { STORES } from '../constants';

interface ProductListItemProps {
  product: Product;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  isCompared: boolean;
  onToggleComparison: (id: string) => void;
}

const ProductListItem: React.FC<ProductListItemProps> = ({ product, isFavorite, onToggleFavorite, isCompared, onToggleComparison }) => {
  const [isImageLoading, setIsImageLoading] = useState(true);
  const storeInfo = STORES.find(s => s.name === product.store);
  const StoreLogo = storeInfo?.logo;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('hu-HU', {
      month: 'short',
      day: 'numeric'
    });
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-shadow hover:shadow-xl flex items-center p-3 space-x-4 border border-gray-100">
      <div className="relative h-20 w-20 rounded-lg flex-shrink-0">
        {isImageLoading && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg"></div>
        )}
        <img
          className={`h-full w-full object-cover rounded-lg transition-opacity duration-300 ${isImageLoading ? 'opacity-0' : 'opacity-100'}`}
          src={product.imageUrl}
          alt={product.name}
          onLoad={() => setIsImageLoading(false)}
          onError={() => setIsImageLoading(false)}
        />
      </div>
      <div className="flex-grow">
        <span className="text-xs font-semibold bg-teal-100 text-primary-teal py-1 px-2 rounded-full mb-1 inline-block">{product.category}</span>
        <h3 className="text-md font-semibold text-gray-800 leading-tight">{product.name}</h3>
        <div className="flex items-center mt-1">
          {StoreLogo && <StoreLogo className="h-5 mr-2" />}
          <p className="text-xs text-gray-500">Érvényes: {formatDate(product.validUntil)}</p>
        </div>
      </div>
      <div className="flex-shrink-0 text-right w-32 pr-2">
        <div className="flex items-center justify-end">
            <span className="text-lg font-bold text-primary-teal">{product.salePrice.toLocaleString('hu-HU')} Ft</span>
            <span className="text-xs text-gray-600 ml-1">/{product.unit}</span>
        </div>
        <span className="text-sm text-gray-500 line-through">{product.originalPrice.toLocaleString('hu-HU')} Ft</span>
        <div className="text-sm font-bold text-green-600">-{product.discountPercentage}%</div>
      </div>
      <div className="flex-shrink-0 flex flex-col items-center space-y-2">
        <button 
          onClick={() => onToggleFavorite(product.id)}
          className="p-2 rounded-full hover:bg-gray-100"
          aria-label="Kedvenc"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 transition-colors duration-200 ${isFavorite ? 'text-primary-teal' : 'text-gray-400 hover:text-teal-400'}`} fill={isFavorite ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 016.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" />
          </svg>
        </button>
         <button
            onClick={() => onToggleComparison(product.id)}
            className={`p-2 rounded-full transition-colors duration-200 ${
                isCompared 
                ? 'bg-primary-teal text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            aria-label={isCompared ? 'Eltávolítás az összehasonlításból' : 'Összehasonlítás'}
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
        </button>
      </div>
    </div>
  );
};

export default ProductListItem;