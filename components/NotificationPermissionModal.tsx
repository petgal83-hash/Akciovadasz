import React from 'react';

interface NotificationPermissionModalProps {
  isOpen: boolean;
  onAllow: () => void;
  onClose: () => void;
}

const NotificationPermissionModal: React.FC<NotificationPermissionModalProps> = ({ isOpen, onAllow, onClose }) => {
  if (!isOpen) return null;

  const handleAllowClick = () => {
    onAllow();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 m-4 max-w-sm w-full text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-teal-100">
          <svg className="h-6 w-6 text-primary-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </div>
        <h3 className="text-lg leading-6 font-medium text-gray-900 mt-4">Értesítések engedélyezése</h3>
        <div className="mt-2 px-4">
          <p className="text-sm text-gray-500">
            Szeretne értesítést kapni, ha kedvenc termékei olcsóbbak lesznek, vagy ha az akciójuk hamarosan lejár?
          </p>
        </div>
        <div className="mt-5 sm:mt-6 space-y-2">
          <button
            type="button"
            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-teal text-base font-medium text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-teal sm:text-sm"
            onClick={handleAllowClick}
          >
            Értesítések engedélyezése
          </button>
          <button
            type="button"
            className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:text-sm"
            onClick={onClose}
          >
            Talán később
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationPermissionModal;