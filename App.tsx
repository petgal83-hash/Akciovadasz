

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Header from './components/Header';
import FilterSidebar from './components/FilterSidebar';
import ProductCard from './components/ProductCard';
import ProductListItem from './components/ProductListItem';
import SkeletonLoader from './components/SkeletonLoader';
import BottomNav from './components/BottomNav';
import ComparisonPage from './components/ComparisonPage';
import SettingsPage from './components/SettingsPage';
import NotificationPermissionModal from './components/NotificationPermissionModal';
import AdBanner from './components/AdBanner';
import AISearchPage from './components/AISearchPage';
import { fetchDeals } from './services/geminiService';
import { Product, Store, ProductOrAd } from './types';
import { useNotifications } from './hooks/useNotifications';
import { FirebaseUser } from './services/firebase';


type AppView = 'home' | 'comparison' | 'favorites' | 'ai-search' | 'settings';
type ViewMode = 'grid' | 'list';

interface AppProps {
    onLogout: () => void;
    user: FirebaseUser;
}

// New FilterModal component for mobile
const FilterModal: React.FC<{ isOpen: boolean; onClose: () => void; children: React.ReactNode }> = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center lg:hidden" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl m-4 w-full max-w-md max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                {children}
            </div>
        </div>
    );
};


const App: React.FC<AppProps> = ({ onLogout, user }) => {
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const previousProductsRef = useRef<Product[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    
    const [view, setView] = useState<AppView>('home');
    
    const [selectedStores, setSelectedStores] = useState<Store[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [priceRange, setPriceRange] = useState({ min: 0, max: 100000 });
    const [minDiscount, setMinDiscount] = useState<number>(0);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>('grid');

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

    const loadDeals = useCallback(async () => {
        try {
            setIsLoading(true);
            const products = await fetchDeals(undefined, location ?? undefined);

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
                loadDeals();
                localStorage.setItem('akciovadasz_lastFetch', JSON.stringify({ time: now, count: dailyFetchCount + 1 }));
            }
        };

        const intervalId = setInterval(autoRefresh, 60 * 60 * 1000); // Check every hour
        return () => clearInterval(intervalId);
    }, [loadDeals]);


    useEffect(() => {
        localStorage.setItem('akciovadasz_favorites', JSON.stringify(favorites));
    }, [favorites]);

    const handleRefresh = () => {
        loadDeals();
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
    
    const FilterControls = () => (
        <div className="px-4 sm:px-0 my-4 space-y-3">
          <div className="flex items-center space-x-2">
            <button onClick={() => setIsFilterModalOpen(true)} className="lg:hidden flex items-center space-x-2 border border-gray-300 rounded-full px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 active:bg-gray-200">
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

        if (view === 'ai-search') {
            return <AISearchPage
                        allProducts={allProducts}
                        favorites={favorites}
                        comparisonList={comparisonList}
                        onToggleFavorite={handleToggleFavorite}
                        onToggleComparison={handleToggleComparison}
                    />;
        }

        if (view === 'home') {
            if (isLoading && allProducts.length === 0) return <SkeletonLoader />;
            if (error) return <ErrorMessage error={error} />;
            return (
                <div>
                    <FilterControls />
                    {renderProductList(filteredProducts, "Akciós ajánlatok", "Nincs a szűrési feltételeknek megfelelő termék.")}
                </div>
            );
        }

        // Placeholder for other views
        // Fix: Cast `view` to string. TypeScript correctly infers `view` as `never` here
        // because all possible cases of AppView are handled above. This cast preserves
        // the placeholder's functionality for any future additions to AppView.
        return (
            <div className="text-center p-8 bg-gray-100 text-gray-800 rounded-lg mt-4 mx-4">
                <h3 className="font-bold text-lg capitalize">{(view as string).replace('-', ' ')}</h3>
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

    const renderProductList = (products: Product[], title: string, emptyMessage: string) => {
        const itemsWithAds: ProductOrAd[] = [];
        products.forEach((product, index) => {
            itemsWithAds.push(product);
            // Insert an ad after the 5th item, and then every 6 items after that
            if ((index + 1) % 6 === 5) {
                itemsWithAds.push({ isAd: true, id: `ad-${index}` });
            }
        });

        return (
            <div>
                <div className="flex justify-between items-center px-4 sm:px-0 mb-4">
                    <h2 className="text-xl font-bold text-gray-800">{title} ({products.length})</h2>
                     <div className="flex items-center space-x-1 border border-gray-200 rounded-full p-0.5 bg-gray-100">
                        <button 
                            onClick={() => setViewMode('grid')} 
                            className={`p-1.5 rounded-full transition-colors duration-200 ${viewMode === 'grid' ? 'bg-primary-teal text-white shadow-sm' : 'text-gray-500 hover:bg-gray-200'}`}
                            aria-label="Grid nézet"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                               <path d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                            </svg>
                        </button>
                        <button 
                            onClick={() => setViewMode('list')} 
                            className={`p-1.5 rounded-full transition-colors duration-200 ${viewMode === 'list' ? 'bg-primary-teal text-white shadow-sm' : 'text-gray-500 hover:bg-gray-200'}`}
                            aria-label="Lista nézet"
                        >
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
                            </svg>
                        </button>
                    </div>
                </div>
                {isLoading && products.length > 0 && <div className="text-center py-4">Frissítés...</div>}
                {products.length === 0 && !isLoading ? (
                    <div className="text-center p-8 bg-yellow-50 text-yellow-800 rounded-lg mx-4 sm:mx-0">
                        <h3 className="font-bold text-lg">Nincs találat</h3>
                        <p>{emptyMessage}</p>
                    </div>
                ) : (
                    viewMode === 'grid' ? (
                         <div className="px-4 sm:px-0">
                            {itemsWithAds.map(item =>
                                'isAd' in item ? <AdBanner key={item.id} /> : (
                                    <ProductCard 
                                        key={item.id} 
                                        product={item} 
                                        isFavorite={favorites.includes(item.id)} 
                                        onToggleFavorite={handleToggleFavorite}
                                        isCompared={comparisonList.includes(item.id)}
                                        onToggleComparison={handleToggleComparison}
                                    />
                                )
                            )}
                        </div>
                    ) : (
                        <div className="px-4 sm:px-0 space-y-3">
                             {itemsWithAds.map(item =>
                                'isAd' in item ? <AdBanner key={item.id} /> : (
                                    <ProductListItem 
                                        key={item.id} 
                                        product={item} 
                                        isFavorite={favorites.includes(item.id)} 
                                        onToggleFavorite={handleToggleFavorite}
                                        isCompared={comparisonList.includes(item.id)}
                                        onToggleComparison={handleToggleComparison}
                                    />
                                )
                            )}
                        </div>
                    )
                )}
            </div>
        );
    };

    const filterSidebarProps = {
      selectedStores,
      onStoreToggle: handleStoreToggle,
      selectedCategories,
      onCategoryToggle: handleCategoryToggle,
      allCategories,
      priceRange,
      onPriceChange: setPriceRange,
      minDiscount,
      onDiscountChange: setMinDiscount,
      onResetFilters: resetFilters,
    };
    
    return (
        <div className="min-h-screen bg-gray-50 pb-24 lg:pb-0">
            <Header onLogout={onLogout} user={user} />
            <div className="container mx-auto flex flex-col lg:flex-row lg:gap-8">
                <aside className="hidden lg:block lg:w-64 xl:w-72 lg:flex-shrink-0">
                    <FilterSidebar {...filterSidebarProps} />
                </aside>
                <main className="flex-1">
                    {renderContent()}
                </main>
            </div>
            <FilterModal isOpen={isFilterModalOpen} onClose={() => setIsFilterModalOpen(false)}>
                <FilterSidebar {...filterSidebarProps} />
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