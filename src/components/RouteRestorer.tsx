import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export function RouteRestorer({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [hasRestored, setHasRestored] = useState(false);

  useEffect(() => {
    // Only restore once after auth is loaded
    if (loading || hasRestored) return;

    // Only restore if user is authenticated and on root
    if (user && location.pathname === '/') {
      try {
        const savedState = localStorage.getItem('recyclr_route_state');
        if (savedState) {
          const parsed = JSON.parse(savedState);
          const lastRoute = parsed.lastRoute;
          const lastVisited = parsed.lastVisited;
          
          // Only restore if visited within last 24 hours and route is valid
          const isRecent = Date.now() - lastVisited < 24 * 60 * 60 * 1000;
          const isValidRoute = lastRoute && 
                               !lastRoute.startsWith('/auth') && 
                               lastRoute !== '/' &&
                               lastRoute.length > 1;
          
          if (isRecent && isValidRoute) {
            navigate(lastRoute, { replace: true });
          }
        }
      } catch (error) {
        console.error('Error restoring route:', error);
      }
    }
    
    setHasRestored(true);
  }, [user, loading, location.pathname, navigate, hasRestored]);

  return <>{children}</>;
}
