import React from 'react';
import Image from 'next/image';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const Logo: React.FC<LogoProps> = ({ className = '', size = 'md' }) => {
  const sizes = {
    sm: { width: 90, height: 22 },
    md: { width: 120, height: 30 },
    lg: { width: 150, height: 37 }
  };

  const { width, height } = sizes[size];

  return (
    <div className={`inline-flex items-center ${className}`}>
      <Image
        src="/images/Weshow-logo-white_300px.webp"
        alt="WeShow Logo"
        width={width}
        height={height}
        style={{
          maxWidth: '100%',
          height: 'auto'
        }}
        priority
      />
    </div>
  );
};

export default Logo; 