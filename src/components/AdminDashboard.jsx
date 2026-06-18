import React from 'react';

function AdminDashboard({
  user,
  handleLogout,
  activeTab,
  setActiveTab,
  API_URL,
  stickers,
  stickersLoading,
  newStickerName,
  setNewStickerName,
  newStickerFile,
  uploadLoading,
  uploadError,
  deletingStickerId,
  setDeletingStickerId,
  handleFileChange,
  handleUploadSticker,
  handleDeleteSticker,
  selections,
  selectionsLoading,
  filterSessionId,
  setFilterSessionId,
  detailSelection,
  setDetailSelection,
  deletingSelectionId,
  setDeletingSelectionId,
  fetchSelections,
  handleDeleteSelection,
  formatSize
}) {
  const parseName = (fullName) => {
    if (!fullName) return { name: '', booking: '' };
    const parts = fullName.split(' | Booking: ');
    if (parts.length > 1) {
      return { name: parts[0], booking: parts[1] };
    }
    return { name: fullName, booking: '' };
  };

  return (
    <>
      <div className="glow-bg"></div>
      <header>
        <h1>NextHouseIstant Dashboard</h1>
        <p className="subtitle">Decorative stickers and print requests management</p>
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

        {/* Admin Navigation Tabs */}
        <div className="admin-tabs">
          <button 
            className={`admin-tab-btn ${activeTab === 'stickers' ? 'active' : ''}`}
            onClick={() => setActiveTab('stickers')}
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Decorative Stickers
          </button>
          <button 
            className={`admin-tab-btn ${activeTab === 'prints' ? 'active' : ''}`}
            onClick={() => setActiveTab('prints')}
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print Requests
          </button>
        </div>

        {activeTab === 'stickers' ? (
          <>
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
          </>
        ) : (
          // Print Requests Tab Content
          <div className="admin-dashboard">
            <div className="admin-toolbar">
              <div className="search-input-wrapper">
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Filter by Session ID..."
                  value={filterSessionId}
                  onChange={(e) => setFilterSessionId(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      fetchSelections(filterSessionId);
                    }
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => fetchSelections(filterSessionId)} className="btn btn-secondary">
                  Filter
                </button>
                {filterSessionId && (
                  <button 
                    onClick={() => {
                      setFilterSessionId('');
                      fetchSelections('');
                    }} 
                    className="btn btn-secondary"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>

            {selectionsLoading ? (
              <div className="center-container" style={{ minHeight: '20vh' }}>
                <div className="spinner" style={{ width: '35px', height: '35px' }}></div>
                <p className="loading-text">Loading print requests...</p>
              </div>
            ) : selections.length === 0 ? (
              <div className="admin-upload-section" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                No print requests found.
              </div>
            ) : (
              <div className="admin-selections-grid">
                {selections.map((sel) => (
                  <div key={sel.id} className="admin-selection-card">
                    <div className="admin-selection-header">
                      <div className="selection-info-group">
                        <span style={{ fontWeight: '600', fontSize: '1.1rem' }}>Print Request #{sel.id}</span>
                        {sel.name && (() => {
                          const { name: parsedName, booking: parsedBooking } = parseName(sel.name);
                          return (
                            <>
                              <h3 className="selection-guest-title" style={{ fontSize: '1.05rem', margin: '0.25rem 0', fontWeight: '600', color: 'var(--accent)' }}>
                                Selection for: <strong>{parsedName}</strong>
                              </h3>
                              {parsedBooking && (
                                <h4 style={{ fontSize: '0.9rem', margin: '0.15rem 0', fontWeight: '500', color: '#4b5563' }}>
                                  Booking: <strong style={{ color: '#000' }}>{parsedBooking}</strong>
                                </h4>
                              )}
                            </>
                          );
                        })()}
                        <span className="selection-session-tag">Session #{sel.download_session_id}</span>
                      </div>
                      <span className="request-date">
                        {new Date(sel.created_at).toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="admin-selection-thumbs">
                      {sel.photos.slice(0, 8).map((photo) => (
                        <div key={photo.id} className="admin-selection-thumb" title={photo.original_filename}>
                          <img src={`${API_URL}/api/photos/${photo.id}/download`} alt={photo.original_filename} />
                        </div>
                      ))}
                      {sel.photos.length > 8 && (
                        <div className="admin-selection-thumb" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.05)', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                          +{sel.photos.length - 8}
                        </div>
                      )}
                    </div>

                    <div className="admin-selection-actions">
                      <span className="photo-count-badge">
                        {sel.photos.length} {sel.photos.length === 1 ? 'photo' : 'photos'}
                      </span>
                      <div className="admin-card-buttons">
                        <button onClick={() => setDetailSelection(sel)} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                          Details
                        </button>
                        
                        {deletingSelectionId === sel.id ? (
                          <div className="confirm-delete-box" style={{ margin: 0 }}>
                            <button onClick={() => handleDeleteSelection(sel.id)} className="btn btn-danger" style={{ padding: '0.5rem' }}>
                              Confirm
                            </button>
                            <button onClick={() => setDeletingSelectionId(null)} className="btn btn-secondary" style={{ padding: '0.5rem' }}>
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => setDeletingSelectionId(sel.id)} className="btn btn-danger" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
      
      {/* Selection Details Modal */}
      {detailSelection && (
        <div className="modal-overlay" onClick={() => setDetailSelection(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Request Details #{detailSelection.id}</h2>
                {detailSelection.name && (() => {
                  const { name: parsedName, booking: parsedBooking } = parseName(detailSelection.name);
                  return (
                    <>
                      <h3 className="selection-guest-title" style={{ fontSize: '1.2rem', margin: '0.25rem 0', fontWeight: '600', color: 'var(--accent)' }}>
                        Selection for: <strong>{parsedName}</strong>
                      </h3>
                      {parsedBooking && (
                        <h4 style={{ fontSize: '1.05rem', margin: '0.25rem 0', fontWeight: '500', color: '#4b5563' }}>
                          Booking: <strong style={{ color: '#000' }}>{parsedBooking}</strong>
                        </h4>
                      )}
                    </>
                  );
                })()}
                <p className="subtitle" style={{ marginTop: '0.25rem' }}>
                  Session ID: {detailSelection.download_session_id} | Submitted on: {new Date(detailSelection.created_at).toLocaleString()}
                </p>
              </div>
              <button className="modal-close-btn" onClick={() => setDetailSelection(null)}>
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="modal-photos-grid">
              {detailSelection.photos.map((photo) => (
                <div key={photo.id} className="modal-photo-card">
                  <div className="modal-photo-thumb">
                    <img src={`${API_URL}/api/photos/${photo.id}/download`} alt={photo.original_filename} />
                  </div>
                  <div className="modal-photo-info">
                    <div>
                      <div className="filename" title={photo.original_filename}>{photo.original_filename}</div>
                      <div className="filesize">{formatSize(photo.file_size)}</div>
                    </div>
                    <a 
                      href={`${API_URL}/api/photos/${photo.id}/download`} 
                      download={photo.original_filename}
                      className="btn btn-download"
                      style={{ padding: '0.5rem', fontSize: '0.85rem', marginTop: '0.5rem' }}
                    >
                      Download
                    </a>
                  </div>
                </div>
              ))}
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button onClick={() => setDetailSelection(null)} className="btn btn-secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <footer>
        &copy; 2026 NextHouseIstant. All rights reserved.
      </footer>
    </>
  );
}

export default AdminDashboard;
