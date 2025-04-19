import React from 'react';
import Image from 'next/image';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

// S3 logo URL
const S3_LOGO_URL = 'https://s3.eu-north-1.amazonaws.com/dev.drapp.ai-files/email-assets/logos/Weshow-logo-white_300px.png';

const Logo: React.FC<LogoProps> = ({ className = '', size = 'md' }) => {
  // Original image dimensions
  const originalWidth = 300;
  const originalHeight = 75; // Assuming 4:1 aspect ratio based on the image name

  const sizes = {
    sm: { width: 90, height: Math.round(90 * (originalHeight / originalWidth)) },
    md: { width: 120, height: Math.round(120 * (originalHeight / originalWidth)) },
    lg: { width: 150, height: Math.round(150 * (originalHeight / originalWidth)) }
  };

  const { width, height } = sizes[size];

  return (
    <div className={`inline-flex items-center ${className}`}>
      <Image
        src={S3_LOGO_URL}
        alt="WeShow Logo"
        width={width}
        height={height}
        className="w-auto h-auto object-contain"
        style={{
          width: 'auto',
          height: 'auto',
          maxWidth: `${width}px`,
          maxHeight: `${height}px`
        }}
        priority
      />
    </div>
  );
};

export default Logo; 