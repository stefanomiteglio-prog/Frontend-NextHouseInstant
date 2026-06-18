import { useState } from 'react';

function CustomerDownloadView({
  session,
  token,
  timeLeft,
  API_URL,
  clientSelections,
  activeSelectedPhotoIds,
  submittingSelection,
  selectionMessage,
  handleToggleSelectPhoto,
  handleClearActiveSelection,
  handleSubmitPrintRequest,
  formatSize
}) {
  const [guestName, setGuestName] = useState('');

  const onSubmit = () => {
    const guestNameInput = document.getElementById('guest-name');
    const guestNameVal = guestNameInput ? guestNameInput.value.trim() : guestName.trim();
    if (!guestNameVal) {
      alert("Per favore, inserisci un nome o il numero del tavolo per identificare la tua selezione.");
      return;
    }
    handleSubmitPrintRequest(guestNameVal, () => {
      setGuestName('');
      if (guestNameInput) {
        guestNameInput.value = '';
      }
    });
  };

  const onCancel = () => {
    handleClearActiveSelection();
    setGuestName('');
  };

  return (
    <>
      <div className="glow-bg-container">
        <div className="glow-bg"></div>
      </div>

      {selectionMessage && (
        <div style={{
          position: 'fixed',
          top: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'var(--accent)',
          color: '#fff',
          padding: '0.75rem 1.5rem',
          borderRadius: '12px',
          fontWeight: '600',
          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
          zIndex: 110,
          animation: 'fadeIn 0.25s ease'
        }}>
          {selectionMessage}
        </div>
      )}

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
          {session.photos?.map((photo) => {
            const isAlreadyPrinted = clientSelections.some(sel => sel.photos.some(p => p.id === photo.id));
            const isActivelySelected = activeSelectedPhotoIds.has(photo.id);

            return (
              <div key={photo.id} className={`card ${isActivelySelected ? 'selected' : ''}`}>
                <div className="img-container">
                  <img 
                    src={`${API_URL}/download/${token}/photos/${photo.id}`} 
                    alt={photo.original_filename} 
                    loading="lazy" 
                  />
                  {!isAlreadyPrinted && (
                    <div 
                      className={`selection-overlay ${isActivelySelected ? 'selected' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleSelectPhoto(photo.id);
                      }}
                    >
                      <svg fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                  {isAlreadyPrinted && (
                    <div className="print-status-badge">
                      <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Printing
                    </div>
                  )}
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
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download Photo
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Floating Selection Bar */}
        <div className={`floating-selection-bar ${activeSelectedPhotoIds.size > 0 ? 'show' : ''}`}>
          <div className="floating-bar-header">
            <div className="selection-info-text">
              <span>{activeSelectedPhotoIds.size}</span>
              {activeSelectedPhotoIds.size === 1 ? 'selected photo' : 'selected photos'} for printing
            </div>
            <button onClick={onCancel} className="btn btn-secondary btn-sm" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
              Cancel
            </button>
          </div>

          <div className="input-group">
            <label htmlFor="guest-name">Il tuo Nome / Tavolo</label>
            <input 
              type="text" 
              id="guest-name" 
              placeholder="Esempio: Marco - Tavolo 4" 
              required 
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
            />
          </div>

          <button onClick={onSubmit} className="btn btn-accent" disabled={submittingSelection} style={{ width: '100%' }}>
            {submittingSelection ? (
              <span className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px', margin: 0, display: 'inline-block' }}></span>
            ) : (
              <>
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Order Prints
              </>
            )}
          </button>
        </div>

        {/* Past Requests Section */}
        {clientSelections.length > 0 && (
          <div className="past-requests-section">
            <h2 className="past-requests-title">My Print Requests</h2>
            <div className="requests-list">
              {clientSelections.map((sel) => (
                <div key={sel.id} className="request-history-card">
                  <div className="request-meta">
                    <span className="request-id">Request #{sel.id} {sel.name && <span className="request-guest-name">({sel.name})</span>}</span>
                    <span className="request-date">{new Date(sel.created_at).toLocaleString()}</span>
                  </div>
                  <div className="request-thumbnails">
                    {sel.photos.slice(0, 5).map((photo) => (
                      <div key={photo.id} className="request-thumb-container" title={photo.original_filename}>
                        <img src={`${API_URL}/download/${token}/photos/${photo.id}`} alt={photo.original_filename} />
                      </div>
                    ))}
                    {sel.photos.length > 5 && (
                      <span className="request-thumb-more">+{sel.photos.length - 5}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <footer>
        &copy; 2026 NextHouseIstant. All rights reserved.
      </footer>
    </>
  );
}

export default CustomerDownloadView;
