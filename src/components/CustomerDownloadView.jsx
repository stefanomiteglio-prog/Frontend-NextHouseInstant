import { useState } from 'react';
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
        <div style={{
          position: 'fixed',
          top: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#10b981',
          color: '#fff',
          padding: '0.75rem 1.5rem',
          borderRadius: '12px',
          fontWeight: '600',
          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
          zIndex: 110,
        }}>
          {selectionMessage}
        </div>
      )}

      {/* NextHouse Logo */}
      <div className="customer-logo-container">
        <img src={nexthouseLogo} alt="NextHouse Logo" />
      </div>

      {/* Countdown timer */}
      <div className="customer-session-countdown">
        Session expires in: <span className="countdown">{timeLeft || '--:--'}</span>
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

        {/* Scrollable list of files */}
        <div className="customer-files-list">
          {session.photos?.map((photo) => {
            const isAlreadyPrinted = clientSelections.some(sel => sel.photos.some(p => p.id === photo.id));
            const isActivelySelected = activeSelectedPhotoIds.has(photo.id);

            return (
              <div key={photo.id} className="customer-file-row">
                {/* Thumbnail */}
                <div className="customer-file-thumbnail">
                  <img 
                    src={`${API_URL}/download/${token}/photos/${photo.id}`} 
                    alt={photo.original_filename} 
                    loading="lazy" 
                  />
                </div>

                {/* Info (Filename and Size) */}
                <div className="customer-file-name-container">
                  <div className="customer-file-name" title={photo.original_filename}>
                    {photo.original_filename}
                  </div>
                  <div className="customer-file-size">
                    {formatSize(photo.file_size)}
                  </div>
                </div>

                {/* Right Action Button */}
                {!isPrintMode ? (
                  /* Download Button */
                  <a 
                    href={`${API_URL}/download/${token}/photos/${photo.id}`} 
                    download={photo.original_filename} 
                    className="customer-btn-single-download"
                    title="Download Photo"
                  >
                    <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </a>
                ) : (
                  /* Selection Checkbox */
                  isAlreadyPrinted ? (
                    <span style={{ fontSize: '11px', color: '#10b981', fontWeight: '700', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Printed
                    </span>
                  ) : (
                    <button 
                      type="button" 
                      className={`customer-checkmark-button ${isActivelySelected ? 'checked' : ''}`}
                      onClick={() => handleToggleSelectPhoto(photo.id)}
                    >
                      <div className="checkmark-circle">
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="3.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </button>
                  )
                )}
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
    </div>
  );
}

export default CustomerDownloadView;
