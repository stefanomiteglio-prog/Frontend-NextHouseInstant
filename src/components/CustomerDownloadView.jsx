import { useState, useEffect } from 'react';
import nexthouseLogo from '../assets/nexthouse_logo.png';
import { translations } from '../translations';

function CustomerDownloadView({
  lang,
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
  handleDeleteClientSelection,
  formatSize,
  theme = 'system',
  toggleTheme
}) {
  const t = (key) => (translations[lang] && translations[lang][key]) || translations['en'][key] || key;
  const [guestName, setGuestName] = useState('');
  const [isPrintMode, setIsPrintMode] = useState(false);
  const [activeLightboxPhotoId, setActiveLightboxPhotoId] = useState(null);
  const [nameError, setNameError] = useState(false);

  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      setActiveLightboxPhotoId(prevId => {
        const idx = session.photos?.findIndex(p => p.id === prevId);
        if (idx !== -1 && idx < session.photos.length - 1) {
          return session.photos[idx + 1].id;
        }
        return prevId;
      });
    } else if (isRightSwipe) {
      setActiveLightboxPhotoId(prevId => {
        const idx = session.photos?.findIndex(p => p.id === prevId);
        if (idx !== -1 && idx > 0) {
          return session.photos[idx - 1].id;
        }
        return prevId;
      });
    }
  };

  const activePhotoIndex = session.photos?.findIndex(p => p.id === activeLightboxPhotoId);
  const activePhoto = activePhotoIndex !== -1 ? session.photos[activePhotoIndex] : null;
  const isActivelySelected = activePhoto ? activeSelectedPhotoIds.has(activePhoto.id) : false;
  const hasPrev = activePhotoIndex > 0;
  const hasNext = activePhotoIndex < session.photos?.length - 1;

  const closeLightbox = () => setActiveLightboxPhotoId(null);

  useEffect(() => {
    if (!activeLightboxPhotoId) return;
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') {
        setActiveLightboxPhotoId(prevId => {
          const idx = session.photos?.findIndex(p => p.id === prevId);
          if (idx !== -1 && idx < session.photos.length - 1) {
            return session.photos[idx + 1].id;
          }
          return prevId;
        });
      } else if (e.key === 'ArrowLeft') {
        setActiveLightboxPhotoId(prevId => {
          const idx = session.photos?.findIndex(p => p.id === prevId);
          if (idx !== -1 && idx > 0) {
            return session.photos[idx - 1].id;
          }
          return prevId;
        });
      } else if (e.key === 'Escape') {
        setActiveLightboxPhotoId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeLightboxPhotoId, session.photos]);

  const parseName = (fullName) => {
    if (!fullName) return { name: '', booking: '' };
    const parts = fullName.split(' | Booking: ');
    if (parts.length > 1) {
      return { name: parts[0], booking: parts[1] };
    }
    return { name: fullName, booking: '' };
  };

  const onSubmit = () => {
    const guestNameVal = guestName.trim();
    if (!guestNameVal) {
      setNameError(true);
      return;
    }
    setNameError(false);

    handleSubmitPrintRequest(guestNameVal, () => {
      setGuestName('');
      setIsPrintMode(false);
    });
  };

  const onCancel = () => {
    handleClearActiveSelection();
    setGuestName('');
    setNameError(false);
    setIsPrintMode(false);
  };

  const handleCancelClick = async (selectionId) => {
    if (window.confirm(t("confirmCancelRequest"))) {
      const success = await handleDeleteClientSelection(selectionId);
      if (!success) {
        alert(t("cancelError"));
      }
    }
  };

  return (
    <div className="customer-view-page">
      <div className="glow-bg-container">
        <div className="glow-bg"></div>
        <div className="glow-bg-secondary"></div>
      </div>
      {selectionMessage && (
        <div className="customer-toast-notification">
          <div className="toast-content">
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span>{selectionMessage === 'Print request submitted successfully!' ? t("toastSuccess") : selectionMessage}</span>
          </div>
          <div className="toast-progress-bar"></div>
        </div>
      )}

      {/* NextHouse Logo */}
      <div className="customer-logo-container">
        <img src={nexthouseLogo} alt="NextHouse Logo" />
      </div>

      {/* Top Header controls: Countdown badge & Theme toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <div className={`customer-session-countdown-badge ${timeLeft && timeLeft !== 'Expired' && (timeLeft.startsWith('00:') || timeLeft.startsWith('01:')) ? 'time-low' : ''}`} style={{ marginBottom: 0 }}>
          <span className="pulse-dot"></span>
          <span className="badge-text">{t("session")}: </span>
          <span className="countdown-time">{timeLeft || '--:--'}</span>
        </div>

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
      </div>

      {/* View Title */}
      <h2 className="customer-title-text">
        {isPrintMode
          ? t("selectImagesPrint")
          : t("imagesReadyDownload")
        }
      </h2>

      {/* Main Files Card */}
      <div className={`customer-files-card ${isPrintMode ? 'print-mode' : ''}`}>

        {/* Spacing and padding managed in index.css */}

        {/* Back button (Only in print mode) */}
        <div className={`customer-back-button-container ${isPrintMode ? 'visible' : 'hidden'}`} style={{ padding: '0 35px', flexShrink: 0 }}>
          <button type="button" className="customer-back-button" onClick={onCancel}>
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {t("backToDownloads")}
          </button>
        </div>

        {/* Responsive grid of photos */}
        <div className="customer-photo-grid">
          {session.photos?.map((photo) => {
            const isActivelySelected = activeSelectedPhotoIds.has(photo.id);

            return (
              <div key={photo.id} className={`customer-grid-item ${isActivelySelected ? 'selected' : ''}`}>
                <div className="customer-grid-thumbnail-wrapper">
                  <img
                    src={`${API_URL}/download/${token}/photos/${photo.id}`}
                    alt="Photobooth capture"
                    loading="lazy"
                    className="customer-grid-img"
                    onClick={() => {
                      if (isPrintMode) {
                        handleToggleSelectPhoto(photo.id);
                      } else {
                        setActiveLightboxPhotoId(photo.id);
                      }
                    }}
                  />

                  {/* Action Overlay */}
                  <div className="customer-grid-action-overlay">
                    <div className={`overlay-download-action ${!isPrintMode ? 'visible' : 'hidden'}`}>
                      <a
                        href={`${API_URL}/download/${token}/photos/${photo.id}`}
                        download={photo.original_filename}
                        className="customer-grid-btn-download"
                        title={t("download")}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </a>
                    </div>

                    <div className={`overlay-print-action ${isPrintMode ? 'visible' : 'hidden'}`}>
                      <button
                        type="button"
                        className={`customer-grid-checkmark-btn ${isActivelySelected ? 'checked' : ''}`}
                        onClick={(e) => { e.stopPropagation(); handleToggleSelectPhoto(photo.id); }}
                        title={isActivelySelected ? t("deselectPrint") : t("selectForPrint")}
                      >
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="3.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Panel inside the Card */}
        <div className="customer-card-bottom">
          <div className={`customer-download-all-container ${!isPrintMode ? 'visible' : 'hidden'}`}>
            <a
              href={`${API_URL}/download/${token}/zip`}
              className="customer-btn-download-all"
            >
              {t("downloadAll")}
            </a>
          </div>

          <div className={`customer-info-details-container ${isPrintMode ? 'visible' : 'hidden'}`}>
            <div className="customer-info-details">
              <h3 className="customer-info-details-title">{t("infoDetails")}</h3>

              {/* Price and Instruction Callout Box */}
              <div className="customer-print-price-callout">
                <div className="callout-price-badge">{t("priceInfo")}</div>
                <div className="callout-instructions-text">{t("receptionInstructions")}</div>
              </div>

              <div className="customer-info-row">
                <span className="customer-info-label">{t("fullName")}</span>
                <input
                  type="text"
                  className={`customer-input-field ${nameError ? 'input-error' : ''}`}
                  placeholder={t("yourNamePlaceholder")}
                  value={guestName}
                  onChange={(e) => {
                    setGuestName(e.target.value);
                    if (nameError && e.target.value.trim()) {
                      setNameError(false);
                    }
                  }}
                />
              </div>
              {nameError && (
                <div className="customer-input-error-msg">
                  {t("guestNameAlert")}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="button"
                className="customer-btn-send-request"
                onClick={onSubmit}
                disabled={submittingSelection || activeSelectedPhotoIds.size === 0}
              >
                {submittingSelection ? t("sending") : t("sendRequest")}
              </button>

              {/* Terms Agreement */}
              <div className="customer-print-terms-text" dangerouslySetInnerHTML={{ __html: t("termsAgreement") }} />
            </div>
          </div>
        </div>
      </div>

      {/* Section/Buttons below the Card */}
      <div className="customer-footer-actions-container">
        <div className={`customer-footer-download-mode ${!isPrintMode ? 'visible' : 'hidden'}`}>
          <div className="customer-footer-info">
            {t("orClickPrint")}
          </div>
          <button
            type="button"
            className="customer-btn-print-mode"
            onClick={() => alert(t("printNotActiveYet"))}
          >
            {t("printRequest")}
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Past Requests Card */}
      {clientSelections.length > 0 && (
        <div className="customer-past-requests-card">
          <div className="customer-past-requests-title">{t("myPrintRequests")}</div>
          <div className="requests-list">
            {clientSelections.map((sel) => {
              const { name: parsedName, booking: parsedBooking } = parseName(sel.name);
              return (
                <div key={sel.id} className="request-history-card">
                  <div className="request-meta">
                    <span className="request-id">
                      {t("printRequestTitle")}
                      {parsedName && (
                        <span className="request-id-name">
                          ({parsedName}{parsedBooking ? ` - Booking: ${parsedBooking}` : ''})
                        </span>
                      )}
                    </span>
                    <div className="request-meta-right">
                      <span className="request-date">{new Date(sel.created_at).toLocaleDateString()}</span>
                      <button
                        type="button"
                        onClick={() => handleCancelClick(sel.id)}
                        className="customer-request-cancel-btn"
                      >
                        <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        {t("cancelRequest")}
                      </button>
                    </div>
                  </div>
                  <div className="request-thumbnails">
                    {sel.photos.slice(0, 5).map((photo) => (
                      <div key={photo.id} className="request-thumb-container">
                        <img
                          src={`${API_URL}/download/${token}/photos/${photo.id}`}
                          alt="Printed Photo"
                          className="request-thumb-img"
                        />
                      </div>
                    ))}
                    {sel.photos.length > 5 && (
                      <span className="request-thumb-more">
                        +{sel.photos.length - 5}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <footer className="customer-page-footer">
        <a href="/privacy" className="privacy-link">Privacy Policy</a>
      </footer>

      {/* Lightbox Overlay */}
      {activePhoto && (
        <div
          className="customer-lightbox-overlay"
          onClick={closeLightbox}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {/* Close Button */}
          <button
            type="button"
            className="lightbox-close-btn"
            onClick={closeLightbox}
            title="Close (Esc)"
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Prev Button */}
          <button
            type="button"
            className="lightbox-nav-btn prev"
            onClick={(e) => { e.stopPropagation(); setActiveLightboxPhotoId(session.photos[activePhotoIndex - 1].id); }}
            disabled={!hasPrev}
            title="Previous (Arrow Left)"
          >
            <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Next Button */}
          <button
            type="button"
            className="lightbox-nav-btn next"
            onClick={(e) => { e.stopPropagation(); setActiveLightboxPhotoId(session.photos[activePhotoIndex + 1].id); }}
            disabled={!hasNext}
            title="Next (Arrow Right)"
          >
            <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Main Content Card */}
          <div className="lightbox-content-card" onClick={(e) => e.stopPropagation()}>
            <div className="lightbox-image-container">
              <img
                src={`${API_URL}/download/${token}/photos/${activePhoto.id}`}
                alt="Photo"
              />
            </div>

            {/* Bottom details & action bar */}
            <div className="lightbox-bottom-bar">
              <div className="lightbox-photo-info">
                <div className="lightbox-filesize">
                  {formatSize(activePhoto.file_size)}
                </div>
              </div>

              <div className="lightbox-actions">
                {!isPrintMode ? (
                  /* Download Button */
                  <a
                    href={`${API_URL}/download/${token}/photos/${activePhoto.id}`}
                    download={activePhoto.original_filename}
                    className="lightbox-btn-download"
                    title={t("download")}
                  >
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    {t("download")}
                  </a>
                ) : (
                  /* Print Selection Action */
                  <button
                    type="button"
                    className={`lightbox-btn-select-print ${isActivelySelected ? 'selected' : ''}`}
                    onClick={() => handleToggleSelectPhoto(activePhoto.id)}
                  >
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {isActivelySelected ? t("deselectPrint") : t("selectForPrint")}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomerDownloadView;
