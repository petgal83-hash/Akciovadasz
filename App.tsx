import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Header from './components/Header';
import FilterSidebar from './components/FilterSidebar';
import ProductCard from './components/ProductCard';
import SkeletonLoader from './components/SkeletonLoader';
import BottomNav from './components/BottomNav';
import ComparisonPage from './components/ComparisonPage';
import SettingsPage from './components/SettingsPage';
import NotificationPermissionModal from './components/NotificationPermissionModal';
import { fetchDeals } from './services/geminiService';
import { Product, Store } from './types';
import { useNotifications } from './hooks/useNotifications';


type AppView = 'home' | 'comparison' | 'favorites' | 'ai-search' | 'settings';

interface AppProps {
    onLogout: () => void;
}

// New FilterModal component
const FilterModal: React.FC<{ isOpen: boolean; onClose: () => void; children: React.ReactNode }> = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl m-4 w-full max-w-md max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                {children}
            </div>
        </div>
    );
};


const App: React.FC<AppProps> = ({ onLogout }) => {
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const previousProductsRef = useRef<Product[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    
    const [view, setView] = useState<AppView>('home');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [submittedSearchTerm, setSubmittedSearchTerm] = useState<string>('');
    
    const [selectedStores, setSelectedStores] = useState<Store[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [priceRange, setPriceRange] = useState({ min: 0, max: 100000 });
    const [minDiscount, setMinDiscount] = useState<number>(0);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);

    const { permission, requestPermission, sendNotification } = useNotifications();

    const [location, setLocation] = useState<{ latitude: number; longitude: number; } | null>(null);
    const [locationError, setLocationError] = useState<string | null>(null);
    
    const [favorites, setFavorites] = useState<string[]>(() => {
        try {
            const saved = localStorage.getItem('akciovadasz_favorites');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    const [comparisonList, setComparisonList] = useState<string[]>(() => {
        try {
            const saved = localStorage.getItem('akciovadasz_comparison');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    });
                    setLocationError(null);
                },
                (error) => {
                    let message = "Ismeretlen hiba történt a helymeghatározás során.";
                    if (error.code === error.PERMISSION_DENIED) {
                        message = "Helymeghatározás letiltva. A helyi ajánlatokhoz engedélyezd a hozzáférést.";
                    } else if (error.code === error.POSITION_UNAVAILABLE) {
                        message = "Helymeghatározási adatok nem elérhetők.";
                    } else if (error.code === error.TIMEOUT) {
                        message = "Időtúllépés a helymeghatározás során.";
                    }
                    setLocationError(message);
                }
            );
        } else {
            setLocationError("A böngésződ nem támogatja a helymeghatározást.");
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('akciovadasz_comparison', JSON.stringify(comparisonList));
    }, [comparisonList]);

    const loadDeals = useCallback(async (searchQuery?: string) => {
        try {
            setIsLoading(true);
            const products = await fetchDeals(searchQuery, location ?? undefined);

            if (permission === 'granted' && previousProductsRef.current.length > 0) {
                const currentFavorites = JSON.parse(localStorage.getItem('akciovadasz_favorites') || '[]');
                const favoriteProducts = products.filter(p => currentFavorites.includes(p.id));

                favoriteProducts.forEach(newFavProduct => {
                    const oldFavProduct = previousProductsRef.current.find(p => p.id === newFavProduct.id);
                    if (oldFavProduct) {
                        // Check for price drop
                        if (newFavProduct.salePrice < oldFavProduct.salePrice) {
                            sendNotification(
                                'Árcsökkenés!',
                                { body: `${newFavProduct.name} most olcsóbb: ${newFavProduct.salePrice.toLocaleString('hu-HU')} Ft!` }
                            );
                        }

                        // Check for expiry
                        const expiryDate = new Date(newFavProduct.validUntil);
                        const tomorrow = new Date();
                        tomorrow.setDate(tomorrow.getDate() + 1);
                        tomorrow.setHours(0, 0, 0, 0); // Start of tomorrow

                        if (expiryDate <= tomorrow) {
                            const sentNotifs = JSON.parse(localStorage.getItem('akciovadasz_expiry_notifs') || '{}');
                            if (sentNotifs[newFavProduct.id] !== newFavProduct.validUntil) {
                                sendNotification(
                                    'Lejáró akció!',
                                    { body: `A(z) ${newFavProduct.name} akciója hamarosan lejár!` }
                                );
                                sentNotifs[newFavProduct.id] = newFavProduct.validUntil;
                                localStorage.setItem('akciovadasz_expiry_notifs', JSON.stringify(sentNotifs));
                            }
                        }
                    }
                });
            }
            
            setAllProducts(products);
            previousProductsRef.current = products;
            setError(null);
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Ismeretlen hiba történt.");
            }
        } finally {
            setIsLoading(false);
        }
    }, [location, permission, sendNotification]);

    // Effect for initial load
    useEffect(() => {
        if (allProducts.length === 0) {
            loadDeals();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loadDeals]);

    // Effect for handling search submission
    useEffect(() => {
        if (submittedSearchTerm) {
            loadDeals(submittedSearchTerm);
        }
    }, [submittedSearchTerm, loadDeals]);

     // Effect for auto-refresh
    useEffect(() => {
        const autoRefresh = () => {
            const now = new Date().getTime();
            const lastFetchData = JSON.parse(localStorage.getItem('akciovadasz_lastFetch') || '{}');
            const lastFetchTime = lastFetchData.time || 0;
            const lastFetchDate = new Date(lastFetchTime).toLocaleDateString();
            const todayDate = new Date().toLocaleDateString();
            let dailyFetchCount = lastFetchData.count || 0;

            if (lastFetchDate !== todayDate) {
                dailyFetchCount = 0;
            }

            const isStale = now - lastFetchTime > 8 * 60 * 60 * 1000; // 8 hours
            const canAutoRefresh = dailyFetchCount < 3;

            if (isStale && canAutoRefresh) {
                loadDeals(submittedSearchTerm);
                localStorage.setItem('akciovadasz_lastFetch', JSON.stringify({ time: now, count: dailyFetchCount + 1 }));
            }
        };

        const intervalId = setInterval(autoRefresh, 60 * 60 * 1000); // Check every hour
        return () => clearInterval(intervalId);
    }, [loadDeals, submittedSearchTerm]);


    useEffect(() => {
        localStorage.setItem('akciovadasz_favorites', JSON.stringify(favorites));
    }, [favorites]);

    const handleSearchSubmit = () => {
        setSubmittedSearchTerm(searchTerm);
    };
    
    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
          handleSearchSubmit();
        }
    };

    const handleRefresh = () => {
        loadDeals(submittedSearchTerm);
    };

    const handleToggleFavorite = useCallback((id: string) => {
        const isAdding = !favorites.includes(id);
        
        if (isAdding && permission === 'default') {
            setIsNotificationModalOpen(true);
        }

        setFavorites(prev => 
            prev.includes(id) ? prev.filter(favId => favId !== id) : [...prev, id]
        );
    }, [favorites, permission]);

    const handleToggleComparison = useCallback((id: string) => {
        setComparisonList(prev => {
            if (prev.includes(id)) {
                return prev.filter(compId => compId !== id);
            }
            if (prev.length >= 4) {
                alert('Maximum 4 terméket lehet egyszerre összehasonlítani.');
                return prev;
            }
            return [...prev, id];
        });
    }, []);
    
    const handleStoreToggle = (store: Store) => {
        setSelectedStores(prev => 
            prev.includes(store) ? prev.filter(s => s !== store) : [...prev, store]
        );
    };

    const handleCategoryToggle = (category: string) => {
        setSelectedCategories(prev =>
            prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
        );
    };

    const resetFilters = () => {
        setSelectedStores([]);
        setSelectedCategories([]);
        setPriceRange({ min: 0, max: 100000 });
        setMinDiscount(0);
        setIsFilterModalOpen(false);
    };
    
    const allCategories = useMemo(() => [...new Set(allProducts.map(p => p.category))].sort(), [allProducts]);
    
    const filteredProducts = useMemo(() => {
        return allProducts.filter(p => {
            const storeMatch = selectedStores.length === 0 || selectedStores.includes(p.store);
            const categoryMatch = selectedCategories.length === 0 || selectedCategories.includes(p.category);
            const priceMatch = p.salePrice >= priceRange.min && p.salePrice <= priceRange.max;
            const discountMatch = p.discountPercentage >= minDiscount;
            return storeMatch && categoryMatch && priceMatch && discountMatch;
        });
    }, [allProducts, selectedStores, selectedCategories, priceRange, minDiscount]);

    const favoriteProducts = useMemo(() => allProducts.filter(p => favorites.includes(p.id)), [allProducts, favorites]);
    const comparisonProducts = useMemo(() => allProducts.filter(p => comparisonList.includes(p.id)), [allProducts, comparisonList]);
    
    const SearchAndFilterBar = () => (
        <div className="px-4 sm:px-0 my-4 space-y-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
            </div>
            <input
              id="search"
              name="search"
              className="block w-full pl-11 pr-3 py-3 border border-gray-200 rounded-full leading-5 bg-gray-50 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary-red focus:border-primary-red sm:text-sm"
              placeholder="Keresés termékek között..."
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              autoComplete="off"
            />
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={() => setIsFilterModalOpen(true)} className="flex items-center space-x-2 border border-gray-300 rounded-full px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 active:bg-gray-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                <span>Szűrők</span>
            </button>
            <button onClick={handleRefresh} className="flex items-center space-x-2 border border-gray-300 rounded-full px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 active:bg-gray-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5m11 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Frissítés</span>
            </button>
          </div>
          {locationError && <p className="text-xs text-center text-red-600 bg-red-50 p-2 rounded-md">{locationError}</p>}
        </div>
    );

    const renderContent = () => {
        if (view === 'settings') {
            return <SettingsPage />;
        }
        
        if (view === 'favorites') {
             return renderProductList(favoriteProducts, "Kedvencek", "Nincsenek kedvencnek jelölt termékeid.");
        }
        
        if (view === 'comparison') {
            return <ComparisonPage products={comparisonProducts} onRemove={handleToggleComparison} />;
        }

        if (view === 'home') {
            if (isLoading && allProducts.length === 0) return <SkeletonLoader />;
            if (error) return <ErrorMessage error={error} />;
            return (
                <div>
                    <SearchAndFilterBar />
                    {renderProductList(filteredProducts, submittedSearchTerm ? "Keresés eredménye" : "Akciós ajánlatok", "Nincs a szűrési feltételeknek megfelelő termék.")}
                </div>
            );
        }

        // Placeholder for other views
        return (
            <div className="text-center p-8 bg-gray-100 text-gray-800 rounded-lg mt-4 mx-4">
                <h3 className="font-bold text-lg capitalize">{view.replace('-', ' ')}</h3>
                <p>Ez a funkció fejlesztés alatt áll.</p>
            </div>
        );
    };

    const ErrorMessage = ({ error }: {error: string}) => (
        <div className="text-center p-8 bg-red-100 text-red-700 rounded-lg mx-4">
            <h3 className="font-bold text-lg">Hiba történt</h3>
            <p>{error}</p>
        </div>
    );

    const renderProductList = (products: Product[], title: string, emptyMessage: string) => (
        <div>
            <h2 className="text-xl font-bold text-gray-800 px-4 sm:px-0 mb-4">{title} ({products.length})</h2>
            {isLoading && products.length > 0 && <div className="text-center py-4">Frissítés...</div>}
            {products.length === 0 && !isLoading ? (
                <div className="text-center p-8 bg-yellow-50 text-yellow-800 rounded-lg mx-4 sm:mx-0">
                    <h3 className="font-bold text-lg">Nincs találat</h3>
                    <p>{emptyMessage}</p>
                </div>
            ) : (
                <div className="px-4 sm:px-0">
                    {products.map(product => (
                        <ProductCard 
                            key={product.id} 
                            product={product} 
                            isFavorite={favorites.includes(product.id)} 
                            onToggleFavorite={handleToggleFavorite}
                            isCompared={comparisonList.includes(product.id)}
                            onToggleComparison={handleToggleComparison}
                        />
                    ))}
                </div>
            )}
        </div>
    );

    return (
        <div className="min-h-screen bg-white pb-24">
            <Header onLogout={onLogout} />
            <main className="container mx-auto">
                {renderContent()}
            </main>
            <FilterModal isOpen={isFilterModalOpen} onClose={() => setIsFilterModalOpen(false)}>
                <FilterSidebar
                    selectedStores={selectedStores}
                    onStoreToggle={handleStoreToggle}
                    selectedCategories={selectedCategories}
                    onCategoryToggle={handleCategoryToggle}
                    allCategories={allCategories}
                    priceRange={priceRange}
                    onPriceChange={setPriceRange}
                    minDiscount={minDiscount}
                    onDiscountChange={setMinDiscount}
                    onResetFilters={resetFilters}
                />
            </FilterModal>
            <NotificationPermissionModal
                isOpen={isNotificationModalOpen}
                onClose={() => setIsNotificationModalOpen(false)}
                onAllow={() => {
                    requestPermission();
                    setIsNotificationModalOpen(false);
                }}
            />
            <BottomNav activeView={view} setActiveView={setView} />
        </div>
    );
};

export default App;