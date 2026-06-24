import { useState } from 'react';

function PrivacyPolicy() {
  const [lang, setLang] = useState('it'); // default to Italian as requested

  const texts = {
    en: {
      title: 'Privacy Policy',
      subtitle: 'GDPR Information Notice for Photobooth & Download Services',
      lastUpdated: 'Last updated: June 2026',
      backToHome: 'Back to Download',
      intro: 'This Privacy Policy describes how Next House processes and protects the personal data collected through our photobooth and photo download service. We are committed to safeguarding your privacy in compliance with the General Data Protection Regulation (GDPR) (EU 2016/679).',
      sections: [
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
      ]
    },
    it: {
      title: 'Informativa sulla Privacy',
      subtitle: 'Informativa GDPR per i Servizi Photobooth e Download',
      lastUpdated: 'Ultimo aggiornamento: Giugno 2026',
      backToHome: 'Torna al Download',
      intro: 'La presente Informativa sulla Privacy descrive le modalità con cui Next House tratta e protegge i dati personali raccolti tramite la nostra cabina fotografica (photobooth) e il relativo servizio di download. Ci impegniamo a garantire la privacy dell\'utente in conformità al Regolamento Generale sulla Protezione dei Dati (GDPR) (UE 2016/679).',
      sections: [
        {
          title: '1. Titolare del Trattamento',
          content: (
            <>
              <p>Il Titolare del trattamento dei tuoi dati personali è:</p>
              <div className="policy-highlight-box">
                <strong>Next House Copenhagen</strong><br />
                Email: <a href="mailto:reservations@nexthousecopenhagen.com">reservations@nexthousecopenhagen.com</a>
              </div>
            </>
          )
        },
        {
          title: '2. Tipologia di Dati Trattati',
          content: (
            <>
              <p>Trattiamo solo i dati strettamente necessari per fornirti il servizio di condivisione e stampa delle foto del photobooth:</p>
              <ul>
                <li><strong>Fotografie:</strong> Le immagini digitali che scatti presso la nostra cabina fotografica.</li>
                <li><strong>Metadati di Selezione:</strong> Se richiedi una stampa alla reception, raccogliamo il nome e/o il codice di prenotazione che inserisci per identificare la tua richiesta.</li>
              </ul>
              <p>Nessun altro dato personale (come indirizzi email, numeri di telefono o profili social) viene richiesto o memorizzato da questo servizio.</p>
            </>
          )
        },
        {
          title: '3. Finalità e Base Giuridica del Trattamento',
          content: (
            <>
              <p>I tuoi dati vengono trattati sulla base della tua richiesta di utilizzo del servizio photobooth (Art. 6, par. 1, lett. b del GDPR - esecuzione di un contratto):</p>
              <ul>
                <li>Per generare un link di download unico per permetterti di scaricare le tue foto digitali.</li>
                <li>Per consentirti di selezionare e inviare richieste di stampa alla reception.</li>
              </ul>
            </>
          )
        },
        {
          title: '4. Periodo di Conservazione dei Dati',
          content: (
            <>
              <p>Per garantire la massima riservatezza e minimizzare la conservazione dei dati, applichiamo un piano di cancellazione rigoroso:</p>
              <div className="policy-warning-box">
                Tutte le foto e le richieste di stampa vengono <strong>eliminate automaticamente e permanentemente dopo 48 ore</strong> dal momento del caricamento. Una volta eliminate, non possono essere recuperate.
              </div>
            </>
          )
        },
        {
          title: '5. Conservazione e Sicurezza dei Dati',
          content: (
            <p>Le foto sono caricate e conservate su server cloud sicuri. Adottiamo misure tecniche e organizzative adeguate per proteggere le immagini da accessi non autorizzati, perdite o alterazioni.</p>
          )
        },
        {
          title: '6. I Tuoi Diritti ai sensi del GDPR',
          content: (
            <>
              <p>In qualità di interessato, ti sono riconosciuti i seguenti diritti ai sensi del GDPR:</p>
              <ul>
                <li><strong>Diritto di Accesso e Cancellazione:</strong> Puoi accedere alle tue foto tramite il link unico durante la finestra di 48 ore. Puoi anche richiedere la cancellazione manuale immediata contattandoci.</li>
                <li><strong>Diritto di Proporre Reclamo:</strong> Se ritieni che i tuoi dati siano trattati in modo improprio, hai il diritto di presentare un reclamo all\'autorità garante per la protezione dei dati personali.</li>
              </ul>
              <p>Per esercitare i tuoi diritti, puoi contattarci via email all\'indirizzo: <a href="mailto:reservations@nexthousecopenhagen.com">reservations@nexthousecopenhagen.com</a>.</p>
            </>
          )
        }
      ]
    }
  };

  const currentText = texts[lang];

  return (
    <div className="privacy-policy-view">
      <div className="glow-bg-container">
        <div className="glow-bg" style={{ background: 'radial-gradient(circle, rgba(249, 115, 22, 0.08) 0%, rgba(0,0,0,0) 70%)' }}></div>
      </div>

      <header className="privacy-header">
        <h1>{currentText.title}</h1>
        <p className="subtitle">{currentText.subtitle}</p>
        <span className="last-updated">{currentText.lastUpdated}</span>
      </header>

      {/* Language Switcher */}
      <div className="lang-switcher">
        <button 
          className={`lang-btn ${lang === 'it' ? 'active' : ''}`}
          onClick={() => setLang('it')}
        >
          Italiano
        </button>
        <button 
          className={`lang-btn ${lang === 'en' ? 'active' : ''}`}
          onClick={() => setLang('en')}
        >
          English
        </button>
      </div>

      {/* Content Card */}
      <div className="privacy-card">
        <p className="policy-intro">{currentText.intro}</p>

        <div className="policy-sections">
          {currentText.sections.map((section, idx) => (
            <div key={idx} className="policy-section">
              <h2 className="policy-section-title">{section.title}</h2>
              <div className="policy-section-content">{section.content}</div>
            </div>
          ))}
        </div>

        <div className="policy-footer">
          <button 
            type="button" 
            className="policy-back-btn"
            onClick={() => window.history.back()}
          >
            {currentText.backToHome}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PrivacyPolicy;
