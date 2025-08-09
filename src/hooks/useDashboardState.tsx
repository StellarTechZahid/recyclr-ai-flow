
import { useState, useEffect, useCallback } from 'react';
import { usePersistentState } from './usePersistentState';

interface DashboardState {
  searchQuery: string;
  selectedView: string;
  timeRange: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  selectedFilters: string[];
  scrollPosition: number;
  expandedSections: Record<string, boolean>;
  activeTab: string;
  showArchived: boolean;
}

const defaultDashboardState: DashboardState = {
  searchQuery: '',
  selectedView: 'overview',
  timeRange: '30',
  sortBy: 'created_at',
  sortOrder: 'desc',
  selectedFilters: [],
  scrollPosition: 0,
  expandedSections: {},
  activeTab: 'all',
  showArchived: false
};

export function useDashboardState() {
  const [dashboardState, setDashboardState] = usePersistentState<DashboardState>(
    'dashboard_state',
    defaultDashboardState
  );
  const [isRestoring, setIsRestoring] = useState(true);

  // Restore scroll position on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      if (dashboardState.scrollPosition > 0) {
        window.scrollTo({
          top: dashboardState.scrollPosition,
          behavior: 'smooth'
        });
      }
      setIsRestoring(false);
    }, 100);

    return () => clearTimeout(timer);
  }, [dashboardState.scrollPosition]);

  // Save scroll position on scroll
  useEffect(() => {
    if (isRestoring) return;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      if (scrollY !== dashboardState.scrollPosition) {
        setDashboardState(prev => ({ ...prev, scrollPosition: scrollY }));
      }
    };

    const throttledScroll = throttle(handleScroll, 500);
    window.addEventListener('scroll', throttledScroll, { passive: true });

    return () => window.removeEventListener('scroll', throttledScroll);
  }, [isRestoring, dashboardState.scrollPosition, setDashboardState]);

  // Save state before navigation
  useEffect(() => {
    const handleBeforeUnload = () => {
      setDashboardState(prev => ({ 
        ...prev, 
        scrollPosition: window.scrollY 
      }));
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [setDashboardState]);

  const updateState = useCallback((updates: Partial<DashboardState>) => {
    setDashboardState(prev => ({ ...prev, ...updates }));
  }, [setDashboardState]);

  const resetState = useCallback(() => {
    setDashboardState(defaultDashboardState);
  }, [setDashboardState]);

  const toggleSection = useCallback((sectionId: string) => {
    setDashboardState(prev => ({
      ...prev,
      expandedSections: {
        ...prev.expandedSections,
        [sectionId]: !prev.expandedSections[sectionId]
      }
    }));
  }, [setDashboardState]);

  return {
    state: dashboardState,
    updateState,
    resetState,
    toggleSection,
    isRestoring
  };
}

// Throttle utility function
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
