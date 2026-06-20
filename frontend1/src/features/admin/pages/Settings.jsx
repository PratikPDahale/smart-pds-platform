import React, { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Bell,
  Database,
  RotateCcw,
  Save,
  ShieldCheck,
  SlidersHorizontal,
  Store,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useAdminStats } from '../hooks/useAdminStats';
import { useInventory } from '../hooks/useInventory';

const SETTINGS_STORAGE_KEY = 'pdsAdminSettings';

const defaultSettings = {
  systemName: 'e-Ration PDS',
  regionName: 'Digital Maharashtra',
  supportEmail: 'support@eration.local',
  helplineNumber: '1800-000-000',
  lowStockThreshold: 50,
  criticalStockThreshold: 20,
  monthlyQuotaReviewDay: 1,
  restockAutoCloseDays: 7,
  sessionTimeoutMinutes: 30,
  auditRetentionDays: 365,
  dealerApprovalRequired: true,
  dealerRestockEnabled: true,
  citizenGrievanceEnabled: true,
  requireGrievanceResponse: true,
  lowStockNotifications: true,
  restockNotifications: true,
  grievanceNotifications: true,
  maintenanceMode: false,
};

const loadSettings = () => {
  try {
    const savedSettings = JSON.parse(localStorage.getItem(SETTINGS_STORAGE_KEY) || '{}');
    return { ...defaultSettings, ...savedSettings };
  } catch {
    return defaultSettings;
  }
};

function Settings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState(loadSettings);
  const { stats } = useAdminStats();
  const { lowStockItems } = useInventory(Number(settings.lowStockThreshold) || defaultSettings.lowStockThreshold);

  const criticalPreview = useMemo(
    () => lowStockItems.filter((item) => Number(item.currentStock || 0) <= Number(settings.criticalStockThreshold || 0)),
    [lowStockItems, settings.criticalStockThreshold]
  );

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setSettings((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleNumberChange = (event) => {
    const { name, value } = event.target;
    setSettings((current) => ({
      ...current,
      [name]: value === '' ? '' : Number(value),
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (Number(settings.criticalStockThreshold) >= Number(settings.lowStockThreshold)) {
      toast.error('Critical threshold must be lower than low-stock threshold');
      return;
    }

    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    toast.success('Settings saved');
  };

  const handleReset = () => {
    setSettings(defaultSettings);
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(defaultSettings));
    toast.success('Settings reset to project defaults');
  };

  return (
    <div className="dashboard-content settings-page">
      <section className="page-intro">
        <div>
          <h2>System settings</h2>
          <p>Configure operational rules for inventory alerts, dealer workflows, grievance tracking, and admin controls.</p>
        </div>
        <span className="badge badge-info">{user?.fullName || 'Admin'}</span>
      </section>

      <section className="stats-grid">
        <article className="stat-panel info">
          <div className="stat-panel__icon"><Store size={20} /></div>
          <div><p>Active dealers</p><h3>{stats?.activeDealers ?? 0}</h3></div>
        </article>
        <article className="stat-panel warning">
          <div className="stat-panel__icon"><Bell size={20} /></div>
          <div><p>Low stock preview</p><h3>{lowStockItems.length}</h3></div>
        </article>
        <article className="stat-panel danger">
          <div className="stat-panel__icon"><SlidersHorizontal size={20} /></div>
          <div><p>Critical stock preview</p><h3>{criticalPreview.length}</h3></div>
        </article>
      </section>

      <form className="settings-layout" onSubmit={handleSubmit}>
        <section className="card settings-panel">
          <div className="section-heading">
            <h3><Store size={18} /> Portal profile</h3>
            <span className="badge badge-success">Public</span>
          </div>
          <div className="settings-form-grid">
            <label>
              System name
              <input className="form-control" name="systemName" value={settings.systemName} onChange={handleChange} required />
            </label>
            <label>
              Region
              <input className="form-control" name="regionName" value={settings.regionName} onChange={handleChange} required />
            </label>
            <label>
              Support email
              <input className="form-control" name="supportEmail" type="email" value={settings.supportEmail} onChange={handleChange} required />
            </label>
            <label>
              Helpline number
              <input className="form-control" name="helplineNumber" value={settings.helplineNumber} onChange={handleChange} required />
            </label>
          </div>
        </section>

        <section className="card settings-panel">
          <div className="section-heading">
            <h3><SlidersHorizontal size={18} /> Inventory and quota rules</h3>
            <span className="badge badge-warning">Operational</span>
          </div>
          <div className="settings-form-grid">
            <label>
              Low stock threshold (kg)
              <input className="form-control" name="lowStockThreshold" type="number" min="1" value={settings.lowStockThreshold} onChange={handleNumberChange} required />
            </label>
            <label>
              Critical stock threshold (kg)
              <input className="form-control" name="criticalStockThreshold" type="number" min="0" value={settings.criticalStockThreshold} onChange={handleNumberChange} required />
            </label>
            <label>
              Monthly quota review day
              <input className="form-control" name="monthlyQuotaReviewDay" type="number" min="1" max="28" value={settings.monthlyQuotaReviewDay} onChange={handleNumberChange} required />
            </label>
            <label>
              Restock review SLA (days)
              <input className="form-control" name="restockAutoCloseDays" type="number" min="1" max="30" value={settings.restockAutoCloseDays} onChange={handleNumberChange} required />
            </label>
          </div>
        </section>

        <section className="card settings-panel">
          <div className="section-heading">
            <h3><Bell size={18} /> Notifications</h3>
            <span className="badge badge-info">Alerts</span>
          </div>
          <div className="settings-toggle-list">
            <SettingsToggle label="Low stock alerts" description="Show stock alerts when products fall below the selected threshold." name="lowStockNotifications" checked={settings.lowStockNotifications} onChange={handleChange} />
            <SettingsToggle label="Restock request alerts" description="Highlight pending dealer restock requests for admin review." name="restockNotifications" checked={settings.restockNotifications} onChange={handleChange} />
            <SettingsToggle label="Grievance alerts" description="Surface new citizen complaints in the admin dashboard." name="grievanceNotifications" checked={settings.grievanceNotifications} onChange={handleChange} />
          </div>
        </section>

        <section className="card settings-panel">
          <div className="section-heading">
            <h3><ShieldCheck size={18} /> Workflow controls</h3>
            <span className="badge badge-danger">Governance</span>
          </div>
          <div className="settings-toggle-list">
            <SettingsToggle label="Dealer approval required" description="New dealer registrations must be reviewed before activation." name="dealerApprovalRequired" checked={settings.dealerApprovalRequired} onChange={handleChange} />
            <SettingsToggle label="Dealer restock requests" description="Allow dealers to request replenishment from their portal." name="dealerRestockEnabled" checked={settings.dealerRestockEnabled} onChange={handleChange} />
            <SettingsToggle label="Citizen grievances" description="Allow citizens to submit complaints about assigned dealers." name="citizenGrievanceEnabled" checked={settings.citizenGrievanceEnabled} onChange={handleChange} />
            <SettingsToggle label="Response required for closure" description="Encourage admins or dealers to add a response before resolving grievances." name="requireGrievanceResponse" checked={settings.requireGrievanceResponse} onChange={handleChange} />
          </div>
        </section>

        <section className="card settings-panel">
          <div className="section-heading">
            <h3><Database size={18} /> Security and retention</h3>
            <span className="badge badge-success">Admin</span>
          </div>
          <div className="settings-form-grid">
            <label>
              Session timeout (minutes)
              <input className="form-control" name="sessionTimeoutMinutes" type="number" min="5" max="240" value={settings.sessionTimeoutMinutes} onChange={handleNumberChange} required />
            </label>
            <label>
              Audit retention (days)
              <input className="form-control" name="auditRetentionDays" type="number" min="30" max="3650" value={settings.auditRetentionDays} onChange={handleNumberChange} required />
            </label>
          </div>
          <div className="settings-toggle-list settings-maintenance">
            <SettingsToggle label="Maintenance mode" description="Use during planned downtime. Keep off during normal ration operations." name="maintenanceMode" checked={settings.maintenanceMode} onChange={handleChange} />
          </div>
        </section>

        <section className="card settings-summary">
          <div className="section-heading">
            <h3>Current policy summary</h3>
            <span className={`badge ${settings.maintenanceMode ? 'badge-danger' : 'badge-success'}`}>
              {settings.maintenanceMode ? 'Maintenance' : 'Operational'}
            </span>
          </div>
          <div className="settings-summary-grid">
            <div><span>Low stock</span><strong>{settings.lowStockThreshold} kg</strong></div>
            <div><span>Critical stock</span><strong>{settings.criticalStockThreshold} kg</strong></div>
            <div><span>Quota review</span><strong>Day {settings.monthlyQuotaReviewDay}</strong></div>
            <div><span>Restock SLA</span><strong>{settings.restockAutoCloseDays} days</strong></div>
          </div>
          <div className="settings-actions">
            <button className="btn btn-primary" type="submit"><Save size={16} /> Save settings</button>
            <button className="btn btn-outline" type="button" onClick={handleReset}><RotateCcw size={16} /> Reset defaults</button>
          </div>
        </section>
      </form>
    </div>
  );
}

function SettingsToggle({ label, description, name, checked, onChange }) {
  return (
    <label className="settings-toggle">
      <input type="checkbox" name={name} checked={checked} onChange={onChange} />
      <span />
      <div>
        <strong>{label}</strong>
        <p>{description}</p>
      </div>
    </label>
  );
}

export default Settings;
