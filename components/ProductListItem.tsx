import React from 'react';
import { Product } from '../types';
import { STORES } from '../constants';

interface ProductListItemProps {
  product: Product;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}

const ProductListItem: React.FC<ProductListItemProps> = ({ product, isFavorite, onToggleFavorite }) => {
  const storeInfo = STORES.find(s => s.name === product.store);
  const StoreLogo = storeInfo?.logo;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('hu-HU', {
      month: 'short',
      day: 'numeric'
    });
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-shadow hover:shadow-lg flex items-center p-3 space-x-4">
      <img className="h-20 w-20 object-cover rounded-md flex-shrink-0" src={product.imageUrl} alt={product.name} />
      <div className="flex-grow">
        <span className="text-xs font-semibold bg-green-100 text-[#2A9D8F] py-1 px-2 rounded-full mb-1 inline-block">{product.category}</span>
        <h3 className="text-md font-semibold text-gray-800 leading-tight">{product.name}</h3>
        <div className="flex items-center mt-1">
          {StoreLogo && <StoreLogo className="h-5 mr-2" />}
          <p className="text-xs text-gray-500">Érvényes: {formatDate(product.validUntil)}</p>
        </div>
      </div>
      <div className="flex-shrink-0 text-right w-32">
        <div className="flex items-center justify-end">
            <span className="text-lg font-bold text-[#2A9D8F]">{product.salePrice.toLocaleString('hu-HU')} Ft</span>
            <span className="text-xs text-gray-600 ml-1">/{product.unit}</span>
        </div>
        <span className="text-sm text-gray-500 line-through">{product.originalPrice.toLocaleString('hu-HU')} Ft</span>
        <div className="text-sm font-bold text-[#E63946]">-{product.discountPercentage}%</div>
      </div>
      <div className="flex-shrink-0">
        <button 
          onClick={() => onToggleFavorite(product.id)}
          className="p-2 rounded-full hover:bg-gray-100"
          aria-label="Kedvenc"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 transition-colors duration-200 ${isFavorite ? 'text-red-500' : 'text-gray-400 hover:text-red-400'}`} fill={isFavorite ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 016.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ProductListItem;