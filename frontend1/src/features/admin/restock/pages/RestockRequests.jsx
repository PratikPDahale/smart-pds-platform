import React, { useEffect, useMemo, useState } from 'react';
import { Check, ClipboardList, X } from 'lucide-react';
import toast from 'react-hot-toast';
import getApiErrorMessage from '../../../../utils/getApiErrorMessage';
import restockRequestService from '../restockRequestService';

const statusTone = {
  PENDING: 'badge-warning',
  APPROVED: 'badge-success',
  REJECTED: 'badge-danger',
};

const formatKg = (value) => `${Number(value || 0).toFixed(2)} kg`;

function RestockRequests() {
  const [requests, setRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [loading, setLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState(null);
  const [remarks, setRemarks] = useState({});

  const pendingCount = useMemo(
    () => requests.filter((request) => request.status === 'PENDING').length,
    [requests]
  );

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const data = await restockRequestService.getAll(statusFilter);
      setRequests(data || []);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to load restock requests'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [statusFilter]);

  const handleDecision = async (request, action) => {
    setReviewingId(request.id);
    try {
      if (action === 'approve') {
        await restockRequestService.approve(request.id, remarks[request.id] || '');
        toast.success('Request approved and stock added');
      } else {
        await restockRequestService.reject(request.id, remarks[request.id] || '');
        toast.success('Request rejected');
      }
      setRemarks((current) => ({ ...current, [request.id]: '' }));
      await fetchRequests();
    } catch (error) {
      toast.error(getApiErrorMessage(error, `Failed to ${action} request`));
    } finally {
      setReviewingId(null);
    }
  };

  return (
    <div className="dashboard-content">
      <section className="page-intro">
        <div>
          <h2>Restock requests</h2>
          <p>Review dealer replenishment requests against stock position, distribution history, and stated reason.</p>
        </div>
        <select className="form-control restock-filter" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="">All</option>
        </select>
      </section>

      <section className="stats-grid">
        <article className="stat-panel warning">
          <div className="stat-panel__icon"><ClipboardList size={20} /></div>
          <div><p>Pending in current view</p><h3>{loading ? '...' : pendingCount}</h3></div>
        </article>
        <article className="stat-panel info">
          <div><p>Requests shown</p><h3>{loading ? '...' : requests.length}</h3></div>
        </article>
      </section>

      <section className="restock-request-list">
        {loading ? (
          <div className="card"><p className="empty-state">Loading restock requests...</p></div>
        ) : requests.length === 0 ? (
          <div className="card"><p className="empty-state">No restock requests found.</p></div>
        ) : (
          requests.map((request) => (
            <article className="card restock-request-card" key={request.id}>
              <div className="restock-request-card__header">
                <div>
                  <h3>{request.productName}</h3>
                  <p>{request.dealerName} requested {formatKg(request.quantity)}</p>
                </div>
                <span className={`badge ${statusTone[request.status] || 'badge-info'}`}>{request.status}</span>
              </div>

              <div className="restock-review-grid">
                <div>
                  <span>Current stock</span>
                  <strong>{formatKg(request.currentStock)}</strong>
                </div>
                <div>
                  <span>Last 30 days issued</span>
                  <strong>{formatKg(request.last30DaysDistributed)}</strong>
                </div>
                <div>
                  <span>Total issued</span>
                  <strong>{formatKg(request.totalDistributed)}</strong>
                </div>
                <div>
                  <span>Distribution records</span>
                  <strong>{request.distributionCount || 0}</strong>
                </div>
              </div>

              <div className="restock-reason">
                <span>Dealer reason</span>
                <p>{request.reason}</p>
              </div>

              <div className="alert alert-info restock-review-hint">
                {request.reviewHint}
              </div>

              {request.status === 'PENDING' ? (
                <div className="restock-actions">
                  <textarea
                    className="form-control"
                    rows="2"
                    placeholder="Admin remarks for this decision"
                    value={remarks[request.id] || ''}
                    onChange={(event) => setRemarks((current) => ({ ...current, [request.id]: event.target.value }))}
                  />
                  <div className="restock-action-buttons">
                    <button
                      className="btn btn-secondary"
                      type="button"
                      disabled={reviewingId === request.id}
                      onClick={() => handleDecision(request, 'approve')}
                    >
                      <Check size={16} /> Approve
                    </button>
                    <button
                      className="btn btn-danger"
                      type="button"
                      disabled={reviewingId === request.id}
                      onClick={() => handleDecision(request, 'reject')}
                    >
                      <X size={16} /> Reject
                    </button>
                  </div>
                </div>
              ) : (
                <p className="restock-admin-remarks">
                  Admin remarks: {request.adminRemarks || 'No remarks added'}
                </p>
              )}
            </article>
          ))
        )}
      </section>
    </div>
  );
}

export default RestockRequests;
