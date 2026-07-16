import { useState } from 'react';
import nexthouseLogo from '../assets/nexthouse_logo.png';

function AdminDashboard({
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
  handleTriggerPrint,
  formatSize,
  monitorStats,
  monitorLoading,
  monitorError,
  monitorAutoRefresh,
  setMonitorAutoRefresh,
  monitorRefreshSeconds,
  fetchMonitorStats
}) {
  const [expandedSelectionIds, setExpandedSelectionIds] = useState(new Set());

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

  const parseName = (fullName) => {
    if (!fullName) return { name: '', booking: '' };
    const parts = fullName.split(' | Booking: ');
    if (parts.length > 1) {
      return { name: parts[0], booking: parts[1] };
    }
    return { name: fullName, booking: '' };
  };

  const formatUptime = (seconds) => {
    if (!seconds) return '0s';
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    
    const parts = [];
    if (d > 0) parts.push(`${d}d`);
    if (h > 0) parts.push(`${h}h`);
    if (m > 0) parts.push(`${m}m`);
    if (parts.length === 0 || s > 0) parts.push(`${s}s`);
    return parts.join(' ');
  };

  return (
    <>
      <div className="glow-bg"></div>
      <header className="admin-header-logo-title">
        <div className="admin-header-left">
          <img src={nexthouseLogo} alt="NextHouse Logo" className="admin-header-logo" />
          <h1 className="admin-header-title">NextHouse Instant Dashboard</h1>
        </div>
        <button onClick={handleLogout} className="btn btn-signout">
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign Out
        </button>
      </header>

      <main className="container">



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
          <button 
            className={`admin-tab-btn ${activeTab === 'monitor' ? 'active' : ''}`}
            onClick={() => setActiveTab('monitor')}
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            System Monitor
          </button>
        </div>

        {activeTab === 'stickers' && (
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
        )}

        {activeTab === 'prints' && (
          <div className="admin-dashboard">

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
            ) : (
              <div className="admin-selections-grid">
                {[...selections]
                  .sort((a, b) => b.id - a.id)
                  .map((sel) => (
                  <div key={sel.id} className="admin-selection-card">
                    <div className="admin-selection-header">
                      <div className="selection-info-group">
                        <div className="admin-selection-header-row">
                          <span className="admin-selection-title">Print Request</span>
                          <span className={`status-badge ${sel.status || 'pending'}`}>
                            {sel.status || 'pending'}
                          </span>
                        </div>
                        {sel.name && (() => {
                          const { name: parsedName, booking: parsedBooking } = parseName(sel.name);
                          return (
                            <>
                              <h3 className="selection-guest-title">
                                Selection for: <strong>{parsedName}</strong>
                              </h3>
                              {parsedBooking && (
                                <h4 className="selection-booking-title">
                                  Booking: <strong>{parsedBooking}</strong>
                                </h4>
                              )}
                            </>
                          );
                        })()}
                        <span className="selection-session-tag">Session #{sel.download_session_id}</span>
                      </div>
                      <span className="request-date">
                        {new Date(sel.created_at).toLocaleString('da-DK', { timeZone: 'Europe/Copenhagen' })}
                      </span>
                    </div>
                    
                    <div className="admin-selection-thumbs">
                      {sel.photos.slice(0, 8).map((photo) => (
                        <div key={photo.id} className="admin-selection-thumb" title="Photo thumbnail">
                          <img src={`${API_URL}/api/photos/${photo.id}/download`} alt="Photo" />
                        </div>
                      ))}
                      {sel.photos.length > 8 && (
                        <div className="admin-selection-thumb admin-selection-thumb-more">
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
                          onClick={() => handleTriggerPrint(sel.id)}
                          className={`btn admin-btn-action-print ${sel.status === 'failed' ? 'btn-danger' : 'btn-accent'} ${['queued', 'assigned', 'printing'].includes(sel.status) ? 'disabled' : ''}`}
                          disabled={['queued', 'assigned', 'printing'].includes(sel.status)}
                        >
                          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                          </svg>
                          {sel.status === 'queued' && 'Queued'}
                          {sel.status === 'assigned' && 'Assigned'}
                          {sel.status === 'printing' && 'Printing...'}
                          {sel.status === 'completed' && 'Reprint'}
                          {sel.status === 'failed' && 'Retry Print'}
                          {(!sel.status || sel.status === 'pending') && 'Print'}
                        </button>
                        <button 
                          onClick={() => toggleExpandSelection(sel.id)} 
                          className={`btn btn-secondary admin-btn-action-details ${expandedSelectionIds.has(sel.id) ? 'active' : ''}`}
                        >
                          {expandedSelectionIds.has(sel.id) ? 'Collapse' : 'Details'}
                        </button>
                        
                        {deletingSelectionId === sel.id ? (
                          <div className="confirm-delete-box admin-confirm-delete-box">
                            <button onClick={() => handleDeleteSelection(sel.id)} className="btn btn-danger admin-btn-confirm">
                              Confirm
                            </button>
                            <button onClick={() => setDeletingSelectionId(null)} className="btn btn-secondary admin-btn-cancel">
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => setDeletingSelectionId(sel.id)} className="btn btn-danger admin-btn-action-delete">
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

        {activeTab === 'monitor' && (
          <div className="admin-dashboard monitor-tab">
            <div className="admin-toolbar" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: 'var(--text-main)' }}>System Metrics</h2>
              
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <span className="session-info" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                  {monitorAutoRefresh ? (
                    <>
                      Auto-refresh in <strong className="countdown" style={{ marginLeft: '4px' }}>{monitorRefreshSeconds}s</strong>
                    </>
                  ) : (
                    'Auto-refresh paused'
                  )}
                </span>
                
                <button 
                  onClick={() => setMonitorAutoRefresh(!monitorAutoRefresh)} 
                  className={`btn ${monitorAutoRefresh ? 'btn-accent' : 'btn-secondary'}`}
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', height: 'auto' }}
                >
                  {monitorAutoRefresh ? 'Pause Auto' : 'Resume Auto'}
                </button>
                
                <button 
                  onClick={fetchMonitorStats} 
                  className="btn btn-secondary" 
                  disabled={monitorLoading}
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', height: 'auto', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <svg className={monitorLoading ? "spinner-rotate" : ""} width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                  </svg>
                  Refresh
                </button>
              </div>
            </div>

            {monitorError && (
              <div className="admin-upload-section" style={{ border: '1px solid rgba(239, 68, 68, 0.2)', background: 'rgba(239, 68, 68, 0.02)', padding: '1.5rem', color: '#ef4444', textAlign: 'center', borderRadius: '12px' }}>
                <p style={{ fontWeight: '500', marginBottom: '0.5rem' }}>Failed to retrieve system statistics</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>{monitorError}</p>
                <button onClick={fetchMonitorStats} className="btn btn-accent" style={{ display: 'inline-block', width: 'auto' }}>Try Again</button>
              </div>
            )}

            {monitorLoading && !monitorStats && (
              <div className="center-container" style={{ minHeight: '30vh' }}>
                <div className="spinner" style={{ width: '40px', height: '40px' }}></div>
                <p className="loading-text">Collecting system hardware and database metrics...</p>
              </div>
            )}

            {monitorStats && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginTop: '1rem' }}>
                
                {/* System Resource Gauges */}
                <div className="admin-upload-section" style={{ padding: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '500', marginBottom: '1.5rem', textAlign: 'left', color: 'var(--text-main)' }}>Hardware Resources</h3>
                  <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '1.5rem' }}>
                    
                    {/* CPU Gauge */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.015)', borderRadius: '12px', border: '1px solid var(--card-border)', minWidth: '160px', flex: '1 1 20%' }}>
                      <div style={{ position: 'relative', width: '100px', height: '100px' }}>
                        <svg width="100" height="100" style={{ transform: 'rotate(-90deg)' }}>
                          <circle cx="50" cy="50" r="40" fill="transparent" stroke="rgba(255,255,255,0.03)" strokeWidth="7" />
                          <circle cx="50" cy="50" r="40" fill="transparent" stroke={monitorStats.system.cpu_percent > 80 ? '#ef4444' : monitorStats.system.cpu_percent > 50 ? '#f59e0b' : '#3b82f6'} strokeWidth="7" strokeDasharray={251.2} strokeDashoffset={251.2 - (Math.min(monitorStats.system.cpu_percent, 100) / 100) * 251.2} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }} />
                        </svg>
                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                          <span style={{ fontSize: '1.3rem', fontWeight: '600' }}>{monitorStats.system.cpu_percent}%</span>
                        </div>
                      </div>
                      <span style={{ fontSize: '0.9rem', fontWeight: '600', marginTop: '0.8rem' }}>CPU Load</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>1m Load: {monitorStats.system.cpu_load_1m} ({monitorStats.system.cpu_cores} Cores)</span>
                    </div>

                    {/* Memory Gauge */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.015)', borderRadius: '12px', border: '1px solid var(--card-border)', minWidth: '160px', flex: '1 1 20%' }}>
                      <div style={{ position: 'relative', width: '100px', height: '100px' }}>
                        <svg width="100" height="100" style={{ transform: 'rotate(-90deg)' }}>
                          <circle cx="50" cy="50" r="40" fill="transparent" stroke="rgba(255,255,255,0.03)" strokeWidth="7" />
                          <circle cx="50" cy="50" r="40" fill="transparent" stroke={monitorStats.system.memory.percent > 85 ? '#ef4444' : monitorStats.system.memory.percent > 65 ? '#f59e0b' : '#10b981'} strokeWidth="7" strokeDasharray={251.2} strokeDashoffset={251.2 - (monitorStats.system.memory.percent / 100) * 251.2} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }} />
                        </svg>
                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                          <span style={{ fontSize: '1.3rem', fontWeight: '600' }}>{monitorStats.system.memory.percent}%</span>
                        </div>
                      </div>
                      <span style={{ fontSize: '0.9rem', fontWeight: '600', marginTop: '0.8rem' }}>Memory</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Used: {monitorStats.system.memory.used_gb} / {monitorStats.system.memory.total_gb} GB</span>
                    </div>

                    {/* Storage Uploads Gauge */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.015)', borderRadius: '12px', border: '1px solid var(--card-border)', minWidth: '160px', flex: '1 1 20%' }}>
                      <div style={{ position: 'relative', width: '100px', height: '100px' }}>
                        <svg width="100" height="100" style={{ transform: 'rotate(-90deg)' }}>
                          <circle cx="50" cy="50" r="40" fill="transparent" stroke="rgba(255,255,255,0.03)" strokeWidth="7" />
                          <circle cx="50" cy="50" r="40" fill="transparent" stroke={monitorStats.system.disk_uploads.percent > 90 ? '#ef4444' : monitorStats.system.disk_uploads.percent > 70 ? '#f59e0b' : '#10b981'} strokeWidth="7" strokeDasharray={251.2} strokeDashoffset={251.2 - (monitorStats.system.disk_uploads.percent / 100) * 251.2} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }} />
                        </svg>
                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                          <span style={{ fontSize: '1.3rem', fontWeight: '600' }}>{monitorStats.system.disk_uploads.percent}%</span>
                        </div>
                      </div>
                      <span style={{ fontSize: '0.9rem', fontWeight: '600', marginTop: '0.8rem' }}>Storage Space</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Free: {monitorStats.system.disk_uploads.free_gb} / {monitorStats.system.disk_uploads.total_gb} GB</span>
                    </div>

                  </div>
                </div>

                {/* Application Stats Grid */}
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '500', marginBottom: '1rem', textAlign: 'left', color: 'var(--text-main)' }}>Application Metrics</h3>
                  <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                    
                    {/* Photos Stat */}
                    <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '1rem', background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
                      <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ fontSize: '1.6rem', fontWeight: '700' }}>{monitorStats.database.photos_count}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Uploaded Photos</div>
                        <div style={{ fontSize: '0.75rem', color: '#3b82f6', fontWeight: '500', marginTop: '2px' }}>{monitorStats.database.photos_size_formatted}</div>
                      </div>
                    </div>

                    {/* Active Sessions Stat */}
                    <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '1rem', background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
                      <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                      </div>
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ fontSize: '1.6rem', fontWeight: '700' }}>{monitorStats.database.sessions_active}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Active Sessions</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>Total sessions: {monitorStats.database.sessions_count}</div>
                      </div>
                    </div>

                    {/* Stickers Stat */}
                    <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '1rem', background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
                      <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ fontSize: '1.6rem', fontWeight: '700' }}>{monitorStats.database.stickers_count}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Decorative Stickers</div>
                        <div style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: '500', marginTop: '2px' }}>{monitorStats.database.stickers_size_formatted}</div>
                      </div>
                    </div>

                    {/* Printers Stat */}
                    <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '1rem', background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
                      <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
                      </div>
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ fontSize: '1.6rem', fontWeight: '700' }}>{monitorStats.database.printers_active} / {monitorStats.database.printers_count}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Active Printers</div>
                        <div style={{ fontSize: '0.75rem', color: '#8b5cf6', fontWeight: '500', marginTop: '2px' }}>Seeded selections: {monitorStats.database.selections_count}</div>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Print Jobs Queue Breakdown */}
                <div className="admin-upload-section" style={{ padding: '1.5rem', textAlign: 'left' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '500', marginBottom: '1.25rem', color: 'var(--text-main)' }}>Print Jobs Queue Distribution</h3>
                  
                  {monitorStats.database.print_jobs.total === 0 ? (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '1rem' }}>
                      No print jobs have been queued yet.
                    </div>
                  ) : (
                    <div>
                      {/* Proportion Stack Bar */}
                      <div style={{ display: 'flex', height: '18px', width: '100%', borderRadius: '9px', overflow: 'hidden', background: 'rgba(255,255,255,0.02)', marginBottom: '1.5rem' }}>
                        {monitorStats.database.print_jobs.completed > 0 && (
                          <div style={{ width: `${(monitorStats.database.print_jobs.completed / monitorStats.database.print_jobs.total) * 100}%`, background: '#10b981', transition: 'width 0.5s ease' }} title={`Completed: ${monitorStats.database.print_jobs.completed}`} />
                        )}
                        {monitorStats.database.print_jobs.printing > 0 && (
                          <div style={{ width: `${(monitorStats.database.print_jobs.printing / monitorStats.database.print_jobs.total) * 100}%`, background: '#f59e0b', transition: 'width 0.5s ease' }} title={`Printing: ${monitorStats.database.print_jobs.printing}`} />
                        )}
                        {monitorStats.database.print_jobs.queued > 0 && (
                          <div style={{ width: `${(monitorStats.database.print_jobs.queued / monitorStats.database.print_jobs.total) * 100}%`, background: '#3b82f6', transition: 'width 0.5s ease' }} title={`Queued: ${monitorStats.database.print_jobs.queued}`} />
                        )}
                        {monitorStats.database.print_jobs.assigned > 0 && (
                          <div style={{ width: `${(monitorStats.database.print_jobs.assigned / monitorStats.database.print_jobs.total) * 100}%`, background: '#8b5cf6', transition: 'width 0.5s ease' }} title={`Assigned: ${monitorStats.database.print_jobs.assigned}`} />
                        )}
                        {monitorStats.database.print_jobs.failed > 0 && (
                          <div style={{ width: `${(monitorStats.database.print_jobs.failed / monitorStats.database.print_jobs.total) * 100}%`, background: '#ef4444', transition: 'width 0.5s ease' }} title={`Failed: ${monitorStats.database.print_jobs.failed}`} />
                        )}
                      </div>

                      {/* Status Legends Grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem' }}>
                        <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '8px' }}>
                          <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', marginRight: '6px' }}></span>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Completed</span>
                          <div style={{ fontSize: '1.2rem', fontWeight: '700', marginTop: '4px' }}>{monitorStats.database.print_jobs.completed}</div>
                        </div>

                        <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '8px' }}>
                          <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b', marginRight: '6px' }}></span>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Printing</span>
                          <div style={{ fontSize: '1.2rem', fontWeight: '700', marginTop: '4px' }}>{monitorStats.database.print_jobs.printing}</div>
                        </div>

                        <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '8px' }}>
                          <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6', marginRight: '6px' }}></span>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Queued</span>
                          <div style={{ fontSize: '1.2rem', fontWeight: '700', marginTop: '4px' }}>{monitorStats.database.print_jobs.queued}</div>
                        </div>

                        <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '8px' }}>
                          <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#8b5cf6', marginRight: '6px' }}></span>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Assigned</span>
                          <div style={{ fontSize: '1.2rem', fontWeight: '700', marginTop: '4px' }}>{monitorStats.database.print_jobs.assigned}</div>
                        </div>

                        <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '8px' }}>
                          <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', marginRight: '6px' }}></span>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Failed</span>
                          <div style={{ fontSize: '1.2rem', fontWeight: '700', marginTop: '4px' }}>{monitorStats.database.print_jobs.failed}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Uptime and Server Info */}
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  
                  {/* System Uptime */}
                  <div className="card" style={{ flex: '1 1 45%', padding: '1rem 1.5rem', background: 'var(--card-bg)', border: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>System Uptime</span>
                    <span style={{ fontSize: '1.4rem', fontWeight: '700', marginTop: '4px', color: '#10b981' }}>
                      {formatUptime(monitorStats.system.system_uptime)}
                    </span>
                  </div>

                  {/* App Uptime */}
                  <div className="card" style={{ flex: '1 1 45%', padding: '1rem 1.5rem', background: 'var(--card-bg)', border: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Application Uptime</span>
                    <span style={{ fontSize: '1.4rem', fontWeight: '700', marginTop: '4px', color: '#3b82f6' }}>
                      {formatUptime(monitorStats.system.app_uptime)}
                    </span>
                  </div>

                </div>

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
                <h2 className="admin-modal-title">Request Details</h2>
                {detailSelection.name && (() => {
                  const { name: parsedName, booking: parsedBooking } = parseName(detailSelection.name);
                  return (
                    <>
                      <h3 className="selection-guest-title modal-title">
                        Selection for: <strong>{parsedName}</strong>
                      </h3>
                      {parsedBooking && (
                        <h4 className="selection-booking-title modal-title">
                          Booking: <strong>{parsedBooking}</strong>
                        </h4>
                      )}
                    </>
                  );
                })()}
                <p className="subtitle admin-modal-subtitle">
                  Session ID: {detailSelection.download_session_id} | Submitted on: {new Date(detailSelection.created_at).toLocaleString('da-DK', { timeZone: 'Europe/Copenhagen' })}
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
            
            <div className="admin-modal-footer">
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
