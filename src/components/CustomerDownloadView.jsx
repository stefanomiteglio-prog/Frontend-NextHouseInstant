import { useState, useEffect } from 'react';
import nexthouseLogo from '../assets/nexthouse_logo.png';

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
  const [bookingNumber, setBookingNumber] = useState('');
  const [isPrintMode, setIsPrintMode] = useState(false);
  const [activeLightboxPhotoId, setActiveLightboxPhotoId] = useState(null);

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
  const isAlreadyPrinted = activePhoto ? clientSelections.some(sel => sel.photos.some(p => p.id === activePhoto.id)) : false;
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
      alert("Please enter your name to identify your selection.");
      return;
    }

    const combinedName = bookingNumber.trim()
      ? `${guestNameVal} | Booking: ${bookingNumber.trim()}`
      : guestNameVal;

    handleSubmitPrintRequest(combinedName, () => {
      setGuestName('');
      setBookingNumber('');
      setIsPrintMode(false);
    });
  };

  const onCancel = () => {
    handleClearActiveSelection();
    setGuestName('');
    setBookingNumber('');
    setIsPrintMode(false);
  };

  return (
    <div className="customer-view-page">
      {selectionMessage && (
        <div className="customer-toast-notification">
          <div className="toast-content">
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span>{selectionMessage}</span>
          </div>
          <div className="toast-progress-bar"></div>
        </div>
      )}

      {/* NextHouse Logo */}
      <div className="customer-logo-container">
        <img src={nexthouseLogo} alt="NextHouse Logo" />
      </div>

      {/* Countdown timer */}
      <div className="customer-session-countdown">
        Session expires in: <span className={`countdown ${timeLeft && timeLeft !== 'Expired' && (timeLeft.startsWith('00:') || timeLeft.startsWith('01:')) ? 'time-low' : ''}`}>{timeLeft || '--:--'}</span>
      </div>

      {/* View Title */}
      <h2 className="customer-title-text">
        {isPrintMode 
          ? "Select the images You want to print! 🖨️"
          : "Your images are ready to download! ✌️"
        }
      </h2>

      {/* Main Files Card */}
      <div className={`customer-files-card ${isPrintMode ? 'print-mode' : ''}`}>
        
        {/* Top decorative white spacer */}
        <div style={{ height: '32px', background: '#ffffff', flexShrink: 0 }} />

        {/* Back button (Only in print mode) */}
        {isPrintMode && (
          <div style={{ padding: '0 35px', flexShrink: 0 }}>
            <button type="button" className="customer-back-button" onClick={onCancel}>
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Downloads
            </button>
          </div>
        )}

        {/* Responsive grid of photos */}
        <div className="customer-photo-grid">
          {session.photos?.map((photo) => {
            const isAlreadyPrinted = clientSelections.some(sel => sel.photos.some(p => p.id === photo.id));
            const isActivelySelected = activeSelectedPhotoIds.has(photo.id);

            return (
              <div key={photo.id} className="customer-grid-item">
                <div className="customer-grid-thumbnail-wrapper">
                  <img 
                    src={`${API_URL}/download/${token}/photos/${photo.id}`} 
                    alt="Photobooth capture" 
                    loading="lazy"
                    className="customer-grid-img"
                    onClick={() => setActiveLightboxPhotoId(photo.id)}
                  />
                  
                  {/* Action Overlay */}
                  <div className="customer-grid-action-overlay">
                    {!isPrintMode ? (
                      /* Download button overlay */
                      <a 
                        href={`${API_URL}/download/${token}/photos/${photo.id}`} 
                        download={photo.original_filename} 
                        className="customer-grid-btn-download"
                        title="Download Photo"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </a>
                    ) : (
                      /* Print Selection Checkbox overlay */
                      isAlreadyPrinted ? (
                        <div className="customer-grid-status-printed" title="Already printed">
                          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      ) : (
                        <button 
                          type="button" 
                          className={`customer-grid-checkmark-btn ${isActivelySelected ? 'checked' : ''}`}
                          onClick={(e) => { e.stopPropagation(); handleToggleSelectPhoto(photo.id); }}
                          title={isActivelySelected ? "Deselect print" : "Select for print"}
                        >
                          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="3.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Panel inside the Card */}
        <div className="customer-card-bottom">
          {!isPrintMode ? (
            /* Download All Button */
            <a 
              href={`${API_URL}/download/${token}/zip`} 
              className="customer-btn-download-all"
            >
              Download All!
            </a>
          ) : (
            /* Print Request Details Form */
            <div className="customer-info-details">
              <h3 className="customer-info-details-title">Information Details:</h3>
              
              <div className="customer-info-row">
                <span className="customer-info-label">Full Name:</span>
                <input 
                  type="text" 
                  className="customer-input-field" 
                  placeholder="Your name" 
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                />
              </div>

              <div className="customer-info-row">
                <span className="customer-info-label">Booking Number:</span>
                <input 
                  type="text" 
                  className="customer-input-field" 
                  placeholder="Booking number (optional)" 
                  value={bookingNumber}
                  onChange={(e) => setBookingNumber(e.target.value)}
                />
              </div>

              {/* Submit Button */}
              <button 
                type="button" 
                className="customer-btn-send-request"
                onClick={onSubmit}
                disabled={submittingSelection || activeSelectedPhotoIds.size === 0}
              >
                {submittingSelection ? "Sending..." : "Send Request"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Section/Buttons below the Card */}
      {!isPrintMode ? (
        <>
          <div className="customer-footer-info">
            Or click ‘Print Request’ button to start a print request
          </div>
          <button 
            type="button" 
            className="customer-btn-print-mode"
            onClick={() => setIsPrintMode(true)}
          >
            Print Request
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
          </button>
        </>
      ) : (
        <div className="customer-footer-info">
          The images will be sent to the reception, where you can pay the fee and receive your requested prints.
          <div className="sub-text">10 DKK per Print</div>
          <div className="terms-text">By clicking on ‘Print!’ you agree to our Terms & Condition</div>
        </div>
      )}

      {/* Past Requests Card */}
      {clientSelections.length > 0 && (
        <div className="customer-past-requests-card">
          <div className="customer-past-requests-title">My Print Requests</div>
          <div className="requests-list" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {clientSelections.map((sel) => {
              const { name: parsedName, booking: parsedBooking } = parseName(sel.name);
              return (
                <div key={sel.id} className="request-history-card" style={{ background: '#f9fafb', padding: '12px', borderRadius: '12px', border: '1px solid #f3f4f6' }}>
                  <div className="request-meta" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '11px', color: '#6b7280' }}>
                    <span className="request-id" style={{ fontWeight: '600', color: '#111827' }}>
                      Print Request 
                      {parsedName && (
                        <span style={{ color: '#20a2ff', marginLeft: '6px' }}>
                          ({parsedName}{parsedBooking ? ` - Booking: ${parsedBooking}` : ''})
                        </span>
                      )}
                    </span>
                    <span className="request-date">{new Date(sel.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="request-thumbnails" style={{ display: 'flex', gap: '6px' }}>
                    {sel.photos.slice(0, 5).map((photo) => (
                      <div key={photo.id} className="request-thumb-container" style={{ width: '36px', height: '36px', borderRadius: '4px', overflow: 'hidden' }}>
                        <img 
                          src={`${API_URL}/download/${token}/photos/${photo.id}`} 
                          alt={photo.original_filename} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                    ))}
                    {sel.photos.length > 5 && (
                      <span className="request-thumb-more" style={{ fontSize: '11px', display: 'flex', alignItems: 'center', color: '#9ca3af' }}>
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
                alt={activePhoto.original_filename} 
              />
            </div>

            {/* Bottom details & action bar */}
            <div className="lightbox-bottom-bar">
              <div className="lightbox-photo-info">
                <div className="lightbox-filename" title={activePhoto.original_filename}>
                  {activePhoto.original_filename}
                </div>
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
                    title="Download Photo"
                  >
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download
                  </a>
                ) : (
                  /* Print Selection Action */
                  isAlreadyPrinted ? (
                    <span className="lightbox-status-printed">
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Already Printed
                    </span>
                  ) : (
                    <button 
                      type="button" 
                      className={`lightbox-btn-select-print ${isActivelySelected ? 'selected' : ''}`}
                      onClick={() => handleToggleSelectPhoto(activePhoto.id)}
                    >
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {isActivelySelected ? 'Deselect Print' : 'Select for Print'}
                    </button>
                  )
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
