
import React from 'react';

interface FlyerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const flyers = [
    { name: 'Tesco Akciós Újság', img: 'https://picsum.photos/seed/tescoflyer/800/1100' },
    { name: 'Lidl Heti Ajánlatok', img: 'https://picsum.photos/seed/lidlflyer/800/1100' },
    { name: 'Aldi Szórólap', img: 'https://picsum.photos/seed/aldiflyer/800/1100' },
    { name: 'Spar Szuper Akciók', img: 'https://picsum.photos/seed/sparflyer/800/1100' },
];

const FlyerModal: React.FC<FlyerModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl p-6 m-4 max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Digitális Akciós Újságok</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p className="text-gray-600 mb-6">Böngéssze a legfrissebb ajánlatokat! Kattintson a képre a "lapozáshoz" (szimuláció).</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {flyers.map(flyer => (
                 <div key={flyer.name} className="border rounded-lg p-4 shadow-sm hover:shadow-lg transition-shadow">
                    <h3 className="text-lg font-semibold mb-2">{flyer.name}</h3>
                    <img src={flyer.img} alt={flyer.name} className="w-full rounded-md object-contain cursor-pointer" />
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default FlyerModal;
