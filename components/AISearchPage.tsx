import React, { useState } from 'react';
import { Product } from '../types';
import { fetchAIResponse } from '../services/geminiService';
import Spinner from './Spinner';
import ProductCard from './ProductCard';

interface AISearchPageProps {
  allProducts: Product[];
  favorites: string[];
  comparisonList: string[];
  onToggleFavorite: (id: string) => void;
  onToggleComparison: (id: string) => void;
}

const AISearchPage: React.FC<AISearchPageProps> = ({ allProducts, favorites, comparisonList, onToggleFavorite, onToggleComparison }) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<{ text: string; products: Product[] } | null>(null);

  const examplePrompts = [
    'Mit főzzek a hétvégén olcsón?',
    'Melyik boltban vannak a legjobb pékáru akciók?',
    'Segíts összeállítani egy bevásárlólistát egy kerti partihoz!',
  ];

  const handleSearch = async () => {
    if (!query.trim()) return;
    setIsLoading(true);
    setError(null);
    setResponse(null);

    try {
      const result = await fetchAIResponse(query, allProducts);
      const relevantProducts = allProducts.filter(p => result.relevantProductIds.includes(p.id));
      setResponse({ text: result.responseText, products: relevantProducts });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ismeretlen hiba történt a keresés során.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePromptClick = (prompt: string) => {
    setQuery(prompt);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-primary-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.562L16.25 22.5l-.648-1.938a3.375 3.375 0 00-2.672-2.672L11.25 18l1.938-.648a3.375 3.375 0 002.672-2.672L16.25 13l.648 1.938a3.375 3.375 0 002.672 2.672L21.75 18l-1.938.648a3.375 3.375 0 00-2.672 2.672z" />
          </svg>
          <h2 className="text-2xl font-bold text-gray-800 mt-2">AI Vásárlási Asszisztens</h2>
          <p className="mt-2 text-gray-600">Kérdezzen bátran! Segítek megtervezni a bevásárlást, ötleteket adok, és megtalálom a legjobb ajánlatokat.</p>
        </div>

        <div className="mt-6">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full border-gray-300 rounded-lg shadow-sm focus:border-primary-teal focus:ring-primary-teal text-base p-4"
            rows={3}
            placeholder="Például: 'Milyen hozzávalók kellenek egy jó lecsóhoz és melyikek akciósak?'"
          />
          <div className="mt-2 flex items-center justify-between">
            <div className="text-xs text-gray-500 hidden sm:block">
                Próbálja ki ezeket:
                {examplePrompts.map(p => (
                    <button key={p} onClick={() => handlePromptClick(p)} className="ml-2 text-primary-teal hover:underline">{`"${p}"`}</button>
                ))}
            </div>
            <button
              onClick={handleSearch}
              disabled={isLoading}
              className="bg-primary-teal text-white font-semibold py-2 px-6 rounded-lg hover:bg-teal-700 transition-colors disabled:bg-teal-300 disabled:cursor-not-allowed flex items-center"
            >
              {isLoading && <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
              Keresés
            </button>
          </div>
        </div>
        
        <div className="mt-8">
            {isLoading && <Spinner />}
            {error && (
                <div className="text-center p-4 bg-red-100 text-red-700 rounded-lg">
                    <p>{error}</p>
                </div>
            )}
            {response && (
                <div className="bg-white p-6 rounded-lg shadow-lg">
                    <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">{response.text}</p>
                    {response.products.length > 0 && (
                        <div className="mt-6">
                            <h3 className="text-lg font-bold text-gray-800 border-t pt-4">Ajánlott termékek</h3>
                            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {response.products.map(product => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        isFavorite={favorites.includes(product.id)}
                                        onToggleFavorite={onToggleFavorite}
                                        isCompared={comparisonList.includes(product.id)}
                                        onToggleComparison={onToggleComparison}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default AISearchPage;