import React, { useState, useEffect } from 'react';

const getApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL || '';
  
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    if (envUrl.includes('localhost')) {
      return envUrl.replace('localhost', window.location.hostname);
    }
    if (envUrl.includes('127.0.0.1')) {
      return envUrl.replace('127.0.0.1', window.location.hostname);
    }
    return `${window.location.protocol}//${window.location.hostname}:8080`;
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
      // Login Form
      return (
        <>
          <div className="glow-bg"></div>
          <header style={{ marginBottom: '1rem' }}>
            <h1>Restricted Area</h1>
            <p className="subtitle">Log in to manage NextHouseIstant stickers</p>
          </header>
          <main className="container" style={{ alignItems: 'center' }}>
            <form onSubmit={handleLogin} className="admin-card">
              <h2 className="admin-title">Admin Login</h2>
              
              <div className="form-group">
                <label className="form-label" htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  className="form-input"
                  placeholder="Username"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  className="form-input"
                  placeholder="Password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
              </div>

              {loginError && (
                <div style={{ color: '#ef4444', fontSize: '0.9rem', textAlign: 'center', marginTop: '0.25rem' }}>
                  {loginError}
                </div>
              )}

              <button type="submit" className="btn btn-download" style={{ marginTop: '1rem' }} disabled={loginLoading}>
                {loginLoading ? 'Logging in...' : 'Log In'}
              </button>
            </form>
          </main>
          <footer>
            &copy; 2026 NextHouseIstant. All rights reserved.
          </footer>
        </>
      );
    }

    // Authenticated Admin Panel
    return (
      <>
        <div className="glow-bg"></div>
        <header>
          <h1>NextHouseIstant Stickers</h1>
          <p className="subtitle">Manage decorative stickers for the external application</p>
        </header>

        <main className="container">
          <div className="dashboard-header">
            <div>
              <span className="photos-count">Welcome, {user.username}</span>
            </div>
            <div>
              <button onClick={handleLogout} className="btn btn-secondary">
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign Out
              </button>
            </div>
          </div>

          <div className="admin-upload-section">
            <form onSubmit={handleUploadSticker} className="upload-grid">
              <div className="form-group">
                <label className="form-label">Sticker Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Main Logo"
                  value={newStickerName}
                  onChange={(e) => setNewStickerName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Image (PNG, JPG, WebP)</label>
                <div className="file-input-wrapper">
                  <div className={`file-input-btn ${newStickerFile ? 'has-file' : ''}`}>
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {newStickerFile ? newStickerFile.name : 'Select image...'}
                  </div>
                  <input
                    type="file"
                    id="sticker-file-input"
                    className="file-input-hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                    required
                  />
                </div>
              </div>
              <div>
                <button type="submit" className="btn btn-accent" disabled={uploadLoading} style={{ minWidth: '160px' }}>
                  {uploadLoading ? 'Uploading...' : 'Upload Sticker'}
                </button>
              </div>
            </form>
            {uploadError && (
              <div style={{ color: '#ef4444', fontSize: '0.9rem', marginTop: '1rem', textAlign: 'left' }}>
                {uploadError}
              </div>
            )}
          </div>

          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginTop: '1rem', textAlign: 'left' }}>Uploaded Stickers</h2>

          {stickersLoading ? (
            <div className="center-container" style={{ minHeight: '20vh' }}>
              <div className="spinner" style={{ width: '35px', height: '35px' }}></div>
              <p className="loading-text">Loading stickers...</p>
            </div>
          ) : stickers.length === 0 ? (
            <div className="admin-upload-section" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              No stickers uploaded in the system. Use the form above to upload one.
            </div>
          ) : (
            <div className="grid">
              {stickers.map((sticker) => (
                <div key={sticker.id} className="card">
                  <div className="img-container">
                    <img 
                      src={`${API_URL}/api/stickers/${sticker.id}/image`} 
                      alt={sticker.name} 
                      loading="lazy" 
                    />
                  </div>
                  <div className="card-body">
                    <div>
                      <div className="filename" title={sticker.name}>
                        {sticker.name}
                      </div>
                      <div className="filesize">{formatSize(sticker.file_size)}</div>
                    </div>

                    {deletingStickerId === sticker.id ? (
                      <div className="confirm-delete-box">
                        <button 
                          onClick={() => handleDeleteSticker(sticker.id)} 
                          className="btn btn-danger"
                          style={{ padding: '0.5rem' }}
                        >
                          Confirm
                        </button>
                        <button 
                          onClick={() => setDeletingStickerId(null)} 
                          className="btn btn-secondary"
                          style={{ padding: '0.5rem' }}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => setDeletingStickerId(sticker.id)} 
                        className="btn btn-danger"
                        style={{ width: '100%' }}
                      >
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
        <footer>
          &copy; 2026 NextHouseIstant. All rights reserved.
        </footer>
      </>
    );
  }

  // --- ORIGINAL USER PHOTO DOWNLOAD PAGE ---

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
    <>
      <div className="glow-bg"></div>

      <header>
        <h1>NextHouseIstant</h1>
        <p className="subtitle">Preview and download real estate photos</p>
      </header>

      <main className="container">
        <div className="actions-bar">
          <div>
            <span className="photos-count">{session.photos?.length || 0} photos selected</span>
          </div>
          <div className="actions-right">
            <span className="session-info">
              Session expires in: <span className="countdown">{timeLeft || '--:--'}</span>
            </span>
            <a href={`${API_URL}/download/${token}/zip`} className="btn btn-secondary">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download ZIP
            </a>
          </div>
        </div>

        <div className="grid">
          {session.photos?.map((photo) => (
            <div key={photo.id} className="card">
              <div className="img-container">
                <img 
                  src={`${API_URL}/download/${token}/photos/${photo.id}`} 
                  alt={photo.original_filename} 
                  loading="lazy" 
                />
              </div>
              <div className="card-body">
                <div>
                  <div className="filename" title={photo.original_filename}>
                    {photo.original_filename}
                  </div>
                  <div className="filesize">{formatSize(photo.file_size)}</div>
                </div>
                <a 
                  href={`${API_URL}/download/${token}/photos/${photo.id}`} 
                  download={photo.original_filename} 
                  className="btn btn-download"
                >
                  <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download Photo
                </a>
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer>
        &copy; 2026 NextHouseIstant. All rights reserved.
      </footer>
    </>
  );
}

export default App;
