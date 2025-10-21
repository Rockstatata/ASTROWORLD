import React from 'react';

interface StelButtonProps {
  label: string;
  img: string;
  obj: any;
  attr: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

const StelButton: React.FC<StelButtonProps> = ({
  label,
  img,
  obj,
  attr,
  onClick,
  disabled = false,
  className = '',
}) => {
  const isActive = obj && obj[attr];

  const handleClick = () => {
    if (obj && attr && typeof obj[attr] !== 'undefined') {
      obj[attr] = !obj[attr];
    }
    onClick?.();
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`group relative p-3 rounded-lg transition-all duration-200 ${
        isActive 
          ? 'bg-blue-600/20 border border-blue-500/50' 
          : 'bg-gray-800/50 border border-gray-600/30 hover:bg-gray-700/50'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'} ${className}`}
      title={label}
    >
      <div className="flex flex-col items-center space-y-1">
        <img 
          src={img} 
          alt={label}
          className={`w-6 h-6 transition-colors ${
            isActive ? 'brightness-125' : 'brightness-75 group-hover:brightness-100'
          }`}
        />
        <span className={`text-xs font-medium transition-colors ${
          isActive ? 'text-blue-300' : 'text-gray-300 group-hover:text-white'
        }`}>
          {label}
        </span>
      </div>
      
      {isActive && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-gray-900" />
      )}
    </button>
  );
};

export default StelButton;