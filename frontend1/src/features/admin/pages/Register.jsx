import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../../api/axios.js';
import { ShoppingBag, User, Mail, Lock, Phone, MapPin, FileText } from 'lucide-react';
import './Auth.css';

function Register() {
  const [role, setRole] = useState('CITIZEN');
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    phoneNumber: '',
    address: '',
    rationCardNumber: '',
    familySize: '',
    category: '',
    shopName: '',
    shopLicense: '',
    region: '',
    aadhaarRef: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let url = '';
      let payload = {};

      if (role === 'CITIZEN') {
        url = '/citizens';
        payload = {
          fullName: formData.fullName,
          username: formData.username,
          email: formData.email,
          password: formData.password,
          rationCardNumber: formData.rationCardNumber,
          address: formData.address,
          phoneNumber: formData.phoneNumber,
          familySize: parseInt(formData.familySize),
          category: formData.category
        };
      } else if (role === 'DEALER') {
        url = '/dealers/register';  // Use self-registration endpoint
        payload = {
          fullName: formData.fullName,
          username: formData.username,
          email: formData.email,
          password: formData.password,
          shopName: formData.shopName,
          shopLicense: formData.shopLicense,
          region: formData.region,
          address: formData.address,
          phoneNumber: formData.phoneNumber,
          aadhaarRef: formData.aadhaarRef
        };
      } else if (role === 'ADMIN') {
        url = '/auth/admin/register';  // Admin registration endpoint
        payload = {
          fullName: formData.fullName,
          username: formData.username,
          email: formData.email,
          password: formData.password,
          phoneNumber: formData.phoneNumber,
          department: formData.department,
          designation: formData.designation,
          aadhaarRef: formData.aadhaarRef,
          registrationCode: formData.registrationCode
        };
      }

      await api.post(url, payload);
      if (role === 'DEALER') {
        toast.success('Dealer registration submitted! Pending admin approval.');
      } else if (role === 'ADMIN') {
        toast.success('Admin registration successful! You can now login.');
      } else {
        toast.success('Citizen registered successfully!');
      }
      setTimeout(() => navigate('/login'), 1500);
    } catch (error) {
      console.error('Registration error:', error.response?.data); // Detailed error log
      
      // Handle validation errors
      if (error.response?.data?.data && typeof error.response.data.data === 'object') {
        // Backend returns validation errors as a Map in the data field
        const validationErrors = Object.entries(error.response.data.data)
          .map(([field, message]) => `${field}: ${message}`)
          .join('; ');
        toast.error(validationErrors, { duration: 5000 });
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Registration failed. Please check all required fields.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container register-container">
        <div className="auth-card register-card">
          <div className="auth-header">
            <div className="logo">
              <ShoppingBag size={40} />
            </div>
            <h1>Create Account</h1>
            <p>Join the e-Ration PDS platform</p>
          </div>

          <div className="role-selector">
            <button
              type="button"
              className={`role-btn ${role === 'CITIZEN' ? 'active' : ''}`}
              onClick={() => setRole('CITIZEN')}
            >
              Citizen
            </button>
            <button
              type="button"
              className={`role-btn ${role === 'DEALER' ? 'active' : ''}`}
              onClick={() => setRole('DEALER')}
            >
              Dealer
            </button>
            <button
              type="button"
              className={`role-btn ${role === 'ADMIN' ? 'active' : ''}`}
              onClick={() => setRole('ADMIN')}
              title="For administrators - requires registration code"
            >
              Admin
            </button>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-row">
              <div className="form-group">
                <label><User size={18} /> Full Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter full name"
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label><User size={18} /> Username</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Choose username"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label><Mail size={18} /> Email</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label><Lock size={18} /> Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Min 6 chars, 1 upper, 1 lower, 1 digit, 1 special"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                  minLength="6"
                  title="Password must contain at least one uppercase, one lowercase, one digit and one special character (@$!%*?&)"
                />
              </div>
            </div>

            {role === 'CITIZEN' && (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label><FileText size={18} /> Ration Card Number</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter ration card number"
                      value={formData.rationCardNumber}
                      onChange={(e) => setFormData({...formData, rationCardNumber: e.target.value})}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label><User size={18} /> Family Size</label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Number of members"
                      value={formData.familySize}
                      onChange={(e) => setFormData({...formData, familySize: e.target.value})}
                      required
                      min="1"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label><FileText size={18} /> Category</label>
                    <select
                      className="form-control"
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      required
                    >
                      <option value="">Select category</option>
                      <option value="APL">APL (Above Poverty Line)</option>
                      <option value="BPL">BPL (Below Poverty Line)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label><Phone size={18} /> Phone Number</label>
                    <input
                      type="tel"
                      className="form-control"
                      placeholder="10-digit number"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                      required
                      pattern="[0-9]{10}"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label><MapPin size={18} /> Address</label>
                  <textarea
                    className="form-control"
                    placeholder="Enter full address"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    required
                    rows="3"
                  ></textarea>
                </div>
              </>
            )}

            {role === 'DEALER' && (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label><ShoppingBag size={18} /> Shop Name</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Fair Price Shop name"
                      value={formData.shopName}
                      onChange={(e) => setFormData({...formData, shopName: e.target.value})}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label><FileText size={18} /> Shop License</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="License number"
                      value={formData.shopLicense}
                      onChange={(e) => setFormData({...formData, shopLicense: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label><MapPin size={18} /> Region</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Operating region"
                      value={formData.region}
                      onChange={(e) => setFormData({...formData, region: e.target.value})}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label><Phone size={18} /> Phone Number</label>
                    <input
                      type="tel"
                      className="form-control"
                      placeholder="10-digit number"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                      required
                      pattern="[0-9]{10}"
                      title="Phone number must be exactly 10 digits"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label><FileText size={18} /> Aadhaar Number</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="12-digit Aadhaar number"
                      value={formData.aadhaarRef}
                      onChange={(e) => setFormData({...formData, aadhaarRef: e.target.value})}
                      required
                      pattern="[0-9]{12}"
                      title="Aadhaar number must be exactly 12 digits"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label><MapPin size={18} /> Shop Address</label>
                  <textarea
                    className="form-control"
                    placeholder="Enter shop address"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    required
                    rows="3"
                  ></textarea>
                </div>
              </>
            )}

            {role === 'ADMIN' && (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label><Phone size={18} /> Phone Number</label>
                    <input
                      type="tel"
                      className="form-control"
                      placeholder="10-digit number"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                      required
                      pattern="[0-9]{10}"
                    />
                  </div>

                  <div className="form-group">
                    <label><FileText size={18} /> Aadhaar Reference (Optional)</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="12-digit Aadhaar reference"
                      value={formData.aadhaarRef}
                      onChange={(e) => setFormData({...formData, aadhaarRef: e.target.value})}
                      maxLength="12"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label><FileText size={18} /> Department *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g., PDS Administration"
                      value={formData.department}
                      onChange={(e) => setFormData({...formData, department: e.target.value})}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label><FileText size={18} /> Designation *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g., Senior Admin Officer"
                      value={formData.designation}
                      onChange={(e) => setFormData({...formData, designation: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label><Lock size={18} /> Registration Code *</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Enter admin registration code"
                    value={formData.registrationCode}
                    onChange={(e) => setFormData({...formData, registrationCode: e.target.value})}
                    required
                  />
                  <small>Required for security verification. Contact your system administrator if you don't have it.</small>
                </div>
              </>
            )}

            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="auth-footer">
            <p>Already have an account? <Link to="/login">Sign in</Link></p>
            <Link to="/" className="back-home">← Back to Home</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
