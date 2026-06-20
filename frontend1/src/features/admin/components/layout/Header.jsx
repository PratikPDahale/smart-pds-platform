import React from 'react';
import { Menu, ShieldCheck } from 'lucide-react';

function Header({ setSidebarOpen }) {
  return (
    <div className="dashboard-header admin-dashboard-header">
      <div className="admin-header-main">
        <button className="menu-btn" onClick={() => setSidebarOpen(true)} type="button" aria-label="Open navigation">
          <Menu size={24} />
        </button>

        <div className="header-copy">
          <span className="admin-header-kicker">Control Center</span>
          <h1>Admin Dashboard</h1>
          <p>Manage citizens, dealers, inventory, and forecasting from one place.</p>
        </div>
      </div>

      <div className="header-actions admin-header-actions">
        <div className="admin-header-chip">
          <ShieldCheck size={18} />
          <span>Administrator</span>
        </div>
      </div>
    </div>
  );
}

export default Header;
