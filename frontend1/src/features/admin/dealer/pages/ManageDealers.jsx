import React, { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import DealerService from '../DealerService';
import { useDealers } from '../../hooks/useDealers';

const statusTone = {
  PENDING_APPROVAL: 'badge-warning',
  APPROVED: 'badge-success',
  ACTIVE: 'badge-success',
  INACTIVE: 'badge-warning',
  REJECTED: 'badge-danger',
  SUSPENDED: 'badge-danger',
};

function ManageDealers() {
  const { dealers, loading, error, reload } = useDealers();
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [reviewingId, setReviewingId] = useState(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);
  const [rejectionReasons, setRejectionReasons] = useState({});

  const pendingDealers = useMemo(
    () => dealers.filter((dealer) => (dealer.status || '').toUpperCase() === 'PENDING_APPROVAL'),
    [dealers]
  );

  const visibleDealers = useMemo(() => {
    if (statusFilter === 'ALL') {
      return dealers;
    }

    return dealers.filter((dealer) => (dealer.status || '').toUpperCase() === statusFilter);
  }, [dealers, statusFilter]);

  const handleReview = async (dealer, action) => {
    const rejectionReason = rejectionReasons[dealer.id]?.trim();

    if (action === 'REJECT' && !rejectionReason) {
      toast.error('Add a rejection reason before rejecting the dealer');
      return;
    }

    setReviewingId(dealer.id);
    try {
      await DealerService.approve(dealer.id, {
        action,
        rejectionReason: action === 'REJECT' ? rejectionReason : '',
      });
      toast.success(action === 'APPROVE' ? 'Dealer approved' : 'Dealer rejected');
      setRejectionReasons((current) => ({ ...current, [dealer.id]: '' }));
      await reload();
    } catch (err) {
      toast.error(err.message || err.response?.data?.message || 'Failed to review dealer');
    } finally {
      setReviewingId(null);
    }
  };

  const toggleDealerStatus = async (dealer) => {
    setStatusUpdatingId(dealer.id);
    try {
      if (dealer.active) {
        await DealerService.deactivate(dealer.id);
        toast.success('Dealer deactivated');
      } else {
        await DealerService.activate(dealer.id);
        toast.success('Dealer activated');
      }
      await reload();
    } catch (err) {
      toast.error(err.message || 'Failed to update dealer status');
    } finally {
      setStatusUpdatingId(null);
    }
  };

  return (
    <div className="dashboard-content">
      <section className="page-intro">
        <div>
          <h2>Manage dealers</h2>
          <p>Dealers apply through public registration. Admin reviews applications, activates approved shops, and suspends access when required.</p>
        </div>
        <div className="filter-group">
          <label htmlFor="dealer-status-filter">Filter by status</label>
          <select
            id="dealer-status-filter"
            className="form-control"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="ALL">All</option>
            <option value="PENDING_APPROVAL">Pending approval</option>
            <option value="APPROVED">Approved</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="REJECTED">Rejected</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
        </div>
      </section>

      {error && <div className="alert alert-danger">{error}</div>}

      <section className="card">
        <div className="section-heading">
          <h3>Dealer applications</h3>
          <span className="badge badge-warning">{pendingDealers.length} pending</span>
        </div>

        {loading ? (
          <p className="empty-state">Loading dealer applications...</p>
        ) : pendingDealers.length === 0 ? (
          <p className="empty-state">No dealer applications are waiting for review.</p>
        ) : (
          <div className="stack-list">
            {pendingDealers.map((dealer) => (
              <div className="review-item" key={dealer.id}>
                <div>
                  <strong>{dealer.shopName}</strong>
                  <span>{dealer.fullName} | {dealer.region || 'No region'} | License: {dealer.shopLicense}</span>
                  <span>{dealer.address}</span>
                </div>
                <textarea
                  className="form-control"
                  rows="2"
                  placeholder="Rejection reason, if rejecting"
                  value={rejectionReasons[dealer.id] || ''}
                  onChange={(event) => setRejectionReasons((current) => ({ ...current, [dealer.id]: event.target.value }))}
                />
                <div className="review-actions">
                  <button className="btn btn-secondary btn-sm" type="button" disabled={reviewingId === dealer.id} onClick={() => handleReview(dealer, 'APPROVE')}>
                    Approve
                  </button>
                  <button className="btn btn-danger btn-sm" type="button" disabled={reviewingId === dealer.id} onClick={() => handleReview(dealer, 'REJECT')}>
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="card">
        <div className="section-heading">
          <h3>Dealer directory</h3>
          <span className="badge badge-success">{visibleDealers.length} records</span>
        </div>

        {loading ? (
          <p className="empty-state">Loading dealers...</p>
        ) : visibleDealers.length === 0 ? (
          <p className="empty-state">No dealers found for this filter.</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Shop</th>
                  <th>Owner</th>
                  <th>Region</th>
                  <th>License</th>
                  <th>Status</th>
                  <th>Access</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {visibleDealers.map((dealer) => (
                  <tr key={dealer.id}>
                    <td>{dealer.shopName}</td>
                    <td>{dealer.fullName}</td>
                    <td>{dealer.region || 'N/A'}</td>
                    <td>{dealer.shopLicense}</td>
                    <td><span className={`badge ${statusTone[dealer.status] || 'badge-info'}`}>{dealer.status || 'UNKNOWN'}</span></td>
                    <td>
                      <span className={`badge ${dealer.active ? 'badge-success' : 'badge-warning'}`}>
                        {dealer.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-outline btn-sm"
                        type="button"
                        disabled={statusUpdatingId === dealer.id || dealer.status === 'PENDING_APPROVAL' || dealer.status === 'REJECTED'}
                        onClick={() => toggleDealerStatus(dealer)}
                      >
                        {dealer.active ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
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

export default ManageDealers;
