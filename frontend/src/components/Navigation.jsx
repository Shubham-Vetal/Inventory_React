import React from 'react';
import { NavLink } from 'react-router-dom';
import { Package, Plus } from 'lucide-react';

const Navigation = () => {
  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <Package className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">Inventory Hub</span>
          </div>

          <div className="flex space-x-1">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`
              }
            >
              View Items
            </NavLink>
            <NavLink
              to="/add"
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`
              }
            >
              <Plus className="h-4 w-4" />
              <span>Add Items</span>
            </NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;