import React from 'react';
import { Calendar, Tag } from 'lucide-react';

const ItemCard = ({ item, onClick }) => {
  const dateObject = item.dateAdded ? new Date(item.dateAdded) : null;

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 border border-gray-100 overflow-hidden group"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={item.coverImage}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full">
          <div className="flex items-center space-x-1">
            <Tag className="h-3 w-3 text-blue-600" />
            <span className="text-xs font-medium text-gray-700">{item.type}</span>
          </div>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-1">
          {item.name}
        </h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {item.description}
        </p>
        <div className="flex items-center text-gray-500 text-xs">
          <Calendar className="h-3 w-3 mr-1" />
          <span>
            Added{' '}
            {dateObject ? dateObject.toLocaleDateString() : 'N/A'} {/* Use the converted dateObject */}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ItemCard;