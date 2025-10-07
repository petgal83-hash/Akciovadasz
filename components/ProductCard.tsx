import React, { useState } from 'react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  isCompared: boolean;
  onToggleComparison: (id: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, isFavorite, onToggleFavorite, isCompared, onToggleComparison }) => {
  const [isImageLoading, setIsImageLoading] = useState(true);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('hu-HU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col border border-gray-100 mb-4 transition-shadow hover:shadow-xl">
      <div className="relative h-52 w-full">
        {isImageLoading && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
        )}
        <img
          className={`h-full w-full object-cover transition-opacity duration-300 ${isImageLoading ? 'opacity-0' : 'opacity-100'}`}
          src={product.imageUrl}
          alt={product.name}
          onLoad={() => setIsImageLoading(false)}
          onError={() => setIsImageLoading(false)}
        />
        <button 
          onClick={() => onToggleFavorite(product.id)}
          className="absolute top-3 right-3 bg-black bg-opacity-30 rounded-full p-2 cursor-pointer shadow-md backdrop-blur-sm hover:bg-opacity-50 transition-all focus:outline-none focus:ring-2 focus:ring-white"
          aria-label="Kedvenc"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 text-white`} fill={isFavorite ? 'white' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 016.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" />
          </svg>
        </button>
        <div className="absolute top-3 left-3 bg-primary-teal text-white font-bold text-xs py-1 px-3 rounded-full shadow-md">
          -{product.discountPercentage}%
        </div>
      </div>
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-lg font-bold text-gray-800 flex-grow mb-2">{product.name}</h3>
        
        <div className="flex items-center text-sm text-gray-600 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2.25 12.25a.75.75 0 00.75.75H5.25v2.25a.75.75 0 00.75.75h2.25a.75.75 0 00.75-.75V13h3.75v2.25a.75.75 0 00.75.75h2.25a.75.75 0 00.75-.75V13h2.25a.75.75 0 00.75-.75V10.5a.75.75 0 00-.75-.75H3a.75.75 0 00-.75.75v1.75z" />
              <path fillRule="evenodd" d="M4.5 2.25a.75.75 0 00-.75.75v4.5c0 .414.336.75.75.75h11.25a.75.75 0 00.75-.75v-4.5a.75.75 0 00-.75-.75H4.5zM6.75 4.5a.75.75 0 01.75-.75h.75a.75.75 0 01.75.75v.75a.75.75 0 01-.75.75h-.75a.75.75 0 01-.75-.75V4.5zm3.75 0a.75.75 0 01.75-.75h.75a.75.75 0 01.75.75v.75a.75.75 0 01-.75.75h-.75a.75.75 0 01-.75-.75V4.5z" clipRule="evenodd" />
            </svg>
            {product.store}
        </div>

        <div className="flex items-end justify-between">
            <div>
                <span className="text-gray-500 line-through mr-2">{product.originalPrice.toLocaleString('hu-HU')} Ft</span>
                <span className="text-2xl font-extrabold text-primary-teal">{product.salePrice.toLocaleString('hu-HU')} Ft</span>
            </div>
            <span className="text-lg font-semibold text-gray-700">{product.unit}</span>
        </div>

        <p className="text-xs text-gray-500 mt-2">Érvényes: {formatDate(product.validUntil)}</p>

        <div className="border-t border-gray-100 mt-4 pt-4">
            <button
                onClick={() => onToggleComparison(product.id)}
                className={`w-full text-center py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${
                    isCompared 
                    ? 'bg-primary-teal text-white hover:bg-teal-700 shadow-md' 
                    : 'bg-white text-primary-teal border-2 border-primary-teal hover:bg-primary-teal hover:text-white'
                }`}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                <span>{isCompared ? 'Eltávolítás' : 'Összehasonlítás'}</span>
            </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;