import React, { useState, useEffect } from 'react';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import CustomerDownloadView from './components/CustomerDownloadView';
import PrivacyPolicy from './components/PrivacyPolicy';
import { translations } from './translations';

const getLanguage = () => {
  const params = new URLSearchParams(window.location.search);
  const langParam = params.get('lang');
  if (langParam) {
    localStorage.setItem('nexthouse_lang', langParam.toLowerCase());
    return langParam.toLowerCase();
  }
  const savedLang = localStorage.getItem('nexthouse_lang');
  if (savedLang) return savedLang;
  
  const browserLang = navigator.language || navigator.userLanguage || 'en';
  const prefix = browserLang.split('-')[0].toLowerCase();
  const supported = ['en', 'it', 'de', 'da', 'es', 'fr'];
  return supported.includes(prefix) ? prefix : 'en';
};

const getApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL || '';
  
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return '';
  }
  
  return envUrl || 'http://localhost:8080';
};

const API_URL = getApiUrl();

function App() {
  const path = window.location.pathname;
  const isAdminRoute = path === '/admin';
  const isPrivacyRoute = path === '/privacy' || path === '/privacy-policy';

  const [lang, setLang] = useState(getLanguage());
  
  const t = (key) => (translations[lang] && translations[lang][key]) || translations['en'][key] || key;

  // State for user photo download page (original logic)
  const [token, setToken] = useState('');
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState('');

  // State for admin/auth
  const [sessionToken, setSessionToken] = useState(null);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // State for stickers
  const [stickers, setStickers] = useState([]);
  const [stickersLoading, setStickersLoading] = useState(false);
  const [newStickerName, setNewStickerName] = useState('');
  const [newStickerFile, setNewStickerFile] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [deletingStickerId, setDeletingStickerId] = useState(null);

  // Client selection states
  const [clientSelections, setClientSelections] = useState([]);
  const [activeSelectedPhotoIds, setActiveSelectedPhotoIds] = useState(new Set());
  const [submittingSelection, setSubmittingSelection] = useState(false);
  const [selectionMessage, setSelectionMessage] = useState('');

  // Admin print selections states
  const [activeTab, setActiveTab] = useState('prints'); // 'stickers' or 'prints'
  const [selections, setSelections] = useState([]);
  const [selectionsLoading, setSelectionsLoading] = useState(false);
  const [filterName, setFilterName] = useState('');
  const [detailSelection, setDetailSelection] = useState(null);
  const [deletingSelectionId, setDeletingSelectionId] = useState(null);

  // Admin auto-refresh states
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshSecondsLeft, setRefreshSecondsLeft] = useState(30);

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

  const fetchClientSelections = async (tokenVal = token) => {
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
  };

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
        } catch (jsonErr) {
          try {
            responseBody = await response.text();
          } catch (textErr) {
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

  const fetchSelections = async (name = '') => {
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
  };

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

  // Authenticated fetch helper
  const authenticatedFetch = async (url, options = {}) => {
    const headers = { ...options.headers };
    if (sessionToken) {
      headers['Authorization'] = `Bearer ${sessionToken}`;
    }
    return fetch(url, {
      ...options,
      headers,
      credentials: 'include'
    });
  };

  // --- ADMIN AUTH & STICKERS LOGIC ---
  useEffect(() => {
    if (!isAdminRoute) return;

    const checkAuth = async () => {
      try {
        const response = await fetch(`${API_URL}/api/auth/me`, { credentials: 'include' });
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          fetchStickers();
        }
      } catch (err) {
        console.error("Auth check failed", err);
      } finally {
        setAuthLoading(false);
      }
    };

    checkAuth();
  }, [isAdminRoute]);

  // Fetch stickers when user gets authenticated
  useEffect(() => {
    if (user && isAdminRoute) {
      fetchStickers();
    }
  }, [user, sessionToken]);

  const fetchStickers = async () => {
    setStickersLoading(true);
    try {
      const response = await authenticatedFetch(`${API_URL}/api/stickers`);
      if (response.ok) {
        const data = await response.json();
        setStickers(data);
      }
    } catch (err) {
      console.error("Error fetching stickers:", err);
    } finally {
      setStickersLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginUsername, password: loginPassword }),
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Unable to log in.');
      }

      const data = await response.json();
      setSessionToken(data.session_token);
      setUser(data.user);
    } catch (err) {
      setLoginError(err.message);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authenticatedFetch(`${API_URL}/api/auth/logout`, { method: 'POST' });
    } catch (err) {
      console.error("Logout request failed", err);
    }
    setUser(null);
    setSessionToken(null);
    setStickers([]);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewStickerFile(file);
      // Auto fill name if empty
      if (!newStickerName) {
        const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
        setNewStickerName(nameWithoutExt);
      }
    }
  };

  const handleUploadSticker = async (e) => {
    e.preventDefault();
    if (!newStickerFile || !newStickerName.trim()) {
      setUploadError("Please provide a name and select an image.");
      return;
    }

    setUploadError('');
    setUploadLoading(true);

    const formData = new FormData();
    formData.append('name', newStickerName);
    formData.append('file', newStickerFile);

    try {
      const response = await authenticatedFetch(`${API_URL}/api/stickers`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error occurred while uploading the sticker.');
      }

      const newSticker = await response.json();
      setStickers((prev) => [newSticker, ...prev]);
      setNewStickerName('');
      setNewStickerFile(null);
      // Clear file input
      const fileInput = document.getElementById('sticker-file-input');
      if (fileInput) fileInput.value = '';
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setUploadLoading(false);
    }
  };

  const handleDeleteSticker = async (stickerId) => {
    try {
      const response = await authenticatedFetch(`${API_URL}/api/stickers/${stickerId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setStickers((prev) => prev.filter((s) => s.id !== stickerId));
      } else {
        alert("Unable to delete the sticker.");
      }
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setDeletingStickerId(null);
    }
  };

  // --- USER DOWNLOAD LOGIC (Original) ---
  useEffect(() => {
    if (isAdminRoute) return;

    const path = window.location.pathname;
    const parts = path.split('/download/');
    if (parts.length > 1) {
      const parsedToken = parts[1].split('/')[0];
      setToken(parsedToken);
    } else {
      setLoading(false);
      setError({
        titleKey: "invalidLinkTitle",
        descKey: "invalidLinkDesc"
      });
    }
  }, [isAdminRoute]);

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
  }, [token, isAdminRoute]);

  // Admin selections fetching effect
  useEffect(() => {
    if (user && isAdminRoute && activeTab === 'prints') {
      fetchSelections(filterName);
    }
  }, [user, activeTab, sessionToken, filterName]);

  // Admin auto refresh timer effect
  useEffect(() => {
    if (!user || !isAdminRoute || activeTab !== 'prints' || !autoRefresh) return;
    
    const interval = setInterval(() => {
      setRefreshSecondsLeft(prev => {
        if (prev <= 1) {
          fetchSelections(filterName);
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [user, isAdminRoute, activeTab, autoRefresh, filterName, sessionToken]);

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

  const formatSize = (bytes) => {
    if (!bytes) return 'Unknown size';
    if (bytes > 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }
    return `${(bytes / 1024).toFixed(0)} KB`;
  };

  // --- RENDERING ROUTER ---

  if (isPrivacyRoute) {
    return <PrivacyPolicy lang={lang} />;
  }

  if (isAdminRoute) {
    if (authLoading) {
      return (
        <div className="center-container">
          <div className="spinner"></div>
          <p className="loading-text">Verifying session...</p>
        </div>
      );
    }

    if (!user) {
      return (
        <div className="admin-view-page">
          <AdminLogin
            loginUsername={loginUsername}
            setLoginUsername={setLoginUsername}
            loginPassword={loginPassword}
            setLoginPassword={setLoginPassword}
            loginError={loginError}
            loginLoading={loginLoading}
            handleLogin={handleLogin}
          />
        </div>
      );
    }

    return (
      <div className="admin-view-page">
        <AdminDashboard
          user={user}
          handleLogout={handleLogout}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          API_URL={API_URL}
          stickers={stickers}
          stickersLoading={stickersLoading}
          newStickerName={newStickerName}
          setNewStickerName={setNewStickerName}
          newStickerFile={newStickerFile}
          setNewStickerFile={setNewStickerFile}
          uploadLoading={uploadLoading}
          uploadError={uploadError}
          setUploadError={setUploadError}
          deletingStickerId={deletingStickerId}
          setDeletingStickerId={setDeletingStickerId}
          handleFileChange={handleFileChange}
          handleUploadSticker={handleUploadSticker}
          handleDeleteSticker={handleDeleteSticker}
          selections={selections}
          selectionsLoading={selectionsLoading}
          filterName={filterName}
          setFilterName={setFilterName}
          detailSelection={detailSelection}
          setDetailSelection={setDetailSelection}
          deletingSelectionId={deletingSelectionId}
          setDeletingSelectionId={setDeletingSelectionId}
          fetchSelections={fetchSelections}
          handleDeleteSelection={handleDeleteSelection}
          formatSize={formatSize}
        />
      </div>
    );
  }

  // --- USER VIEW ---

  if (loading) {
    return (
      <div className="center-container">
        <div className="spinner"></div>
        <p className="loading-text">{t("loadingPhotos")}</p>
      </div>
    );
  }

  if (error) {
    if (error.isExpired) {
      return (
        <div className="center-container">
          <div className="expired-container">
            <div className="expired-icon">
              <svg width="64" height="64" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ margin: '0 auto' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="expired-title">{t(error.titleKey)}</h2>
            <p className="expired-desc">{t(error.descKey)}</p>
          </div>
        </div>
      );
    }

    return (
      <div className="center-container">
        <div className="error-container">
          <div className="error-icon">
            <svg width="64" height="64" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ margin: '0 auto' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="error-title">{t(error.titleKey)}</h2>
          <p className="error-desc">{t(error.descKey)}</p>
        </div>
      </div>
    );
  }

  return (
    <CustomerDownloadView
      lang={lang}
      session={session}
      token={token}
      timeLeft={timeLeft}
      API_URL={API_URL}
      clientSelections={clientSelections}
      activeSelectedPhotoIds={activeSelectedPhotoIds}
      submittingSelection={submittingSelection}
      selectionMessage={selectionMessage}
      handleToggleSelectPhoto={handleToggleSelectPhoto}
      handleClearActiveSelection={handleClearActiveSelection}
      handleSubmitPrintRequest={handleSubmitPrintRequest}
      formatSize={formatSize}
    />
  );
}

export default App;
