import React from 'react';

const SkeletonCard: React.FC = () => (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col border border-gray-100 mb-4">
        <div className="bg-gray-200 h-52 w-full animate-pulse"></div>
        <div className="p-4 flex flex-col flex-grow">
            <div className="h-7 w-3/4 bg-gray-200 rounded animate-pulse mb-3"></div>
            <div className="h-5 w-1/3 bg-gray-200 rounded animate-pulse mb-4"></div>

            <div className="flex items-end justify-between mb-2">
                <div className="space-y-2">
                    <div className="h-5 w-24 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-8 w-32 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="h-7 w-12 bg-gray-200 rounded animate-pulse"></div>
            </div>
             <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse mt-1"></div>
        </div>
    </div>
);


const SkeletonLoader: React.FC = () => {
    return (
        <div className="px-4 sm:px-0">
            {Array.from({ length: 5 }).map((_, index) => (
                <SkeletonCard key={index} />
            ))}
        </div>
    );
};

export default SkeletonLoader;