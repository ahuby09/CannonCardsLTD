import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const STORAGE_KEY = 'cannon_cards_cookie_notice_acknowledged';

export default function CookieNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(localStorage.getItem(STORAGE_KEY) !== 'yes');
  }, []);

  function accept() {
    localStorage.setItem(STORAGE_KEY, 'yes');
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="cookie-notice" role="region" aria-label="Cookies and local storage notice">
      <p>
        We use essential browser storage for your basket, login session, and checkout. We do not currently use analytics or advertising cookies.
        <Link to="/legal/cookies"> Read our cookies and storage notice.</Link>
      </p>
      <button type="button" onClick={accept}>OK</button>
    </div>
  );
}
