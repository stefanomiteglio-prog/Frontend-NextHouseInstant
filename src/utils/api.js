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
  
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return '';
  }
  
  return envUrl || 'http://localhost:8080';
};

export const API_URL = getApiUrl();
