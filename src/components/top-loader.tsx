
'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export const TopLoader = () => {
  const [progress, setProgress] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    setProgress(0); // Reset on mount/unmount if needed
    
    const handleStart = () => {
      setProgress(30); // Start with a small jump
      // Simulate loading progress
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) {
            clearInterval(interval);
            return prev;
          }
          // Increment progress slowly, then faster
          if (prev < 70) {
            return prev + 5;
          } else {
            return prev + 2;
          }
        });
      }, 200);
      return interval;
    };
    
    const handleComplete = (interval: NodeJS.Timeout) => {
      clearInterval(interval);
      setProgress(100);
      setTimeout(() => setProgress(0), 500); // Hide after completion
    };

    let interval = handleStart();

    // The effect cleanup function will run when the component unmounts
    // or when the pathname changes, effectively stopping the loader.
    return () => {
      handleComplete(interval);
    };

  }, [pathname]);

  if (progress === 0) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 h-1 z-50 bg-primary/80 transition-all duration-300 ease-out"
      style={{ width: `${progress}%` }}
    />
  );
};
