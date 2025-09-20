import React from 'react';
import type { StellariumObject } from '../types/stellarium';

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
      className={`w-20 h-20 flex-shrink-0 cursor-pointer transition-opacity ${
        !value ? 'opacity-50' : 'opacity-100'
      }`}
      title={label}
    >
      <button onClick={handleClick} className="w-full h-full">
        <img 
          src={img} 
          alt={label}
          className="w-full h-full object-contain"
        />
      </button>
    </div>
  );
};

export default StelButton;