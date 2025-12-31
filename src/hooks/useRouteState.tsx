import { useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { usePersistentState } from './usePersistentState';

interface RouteState {
  lastRoute: string;
  lastVisited: number;
  tabStates: Record<string, string>;
  scrollPositions: Record<string, number>;
}

const defaultRouteState: RouteState = {
  lastRoute: '/dashboard',
  lastVisited: Date.now(),
  tabStates: {},
  scrollPositions: {}
};

export function useRouteState() {
  const location = useLocation();
  const navigate = useNavigate();
  const [routeState, setRouteState] = usePersistentState<RouteState>(
    'recyclr_route_state',
    defaultRouteState
  );

  // Save current route whenever it changes
  useEffect(() => {
    const currentPath = location.pathname;
    
    // Don't save auth routes or root
    if (currentPath.startsWith('/auth') || currentPath === '/') {
      return;
    }

    setRouteState(prev => ({
      ...prev,
      lastRoute: currentPath,
      lastVisited: Date.now()
    }));
  }, [location.pathname, setRouteState]);

  // Save scroll position on scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentPath = location.pathname;
      if (currentPath.startsWith('/auth') || currentPath === '/') {
        return;
      }

      setRouteState(prev => ({
        ...prev,
        scrollPositions: {
          ...prev.scrollPositions,
          [currentPath]: window.scrollY
        }
      }));
    };

    const throttledScroll = throttle(handleScroll, 500);
    window.addEventListener('scroll', throttledScroll, { passive: true });

    return () => window.removeEventListener('scroll', throttledScroll);
  }, [location.pathname, setRouteState]);

  // Restore scroll position when route changes
  useEffect(() => {
    const savedPosition = routeState.scrollPositions[location.pathname];
    if (savedPosition !== undefined) {
      setTimeout(() => {
        window.scrollTo({ top: savedPosition, behavior: 'instant' });
      }, 100);
    }
  }, [location.pathname, routeState.scrollPositions]);

  // Handle visibility change (tab switch)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // User returned to tab - restore route if needed
        const currentPath = location.pathname;
        const savedRoute = routeState.lastRoute;
        
        // If we're on root and have a saved route, restore it
        if (currentPath === '/' && savedRoute && savedRoute !== '/') {
          navigate(savedRoute, { replace: true });
        }
      } else {
        // User left tab - save current state
        const currentPath = location.pathname;
        if (!currentPath.startsWith('/auth') && currentPath !== '/') {
          setRouteState(prev => ({
            ...prev,
            lastRoute: currentPath,
            lastVisited: Date.now(),
            scrollPositions: {
              ...prev.scrollPositions,
              [currentPath]: window.scrollY
            }
          }));
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [location.pathname, routeState.lastRoute, navigate, setRouteState]);

  // Handle beforeunload - save state before closing
  useEffect(() => {
    const handleBeforeUnload = () => {
      const currentPath = location.pathname;
      if (!currentPath.startsWith('/auth') && currentPath !== '/') {
        localStorage.setItem('recyclr_route_state', JSON.stringify({
          ...routeState,
          lastRoute: currentPath,
          lastVisited: Date.now(),
          scrollPositions: {
            ...routeState.scrollPositions,
            [currentPath]: window.scrollY
          }
        }));
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [location.pathname, routeState]);

  const saveTabState = useCallback((pageKey: string, tabValue: string) => {
    setRouteState(prev => ({
      ...prev,
      tabStates: {
        ...prev.tabStates,
        [pageKey]: tabValue
      }
    }));
  }, [setRouteState]);

  const getTabState = useCallback((pageKey: string, defaultTab: string): string => {
    return routeState.tabStates[pageKey] || defaultTab;
  }, [routeState.tabStates]);

  const restoreRoute = useCallback(() => {
    if (routeState.lastRoute && routeState.lastRoute !== '/') {
      navigate(routeState.lastRoute, { replace: true });
      return true;
    }
    return false;
  }, [routeState.lastRoute, navigate]);

  return {
    routeState,
    saveTabState,
    getTabState,
    restoreRoute,
    lastRoute: routeState.lastRoute
  };
}

// Throttle utility
function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  let previous = 0;

  return function executedFunction(...args: Parameters<T>) {
    const now = Date.now();

    if (!previous) {
      func(...args);
      previous = now;
      return;
    }

    const remaining = wait - (now - previous);

    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      func(...args);
      previous = now;
    } else if (!timeout) {
      timeout = setTimeout(() => {
        func(...args);
        previous = Date.now();
        timeout = null;
      }, remaining);
    }
  };
}
