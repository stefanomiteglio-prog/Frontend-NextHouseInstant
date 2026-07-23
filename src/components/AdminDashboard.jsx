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
  fetchMonitorStats,
  theme = 'system',
  toggleTheme
}) {
  const [expandedSelectionIds, setExpandedSelectionIds] = useState(new Set());
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const renderHistoryChart = () => {
    const historyData = monitorStats?.history || [];

    if (historyData.length === 0) {
      return (
        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '3rem' }}>
          No historical data recorded yet. Statistics will start appearing daily.
        </div>
      );
    }

    const width = 800;
    const height = 280;
    const paddingLeft = 40;
    const paddingRight = 20;
    const paddingTop = 20;
    const paddingBottom = 40;

    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    const maxVal = Math.max(
      10,
      ...historyData.map(d => Math.max(d.sessions_count || 0, d.selections_count || 0))
    );

    const points = historyData.map((d, i) => {
      const x = paddingLeft + (i / (historyData.length - 1 || 1)) * chartWidth;
      const ySessions = height - paddingBottom - ((d.sessions_count || 0) / maxVal) * chartHeight;
      const ySelections = height - paddingBottom - ((d.selections_count || 0) / maxVal) * chartHeight;
      return { x, ySessions, ySelections, date: d.date, raw: d };
    });

    const sessionsPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.ySessions}`).join(' ');
    const selectionsPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.ySelections}`).join(' ');

    const sessionsAreaPath = `${sessionsPath} L ${points[points.length - 1].x} ${height - paddingBottom} L ${points[0].x} ${height - paddingBottom} Z`;
    const selectionsAreaPath = `${selectionsPath} L ${points[points.length - 1].x} ${height - paddingBottom} L ${points[0].x} ${height - paddingBottom} Z`;

    const labelStep = Math.max(1, Math.floor(historyData.length / 5));
    const xLabels = points.filter((_, idx) => idx % labelStep === 0 || idx === points.length - 1);

    const gridLines = [0, 0.25, 0.5, 0.75, 1];

    const formatDate = (dateStr) => {
      try {
        const d = new Date(dateStr);
        return d.toLocaleDateString('da-DK', { day: '2-digit', month: 'short' });
      } catch {
        return dateStr;
      }
    };

    const formatTooltipDate = (dateStr) => {
      try {
        const d = new Date(dateStr);
        return d.toLocaleDateString('da-DK', { day: '2-digit', month: 'short', year: 'numeric' });
      } catch {
        return dateStr;
      }
    };

    // Calculate tooltip coordinates if active
    let tooltipX = 0;
    let tooltipY = 0;
    let showBelow = false;
    const tooltipWidth = 150;
    const tooltipHeight = 75;

    if (hoveredPoint) {
      tooltipX = hoveredPoint.x - tooltipWidth / 2;
      const minTooltipX = 10;
      const maxTooltipX = width - tooltipWidth - 10;
      if (tooltipX < minTooltipX) {
        tooltipX = minTooltipX;
      } else if (tooltipX > maxTooltipX) {
        tooltipX = maxTooltipX;
      }

      // Collect Y coordinates of only the dots actually rendered (count > 0)
      const activeYs = [];
      if (hoveredPoint.raw.sessions_count > 0) activeYs.push(hoveredPoint.ySessions);
      if (hoveredPoint.raw.selections_count > 0) activeYs.push(hoveredPoint.ySelections);

      const minY = activeYs.length > 0 ? Math.min(...activeYs) : height - paddingBottom;
      const maxY = activeYs.length > 0 ? Math.max(...activeYs) : height - paddingBottom;

      tooltipY = minY - tooltipHeight - 15;
      if (tooltipY < paddingTop) {
        tooltipY = maxY + 15;
        showBelow = true;
      }
    }

    return (
      <div className="admin-upload-section" style={{ padding: '1.5rem', textAlign: 'left', marginTop: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ padding: '0.4rem', borderRadius: '8px', background: 'rgba(168, 85, 247, 0.15)', color: '#a855f7', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
            </div>
            <h3 className="admin-subsection-title">
              30-Day Activity History
            </h3>
          </div>
          <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '3px', background: '#3b82f6' }}></span>
              <span className="chart-legend-text">Sessions Created</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '3px', background: '#a855f7' }}></span>
              <span className="chart-legend-text">Print Requests</span>
            </div>
          </div>
        </div>

        <div style={{ width: '100%', overflowX: 'auto', position: 'relative' }}>
          <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', minWidth: '600px', height: 'auto', display: 'block' }}>
            <defs>
              <linearGradient id="sessionsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="selectionsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a855f7" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#a855f7" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {gridLines.map((ratio, i) => {
              const y = height - paddingBottom - ratio * chartHeight;
              const value = Math.round(ratio * maxVal);
              return (
                <g key={i}>
                  <line
                    x1={paddingLeft}
                    y1={y}
                    x2={width - paddingRight}
                    y2={y}
                    stroke="rgba(0, 0, 0, 0.06)"
                    strokeWidth="1"
                    strokeDasharray={ratio === 0 ? "0" : "4 4"}
                  />
                  <text
                    x={paddingLeft - 8}
                    y={y + 4}
                    fill="#64748b"
                    fontSize="10"
                    fontWeight="500"
                    fontFamily="'Inter', sans-serif"
                    textAnchor="end"
                  >
                    {value}
                  </text>
                </g>
              );
            })}

            {/* Vertical hover guide line */}
            {hoveredPoint && (
              <line
                x1={hoveredPoint.x}
                y1={paddingTop}
                x2={hoveredPoint.x}
                y2={height - paddingBottom}
                stroke="#cbd5e1"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                pointerEvents="none"
              />
            )}

            <path d={sessionsAreaPath} fill="url(#sessionsGrad)" />
            <path d={selectionsAreaPath} fill="url(#selectionsGrad)" />

            <path d={sessionsPath} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d={selectionsPath} fill="none" stroke="#a855f7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

            {/* Interactive Circles / Dots */}
            {points.map((p, idx) => {
              const isHovered = hoveredPoint && hoveredPoint.date === p.date;
              return (
                <g key={idx}>
                  {p.raw.sessions_count > 0 && (
                    <circle
                      cx={p.x}
                      cy={p.ySessions}
                      r={isHovered ? "6" : "4"}
                      fill="#ffffff"
                      stroke="#3b82f6"
                      strokeWidth={isHovered ? "3" : "2"}
                      style={{ transition: 'all 0.1s ease' }}
                    />
                  )}
                  {p.raw.selections_count > 0 && (
                    <circle
                      cx={p.x}
                      cy={p.ySelections}
                      r={isHovered ? "6" : "4"}
                      fill="#ffffff"
                      stroke="#a855f7"
                      strokeWidth={isHovered ? "3" : "2"}
                      style={{ transition: 'all 0.1s ease' }}
                    />
                  )}
                </g>
              );
            })}

            {/* X Axis Labels */}
            {xLabels.map((p, idx) => (
              <text
                key={idx}
                x={p.x}
                y={height - 12}
                fill="#64748b"
                fontSize="10"
                fontWeight="500"
                fontFamily="'Inter', sans-serif"
                textAnchor="middle"
              >
                {formatDate(p.date)}
              </text>
            ))}

            {/* Invisible hover zones/bars */}
            {points.map((p, idx) => {
              const colWidth = chartWidth / (points.length - 1 || 1);
              return (
                <rect
                  key={`hover-zone-${idx}`}
                  x={p.x - colWidth / 2}
                  y={paddingTop}
                  width={colWidth}
                  height={chartHeight}
                  fill="transparent"
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={() => setHoveredPoint(p)}
                  onMouseMove={() => setHoveredPoint(p)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              );
            })}

            {/* Tooltip Group */}
            {hoveredPoint && (
              <g style={{ pointerEvents: 'none' }}>
                {/* Tooltip Background Card with subtle shadow */}
                <rect
                  x={tooltipX}
                  y={tooltipY}
                  width={tooltipWidth}
                  height={tooltipHeight}
                  rx="8"
                  ry="8"
                  fill="#ffffff"
                  stroke="#e2e8f0"
                  strokeWidth="1.5"
                  style={{ filter: 'drop-shadow(0 4px 10px rgba(0, 0, 0, 0.1))' }}
                />

                {/* Tooltip Caret */}
                {showBelow ? (
                  <polygon
                    points={`${hoveredPoint.x},${tooltipY} ${hoveredPoint.x - 6},${tooltipY - 6} ${hoveredPoint.x + 6},${tooltipY - 6}`}
                    fill="#ffffff"
                    stroke="#e2e8f0"
                    strokeWidth="1.5"
                  />
                ) : (
                  <polygon
                    points={`${hoveredPoint.x},${tooltipY + tooltipHeight} ${hoveredPoint.x - 6},${tooltipY + tooltipHeight + 6} ${hoveredPoint.x + 6},${tooltipY + tooltipHeight + 6}`}
                    fill="#ffffff"
                    stroke="#e2e8f0"
                    strokeWidth="1.5"
                  />
                )}
                {/* Clean Caret Base Cover */}
                {showBelow ? (
                  <polygon
                    points={`${hoveredPoint.x - 5},${tooltipY} ${hoveredPoint.x + 5},${tooltipY} ${hoveredPoint.x},${tooltipY + 1}`}
                    fill="#ffffff"
                  />
                ) : (
                  <polygon
                    points={`${hoveredPoint.x - 5},${tooltipY + tooltipHeight} ${hoveredPoint.x + 5},${tooltipY + tooltipHeight} ${hoveredPoint.x},${tooltipY + tooltipHeight - 1}`}
                    fill="#ffffff"
                  />
                )}

                {/* Tooltip Header Date */}
                <text
                  x={tooltipX + 12}
                  y={tooltipY + 20}
                  fontSize="11.5"
                  fontWeight="700"
                  fill="#1e293b"
                  fontFamily="'Inter', sans-serif"
                >
                  {formatTooltipDate(hoveredPoint.date)}
                </text>

                {/* Divider Line */}
                <line
                  x1={tooltipX + 12}
                  y1={tooltipY + 28}
                  x2={tooltipX + tooltipWidth - 12}
                  y2={tooltipY + 28}
                  stroke="#f1f5f9"
                  strokeWidth="1.2"
                />

                {/* Sessions Detail Row */}
                <circle
                  cx={tooltipX + 18}
                  cy={tooltipY + 42}
                  r="3.5"
                  fill="#3b82f6"
                />
                <text
                  x={tooltipX + 28}
                  y={tooltipY + 45}
                  fontSize="10"
                  fontWeight="500"
                  fill="#64748b"
                  fontFamily="'Inter', sans-serif"
                >
                  Sessions:
                </text>
                <text
                  x={tooltipX + tooltipWidth - 14}
                  y={tooltipY + 45}
                  fontSize="10.5"
                  fontWeight="700"
                  fill="#1e293b"
                  fontFamily="'Inter', sans-serif"
                  textAnchor="end"
                >
                  {hoveredPoint.raw.sessions_count || 0}
                </text>

                {/* Selections/Prints Detail Row */}
                <circle
                  cx={tooltipX + 18}
                  cy={tooltipY + 58}
                  r="3.5"
                  fill="#a855f7"
                />
                <text
                  x={tooltipX + 28}
                  y={tooltipY + 61}
                  fontSize="10"
                  fontWeight="500"
                  fill="#64748b"
                  fontFamily="'Inter', sans-serif"
                >
                  Prints:
                </text>
                <text
                  x={tooltipX + tooltipWidth - 14}
                  y={tooltipY + 61}
                  fontSize="10.5"
                  fontWeight="700"
                  fill="#1e293b"
                  fontFamily="'Inter', sans-serif"
                  textAnchor="end"
                >
                  {hoveredPoint.raw.selections_count || 0}
                </text>
              </g>
            )}
          </svg>
        </div>
      </div>
    );
  };

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



  return (
    <>
      <div className="glow-bg"></div>
      <header className="admin-header-logo-title">
        <div className="admin-header-left">
          <img src={nexthouseLogo} alt="NextHouse Logo" className="admin-header-logo" />
          <h1 className="admin-header-title">NextHouse Instant Dashboard</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {toggleTheme && (
            <button
              type="button"
              onClick={toggleTheme}
              className="theme-toggle-btn"
              title={`Theme: ${theme}. Click to switch theme.`}
            >
              {theme === 'system' ? (
                <>
                  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>Auto</span>
                </>
              ) : theme === 'dark' ? (
                <>
                  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                  <span>Dark</span>
                </>
              ) : (
                <>
                  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span>Light</span>
                </>
              )}
            </button>
          )}
          <button onClick={handleLogout} className="btn btn-signout">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </div>
      </header>

      <main className="container">



        {/* Admin Navigation Tabs */}
        <div className="admin-tabs">
          <button
            className={`admin-tab-btn ${activeTab === 'monitor' ? 'active' : ''}`}
            onClick={() => setActiveTab('monitor')}
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            System Monitor
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

            <h2 className="admin-section-title" style={{ marginTop: '1.5rem', marginBottom: '1rem', textAlign: 'left' }}>Uploaded Stickers</h2>

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
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ padding: '0.5rem', borderRadius: '12px', background: 'rgba(249, 115, 22, 0.15)', color: 'var(--primary)', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 0 12px rgba(249, 115, 22, 0.2)' }}>
                  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h2 className="admin-section-title">System Metrics</h2>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <span className="session-info" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                  Auto-refresh in <strong className="countdown" style={{ marginLeft: '4px' }}>{monitorRefreshSeconds}s</strong>
                </span>

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

                {/* Monthly History SVG Chart */}
                {renderHistoryChart()}

                {/* Printer Status Section */}
                <div className="admin-upload-section" style={{ padding: '1.5rem', textAlign: 'left' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
                    <div style={{ padding: '0.4rem', borderRadius: '8px', background: monitorStats.database.printers_active > 0 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)', color: monitorStats.database.printers_active > 0 ? '#10b981' : '#ef4444', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                      </svg>
                    </div>
                    <h3 className="admin-subsection-title">Printer Status</h3>
                  </div>

                  <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '1.25rem', background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '12px' }}>
                    <div style={{ padding: '0.85rem', borderRadius: '12px', background: monitorStats.database.printers_active > 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: monitorStats.database.printers_active > 0 ? '#10b981' : '#ef4444', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                      </svg>
                    </div>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: '1.35rem', fontWeight: '700', color: monitorStats.database.printers_active > 0 ? '#10b981' : '#ef4444', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: monitorStats.database.printers_active > 0 ? '#10b981' : '#ef4444', display: 'inline-block' }}></span>
                        {monitorStats.database.printers_active > 0 ? 'Printer Active' : 'Printer Inactive'} ({monitorStats.database.printers_active} / {monitorStats.database.printers_count})
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        {monitorStats.database.printers_active > 0 ? 'Printer is online and operational.' : 'No active printers detected.'}
                      </div>
                    </div>
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
