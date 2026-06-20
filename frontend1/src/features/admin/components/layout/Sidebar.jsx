import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../../../context/AuthContext';
import {
  Home, Users, ShoppingBag, Package, TrendingUp,
  BarChart3, Settings, LogOut, X, User, ClipboardList, MessageSquare
} from 'lucide-react';

function Sidebar({ sidebarOpen, setSidebarOpen, handleLogout }) {
  const { user } = useAuth();

  return (
    <aside className={`dashboard-sidebar admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="logo">
          <BarChart3 size={32} />
          <span>Admin Portal</span>
        </div>

        <button className="close-sidebar" onClick={() => setSidebarOpen(false)} type="button">
          <X size={24} />
        </button>
      </div>

      <div className="sidebar-user admin-sidebar-user">
        <div className="user-avatar admin">
          <User size={24} />
        </div>
        <div className="user-info">
          <h4>{user?.fullName || 'Admin'}</h4>
          <p>System Admin</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/admin" end className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`} onClick={() => setSidebarOpen(false)}>
          <Home size={20} /> Dashboard
        </NavLink>
        <NavLink to="/admin/forecast" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`} onClick={() => setSidebarOpen(false)}>
          <TrendingUp size={20} /> Forecast
        </NavLink>
        <NavLink to="/admin/inventory" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`} onClick={() => setSidebarOpen(false)}>
          <Package size={20} /> Inventory
        </NavLink>
        <NavLink to="/admin/restock-requests" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`} onClick={() => setSidebarOpen(false)}>
          <ClipboardList size={20} /> Restock Requests
        </NavLink>
        <NavLink to="/admin/grievances" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`} onClick={() => setSidebarOpen(false)}>
          <MessageSquare size={20} /> Grievances
        </NavLink>
        <NavLink to="/admin/products" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`} onClick={() => setSidebarOpen(false)}>
          <Package size={20} /> Products
        </NavLink>
        <NavLink to="/admin/dealers" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`} onClick={() => setSidebarOpen(false)}>
          <ShoppingBag size={20} /> Dealers
        </NavLink>
        <NavLink to="/admin/citizens" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`} onClick={() => setSidebarOpen(false)}>
          <Users size={20} /> Citizens
        </NavLink>
        <NavLink to="/admin/analytics" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`} onClick={() => setSidebarOpen(false)}>
          <BarChart3 size={20} /> Analytics
        </NavLink>
        <NavLink to="/admin/settings" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`} onClick={() => setSidebarOpen(false)}>
          <Settings size={20} /> Settings
        </NavLink>
      </nav>

      <button className="logout-btn" onClick={handleLogout} type="button">
        <LogOut size={20} /> Logout
      </button>
    </aside>
  );
}

export default Sidebar;
