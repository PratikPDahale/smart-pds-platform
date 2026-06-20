import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Users, TrendingUp, Shield, MapPin, Clock, CheckCircle, BarChart3 } from 'lucide-react';
import './Home.css';

function Home() {
  return (
    <div className="home-page">
      {/* Government Header */}
      <div className="govt-header">
        <div className="container">
          <div className="govt-header-content">
            <div className="govt-emblem">
              <div className="emblem-circle">
                <div className="ashoka-chakra"></div>
              </div>
              <div className="govt-info">
                <h3>महाराष्ट्र शासन</h3>
                <h4>Government of Maharashtra</h4>
                <p>Food, Civil Supplies & Consumer Protection Department</p>
              </div>
            </div>
            <div className="digital-india">
              <div className="digital-badge">Digital India</div>
              <div className="maha-badge">Maharashtra</div>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <nav className="navbar">
        <div className="container nav-content">
          <div className="logo">
            <div className="logo-text">
              <span className="logo-marathi-nav">महाराष्ट्र शासन</span>
              <span className="logo-english-nav">e-Ration PDS</span>
            </div>
          </div>
          <div className="nav-links">
            <Link to="/login" className="btn btn-govt-login">Login</Link>
            <Link to="/register" className="btn btn-govt-register">Register</Link>
          </div>
        </div>
      </nav>

      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              सार्वजनिक वितरण प्रणाली
              <span className="gradient-text">Public Distribution System - Digital Maharashtra</span>
            </h1>
            <p className="hero-subtitle">
              Government of Maharashtra's initiative for transparent and efficient ration distribution.
              Ensuring food security for every citizen through technology and accountability.
            </p>
            <div className="govt-tagline">
              <span className="tagline-marathi">सर्वांसाठी अन्न सुरक्षा</span>
              <span className="tagline-separator">|</span>
              <span className="tagline-english">Food Security for All</span>
            </div>
            <div className="hero-stats">
              <div className="stat-item">
                <h3>1M+</h3>
                <p>Active Users</p>
              </div>
              <div className="stat-item">
                <h3>5K+</h3>
                <p>Fair Price Shops</p>
              </div>
              <div className="stat-item">
                <h3>99.9%</h3>
                <p>Transparency</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2 className="section-title">Why Choose e-Ration PDS?</h2>
          <p className="section-subtitle">
            Modern solutions to age-old challenges in the Public Distribution System
          </p>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon primary">
                <Shield />
              </div>
              <h3>100% Transparent</h3>
              <p>Track every grain from warehouse to your doorstep with complete transparency and accountability.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon success">
                <Users />
              </div>
              <h3>User-Friendly</h3>
              <p>Simple interfaces for citizens, dealers, and admins. Access your portal from anywhere, anytime.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon warning">
                <TrendingUp />
              </div>
              <h3>Smart Forecasting</h3>
              <p>AI-powered demand prediction prevents shortages and reduces wastage across the supply chain.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon info">
                <Clock />
              </div>
              <h3>Real-Time Updates</h3>
              <p>Get instant notifications about stock, distributions, and quota updates on your dashboard.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon danger">
                <MapPin />
              </div>
              <h3>Location-Based</h3>
              <p>Find nearby fair price shops, check their inventory, and plan your visits efficiently.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon secondary">
                <BarChart3 />
              </div>
              <h3>Analytics Dashboard</h3>
              <p>Comprehensive insights and reports for better decision-making and resource allocation.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Portals Section */}
      <section className="portals">
        <div className="container">
          <h2 className="section-title">Three Powerful Portals</h2>
          <p className="section-subtitle">
            Designed specifically for each stakeholder in the PDS ecosystem
          </p>
          <div className="portals-grid">
            <div className="portal-card citizen">
              <div className="portal-icon">
                <Users size={48} />
              </div>
              <h3>Citizen Portal</h3>
              <ul className="portal-features">
                <li>✓ Check your monthly quota</li>
                <li>✓ View distribution history</li>
                <li>✓ Download digital receipts</li>
                <li>✓ Find nearby FPS dealers</li>
                <li>✓ File grievances online</li>
              </ul>
              <Link to="/register" className="portal-btn">Register as Citizen</Link>
            </div>

            <div className="portal-card dealer">
              <div className="portal-icon">
                <ShoppingBag size={48} />
              </div>
              <h3>Dealer Portal</h3>
              <ul className="portal-features">
                <li>✓ Manage your inventory</li>
                <li>✓ Distribute rations digitally</li>
                <li>✓ Request stock replenishment</li>
                <li>✓ Track citizen entitlements</li>
                <li>✓ Generate sales reports</li>
              </ul>
              <Link to="/register" className="portal-btn">Register as Dealer</Link>
            </div>

            <div className="portal-card admin">
              <div className="portal-icon">
                <BarChart3 size={48} />
              </div>
              <h3>Admin Portal</h3>
              <ul className="portal-features">
                <li>✓ Monitor entire PDS network</li>
                <li>✓ AI-powered demand forecasting</li>
                <li>✓ Approve restock requests</li>
                <li>✓ Track inventory movements</li>
                <li>✓ Generate system-wide reports</li>
              </ul>
              <Link to="/register" className="portal-btn">Admin Access</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Problems Solved Section */}
      <section className="problems-solved">
        <div className="container">
          <h2 className="section-title">Solving Real Problems</h2>
          <div className="problems-grid">
            <div className="problem-card">
              <div className="problem-before">
                <h4>❌ Before</h4>
                <p>Fake ration cards and identity fraud</p>
              </div>
              <div className="problem-after">
                <h4>✅ After</h4>
                <p>Digital authentication with Aadhaar integration</p>
              </div>
            </div>
            <div className="problem-card">
              <div className="problem-before">
                <h4>❌ Before</h4>
                <p>Manual stock management and errors</p>
              </div>
              <div className="problem-after">
                <h4>✅ After</h4>
                <p>Automated inventory with real-time tracking</p>
              </div>
            </div>
            <div className="problem-card">
              <div className="problem-before">
                <h4>❌ Before</h4>
                <p>Corruption and diversion of food grains</p>
              </div>
              <div className="problem-after">
                <h4>✅ After</h4>
                <p>Complete transparency and audit trails</p>
              </div>
            </div>
            <div className="problem-card">
              <div className="problem-before">
                <h4>❌ Before</h4>
                <p>Urban bias and unequal distribution</p>
              </div>
              <div className="problem-after">
                <h4>✅ After</h4>
                <p>Fair allocation based on real-time data</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <h2>Ready to Transform PDS?</h2>
          <p>Join thousands of citizens, dealers, and administrators making food distribution fair and efficient.</p>
          <Link to="/register" className="btn btn-primary btn-lg">
            Get Started Today <CheckCircle size={20} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer govt-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <div className="logo govt-logo">
                <ShoppingBag size={24} />
                <div>
                  <span className="logo-marathi">ई-रेशन पीडीएस</span>
                  <span className="logo-english">e-Ration PDS</span>
                </div>
              </div>
              <p>महाराष्ट्र शासन | Government of Maharashtra</p>
              <p>Food, Civil Supplies & Consumer Protection Department</p>
            </div>
            <div className="footer-section">
              <h4>Quick Links</h4>
              <a href="#">About Department</a>
              <a href="#">Contact Us</a>
              <a href="#">RTI Information</a>
              <a href="#">Policies & Guidelines</a>
              <a href="#">Grievance Redressal</a>
            </div>
            <div className="footer-section">
              <h4>Citizen Services</h4>
              <a href="#">Apply for Ration Card</a>
              <a href="#">Check Eligibility</a>
              <a href="#">Track Application</a>
              <a href="#">FAQs</a>
              <a href="#">Helpline: 1800-RATION</a>
            </div>
            <div className="footer-section">
              <h4>Important Links</h4>
              <a href="https://www.india.gov.in" target="_blank">India.gov.in</a>
              <a href="https://www.maharashtra.gov.in" target="_blank">Maharashtra.gov.in</a>
              <a href="https://www.digitalindia.gov.in" target="_blank">Digital India</a>
              <a href="#">Website Policies</a>
            </div>
          </div>
          <div className="footer-bottom">
            <div className="footer-govt-info">
              <p>© 2025 Government of Maharashtra. All Rights Reserved.</p>
              <div className="footer-badges">
                <span className="badge-item">Last Updated: {new Date().toLocaleDateString('en-IN')}</span>
                <span className="badge-separator">|</span>
                <span className="badge-item">Visitors: 1,234,567</span>
                <span className="badge-separator">|</span>
                <span className="badge-item">Best viewed in Chrome, Firefox, Safari</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;
