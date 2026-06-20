import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../../api/axios.js';
import { Shield, User, Mail, Lock, Phone, Building2, Briefcase, Key, ArrowRight } from 'lucide-react';
import './Auth.css';

function AdminRegister() {
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    department: '',
    designation: '',
    aadhaarRef: '',
    registrationCode: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const validatePassword = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate form data
      if (!formData.fullName.trim()) {
        toast.error('Full name is required');
        return;
      }

      if (!formData.username.trim()) {
        toast.error('Username is required');
        return;
      }

      if (formData.username.length < 3) {
        toast.error('Username must be at least 3 characters');
        return;
      }

      if (!formData.email.trim()) {
        toast.error('Email is required');
        return;
      }

      if (!validatePassword(formData.password)) {
        toast.error('Password must contain: uppercase, lowercase, digit, and special character (@$!%*?&)');
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }

      if (!formData.phoneNumber.trim() || !/^\d{10}$/.test(formData.phoneNumber)) {
        toast.error('Phone number must be exactly 10 digits');
        return;
      }

      if (!formData.department.trim()) {
        toast.error('Department is required');
        return;
      }

      if (!formData.designation.trim()) {
        toast.error('Designation is required');
        return;
      }

      if (!formData.registrationCode.trim()) {
        toast.error('Registration code is required');
        return;
      }

      const payload = {
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

      const response = await api.post('/auth/admin/register', payload);
      
      toast.success('Admin registered successfully! You can now login.');
      setTimeout(() => navigate('/login'), 1500);
    } catch (error) {
      console.error('Admin registration error:', error.response?.data);
      
      if (error.response?.data?.data && typeof error.response.data.data === 'object') {
        const validationErrors = Object.entries(error.response.data.data)
          .map(([field, message]) => `${field}: ${message}`)
          .join('; ');
        toast.error(validationErrors, { duration: 5000 });
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.response?.status === 400) {
        toast.error('Invalid registration code or duplicate credentials');
      } else {
        toast.error('Registration failed. Please try again.');
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
            <div className="logo admin-logo">
              <Shield size={40} />
            </div>
            <h1>Admin Registration</h1>
            <p>Register as system administrator</p>
          </div>

          <div className="admin-notice">
            <strong>⚠️ Secure Registration</strong>
            <p>This form is for authorized government administrators only. A registration code is required.</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {/* Row 1: Name and Username */}
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
                  placeholder="Choose unique username"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  required
                />
              </div>
            </div>

            {/* Row 2: Email and Phone */}
            <div className="form-row">
              <div className="form-group">
                <label><Mail size={18} /> Email</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="Enter official email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label><Phone size={18} /> Phone Number</label>
                <input
                  type="tel"
                  className="form-control"
                  placeholder="10-digit phone number"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                  maxLength="10"
                  required
                />
              </div>
            </div>

            {/* Row 3: Password and Confirm Password */}
            <div className="form-row">
              <div className="form-group">
                <label><Lock size={18} /> Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-control"
                    placeholder="Min 8 chars: uppercase, lowercase, digit, special char"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required
                  />
                </div>
                <small>Must contain: A-Z, a-z, 0-9, and @$!%*?&</small>
              </div>

              <div className="form-group">
                <label><Lock size={18} /> Confirm Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control"
                  placeholder="Re-enter password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  required
                />
              </div>
            </div>

            {/* Row 4: Department and Designation */}
            <div className="form-row">
              <div className="form-group">
                <label><Building2 size={18} /> Department</label>
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
                <label><Briefcase size={18} /> Designation</label>
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

            {/* Row 5: Aadhaar and Registration Code */}
            <div className="form-row">
              <div className="form-group">
                <label>Aadhaar Reference (Optional)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="12-digit Aadhaar reference"
                  value={formData.aadhaarRef}
                  onChange={(e) => setFormData({...formData, aadhaarRef: e.target.value})}
                  maxLength="12"
                />
              </div>

              <div className="form-group">
                <label><Key size={18} /> Registration Code *</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Enter registration code"
                  value={formData.registrationCode}
                  onChange={(e) => setFormData({...formData, registrationCode: e.target.value})}
                  required
                />
                <small>Required for security verification</small>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? 'Registering...' : 'Register as Admin'}
              <ArrowRight size={20} />
            </button>
          </form>

          <div className="auth-footer">
            <p>Already have an account? <Link to="/login">Login here</Link></p>
            <Link to="/" className="back-home">← Back to Home</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminRegister;
