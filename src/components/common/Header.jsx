import React from 'react';

const Header = () => {
  const getCurrentUser = () => {
    const sessionUser = sessionStorage.getItem("currentUser");
    const localUser = localStorage.getItem("currentUser");
    
    if (sessionUser) {
      try {
        return JSON.parse(sessionUser);
      } catch (e) {
        console.error('Error parsing sessionStorage user:', e);
      }
    }
    if (localUser) {
      try {
        return JSON.parse(localUser);
      } catch (e) {
        console.error('Error parsing localStorage user:', e);
      }
    }
    return null;
  };

  const user = getCurrentUser();

  return (
    <header className="bg-white shadow-sm border-b px-6 py-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patient Dashboard</h1>
          <p className="text-gray-600">Manage your health profile and results</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="font-semibold text-gray-900">
              {user?.displayName || user?.email || 'User'}
            </p>
            <p className="text-sm text-gray-600">Patient</p>
          </div>
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
            {user?.displayName ? user.displayName.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;