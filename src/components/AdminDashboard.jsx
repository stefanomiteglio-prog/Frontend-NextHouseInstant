import React, { useState } from 'react';
import nexthouseLogo from '../assets/nexthouse_logo.png';

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
  filterName,
  setFilterName,
  detailSelection,
  setDetailSelection,
  deletingSelectionId,
  setDeletingSelectionId,
  fetchSelections,
  handleDeleteSelection,
  handleUpdateSelectionStatus,
  formatSize
}) {
  const [expandedSelectionIds, setExpandedSelectionIds] = useState(new Set());
  const [statusFilter, setStatusFilter] = useState('all');

  const toggleExpandSelection = (id) => {
    setExpandedSelectionIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handlePrintSelection = (sel) => {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    const photosHtml = sel.photos.map(photo => `
      <div class="photo-page">
        <img src="${API_URL}/api/photos/${photo.id}/download" alt="Print photo" />
      </div>
    `).join('');

    doc.write(`
      <html>
        <head>
          <title>Print - Request #${sel.id} - ${sel.name}</title>
          <style>
            @page {
              size: auto;
              margin: 0;
            }
            body {
              margin: 0;
              padding: 0;
              background: #fff;
            }
            .photo-page {
              width: 100vw;
              height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              page-break-after: always;
              break-after: page;
              box-sizing: border-box;
            }
            img {
              max-width: 100%;
              max-height: 100%;
              object-fit: contain;
            }
          </style>
        </head>
        <body>
          ${photosHtml}
          <script>
            window.onload = function() {
              window.focus();
              window.print();
              setTimeout(function() {
                window.parent.document.body.removeChild(window.frameElement);
              }, 1000);
            };
          </script>
        </body>
      </html>
    `);
    doc.close();
  };
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
      <header className="admin-header-logo-title">
        <img src={nexthouseLogo} alt="NextHouse Logo" className="admin-header-logo" />
        <h1 className="admin-header-title">NextHouse Instant Dashboard</h1>
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
            className={`admin-tab-btn ${activeTab === 'prints' ? 'active' : ''}`}
            onClick={() => setActiveTab('prints')}
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print Requests
          </button>
          <button 
            className={`admin-tab-btn ${activeTab === 'stickers' ? 'active' : ''}`}
            onClick={() => setActiveTab('stickers')}
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Decorative Stickers
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
            <div className="status-filter-tabs">
              <button 
                className={`status-filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
                onClick={() => setStatusFilter('all')}
              >
                All ({selections.length})
              </button>
              <button 
                className={`status-filter-btn ${statusFilter === 'pending' ? 'active' : ''}`}
                onClick={() => setStatusFilter('pending')}
              >
                To Print ({selections.filter(s => (s.status || 'pending') === 'pending').length})
              </button>
              <button 
                className={`status-filter-btn ${statusFilter === 'printed' ? 'active' : ''}`}
                onClick={() => setStatusFilter('printed')}
              >
                Printed ({selections.filter(s => s.status === 'printed').length})
              </button>
            </div>

            <div className="admin-toolbar">
              <div className="search-input-wrapper">
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Filter by name..."
                  value={filterName}
                  onChange={(e) => setFilterName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      fetchSelections(filterName);
                    }
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>


                <button onClick={() => fetchSelections(filterName)} className="btn btn-secondary">
                  Filter
                </button>
                {filterName && (
                  <button 
                    onClick={() => {
                      setFilterName('');
                    }} 
                    className="btn btn-secondary"
                  >
                    Reset
                  </button>
                )}
                <button onClick={() => fetchSelections(filterName)} className="btn btn-secondary" title="Refresh List" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                  </svg>
                  Refresh
                </button>
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
            ) : [...selections].filter((sel) => statusFilter === 'all' || (sel.status || 'pending') === statusFilter).length === 0 ? (
              <div className="admin-upload-section" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                No print requests found matching this status filter.
              </div>
            ) : (
              <div className="admin-selections-grid">
                {[...selections]
                  .filter((sel) => statusFilter === 'all' || (sel.status || 'pending') === statusFilter)
                  .sort((a, b) => b.id - a.id)
                  .map((sel) => (
                  <div key={sel.id} className="admin-selection-card">
                    <div className="admin-selection-header">
                      <div className="selection-info-group">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontWeight: '600', fontSize: '1.1rem' }}>Print Request</span>
                          <span className={`status-badge ${(sel.status || 'pending')}`}>
                            {(sel.status || 'pending') === 'printed' ? 'Printed' : 'To Print'}
                          </span>
                        </div>
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
                        <div key={photo.id} className="admin-selection-thumb" title="Photo thumbnail">
                          <img src={`${API_URL}/api/photos/${photo.id}/download`} alt="Photo" />
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
                        <button 
                          onClick={() => handleUpdateSelectionStatus(sel.id, (sel.status || 'pending') === 'printed' ? 'pending' : 'printed')}
                          className={`btn btn-status ${(sel.status || 'pending')}`}
                          style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                        >
                          {(sel.status || 'pending') === 'printed' ? 'Mark as Pending' : 'Mark as Printed'}
                        </button>
                        <button 
                          onClick={() => handlePrintSelection(sel)}
                          className="btn btn-accent"
                          style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                          </svg>
                          Print
                        </button>
                        <button 
                          onClick={() => toggleExpandSelection(sel.id)} 
                          className={`btn btn-secondary ${expandedSelectionIds.has(sel.id) ? 'active' : ''}`}
                          style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                        >
                          {expandedSelectionIds.has(sel.id) ? 'Collapse' : 'Details'}
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

                    {/* Accordion Details Panel */}
                    <div className={`admin-selection-details-accordion ${expandedSelectionIds.has(sel.id) ? 'expanded' : ''}`}>
                      <div className="accordion-content">
                        <div className="accordion-photos-grid">
                          {sel.photos.map((photo) => (
                            <div key={photo.id} className="accordion-photo-card">
                              <div className="accordion-photo-thumb">
                                <img src={`${API_URL}/api/photos/${photo.id}/download`} alt="Photo" />
                              </div>
                              <div className="accordion-photo-info">
                                <div className="filesize">{formatSize(photo.file_size)}</div>
                                <a 
                                  href={`${API_URL}/api/photos/${photo.id}/download`} 
                                  download={photo.original_filename}
                                  className="btn btn-download"
                                  style={{ padding: '0.5rem', fontSize: '0.8rem', marginTop: '0.5rem', height: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                >
                                  Download
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>
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
                <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Request Details</h2>
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '0.5rem' }}>
                  <span className={`status-badge ${(detailSelection.status || 'pending')}`}>
                    {(detailSelection.status || 'pending') === 'printed' ? 'Printed' : 'To Print'}
                  </span>
                </div>
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
                    <img src={`${API_URL}/api/photos/${photo.id}/download`} alt="Photo" />
                  </div>
                  <div className="modal-photo-info">
                    <div>
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
