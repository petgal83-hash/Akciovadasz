import React from 'react';
import { Product } from '../types';

interface ComparisonPageProps {
  products: Product[];
  onRemove: (id: string) => void;
}

const ComparisonPage: React.FC<ComparisonPageProps> = ({ products, onRemove }) => {
  if (products.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-50 text-gray-700 rounded-lg mt-4 mx-4">
        <h3 className="font-bold text-lg">Nincs termék az összehasonlításhoz</h3>
        <p className="mt-2">Kattints az 'Összehasonlítás' gombra a termékkártyákon, hogy hozzáadd őket az listához.</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 px-4 sm:px-0">Termék Összehasonlítás ({products.length})</h2>
      <div className="overflow-x-auto pb-4">
        <div className="flex space-x-4 min-w-max px-4 sm:px-0">
          {products.map(product => (
            <div key={product.id} className="bg-white rounded-lg shadow-md border w-72 flex-shrink-0 flex flex-col">
              <img src={product.imageUrl} alt={product.name} className="h-40 w-full object-cover rounded-t-lg" />
              <div className="p-4 flex flex-col flex-grow">
                <h3 className="font-bold text-lg flex-grow mb-2">{product.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{product.store}</p>
                
                <div className="my-2">
                    <span className="text-gray-500 line-through mr-2">{product.originalPrice.toLocaleString('hu-HU')} Ft</span>
                    <span className="text-2xl font-extrabold text-primary-teal">{product.salePrice.toLocaleString('hu-HU')} Ft</span>
                </div>
                <p className="text-lg font-semibold text-gray-700 mb-2">{product.unit}</p>

                <div className="text-sm font-bold text-green-600">-{product.discountPercentage}% kedvezmény</div>
              </div>
              <div className="p-4 border-t mt-auto">
                 <button
                    onClick={() => onRemove(product.id)}
                    className="w-full bg-gray-200 text-gray-800 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                  >
                    Eltávolítás
                 </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ComparisonPage;