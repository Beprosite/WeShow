import React from 'react';
import Image from 'next/image';

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className = '' }) => {
  return (
    <div className={`flex items-center ${className}`}>
      <Image
        src="/images/Weshow-logo-white_300px.webp"
        alt="WeShow Logo"
        width={90}
        height={22}
        className="w-auto h-5"
        priority
      />
    </div>
  );
};

export default Logo; 