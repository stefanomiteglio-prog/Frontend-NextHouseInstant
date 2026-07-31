import { useState, useEffect, useCallback } from 'react';
import nexthouseLogo from '../assets/nexthouse_logo.png';
import { useAdminAuth } from '../hooks/useAdminAuth';

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
  const { authenticatedFetch } = useAdminAuth();
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [requirePrintPin, setRequirePrintPin] = useState(true);
  const [printPin, setPrintPin] = useState('2314');
  const [settingsToast, setSettingsToast] = useState('');
  const [expandedSelectionIds, setExpandedSelectionIds] = useState(new Set());
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [manualRefreshingMonitor, setManualRefreshingMonitor] = useState(false);
  const [manualRefreshingPrints, setManualRefreshingPrints] = useState(false);

  const fetchSettings = useCallback(async () => {
    setSettingsLoading(true);
    try {
      const res = await authenticatedFetch(`${API_URL}/api/settings`);
      if (res.ok) {
        const data = await res.json();
        setRequirePrintPin(data.require_print_pin);
        setPrintPin(data.print_pin || '2314');
      }
    } catch (err) {
      console.error("Error fetching settings:", err);
    } finally {
      setSettingsLoading(false);
    }
  }, [authenticatedFetch, API_URL]);

  useEffect(() => {
    if (activeTab === 'settings') {
      fetchSettings();
    }
  }, [activeTab, fetchSettings]);

  const handleSaveSettings = async (newRequirePin, newPin) => {
    setSettingsSaving(true);
    try {
      const res = await authenticatedFetch(`${API_URL}/api/settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          require_print_pin: newRequirePin,
          print_pin: newPin
        })
      });
      if (res.ok) {
        const data = await res.json();
        setRequirePrintPin(data.require_print_pin);
        setPrintPin(data.print_pin);
        setSettingsToast('Settings updated successfully!');
        setTimeout(() => setSettingsToast(''), 4000);
      } else {
        const err = await res.json();
        alert(`Error: ${err.detail || 'Unable to save settings.'}`);
      }
    } catch (err) {
      console.error("Error updating settings:", err);
      alert("Connection error while saving.");
    } finally {
      setSettingsSaving(false);
    }
  };

  const handleManualRefreshMonitor = async () => {
    if (manualRefreshingMonitor || monitorLoading) return;
    setManualRefreshingMonitor(true);
    const startTime = Date.now();
    try {
      await fetchMonitorStats();
    } catch (e) {
      console.error(e);
    } finally {
      const elapsed = Date.now() - startTime;
      const minDelay = Math.max(0, 800 - elapsed);
      setTimeout(() => {
        setManualRefreshingMonitor(false);
      }, minDelay);
    }
  };

  const handleManualRefreshPrints = async () => {
    if (manualRefreshingPrints || selectionsLoading) return;
    setManualRefreshingPrints(true);
    const startTime = Date.now();
    try {
      await fetchSelections(filterName);
    } catch (e) {
      console.error(e);
    } finally {
      const elapsed = Date.now() - startTime;
      const minDelay = Math.max(0, 800 - elapsed);
      setTimeout(() => {
        setManualRefreshingPrints(false);
      }, minDelay);
    }
  };

  const renderHistoryChart = () => {
    const rawHistoryData = monitorStats?.history || [];

    if (!rawHistoryData || rawHistoryData.length === 0) {
      return (
        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '3rem' }}>
          No historical data recorded yet. Statistics will start appearing daily.
        </div>
      );
    }

    const getDayKey = (dateStr) => {
      if (!dateStr) return '';
      const parts = String(dateStr).split('T')[0].split('-');
      if (parts.length === 3) {
        return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
      }
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return String(dateStr);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    // Index raw history data by YYYY-MM-DD
    const historyMap = {};
    const parsedDates = [];

    rawHistoryData.forEach(item => {
      const key = getDayKey(item.date);
      if (key) {
        historyMap[key] = item;
      }
      const d = new Date(item.date);
      if (!isNaN(d.getTime())) {
        parsedDates.push(d);
      }
    });

    // End date: today at end of day, or max date in data if in future
    let endDate = new Date();
    endDate.setHours(23, 59, 59, 999);
    if (parsedDates.length > 0) {
      const maxParsed = new Date(Math.max(...parsedDates));
      if (maxParsed > endDate) endDate = new Date(maxParsed);
    }

    // Start date: 29 days before end date (30 days window), or min date in data if earlier
    let startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 29);
    startDate.setHours(0, 0, 0, 0);
    if (parsedDates.length > 0) {
      const minParsed = new Date(Math.min(...parsedDates));
      minParsed.setHours(0, 0, 0, 0);
      if (minParsed < startDate) {
        startDate = new Date(minParsed);
      }
    }

    // Fill continuous sequence of days so days without data are included
    const historyData = [];
    let curr = new Date(startDate);
    while (curr <= endDate) {
      const year = curr.getFullYear();
      const month = String(curr.getMonth() + 1).padStart(2, '0');
      const day = String(curr.getDate()).padStart(2, '0');
      const key = `${year}-${month}-${day}`;
      const existing = historyMap[key];

      const sCount = existing ? (existing.sessions_count || 0) : 0;
      const pCount = existing ? (existing.selections_count || 0) : 0;

      historyData.push({
        date: key,
        sessions_count: sCount,
        selections_count: pCount,
        hasData: sCount > 0 || pCount > 0
      });

      curr.setDate(curr.getDate() + 1);
    }

    const width = 800;
    const height = 280;
    const paddingLeft = 40;
    const paddingRight = 20;
    const paddingTop = 25;
    const paddingBottom = 40;

    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    const maxVal = Math.max(
      10,
      ...historyData.map(d => Math.max(d.sessions_count, d.selections_count))
    );

    const n = historyData.length;
    const slotWidth = chartWidth / n;
    const barGap = 1.5;
    const maxGroupWidth = slotWidth * 0.75;
    const singleBarWidth = Math.max(2.5, Math.floor((maxGroupWidth - barGap) / 2));
    const totalGroupWidth = singleBarWidth * 2 + barGap;

    const points = historyData.map((d, i) => {
      const slotX = paddingLeft + i * slotWidth;
      const xCenter = slotX + slotWidth / 2;
      const xSessions = xCenter - totalGroupWidth / 2;
      const xSelections = xSessions + singleBarWidth + barGap;

      const sessionsH = (d.sessions_count / maxVal) * chartHeight;
      const selectionsH = (d.selections_count / maxVal) * chartHeight;

      const ySessions = height - paddingBottom - sessionsH;
      const ySelections = height - paddingBottom - selectionsH;

      return {
        xCenter,
        slotX,
        slotWidth,
        xSessions,
        xSelections,
        singleBarWidth,
        sessionsH,
        selectionsH,
        ySessions,
        ySelections,
        date: d.date,
        raw: d
      };
    });

    const labelStep = Math.max(1, Math.floor(n / 6));
    const xLabels = points.filter((_, idx) => idx % labelStep === 0 || idx === n - 1);

    const gridLines = [0, 0.25, 0.5, 0.75, 1];

    const formatDate = (dateStr) => {
      try {
        const parts = String(dateStr).split('-');
        if (parts.length === 3) {
          const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
          return d.toLocaleDateString('da-DK', { day: '2-digit', month: 'short' });
        }
        const d = new Date(dateStr);
        return d.toLocaleDateString('da-DK', { day: '2-digit', month: 'short' });
      } catch {
        return dateStr;
      }
    };

    const formatTooltipDate = (dateStr) => {
      try {
        const parts = String(dateStr).split('-');
        if (parts.length === 3) {
          const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
          return d.toLocaleDateString('da-DK', { day: '2-digit', month: 'short', year: 'numeric' });
        }
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
    const tooltipWidth = 155;
    const hasNoDataNote = hoveredPoint && !hoveredPoint.raw.hasData;
    const tooltipHeight = hasNoDataNote ? 90 : 76;

    if (hoveredPoint) {
      tooltipX = hoveredPoint.xCenter - tooltipWidth / 2;
      const minTooltipX = 10;
      const maxTooltipX = width - tooltipWidth - 10;
      if (tooltipX < minTooltipX) {
        tooltipX = minTooltipX;
      } else if (tooltipX > maxTooltipX) {
        tooltipX = maxTooltipX;
      }

      const maxBarH = Math.max(hoveredPoint.sessionsH, hoveredPoint.selectionsH);
      const topYOfBars = height - paddingBottom - maxBarH;

      tooltipY = topYOfBars - tooltipHeight - 12;

      if (tooltipY < paddingTop) {
        tooltipY = topYOfBars + 12;
        showBelow = true;
      }

      const minTooltipY = 10;
      const maxTooltipY = height - tooltipHeight - 10;
      if (tooltipY < minTooltipY) {
        tooltipY = minTooltipY;
      } else if (tooltipY > maxTooltipY) {
        tooltipY = maxTooltipY;
      }
    }

    return (
      <div className="admin-upload-section" style={{ padding: '1.5rem', textAlign: 'left', marginTop: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ padding: '0.4rem', borderRadius: '8px', background: 'rgba(168, 85, 247, 0.15)', color: '#a855f7', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="admin-subsection-title">
              30-Day Activity History (Istogramma)
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
              <linearGradient id="barSessionsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#60a5fa" />
                <stop offset="100%" stopColor="#2563eb" />
              </linearGradient>
              <linearGradient id="barSelectionsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#c084fc" />
                <stop offset="100%" stopColor="#9333ea" />
              </linearGradient>
              <linearGradient id="hoverColGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(59, 130, 246, 0.12)" />
                <stop offset="100%" stopColor="rgba(59, 130, 246, 0.02)" />
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

            {/* Column Hover Background Highlight */}
            {points.map((p, idx) => {
              const isHovered = hoveredPoint && hoveredPoint.date === p.date;
              if (!isHovered) return null;
              return (
                <rect
                  key={`hover-bg-${idx}`}
                  x={p.slotX}
                  y={paddingTop}
                  width={p.slotWidth}
                  height={chartHeight}
                  fill="url(#hoverColGrad)"
                  rx="4"
                  pointerEvents="none"
                />
              );
            })}

            {/* Histogram Bars */}
            {points.map((p, idx) => {
              const isHovered = hoveredPoint && hoveredPoint.date === p.date;
              const opacity = hoveredPoint ? (isHovered ? 1 : 0.65) : 1;

              return (
                <g key={idx} style={{ transition: 'opacity 0.15s ease' }} opacity={opacity}>
                  {/* Sessions Bar */}
                  {p.raw.sessions_count > 0 ? (
                    <rect
                      x={p.xSessions}
                      y={p.ySessions}
                      width={p.singleBarWidth}
                      height={Math.max(3, p.sessionsH)}
                      fill="url(#barSessionsGrad)"
                      rx={Math.min(3, p.sessionsH / 2)}
                      ry={Math.min(3, p.sessionsH / 2)}
                    />
                  ) : (
                    /* Subtle 2px zero indicator tick for 0 sessions */
                    <rect
                      x={p.xSessions}
                      y={height - paddingBottom - 2}
                      width={p.singleBarWidth}
                      height={2}
                      fill="rgba(59, 130, 246, 0.35)"
                      rx="1"
                      ry="1"
                    />
                  )}

                  {/* Selections / Print Requests Bar */}
                  {p.raw.selections_count > 0 ? (
                    <rect
                      x={p.xSelections}
                      y={p.ySelections}
                      width={p.singleBarWidth}
                      height={Math.max(3, p.selectionsH)}
                      fill="url(#barSelectionsGrad)"
                      rx={Math.min(3, p.selectionsH / 2)}
                      ry={Math.min(3, p.selectionsH / 2)}
                    />
                  ) : (
                    /* Subtle 2px zero indicator tick for 0 prints */
                    <rect
                      x={p.xSelections}
                      y={height - paddingBottom - 2}
                      width={p.singleBarWidth}
                      height={2}
                      fill="rgba(168, 85, 247, 0.35)"
                      rx="1"
                      ry="1"
                    />
                  )}
                </g>
              );
            })}

            {/* X Axis Labels */}
            {xLabels.map((p, idx) => (
              <text
                key={idx}
                x={p.xCenter}
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

            {/* Invisible hover zones/bars for smooth mouse tracking */}
            {points.map((p, idx) => (
              <rect
                key={`hover-zone-${idx}`}
                x={p.slotX}
                y={paddingTop}
                width={p.slotWidth}
                height={chartHeight}
                fill="transparent"
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHoveredPoint(p)}
                onMouseMove={() => setHoveredPoint(p)}
                onMouseLeave={() => setHoveredPoint(null)}
              />
            ))}

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
                    points={`${hoveredPoint.xCenter},${tooltipY - 6} ${hoveredPoint.xCenter - 6},${tooltipY} ${hoveredPoint.xCenter + 6},${tooltipY}`}
                    fill="#ffffff"
                    stroke="#e2e8f0"
                    strokeWidth="1.5"
                  />
                ) : (
                  <polygon
                    points={`${hoveredPoint.xCenter},${tooltipY + tooltipHeight + 6} ${hoveredPoint.xCenter - 6},${tooltipY + tooltipHeight} ${hoveredPoint.xCenter + 6},${tooltipY + tooltipHeight}`}
                    fill="#ffffff"
                    stroke="#e2e8f0"
                    strokeWidth="1.5"
                  />
                )}
                {/* Clean Caret Base Cover */}
                {showBelow ? (
                  <polygon
                    points={`${hoveredPoint.xCenter - 5},${tooltipY} ${hoveredPoint.xCenter + 5},${tooltipY} ${hoveredPoint.xCenter},${tooltipY + 1}`}
                    fill="#ffffff"
                  />
                ) : (
                  <polygon
                    points={`${hoveredPoint.xCenter - 5},${tooltipY + tooltipHeight} ${hoveredPoint.xCenter + 5},${tooltipY + tooltipHeight} ${hoveredPoint.xCenter},${tooltipY + tooltipHeight - 1}`}
                    fill="#ffffff"
                  />
                )}

                {/* Tooltip Header Date */}
                <text
                  x={tooltipX + 12}
                  y={tooltipY + 18}
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
                  y1={tooltipY + 25}
                  x2={tooltipX + tooltipWidth - 12}
                  y2={tooltipY + 25}
                  stroke="#f1f5f9"
                  strokeWidth="1.2"
                />

                {/* Sessions Detail Row */}
                <circle
                  cx={tooltipX + 18}
                  cy={tooltipY + 38}
                  r="3.5"
                  fill="#3b82f6"
                />
                <text
                  x={tooltipX + 28}
                  y={tooltipY + 41}
                  fontSize="10"
                  fontWeight="500"
                  fill="#64748b"
                  fontFamily="'Inter', sans-serif"
                >
                  Sessions:
                </text>
                <text
                  x={tooltipX + tooltipWidth - 14}
                  y={tooltipY + 41}
                  fontSize="10.5"
                  fontWeight="700"
                  fill="#1e293b"
                  fontFamily="'Inter', sans-serif"
                  textAnchor="end"
                >
                  {hoveredPoint.raw.sessions_count}
                </text>

                {/* Selections/Prints Detail Row */}
                <circle
                  cx={tooltipX + 18}
                  cy={tooltipY + 54}
                  r="3.5"
                  fill="#a855f7"
                />
                <text
                  x={tooltipX + 28}
                  y={tooltipY + 57}
                  fontSize="10"
                  fontWeight="500"
                  fill="#64748b"
                  fontFamily="'Inter', sans-serif"
                >
                  Prints:
                </text>
                <text
                  x={tooltipX + tooltipWidth - 14}
                  y={tooltipY + 57}
                  fontSize="10.5"
                  fontWeight="700"
                  fill="#1e293b"
                  fontFamily="'Inter', sans-serif"
                  textAnchor="end"
                >
                  {hoveredPoint.raw.selections_count}
                </text>

                {/* No activity indicator line if 0 activity */}
                {!hoveredPoint.raw.hasData && (
                  <text
                    x={tooltipX + 12}
                    y={tooltipY + 74}
                    fontSize="9"
                    fontWeight="500"
                    fill="#94a3b8"
                    fontStyle="italic"
                    fontFamily="'Inter', sans-serif"
                  >
                    Nessuna attività registrata
                  </text>
                )}
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
        <div className="admin-tabs" style={{ marginBottom: activeTab === 'stickers' ? '0.4rem' : undefined }}>
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
          <button
            className={`admin-tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Settings
          </button>
        </div>

        {activeTab === 'stickers' && (
          <>
            {/* Compact Informational Banner */}
            <div
              style={{
                padding: '0.4rem 0.85rem',
                margin: '0 0 0.4rem 0',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                background: 'rgba(59, 130, 246, 0.06)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                borderRadius: '8px',
                textAlign: 'left'
              }}
            >
              <div
                style={{
                  padding: '0.3rem',
                  borderRadius: '6px',
                  background: 'rgba(59, 130, 246, 0.15)',
                  color: '#3b82f6',
                  display: 'flex',
                  justify: 'center',
                  alignItems: 'center',
                  flexShrink: 0
                }}
              >
                <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.3' }}>
                <strong style={{ color: 'var(--text-main)', marginRight: '6px' }}>Sticker Management:</strong>
                Upload custom stickers and graphic overlays that guests can select to decorate their photobooth photos.
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
                {filterName && (
                  <button
                    onClick={() => {
                      setFilterName('');
                    }}
                    className="btn btn-secondary"
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', height: 'auto' }}
                  >
                    Reset
                  </button>
                )}
                <button
                  onClick={handleManualRefreshPrints}
                  className={`btn btn-secondary btn-refresh ${selectionsLoading || manualRefreshingPrints ? 'is-refreshing' : ''}`}
                  disabled={selectionsLoading || manualRefreshingPrints}
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', height: 'auto', display: 'flex', alignItems: 'center', gap: '4px' }}
                  title="Refresh List"
                >
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
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
                <button
                  onClick={handleManualRefreshMonitor}
                  className={`btn btn-secondary btn-refresh ${monitorLoading || manualRefreshingMonitor ? 'is-refreshing' : ''}`}
                  disabled={monitorLoading || manualRefreshingMonitor}
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', height: 'auto', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <div style={{ padding: '0.4rem', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
                      </div>
                      <h3 className="admin-subsection-title">Printer Status</h3>
                    </div>
                  </div>

                  {(() => {
                    const isActive = (monitorStats?.database?.printers_active || 0) > 0;
                    const isPrinting = (monitorStats?.database?.print_jobs?.printing || 0) > 0;
                    const isQueued = ((monitorStats?.database?.print_jobs?.queued || 0) > 0 || (monitorStats?.database?.print_jobs?.assigned || 0) > 0);

                    let statusState = 'Active';
                    let statusColor = '#10b981';
                    let statusBg = 'rgba(16, 185, 129, 0.08)';
                    let statusBorder = 'rgba(16, 185, 129, 0.25)';
                    let description = 'Printer is online and ready.';

                    if (!isActive) {
                      statusState = 'Offline';
                      statusColor = '#ef4444';
                      statusBg = 'rgba(239, 68, 68, 0.08)';
                      statusBorder = 'rgba(239, 68, 68, 0.25)';
                      description = 'Printer is offline or disconnected.';
                    } else if (isPrinting) {
                      statusState = 'Printing';
                      statusColor = '#f59e0b';
                      statusBg = 'rgba(245, 158, 11, 0.08)';
                      statusBorder = 'rgba(245, 158, 11, 0.25)';
                      description = 'Printer is currently printing a document.';
                    } else if (isQueued) {
                      statusState = 'Queued';
                      statusColor = '#3b82f6';
                      statusBg = 'rgba(59, 130, 246, 0.08)';
                      statusBorder = 'rgba(59, 130, 246, 0.25)';
                      description = 'Print job is queued and waiting to process.';
                    }

                    return (
                      <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '1.25rem', background: 'var(--card-bg)', border: `1px solid ${statusBorder}`, borderRadius: '12px' }}>
                        <div style={{ padding: '0.85rem', borderRadius: '12px', background: statusBg, color: statusColor, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                          <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                          </svg>
                        </div>
                        <div style={{ textAlign: 'left' }}>
                          <div style={{ fontSize: '1.35rem', fontWeight: '700', color: statusColor, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: statusColor, display: 'inline-block' }}></span>
                            {statusState}
                          </div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                            {description}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>

              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="card" style={{ padding: '2rem', marginTop: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                  Print Settings
                </h2>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  Manage security requirements for guest print request submissions.
                </p>
              </div>
              {settingsToast && (
                <div style={{
                  padding: '0.6rem 1.2rem',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  borderRadius: '8px',
                  color: '#10b981',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {settingsToast}
                </div>
              )}
            </div>

            {settingsLoading ? (
              <div style={{ padding: '3rem', textAlign: 'center' }}>
                <div className="spinner" style={{ margin: '0 auto 1rem auto' }}></div>
                <p style={{ color: 'var(--text-muted)' }}>Loading settings...</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {/* Requirement Toggle Card */}
                <div style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--card-border)',
                  borderRadius: '16px',
                  padding: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1.5rem',
                  flexWrap: 'wrap'
                }}>
                  <div style={{ flex: 1, minWidth: '260px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '9999px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        background: requirePrintPin ? 'rgba(249, 115, 22, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                        color: requirePrintPin ? '#f97316' : '#10b981',
                        border: `1px solid ${requirePrintPin ? 'rgba(249, 115, 22, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`
                      }}>
                        {requirePrintPin ? 'PIN Required' : 'PIN Disabled (Direct access)'}
                      </span>
                    </div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                      Require PIN for print requests
                    </h3>
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                      When enabled, guests must enter a 4-digit PIN to confirm and submit print requests. When disabled, any guest with a valid link can send requests without entering a PIN.
                    </p>
                  </div>

                  <label style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}>
                    <input
                      type="checkbox"
                      checked={requirePrintPin}
                      onChange={(e) => {
                        const nextVal = e.target.checked;
                        setRequirePrintPin(nextVal);
                        handleSaveSettings(nextVal, printPin);
                      }}
                      style={{ display: 'none' }}
                    />
                    <div style={{
                      width: '56px',
                      height: '30px',
                      borderRadius: '9999px',
                      background: requirePrintPin ? '#f97316' : 'rgba(255, 255, 255, 0.15)',
                      position: 'relative',
                      transition: 'all 0.3s ease',
                      boxShadow: requirePrintPin ? '0 0 12px rgba(249, 115, 22, 0.4)' : 'none'
                    }}>
                      <div style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: '#ffffff',
                        position: 'absolute',
                        top: '3px',
                        left: requirePrintPin ? '29px' : '3px',
                        transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                      }} />
                    </div>
                  </label>
                </div>

                {/* PIN Code Configuration */}
                {requirePrintPin && (
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--card-border)',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem'
                  }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>
                      Print PIN Code
                    </h3>
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: 0 }}>
                      Enter the 4-digit PIN provided to guests by staff at reception.
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={4}
                        value={printPin}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                          setPrintPin(val);
                        }}
                        style={{
                          width: '140px',
                          padding: '0.65rem 1rem',
                          fontSize: '1.2rem',
                          fontWeight: 700,
                          letterSpacing: '0.2rem',
                          textAlign: 'center',
                          background: 'rgba(0, 0, 0, 0.3)',
                          border: '1px solid var(--card-border)',
                          borderRadius: '10px',
                          color: 'var(--text-main)'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveSettings(requirePrintPin, printPin)}
                        disabled={settingsSaving || printPin.length !== 4}
                        className="btn btn-download"
                        style={{ padding: '0.65rem 1.5rem' }}
                      >
                        {settingsSaving ? 'Saving...' : 'Update PIN'}
                      </button>
                    </div>
                  </div>
                )}
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
