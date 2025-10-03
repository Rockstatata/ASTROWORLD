import React from 'react';
import type { StellariumObject } from '../../types/stellarium';

interface StelButtonProps {
  label: string;
  img: string;
  obj: StellariumObject | null;
  attr: string;
}

const StelButton: React.FC<StelButtonProps> = ({ label, img, obj, attr }) => {
  const value = obj ? obj[attr] : false;

  const handleClick = () => {
    if (obj) {
      obj[attr] = !obj[attr];
    }
  };

  return (
    <div 
      className="relative group"
      title={label}
    >
      <button 
        onClick={handleClick} 
        className={`w-16 h-16 flex items-center justify-center rounded-xl transition-all duration-200 ${
          value 
            ? 'bg-gradient-to-br from-space-blue to-space-violet shadow-lg shadow-space-violet/30' 
            : 'bg-transparent hover:bg-white/10'
        }`}
      >
        <img 
          src={img} 
          alt={label}
          className={`w-8 h-8 object-contain transition-all duration-200 ${
            value ? 'brightness-125' : 'brightness-75 opacity-70 group-hover:opacity-100 group-hover:brightness-100'
          }`}
        />
      </button>
      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
        {label}
      </div>
    </div>
  );
};

export default StelButton;