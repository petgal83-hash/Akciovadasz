import React from 'react';
import { useNotifications } from '../hooks/useNotifications';

const SettingsPage: React.FC = () => {
  const { permission, requestPermission } = useNotifications();

  const getStatusText = () => {
    switch (permission) {
      case 'granted':
        return 'Az értesítések engedélyezve vannak.';
      case 'denied':
        return 'Az értesítések le vannak tiltva a böngészőben.';
      case 'default':
        return 'Az értesítések nincsenek beállítva.';
    }
  };
  
  const getStatusColor = () => {
     switch (permission) {
      case 'granted':
        return 'text-green-600';
      case 'denied':
        return 'text-red-600';
      case 'default':
        return 'text-gray-600';
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Beállítások</h2>
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900">Értesítések</h3>
        <p className="text-sm text-gray-500 mt-1">Kezelje az alkalmazás értesítési beállításait.</p>
        <div className="mt-4 p-4 bg-gray-50 rounded-md flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-800">Jelenlegi állapot:</p>
            <p className={`text-sm font-semibold ${getStatusColor()}`}>{getStatusText()}</p>
          </div>
          {permission !== 'granted' && (
            <button
              onClick={requestPermission}
              className="px-4 py-2 bg-primary-teal text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-teal"
            >
              {permission === 'denied' ? 'Engedélyezés újra' : 'Engedélyezés'}
            </button>
          )}
        </div>
        {permission === 'denied' && (
            <p className="text-xs text-gray-500 mt-3">
                Az értesítések engedélyezéséhez frissítenie kell a böngésző webhely-beállításait ehhez az oldalhoz. Általában a címsor melletti lakat ikonra kattintva teheti ezt meg.
            </p>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;