import { useState } from 'react';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import CustomerDownloadView from './components/CustomerDownloadView';
import PrivacyPolicy from './components/PrivacyPolicy';
import { translations } from './translations';
import { getLanguage, API_URL } from './utils/api';
import { AdminAuthProvider } from './context/AdminAuthProvider';
import { useAdminAuth } from './hooks/useAdminAuth';
import { useStickers } from './hooks/useStickers';
import { useSelections } from './hooks/useSelections';
import { useDownloadSession } from './hooks/useDownloadSession';

function AppContent() {
  const path = window.location.pathname;
  const isAdminRoute = path === '/admin';
  const isPrivacyRoute = path === '/privacy' || path === '/privacy-policy';

  const [lang] = useState(getLanguage());
  
  const t = (key) => (translations[lang] && translations[lang][key]) || translations['en'][key] || key;

  // 1. Admin Auth context
  const auth = useAdminAuth();
  
  // 2. Stickers hook
  const stickersData = useStickers();

  // 3. Selections hook
  const selectionsData = useSelections();

  // 4. Customer Download Session hook
  const downloadSession = useDownloadSession();

  const formatSize = (bytes) => {
    if (!bytes) return 'Unknown size';
    if (bytes > 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }
    return `${(bytes / 1024).toFixed(0)} KB`;
  };

  // --- RENDERING ROUTER ---

  if (isPrivacyRoute) {
    return <PrivacyPolicy lang={lang} />;
  }

  if (isAdminRoute) {
    if (auth.authLoading) {
      return (
        <div className="center-container">
          <div className="spinner"></div>
          <p className="loading-text">Verifying session...</p>
        </div>
      );
    }

    if (!auth.user) {
      return (
        <div className="admin-view-page">
          <AdminLogin
            loginUsername={auth.loginUsername}
            setLoginUsername={auth.setLoginUsername}
            loginPassword={auth.loginPassword}
            setLoginPassword={auth.setLoginPassword}
            loginError={auth.loginError}
            loginLoading={auth.loginLoading}
            handleLogin={auth.handleLogin}
          />
        </div>
      );
    }

    return (
      <div className="admin-view-page">
        <AdminDashboard
          handleLogout={auth.handleLogout}
          activeTab={selectionsData.activeTab}
          setActiveTab={selectionsData.setActiveTab}
          API_URL={API_URL}
          stickers={stickersData.stickers}
          stickersLoading={stickersData.stickersLoading}
          newStickerName={stickersData.newStickerName}
          setNewStickerName={stickersData.setNewStickerName}
          newStickerFile={stickersData.newStickerFile}
          setNewStickerFile={stickersData.setNewStickerFile}
          uploadLoading={stickersData.uploadLoading}
          uploadError={stickersData.uploadError}
          setUploadError={stickersData.setUploadError}
          deletingStickerId={stickersData.deletingStickerId}
          setDeletingStickerId={stickersData.setDeletingStickerId}
          handleFileChange={stickersData.handleFileChange}
          handleUploadSticker={stickersData.handleUploadSticker}
          handleDeleteSticker={stickersData.handleDeleteSticker}
          selections={selectionsData.selections}
          selectionsLoading={selectionsData.selectionsLoading}
          filterName={selectionsData.filterName}
          setFilterName={selectionsData.setFilterName}
          detailSelection={selectionsData.detailSelection}
          setDetailSelection={selectionsData.setDetailSelection}
          deletingSelectionId={selectionsData.deletingSelectionId}
          setDeletingSelectionId={selectionsData.setDeletingSelectionId}
          fetchSelections={selectionsData.fetchSelections}
          handleDeleteSelection={selectionsData.handleDeleteSelection}
          handleTriggerPrint={selectionsData.handleTriggerPrint}
          formatSize={formatSize}
        />
      </div>
    );
  }

  // --- USER VIEW ---

  if (downloadSession.loading) {
    return (
      <div className="center-container">
        <div className="spinner"></div>
        <p className="loading-text">{t("loadingPhotos")}</p>
      </div>
    );
  }

  if (downloadSession.error) {
    if (downloadSession.error.isExpired) {
      return (
        <div className="center-container">
          <div className="expired-container">
            <div className="expired-icon">
              <svg width="64" height="64" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ margin: '0 auto' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="expired-title">{t(downloadSession.error.titleKey)}</h2>
            <p className="expired-desc">{t(downloadSession.error.descKey)}</p>
          </div>
        </div>
      );
    }

    return (
      <div className="center-container">
        <div className="error-container">
          <div className="error-icon">
            <svg width="64" height="64" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ margin: '0 auto' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="error-title">{t(downloadSession.error.titleKey)}</h2>
          <p className="error-desc">{t(downloadSession.error.descKey)}</p>
        </div>
      </div>
    );
  }

  return (
    <CustomerDownloadView
      lang={lang}
      session={downloadSession.session}
      token={downloadSession.token}
      timeLeft={downloadSession.timeLeft}
      API_URL={API_URL}
      clientSelections={downloadSession.clientSelections}
      activeSelectedPhotoIds={downloadSession.activeSelectedPhotoIds}
      submittingSelection={downloadSession.submittingSelection}
      selectionMessage={downloadSession.selectionMessage}
      handleToggleSelectPhoto={downloadSession.handleToggleSelectPhoto}
      handleClearActiveSelection={downloadSession.handleClearActiveSelection}
      handleSubmitPrintRequest={downloadSession.handleSubmitPrintRequest}
      handleDeleteClientSelection={downloadSession.handleDeleteClientSelection}
      formatSize={formatSize}
    />
  );
}

function App() {
  return (
    <AdminAuthProvider>
      <AppContent />
    </AdminAuthProvider>
  );
}

export default App;
