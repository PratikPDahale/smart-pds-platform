import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import CitizenService from '../CitizenService';
import DealerService from '../../dealer/DealerService';
import { useCitizens } from '../../hooks/useCitizens';

function ManageCitizens() {
  const { citizens, loading, error, reload } = useCitizens();
  const [dealers, setDealers] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [assigningId, setAssigningId] = useState(null);
  const [dealerSelections, setDealerSelections] = useState({});
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    rationCardNumber: '',
    address: '',
    phoneNumber: '',
    familySize: 1,
    category: 'APL',
    dealerId: '',
  });

  useEffect(() => {
    DealerService.getAll()
      .then((data) => setDealers((data || []).filter((dealer) => dealer.active)))
      .catch(() => setDealers([]));
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      await CitizenService.create({
        ...formData,
        familySize: Number(formData.familySize),
        dealerId: formData.dealerId ? Number(formData.dealerId) : null,
      });
      toast.success('Citizen created successfully');
      setFormData({
        username: '',
        email: '',
        password: '',
        fullName: '',
        rationCardNumber: '',
        address: '',
        phoneNumber: '',
        familySize: 1,
        category: 'APL',
        dealerId: '',
      });
      await reload();
    } catch (err) {
      toast.error(err.message || 'Failed to create citizen');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDealerSelection = (citizenId, dealerId) => {
    setDealerSelections((current) => ({ ...current, [citizenId]: dealerId }));
  };

  const handleAssignDealer = async (citizen) => {
    const selectedDealerId = dealerSelections[citizen.id] || citizen.dealerId;

    if (!selectedDealerId) {
      toast.error('Select a dealer before assigning');
      return;
    }

    setAssigningId(citizen.id);
    try {
      await CitizenService.assignDealer(citizen.id, selectedDealerId);
      toast.success('Dealer assigned successfully');
      await reload();
    } catch (err) {
      toast.error(err.message || 'Failed to assign dealer');
    } finally {
      setAssigningId(null);
    }
  };

  return (
    <div className="dashboard-content">
      <section className="page-intro">
        <div>
          <h2>Manage citizens</h2>
          <p>Use assisted onboarding for citizens who cannot self-register, then assign each citizen to an active fair price shop.</p>
        </div>
      </section>

      {error && <div className="alert alert-danger">{error}</div>}

      <section className="card">
        <div className="section-heading">
          <h3>Add citizen</h3>
          <span className="badge badge-info">Assisted onboarding</span>
        </div>

        <form className="admin-form-grid" onSubmit={handleSubmit}>
          <input className="form-control" name="fullName" placeholder="Full name" value={formData.fullName} onChange={handleChange} required />
          <input className="form-control" name="username" placeholder="Username" value={formData.username} onChange={handleChange} required />
          <input className="form-control" name="email" placeholder="Email" type="email" value={formData.email} onChange={handleChange} required />
          <input className="form-control" name="password" placeholder="Password" type="password" value={formData.password} onChange={handleChange} required />
          <input className="form-control" name="rationCardNumber" placeholder="Ration card number" value={formData.rationCardNumber} onChange={handleChange} required />
          <input className="form-control" name="phoneNumber" placeholder="Phone number" value={formData.phoneNumber} onChange={handleChange} required />
          <input className="form-control" name="familySize" placeholder="Family size" type="number" min="1" value={formData.familySize} onChange={handleChange} required />
          <select className="form-control" name="category" value={formData.category} onChange={handleChange} required>
            <option value="APL">APL</option>
            <option value="BPL">BPL</option>
          </select>
          <select className="form-control" name="dealerId" value={formData.dealerId} onChange={handleChange}>
            <option value="">Assign dealer later</option>
            {dealers.map((dealer) => (
              <option key={dealer.id} value={dealer.id}>{dealer.shopName}</option>
            ))}
          </select>
          <textarea className="form-control admin-form-full" name="address" placeholder="Address" rows="3" value={formData.address} onChange={handleChange} required />
          <button className="btn btn-primary admin-form-actions" type="submit" disabled={submitting}>
            {submitting ? 'Saving...' : 'Create citizen'}
          </button>
        </form>
      </section>

      <section className="card">
        <div className="section-heading">
          <h3>Citizen directory</h3>
          <span className="badge badge-success">{citizens.length} records</span>
        </div>

        {loading ? (
          <p className="empty-state">Loading citizens...</p>
        ) : citizens.length === 0 ? (
          <p className="empty-state">No citizens available yet.</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Username</th>
                  <th>Ration card</th>
                  <th>Category</th>
                  <th>Family size</th>
                  <th>Dealer</th>
                  <th>Assign dealer</th>
                </tr>
              </thead>
              <tbody>
                {citizens.map((citizen) => (
                  <tr key={citizen.id}>
                    <td>{citizen.fullName}</td>
                    <td>{citizen.username}</td>
                    <td>{citizen.rationCardNumber}</td>
                    <td><span className="badge badge-info">{citizen.category}</span></td>
                    <td>{citizen.familySize}</td>
                    <td>{citizen.dealerShopName || 'Not assigned'}</td>
                    <td>
                      <div className="inline-action">
                        <select
                          className="form-control"
                          value={dealerSelections[citizen.id] ?? citizen.dealerId ?? ''}
                          onChange={(event) => handleDealerSelection(citizen.id, event.target.value)}
                        >
                          <option value="">Select dealer</option>
                          {dealers.map((dealer) => (
                            <option key={dealer.id} value={dealer.id}>{dealer.shopName}</option>
                          ))}
                        </select>
                        <button
                          className="btn btn-outline btn-sm"
                          type="button"
                          disabled={assigningId === citizen.id}
                          onClick={() => handleAssignDealer(citizen)}
                        >
                          Assign
                        </button>
                      </div>
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

export default ManageCitizens;
