import { translations, privacyTranslations } from '../translations';

function PrivacyPolicy({ lang }) {
  const t = (key) => (translations[lang] && translations[lang][key]) || translations['en'][key] || key;
  const sections = privacyTranslations[lang] || privacyTranslations['en'];

  return (
    <div className="privacy-policy-view">
      <div className="glow-bg-container">
        <div className="glow-bg" style={{ background: 'radial-gradient(circle, rgba(249, 115, 22, 0.08) 0%, rgba(0,0,0,0) 70%)' }}></div>
      </div>

      <header className="privacy-header">
        <h1>{t("privacyPolicy")}</h1>
        <p className="subtitle">{t("gdprSubtitle")}</p>
        <span className="last-updated">{t("lastUpdated")}</span>
      </header>

      {/* Content Card */}
      <div className="privacy-card">
        <p className="policy-intro">
          {t("policyIntro")}
        </p>

        <div className="policy-sections">
          {sections.map((section, idx) => (
            <div key={idx} className="policy-section">
              <h2 className="policy-section-title">{section.title}</h2>
              <div className="policy-section-content">{section.content}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PrivacyPolicy;
