import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="website-footer">
      
        {/* Quick Links Section */}
        {/* <div className="footer-column">
          <h3>Quick Links</h3>
          <ul className="footer-links">
            <li><a href="#about">About Us</a></li>
            <li><a href="#services">Our Services</a></li>
            <li><a href="#branches">Branch Locator</a></li>
            <li><a href="#careers">Careers</a></li>
            <li><a href="#faq">FAQs</a></li>
          </ul>
        </div> */}

        {/* Services Section */}
        {/* <div className="footer-column">
          <h3>Banking Services</h3>
          <ul className="footer-links">
            <li><a href="#savings">Savings Account</a></li>
            <li><a href="#fd">Fixed Deposits</a></li>
            <li><a href="#loans">Loans</a></li>
            <li><a href="#online-banking">Online Banking</a></li>
            <li><a href="#mobile-app">Mobile App</a></li>
          </ul>
        </div> */}

        
       
        
      

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <p className="copyright">© 2025 Microbanking System. All rights reserved.</p>
          <div className="footer-legal">
            <a href="#terms">Terms of Service</a>
            <span className="separator">|</span>
            <a href="#privacy">Privacy Policy</a>
            <span className="separator">|</span>
            <a href="#refund">Refund Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
