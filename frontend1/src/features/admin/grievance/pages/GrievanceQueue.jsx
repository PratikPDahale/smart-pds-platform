import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle, ClipboardList } from 'lucide-react';
import toast from 'react-hot-toast';
import getApiErrorMessage from '../../../../utils/getApiErrorMessage';
import grievanceService from '../grievanceService';

const statusTone = {
  OPEN: 'badge-danger',
  IN_REVIEW: 'badge-warning',
  RESOLVED: 'badge-success',
  REJECTED: 'badge-info',
};

function GrievanceQueue({ dealerId = null, title = 'Grievance queue', scope = 'admin' }) {
  const [grievances, setGrievances] = useState([]);
  const [statusFilter, setStatusFilter] = useState(scope === 'admin' ? 'OPEN' : '');
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [responses, setResponses] = useState({});

  const openCount = useMemo(
    () => grievances.filter((grievance) => grievance.status === 'OPEN').length,
    [grievances]
  );

  const fetchGrievances = async () => {
    setLoading(true);
    try {
      const data = dealerId
        ? await grievanceService.getByDealer(dealerId)
        : await grievanceService.getAll(statusFilter);
      const filteredData = dealerId && statusFilter
        ? (data || []).filter((grievance) => grievance.status === statusFilter)
        : data || [];
      setGrievances(filteredData);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to load grievances'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrievances();
  }, [dealerId, statusFilter]);

  const handleStatusUpdate = async (grievance, status) => {
    setUpdatingId(grievance.id);
    try {
      await grievanceService.updateStatus(grievance.id, {
        status,
        response: responses[grievance.id] || '',
      });
      toast.success('Grievance updated');
      setResponses((current) => ({ ...current, [grievance.id]: '' }));
      await fetchGrievances();
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to update grievance'));
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="dashboard-content">
      <section className="page-intro">
        <div>
          <h2>{title}</h2>
          <p>Track citizen complaints routed to dealers and record follow-up action.</p>
        </div>
        <select className="form-control restock-filter" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
          <option value="">All</option>
          <option value="OPEN">Open</option>
          <option value="IN_REVIEW">In review</option>
          <option value="RESOLVED">Resolved</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </section>

      <section className="stats-grid">
        <article className="stat-panel danger">
          <div className="stat-panel__icon"><ClipboardList size={20} /></div>
          <div><p>Open complaints</p><h3>{loading ? '...' : openCount}</h3></div>
        </article>
        <article className="stat-panel info">
          <div><p>Shown in queue</p><h3>{loading ? '...' : grievances.length}</h3></div>
        </article>
      </section>

      <section className="grievance-list">
        {loading ? (
          <div className="card"><p className="empty-state">Loading grievances...</p></div>
        ) : grievances.length === 0 ? (
          <div className="card"><p className="empty-state">No grievances found.</p></div>
        ) : (
          grievances.map((grievance) => (
            <article className="card grievance-card" key={grievance.id}>
              <div className="grievance-card__header">
                <div>
                  <h3>{grievance.subject}</h3>
                  <p>
                    {grievance.citizenName} ({grievance.rationCardNumber}) against {grievance.dealerName}
                  </p>
                </div>
                <span className={`badge ${statusTone[grievance.status] || 'badge-info'}`}>{grievance.status.replace('_', ' ')}</span>
              </div>

              <div className="grievance-meta">
                <span>{grievance.category}</span>
                <span>{grievance.priority} priority</span>
                <span>{grievance.createdAt ? new Date(grievance.createdAt).toLocaleString() : 'N/A'}</span>
              </div>

              <p className="grievance-description">{grievance.description}</p>

              {grievance.response && (
                <div className="alert alert-info grievance-response">
                  <CheckCircle size={16} /> {grievance.response}
                </div>
              )}

              {grievance.status !== 'RESOLVED' && grievance.status !== 'REJECTED' && (
                <div className="restock-actions">
                  <textarea
                    className="form-control"
                    rows="2"
                    placeholder="Response or action taken"
                    value={responses[grievance.id] || ''}
                    onChange={(event) => setResponses((current) => ({ ...current, [grievance.id]: event.target.value }))}
                  />
                  <div className="restock-action-buttons">
                    <button
                      className="btn btn-outline"
                      type="button"
                      disabled={updatingId === grievance.id}
                      onClick={() => handleStatusUpdate(grievance, 'IN_REVIEW')}
                    >
                      In Review
                    </button>
                    <button
                      className="btn btn-secondary"
                      type="button"
                      disabled={updatingId === grievance.id}
                      onClick={() => handleStatusUpdate(grievance, 'RESOLVED')}
                    >
                      Resolve
                    </button>
                    {scope === 'admin' && (
                      <button
                        className="btn btn-danger"
                        type="button"
                        disabled={updatingId === grievance.id}
                        onClick={() => handleStatusUpdate(grievance, 'REJECTED')}
                      >
                        Reject
                      </button>
                    )}
                  </div>
                </div>
              )}
            </article>
          ))
        )}
      </section>
    </div>
  );
}

export default GrievanceQueue;
