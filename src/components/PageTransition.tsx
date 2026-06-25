import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

interface PageTransitionProps {
  children: React.ReactNode;
}

export default function PageTransition({ children }: PageTransitionProps) {
  const location = useLocation();
  const [displayChildren, setDisplayChildren] = useState(children);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    if (location.pathname) {
      // Start fade out
      setIsTransitioning(true);
      setOpacity(0);
      
      // Wait for fade out, then update content and fade in
      const timeout = setTimeout(() => {
        setDisplayChildren(children);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Small delay before fading in
        setTimeout(() => {
          setOpacity(1);
          setIsTransitioning(false);
        }, 50);
      }, 200);

      return () => clearTimeout(timeout);
    }
  }, [location.pathname, children]);

  return (
    <div
      style={{
        opacity,
        transition: 'opacity 200ms ease-in-out',
        minHeight: '100vh',
      }}
    >
      {displayChildren}
    </div>
  );
}
