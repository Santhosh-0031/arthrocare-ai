import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/patient/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/patient/profile', label: 'Profile', icon: '👤' },
    { path: '/patient/lab-results', label: 'Lab Results', icon: '🔬' },
    { path: '/patient/predictions', label: 'Predictions', icon: '📈' },
  ];

  return (
    <div className="w-64 bg-white shadow-lg h-full">
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-800">ArthroCare AI</h2>
        <p className="text-sm text-gray-600 mt-1">Patient Portal</p>
      </div>
      
      <nav className="mt-6">
        <ul className="space-y-2 px-4">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  location.pathname === item.path
                    ? 'bg-blue-100 text-blue-700 font-semibold'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="absolute bottom-4 left-4 right-4">
        <button
          onClick={() => {
            localStorage.removeItem('currentUser');
            sessionStorage.removeItem('currentUser');
            window.location.href = '/login';
          }}
          className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <span className="text-lg">🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;