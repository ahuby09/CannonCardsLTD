import { Link } from 'react-router-dom';
import { affiliationNotice, legalConfig } from '../config/legal.js';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <section className="site-footer__brand">
          <h2>{legalConfig.businessName}</h2>
          <p>{affiliationNotice}</p>
          <p>Prices are shown in {legalConfig.currency}. We currently ship to: {legalConfig.shippingCountries}.</p>
        </section>

        <div className="site-footer__links">
          <section>
            <h3>Customer Care</h3>
            <nav>
              <Link to="/legal/shipping">Shipping</Link>
              <Link to="/legal/returns">Returns and refunds</Link>
              <Link to="/legal/terms">Terms of sale</Link>
              <Link to="/legal/contact">Contact</Link>
            </nav>
          </section>

          <section>
            <h3>Legal</h3>
            <nav>
              <Link to="/legal/privacy">Privacy policy</Link>
              <Link to="/legal/cookies">Cookies and storage</Link>
              <Link to="/legal/product-warnings">Product warnings</Link>
            </nav>
          </section>
        </div>
      </div>
      <div className="site-footer__bar">
        <span>&copy; {new Date().getFullYear()} {legalConfig.businessName}. All rights reserved.</span>
        <span>Last policy update: {legalConfig.lastUpdated}</span>
      </div>
    </footer>
  );
}
