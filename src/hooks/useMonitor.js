import { useState, useEffect, useCallback } from 'react';
import { useAdminAuth } from './useAdminAuth';

export function useMonitor(activeTab) {
  const { user, authenticatedFetch, API_URL } = useAdminAuth();
  
  const REFRESH_INTERVAL_SECONDS = 5;
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshSecondsLeft, setRefreshSecondsLeft] = useState(REFRESH_INTERVAL_SECONDS);

  const fetchStats = useCallback(async () => {
    if (!user) return;
    setStats(prevStats => {
      if (!prevStats) setLoading(true);
      return prevStats;
    });
    setError(null);
    try {
      const response = await authenticatedFetch(`${API_URL}/api/dashboard/stats`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
        setRefreshSecondsLeft(REFRESH_INTERVAL_SECONDS);
      } else {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }
    } catch (err) {
      console.error("Error fetching monitor stats:", err);
      setError(err.message || "Failed to load stats.");
    } finally {
      setLoading(false);
    }
  }, [authenticatedFetch, API_URL, user]);

  // Initial fetch when activeTab is monitor
  useEffect(() => {
    if (user && activeTab === 'monitor') {
      fetchStats();
    }
  }, [user, activeTab, fetchStats]);

  // Auto refresh timer effect (every 5 seconds)
  useEffect(() => {
    if (!user || activeTab !== 'monitor' || !autoRefresh) return;
    
    const interval = setInterval(() => {
      setRefreshSecondsLeft(prev => {
        if (prev <= 1) {
          fetchStats();
          return REFRESH_INTERVAL_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [user, activeTab, autoRefresh, fetchStats]);

  return {
    stats,
    loading,
    error,
    autoRefresh,
    setAutoRefresh,
    refreshSecondsLeft,
    fetchStats
  };
}
