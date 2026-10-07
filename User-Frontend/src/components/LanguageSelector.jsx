import React, { useState, useEffect } from 'react';

const LanguageSelector = () => {
  const getLanguageCookie = () => {
    const match = document.cookie.match(new RegExp('(^| )googtrans=([^;]+)'));
    if (match) return match[2].split('/')[2];
    return 'en';
  };

  const [currentLang, setCurrentLang] = useState(getLanguageCookie());

  useEffect(() => {
    const applyTranslation = () => {
      const gtSelect = document.querySelector('.goog-te-combo');
      if (gtSelect) {
        if (currentLang !== 'en') {
          gtSelect.value = currentLang;
          gtSelect.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }
    };
    applyTranslation();
    setTimeout(applyTranslation, 500);
  }, [currentLang]);

  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    setCurrentLang(lang);
    
    if (lang === 'en') {
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname}`;
    } else {
      document.cookie = `googtrans=/en/${lang}; path=/;`;
      document.cookie = `googtrans=/en/${lang}; path=/; domain=${window.location.hostname}`;
    }

    const gtSelect = document.querySelector('.goog-te-combo');
    if (gtSelect) {
      gtSelect.value = lang === 'en' ? 'en' : lang;
      gtSelect.dispatchEvent(new Event('change', { bubbles: true }));
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="notranslate" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <span style={{ fontSize: '14px', fontWeight: '600', color: '#475569' }}>Language:</span>
      <select value={currentLang} onChange={handleLanguageChange} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #E2E8F0', background: 'white', color: '#0F172A', fontWeight: '500', fontSize: '14px', cursor: 'pointer', outline: 'none' }}>
        <option value="en">English</option>
        <option value="kn">Kannada</option>
        <option value="hi">Hindi</option>
      </select>
    </div>
  );
};

export default LanguageSelector;
