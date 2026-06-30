import { useState, useEffect, useCallback } from 'react';
import { useAdminAuth } from './useAdminAuth';

export function useSelections() {
  const { user, authenticatedFetch, API_URL } = useAdminAuth();
  
  const [activeTab, setActiveTab] = useState('prints'); // 'stickers' or 'prints'
  const [selections, setSelections] = useState([]);
  const [selectionsLoading, setSelectionsLoading] = useState(false);
  const [filterName, setFilterName] = useState('');
  const [detailSelection, setDetailSelection] = useState(null);
  const [deletingSelectionId, setDeletingSelectionId] = useState(null);

  // Admin auto-refresh states
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshSecondsLeft, setRefreshSecondsLeft] = useState(30);

  const fetchSelections = useCallback(async (name = filterName) => {
    setSelectionsLoading(true);
    setRefreshSecondsLeft(30);
    try {
      const url = name 
        ? `${API_URL}/api/selections?name=${encodeURIComponent(name)}` 
        : `${API_URL}/api/selections`;
      const response = await authenticatedFetch(url);
      if (response.ok) {
        const data = await response.json();
        setSelections(data);
      }
    } catch (err) {
      console.error("Error fetching selections:", err);
    } finally {
      setSelectionsLoading(false);
    }
  }, [authenticatedFetch, API_URL, filterName]);

  const handleDeleteSelection = async (selectionId) => {
    try {
      const response = await authenticatedFetch(`${API_URL}/api/selections/${selectionId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setSelections((prev) => prev.filter((s) => s.id !== selectionId));
      } else {
        alert("Unable to delete request.");
      }
    } catch (err) {
      console.error("Error deleting selection:", err);
    } finally {
      setDeletingSelectionId(null);
    }
  };

  const handleUpdateSelectionStatus = async (selectionId, newStatus) => {
    try {
      const response = await authenticatedFetch(`${API_URL}/api/selections/${selectionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) {
        const updated = await response.json();
        setSelections((prev) => prev.map((s) => s.id === selectionId ? updated : s));
      } else {
        alert("Unable to update request status.");
      }
    } catch (err) {
      console.error("Error updating selection status:", err);
    }
  };

  // Fetch selections when conditions change
  useEffect(() => {
    if (user && activeTab === 'prints') {
      Promise.resolve().then(() => {
        fetchSelections(filterName);
      });
    }
  }, [user, activeTab, filterName, fetchSelections]);

  // Auto refresh timer effect
  useEffect(() => {
    if (!user || activeTab !== 'prints' || !autoRefresh) return;
    
    const interval = setInterval(() => {
      setRefreshSecondsLeft(prev => {
        if (prev <= 1) {
          Promise.resolve().then(() => {
            fetchSelections(filterName);
          });
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [user, activeTab, autoRefresh, filterName, fetchSelections]);

  return {
    activeTab,
    setActiveTab,
    selections,
    selectionsLoading,
    filterName,
    setFilterName,
    detailSelection,
    setDetailSelection,
    deletingSelectionId,
    setDeletingSelectionId,
    autoRefresh,
    setAutoRefresh,
    refreshSecondsLeft,
    setRefreshSecondsLeft,
    fetchSelections,
    handleDeleteSelection,
    handleUpdateSelectionStatus
  };
}
