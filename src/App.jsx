import React, { useState, useEffect } from 'react';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import CustomerDownloadView from './components/CustomerDownloadView';

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
  const [activeTab, setActiveTab] = useState('stickers'); // 'stickers' or 'prints'
  const [selections, setSelections] = useState([]);
  const [selectionsLoading, setSelectionsLoading] = useState(false);
  const [filterSessionId, setFilterSessionId] = useState('');
  const [detailSelection, setDetailSelection] = useState(null);
  const [deletingSelectionId, setDeletingSelectionId] = useState(null);

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

  const handleSubmitPrintRequest = async () => {
    if (activeSelectedPhotoIds.size === 0) return;
    setSubmittingSelection(true);
    setSelectionMessage('');
    try {
      const response = await fetch(`${API_URL}/download/${token}/selections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photo_ids: Array.from(activeSelectedPhotoIds) })
      });
      if (response.ok) {
        setSelectionMessage('Print request submitted successfully!');
        setActiveSelectedPhotoIds(new Set());
        fetchClientSelections(token);
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

  // Admin print selections helper
  const fetchSelections = async (sessionId = '') => {
    setSelectionsLoading(true);
    try {
      const url = sessionId 
        ? `${API_URL}/api/selections?download_session_id=${sessionId}` 
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
        title: "Invalid link",
        description: "The entered address does not contain a valid download token."
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
            throw new Error("Session not found|The download link is invalid or the session has expired.");
          } else if (response.status === 410) {
            throw new Error("Session expired or limit reached|This download session is no longer available.");
          } else {
            throw new Error("Server error|Unable to load session data at this time.");
          }
        }
        const data = await response.json();
        setSession(data);
        await fetchClientSelections(token);
      } catch (err) {
        const [title, desc] = err.message.split('|');
        setError({
          title: title || "Loading error",
          description: desc || err.message
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
      fetchSelections(filterSessionId);
    }
  }, [user, activeTab, sessionToken]);

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
          title: "Session Expired",
          description: "The download session has expired. Links are valid for 5 minutes."
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
        <AdminLogin
          loginUsername={loginUsername}
          setLoginUsername={setLoginUsername}
          loginPassword={loginPassword}
          setLoginPassword={setLoginPassword}
          loginError={loginError}
          loginLoading={loginLoading}
          handleLogin={handleLogin}
        />
      );
    }

    return (
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
        filterSessionId={filterSessionId}
        setFilterSessionId={setFilterSessionId}
        detailSelection={detailSelection}
        setDetailSelection={setDetailSelection}
        deletingSelectionId={deletingSelectionId}
        setDeletingSelectionId={setDeletingSelectionId}
        fetchSelections={fetchSelections}
        handleDeleteSelection={handleDeleteSelection}
        formatSize={formatSize}
      />
    );
  }

  // --- USER VIEW ---

  if (loading) {
    return (
      <div className="center-container">
        <div className="spinner"></div>
        <p className="loading-text">Loading photos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="center-container">
        <div className="error-container">
          <div className="error-icon">
            <svg width="64" height="64" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ margin: '0 auto' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="error-title">{error.title}</h2>
          <p className="error-desc">{error.description}</p>
        </div>
      </div>
    );
  }

  return (
    <CustomerDownloadView
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
