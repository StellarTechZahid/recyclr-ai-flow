import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useRouteState } from '@/hooks/useRouteState';

export function RouteRestorer({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [hasRestored, setHasRestored] = useState(false);

  // Start tracking/saving route state globally
  useRouteState();

  useEffect(() => {
    // Only restore once after auth is loaded
    if (loading || hasRestored) return;

    // Only restore if user is authenticated and on root/dashboard
    // (prevents wiping the current view when the user is already inside the app)
    if (user && (location.pathname === '/' || location.pathname === '/dashboard')) {
      try {
        const savedState = localStorage.getItem('vyralix_route_state');
        if (savedState) {
          const parsed = JSON.parse(savedState);
          const lastRoute = parsed.lastRoute as string | undefined;
          const lastVisited = parsed.lastVisited as number | undefined;

          // Only restore if visited within last 24 hours and route is valid
          const isRecent = !!lastVisited && Date.now() - lastVisited < 24 * 60 * 60 * 1000;
          const isValidRoute =
            !!lastRoute &&
            !lastRoute.startsWith('/auth') &&
            lastRoute !== '/' &&
            lastRoute.length > 1;

          const isNotSameRoute = !!lastRoute && lastRoute !== location.pathname;

          if (isRecent && isValidRoute && isNotSameRoute) {
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

