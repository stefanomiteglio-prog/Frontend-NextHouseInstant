function PrivacyPolicy() {
  const sections = [
    {
      title: '1. Data Controller',
      content: (
        <>
          <p>The Data Controller responsible for processing your personal data is:</p>
          <div className="policy-highlight-box">
            <strong>Next House Copenhagen</strong><br />
            Email: <a href="mailto:reservations@nexthousecopenhagen.com">reservations@nexthousecopenhagen.com</a>
          </div>
        </>
      )
    },
    {
      title: '2. Types of Data Processed',
      content: (
        <>
          <p>We process only the strictly necessary data to provide you with the photobooth sharing and printing service:</p>
          <ul>
            <li><strong>Photographs:</strong> The digital images you capture at the photobooth kiosk.</li>
            <li><strong>Selection Metadata:</strong> If you request a print at the reception, we collect the name and/or booking code you input to identify your request.</li>
          </ul>
          <p>No other personal data (such as email addresses, telephone numbers, or social media profiles) is requested or stored by this service.</p>
        </>
      )
    },
    {
      title: '3. Purposes and Legal Basis of Processing',
      content: (
        <>
          <p>Your data is processed based on your request to use the photobooth service (Art. 6(1)(b) of the GDPR - performance of a contract):</p>
          <ul>
            <li>To generate a unique download link for you to retrieve your digital photos.</li>
            <li>To allow you to select and submit print requests to the reception.</li>
          </ul>
        </>
      )
    },
    {
      title: '4. Data Retention Period',
      content: (
        <>
          <p>To ensure your privacy and minimize data storage, we apply a strict retention schedule:</p>
          <div className="policy-warning-box">
            All photos and print selection requests are <strong>automatically and permanently deleted after 48 hours</strong> from the time they are uploaded. Once deleted, they cannot be recovered.
          </div>
        </>
      )
    },
    {
      title: '5. Data Storage and Security',
      content: (
        <p>Your photos are uploaded and stored on secure cloud servers. We employ appropriate technical and organizational measures to protect your images against unauthorized access, loss, or alteration.</p>
      )
    },
    {
      title: '6. Your Rights under GDPR',
      content: (
        <>
          <p>As a data subject, you have the following rights under the GDPR:</p>
          <ul>
            <li><strong>Right of Access & Deletion:</strong> You can access your photos via the unique link during the 48-hour window. You can also request immediate manual deletion by contacting us.</li>
            <li><strong>Right to Lodge a Complaint:</strong> If you believe your data has been handled improperly, you have the right to lodge a complaint with a data protection authority.</li>
          </ul>
          <p>To exercise any of your rights, please email us at <a href="mailto:reservations@nexthousecopenhagen.com">reservations@nexthousecopenhagen.com</a>.</p>
        </>
      )
    }
  ];

  return (
    <div className="privacy-policy-view">
      <div className="glow-bg-container">
        <div className="glow-bg" style={{ background: 'radial-gradient(circle, rgba(249, 115, 22, 0.08) 0%, rgba(0,0,0,0) 70%)' }}></div>
      </div>

      <header className="privacy-header">
        <h1>Privacy Policy</h1>
        <p className="subtitle">GDPR Information Notice for Photobooth & Download Services</p>
        <span className="last-updated">Last updated: June 2026</span>
      </header>

      {/* Content Card */}
      <div className="privacy-card">
        <p className="policy-intro">
          This Privacy Policy describes how Next House processes and protects the personal data collected through our photobooth and photo download service. We are committed to safeguarding your privacy in compliance with the General Data Protection Regulation (GDPR) (EU 2016/679).
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
