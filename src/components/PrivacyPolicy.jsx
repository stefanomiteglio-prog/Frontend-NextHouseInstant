function PrivacyPolicy() {
  const sections = [
    {
      title: '1. Data Controller',
      content: (
        <>
          <p>The Data Controller responsible for the processing of your personal data under this service is:</p>
          <div className="policy-highlight-box">
            <strong>ARP-HANSEN HOTEL GROUP A/S</strong> (operating Next House Copenhagen)<br />
            Registered Address: Nybrovej 75, 2820 Gentofte, Denmark<br />
            Physical Address: Bernstorffsgade 27, 1577 København, Denmark<br />
            CVR (Danish Business Reg. No): 54399219<br />
            Email: <a href="mailto:reservations@nexthousecopenhagen.com">reservations@nexthousecopenhagen.com</a>
          </div>
        </>
      )
    },
    {
      title: '2. Types of Personal Data Processed',
      content: (
        <>
          <p>We process only the personal data strictly necessary to provide the photobooth sharing and printing service:</p>
          <ul>
            <li><strong>Digital Photographs:</strong> The images captured by you at the physical photobooth kiosk.</li>
            <li><strong>Selection Metadata:</strong> If you choose to print your photos, we collect the guest name and/or booking code you manually input to identify your selection at the reception.</li>
          </ul>
          <p>This service does not request, collect, or store any other personal data (such as email addresses, phone numbers, or social media profiles). No browser cookies or tracking scripts are deployed on this website.</p>
        </>
      )
    },
    {
      title: '3. Purposes and Legal Basis of Processing',
      content: (
        <>
          <p>Your personal data is processed solely for the following purposes:</p>
          <ol>
            <li><strong>Photo Download:</strong> To temporarily host your digital photos on a secure cloud server and generate a unique, tokenized download link so you can retrieve your images on your personal device.</li>
            <li><strong>Print Request Fulfillment:</strong> To transmit your selected photos and your identification details (guest name / booking code) to the hotel reception, enabling staff to print and hand over your requested physical prints.</li>
          </ol>
          <p>The legal basis for this processing is **Article 6(1)(b) of the GDPR** (processing is necessary for the performance of a contract to which the data subject is party, i.e., providing the photo sharing/printing service you requested).</p>
        </>
      )
    },
    {
      title: '4. Data Retention Period',
      content: (
        <>
          <p>We implement a strict data minimization schedule to ensure your privacy:</p>
          <div className="policy-warning-box">
            All photographs and print request details are <strong>automatically and permanently deleted after 48 hours</strong> from the moment they are uploaded to our system. Once deleted, they are completely unrecoverable.
          </div>
          <p>Please note that we do not maintain database backups of photographs. Consequently, there are no latent copies of your photos after the 48-hour expiration window.</p>
        </>
      )
    },
    {
      title: '5. Data Storage and Transfers Outside the EU',
      content: (
        <>
          <p>Your privacy is protected within the European Union:</p>
          <ul>
            <li><strong>Infrastructure & Hosting:</strong> The backend API and the photographs are hosted on a secure cloud instance provided by <strong>Hetzner Online GmbH</strong>.</li>
            <li><strong>Server Location:</strong> The servers are located in <strong>Falkenstein, Germany</strong>.</li>
            <li><strong>No Extra-EU Transfers:</strong> All photos and selection data are processed and stored locally on these German servers. No personal data is transferred, processed, or stored outside the European Economic Area (EEA).</li>
          </ul>
        </>
      )
    },
    {
      title: '6. Recipients of Personal Data',
      content: (
        <>
          <p>Access to your personal data is restricted to:</p>
          <ul>
            <li>Authorized hotel reception staff (solely to identify and print your photos).</li>
            <li>The cloud hosting provider (Hetzner Online GmbH) acting as our Data Processor under a strict Data Processing Agreement (DPA).</li>
          </ul>
          <p>We do not share, sell, lease, or distribute your photographs or information to any other third parties.</p>
        </>
      )
    },
    {
      title: '7. Your Rights under the GDPR',
      content: (
        <>
          <p>As a data subject, you have the following rights under the GDPR:</p>
          <ul>
            <li><strong>Right of Access (Art. 15):</strong> You can access your photos directly via the unique URL during the 48-hour retention window.</li>
            <li><strong>Right to Erasure / "Right to be Forgotten" (Art. 17):</strong> You can request immediate manual erasure of your photos before the automatic 48-hour deletion by contacting us.</li>
            <li><strong>Right to Restriction of Processing (Art. 18):</strong> You have the right to request a temporary suspension of processing.</li>
            <li><strong>Right to Data Portability (Art. 20):</strong> You can download your photographs directly on your device during the 48-hour window.</li>
          </ul>
          <p>To exercise any of these rights, please email us at <a href="mailto:reservations@nexthousecopenhagen.com">reservations@nexthousecopenhagen.com</a>. Because all data is permanently deleted after 48 hours, we are unable to fulfill access or deletion requests for any photos taken more than 48 hours prior.</p>
        </>
      )
    },
    {
      title: '8. Right to Lodge a Complaint',
      content: (
        <>
          <p>If you believe that the processing of your personal data violates the GDPR, you have the right to lodge a complaint with a competent supervisory authority.</p>
          <p>In Denmark, the competent national authority is:</p>
          <div className="policy-highlight-box" style={{ background: 'rgba(255, 255, 255, 0.02)', borderLeftColor: 'var(--text-muted)' }}>
            <strong>Datatilsynet</strong><br />
            Carl Jacobsens Vej 35, 2500 Valby, Denmark<br />
            Website: <a href="https://www.datatilsynet.dk" target="_blank" rel="noopener noreferrer">www.datatilsynet.dk</a>
          </div>
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
          This Privacy Policy describes how Next House Copenhagen processes and protects the personal data collected through our photobooth and photo download service. We are committed to safeguarding your privacy in compliance with the General Data Protection Regulation (GDPR) (EU 2016/679).
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
