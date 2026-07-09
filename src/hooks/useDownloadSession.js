import { useState, useEffect, useCallback } from 'react';
import { API_URL } from '../utils/api';

export function useDownloadSession() {
  const isAdminRoute = window.location.pathname === '/admin';

  const [token, setToken] = useState(() => {
    if (isAdminRoute) return '';
    const path = window.location.pathname;
    const parts = path.split('/download/');
    return parts.length > 1 ? parts[1].split('/')[0] : '';
  });

  const [loading, setLoading] = useState(() => {
    if (isAdminRoute) return false;
    const parts = window.location.pathname.split('/download/');
    return parts.length > 1;
  });

  const [error, setError] = useState(() => {
    if (isAdminRoute) return null;
    const parts = window.location.pathname.split('/download/');
    if (parts.length <= 1) {
      return {
        titleKey: "invalidLinkTitle",
        descKey: "invalidLinkDesc"
      };
    }
    return null;
  });

  const [session, setSession] = useState(null);
  const [timeLeft, setTimeLeft] = useState('');

  // Client selection states
  const [clientSelections, setClientSelections] = useState([]);
  const [activeSelectedPhotoIds, setActiveSelectedPhotoIds] = useState(new Set());
  const [submittingSelection, setSubmittingSelection] = useState(false);
  const [selectionMessage, setSelectionMessage] = useState('');

  const handleToggleSelectPhoto = (photoId) => {
    setActiveSelectedPhotoIds((prev) => {
      const next = new Set(prev);
      if (next.has(photoId)) {
        next.delete(photoId);
      } else {
        next.add(photoId);
      }
      return next;
    });
  };

  const handleClearActiveSelection = () => {
    setActiveSelectedPhotoIds(new Set());
  };

  const fetchClientSelections = useCallback(async (tokenVal = token) => {
    if (!tokenVal) return;
    try {
      const response = await fetch(`${API_URL}/download/${tokenVal}/selections`);
      if (response.ok) {
        const data = await response.json();
        setClientSelections(data);
      }
    } catch (err) {
      console.error("Error fetching selections:", err);
    }
  }, [token]);

  const handleSubmitPrintRequest = async (guestName, onSuccess) => {
    if (activeSelectedPhotoIds.size === 0) return;
    setSubmittingSelection(true);
    setSelectionMessage('');
    try {
      const response = await fetch(`${API_URL}/download/${token}/selections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          photo_ids: Array.from(activeSelectedPhotoIds),
          name: guestName
        })
      });
      if (response.ok) {
        setSelectionMessage('Print request submitted successfully!');
        setActiveSelectedPhotoIds(new Set());
        fetchClientSelections(token);
        if (onSuccess) onSuccess();
        // Clear message after 4 seconds
        setTimeout(() => setSelectionMessage(''), 4000);
      } else {
        let errorDetails = `HTTP ${response.status} ${response.statusText}`;
        let responseBody = '';
        try {
          const errData = await response.json();
          responseBody = errData.detail || JSON.stringify(errData);
        } catch {
          try {
            responseBody = await response.text();
          } catch {
            responseBody = 'Failed to retrieve error details.';
          }
        }
        
        console.error("Print submission failed:", errorDetails, responseBody);
        
        alert(
          `Print Request Error:\n` +
          `---------------------\n` +
          `Status: ${errorDetails}\n` +
          `Response: ${responseBody.substring(0, 300)}${responseBody.length > 300 ? '...' : ''}\n\n` +
          `Please share this error message with your developer.`
        );
      }
    } catch (err) {
      console.error("Error sending print request:", err);
      alert(
        `Connection / Network Error:\n` +
        `---------------------\n` +
        `Message: ${err.message || err}\n\n` +
        `Please check your internet connection or backend server status.`
      );
    } finally {
      setSubmittingSelection(false);
    }
  };

  const handleDeleteClientSelection = async (selectionId) => {
    try {
      const response = await fetch(`${API_URL}/download/${token}/selections/${selectionId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setClientSelections((prev) => prev.filter((s) => s.id !== selectionId));
        return true;
      }
      return false;
    } catch (err) {
      console.error("Error cancelling print request:", err);
      return false;
    }
  };

  // Fetch session once token is set
  useEffect(() => {
    if (!token || isAdminRoute) return;

    const fetchSession = async () => {
      try {
        const response = await fetch(`${API_URL}/api/download-sessions/${token}`);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("sessionNotFoundTitle|sessionNotFoundDesc");
          } else if (response.status === 410) {
            throw new Error("sessionExpiredOrLimitTitle|sessionExpiredOrLimitDesc");
          } else {
            throw new Error("serverErrorTitle|serverErrorDesc");
          }
        }
        const data = await response.json();
        setSession(data);
        await fetchClientSelections(token);
      } catch (err) {
        const [titleKey, descKey] = err.message.includes('|') ? err.message.split('|') : ['serverErrorTitle', err.message];
        setError({
          titleKey: titleKey,
          descKey: descKey,
          isExpired: err.message.toLowerCase().includes("expired") || err.message.toLowerCase().includes("limit")
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [token, isAdminRoute, fetchClientSelections]);

  // Countdown timer effect
  useEffect(() => {
    if (!session?.expires_at || isAdminRoute) return;

    let expiresStr = session.expires_at;
    if (expiresStr && !expiresStr.endsWith('Z') && !expiresStr.includes('+') && !/-\d{2}:\d{2}$/.test(expiresStr)) {
      expiresStr += 'Z';
    }
    const expiresTime = new Date(expiresStr).getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const distance = expiresTime - now;

      if (distance < 0) {
        setTimeLeft('Expired');
        setError({
          titleKey: "sessionExpiredTitle",
          descKey: "sessionExpiredDesc",
          isExpired: true
        });
        return false;
      } else {
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        setTimeLeft(
          `${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds}`
        );
        return true;
      }
    };

    const shouldContinue = updateTimer();
    if (!shouldContinue) return;

    const timer = setInterval(() => {
      const shouldContinue = updateTimer();
      if (!shouldContinue) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [session, isAdminRoute]);

  return {
    token,
    setToken,
    session,
    loading,
    error,
    timeLeft,
    clientSelections,
    activeSelectedPhotoIds,
    submittingSelection,
    selectionMessage,
    handleToggleSelectPhoto,
    handleClearActiveSelection,
    handleSubmitPrintRequest,
    fetchClientSelections,
    handleDeleteClientSelection
  };
}
