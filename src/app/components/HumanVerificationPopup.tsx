import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface HumanVerificationPopupProps {
  onComplete: () => void;
  onClose: () => void;
}

export default function HumanVerificationPopup({ onComplete, onClose }: HumanVerificationPopupProps) {
  const [progress, setProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isHolding && !isComplete) {
      interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + 1;
          if (newProgress >= 100) {
            return 100;
          }
          return newProgress;
        });
      }, 30); // 30ms * 100 = 3 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isHolding, isComplete]);

  useEffect(() => {
    if (progress === 100 && !isComplete) {
      setIsComplete(true);
      onComplete();
    }
  }, [progress, isComplete, onComplete]);

  const handleMouseDown = () => {
    setIsHolding(true);
  };

  const handleMouseUp = () => {
    if (!isComplete) {
      setIsHolding(false);
      setProgress(0);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
      {/* Particle background */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-[#00A3FF]/20 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      <div className="bg-[#0A0A0A]/90 rounded-lg p-8 max-w-md w-full mx-4 relative overflow-hidden border border-[#00A3FF]/20">
        {/* Glowing border effect */}
        <div className="absolute inset-0 rounded-lg border border-[#00A3FF]/20 animate-pulse" />
        
        <div className="text-center mb-6 relative z-10">
          <h2 className="text-2xl text-white font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-[#00A3FF] to-[#00FFA3]">
            Human Verification
          </h2>
          <p className="text-white/60">Please hold the button to verify you're human</p>
        </div>

        <div className="space-y-4">
          {/* Animated text */}
          <div className="relative w-full h-32 flex items-center justify-center">
            <div className="relative">
              <h3 
                className="text-4xl font-['Impact'] tracking-wider text-white/10"
                style={{ WebkitTextStroke: '1px #00A3FF' }}
              >
                {isComplete ? 'GREAT! THE SHOW BEGINS' : 'HOLD TO VERIFY'}
              </h3>
              <h3 
                className="absolute top-0 left-0 text-4xl font-['Impact'] tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#00A3FF] to-[#00FFA3]"
                style={{ 
                  width: `${progress}%`,
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  WebkitTextStroke: '1px transparent'
                }}
              >
                {isComplete ? 'GREAT! THE SHOW BEGINS' : 'HOLD TO VERIFY'}
              </h3>
            </div>
          </div>

          {/* Digital-style progress bar */}
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#00A3FF] to-[#00FFA3] transition-all duration-300 relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse" />
            </div>
          </div>

          {/* Segmented progress indicator */}
          <div className="flex gap-1 w-full">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                  progress >= (i + 1) * 10 ? 'bg-[#00A3FF]' : 'bg-white/10'
                }`}
              />
            ))}
          </div>

          {/* Cyberpunk-style verification button */}
          <button
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className={`w-full px-6 py-3 rounded-full inline-flex items-center justify-center 
              relative overflow-hidden group
              ${isComplete ? 'bg-[#00FFA3]/20' : 'bg-[#00A3FF]/20'} backdrop-blur-sm text-white 
              shadow-lg ${isComplete ? 'shadow-[#00FFA3]/20' : 'shadow-[#00A3FF]/20'} 
              border ${isComplete ? 'border-[#00FFA3]/30' : 'border-[#00A3FF]/30'} 
              hover:bg-[#00A3FF]/30 hover:shadow-[#00A3FF]/30
              transition-all duration-200`}
          >
            {/* Glowing effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#00A3FF] to-[#00FFA3] opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
            
            {/* Button content */}
            <span className="relative z-10 font-['Impact'] tracking-wider">
              {isComplete ? (
                <>
                  <span className="inline-block mr-2">✓</span>
                  VERIFIED!
                </>
              ) : (
                <>
                  <span className="inline-block mr-2">⟳</span>
                  HOLD TO VERIFY
                </>
              )}
            </span>
          </button>

          <button
            onClick={onClose}
            className="text-white/60 hover:text-white/80 text-sm transition-colors duration-200"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
} 