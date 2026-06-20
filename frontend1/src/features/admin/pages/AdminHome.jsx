import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, AlertTriangle, Package, ShoppingBag, Users } from 'lucide-react';
import { useAdminStats } from '../hooks/useAdminStats';
import { useInventory } from '../hooks/useInventory';
import restockRequestService from '../restock/restockRequestService';
import grievanceService from '../grievance/grievanceService';

function AdminHome() {
  const { stats, loading, error } = useAdminStats();
  const { inventory, lowStockItems } = useInventory();
  const [pendingRestockRequests, setPendingRestockRequests] = useState([]);
  const [openGrievances, setOpenGrievances] = useState([]);

  const totalStock = inventory.reduce((sum, item) => sum + (item.currentStock || 0), 0);
  const summaryCards = [
    { label: 'Total Citizens', value: stats?.totalCitizens ?? 0, icon: Users, tone: 'primary' },
    { label: 'Total Dealers', value: stats?.totalDealers ?? 0, icon: ShoppingBag, tone: 'success' },
    { label: 'Products', value: stats?.totalProducts ?? 0, icon: Package, tone: 'info' },
    { label: 'Distributions', value: stats?.totalDistributions ?? 0, icon: Activity, tone: 'warning' },
  ];

  useEffect(() => {
    restockRequestService.getAll('PENDING')
      .then((data) => setPendingRestockRequests(data || []))
      .catch(() => setPendingRestockRequests([]));
    grievanceService.getAll('OPEN')
      .then((data) => setOpenGrievances(data || []))
      .catch(() => setOpenGrievances([]));
  }, []);

  return (
    <div className="dashboard-content">
      <section className="page-intro">
        <div>
          <h2>Admin overview</h2>
          <p>Live metrics from the Spring Boot backend for citizens, dealers, stock, and distributions.</p>
        </div>
      </section>

      {error && <div className="alert alert-danger">{error}</div>}

      <section className="stats-grid">
        {summaryCards.map(({ label, value, icon: Icon, tone }) => (
          <article key={label} className={`stat-panel ${tone}`}>
            <div className="stat-panel__icon">
              <Icon size={20} />
            </div>
            <div>
              <p>{label}</p>
              <h3>{loading ? '...' : value}</h3>
            </div>
          </article>
        ))}
      </section>

      <section className="insight-grid">
        <article className="card">
          <div className="section-heading">
            <h3>Inventory snapshot</h3>
            <span className="badge badge-info">Live</span>
          </div>
          <div className="key-metrics">
            <div>
              <strong>{totalStock.toFixed(2)}</strong>
              <span>Total stock in network</span>
            </div>
            <div>
              <strong>{lowStockItems.length}</strong>
              <span>Low stock alerts</span>
            </div>
            <div>
              <strong>{stats?.activeDealers ?? 0}</strong>
              <span>Active dealers</span>
            </div>
          </div>
        </article>

        <article className="card">
          <div className="section-heading">
            <h3>Quick actions</h3>
            <span className="badge badge-success">Admin</span>
          </div>
          <div className="quick-links">
            <Link className="quick-link" to="/admin/dealers">Manage dealers</Link>
            <Link className="quick-link" to="/admin/citizens">Manage citizens</Link>
            <Link className="quick-link" to="/admin/products">Manage products</Link>
            <Link className="quick-link" to="/admin/inventory">Update stock</Link>
            <Link className="quick-link" to="/admin/restock-requests">Review restock requests</Link>
            <Link className="quick-link" to="/admin/grievances">Review grievances</Link>
            <Link className="quick-link" to="/admin/forecast">Generate forecasts</Link>
          </div>
        </article>
      </section>

      <section className="card">
        <div className="section-heading">
          <h3>Open citizen grievances</h3>
          <Link className="quick-link compact" to="/admin/grievances">Review all</Link>
        </div>
        {openGrievances.length === 0 ? (
          <p className="empty-state">No open grievances.</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Citizen</th>
                  <th>Dealer</th>
                  <th>Subject</th>
                  <th>Priority</th>
                  <th>Submitted</th>
                </tr>
              </thead>
              <tbody>
                {openGrievances.slice(0, 5).map((grievance) => (
                  <tr key={grievance.id}>
                    <td>{grievance.citizenName}</td>
                    <td>{grievance.dealerName}</td>
                    <td>{grievance.subject}</td>
                    <td>{grievance.priority}</td>
                    <td>{grievance.createdAt ? new Date(grievance.createdAt).toLocaleString() : 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="card">
        <div className="section-heading">
          <h3>Pending restock requests</h3>
          <Link className="quick-link compact" to="/admin/restock-requests">Review all</Link>
        </div>
        {pendingRestockRequests.length === 0 ? (
          <p className="empty-state">No pending restock requests.</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Dealer</th>
                  <th>Product</th>
                  <th>Requested</th>
                  <th>Current stock</th>
                  <th>Last 30 days issued</th>
                  <th>Reason</th>
                </tr>
              </thead>
              <tbody>
                {pendingRestockRequests.slice(0, 5).map((request) => (
                  <tr key={request.id}>
                    <td>{request.dealerName}</td>
                    <td>{request.productName}</td>
                    <td>{Number(request.quantity || 0).toFixed(2)} kg</td>
                    <td>{Number(request.currentStock || 0).toFixed(2)} kg</td>
                    <td>{Number(request.last30DaysDistributed || 0).toFixed(2)} kg</td>
                    <td>{request.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="card">
        <div className="section-heading">
          <h3>Low stock alerts</h3>
          <AlertTriangle size={18} />
        </div>
        {lowStockItems.length === 0 ? (
          <p className="empty-state">No low stock alerts at the selected threshold.</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Dealer</th>
                  <th>Product</th>
                  <th>Current stock</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {lowStockItems.slice(0, 6).map((item) => (
                  <tr key={item.id}>
                    <td>{item.dealerName || `Dealer #${item.dealerId}`}</td>
                    <td>{item.productName}</td>
                    <td>{item.currentStock}</td>
                    <td><span className="badge badge-danger">Low</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default AdminHome;
