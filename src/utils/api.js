export const getLanguage = () => {
  const params = new URLSearchParams(window.location.search);
  const langParam = params.get('lang');
  if (langParam) {
    localStorage.setItem('nexthouse_lang', langParam.toLowerCase());
    return langParam.toLowerCase();
  }
  const savedLang = localStorage.getItem('nexthouse_lang');
  if (savedLang) return savedLang;
  
  const browserLang = navigator.language || navigator.userLanguage || 'en';
  const prefix = browserLang.split('-')[0].toLowerCase();
  const supported = ['en', 'it', 'de', 'da', 'es', 'fr'];
  return supported.includes(prefix) ? prefix : 'en';
};

export const getApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL || '';
  const hostname = window.location.hostname;
  
  // If it's localhost or a local IP address, we are in development
  const isDevelopment = hostname === 'localhost' || 
                        hostname === '127.0.0.1' || 
                        /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname);
                        
  if (!isDevelopment) {
    return '';
  }
  
  // In development, if we are on a local IP address (e.g. phone testing), point to port 8080 on that IP
  if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
    return `http://${hostname}:8080`;
  }
  
  return envUrl || 'http://localhost:8080';
};

export const API_URL = getApiUrl();
