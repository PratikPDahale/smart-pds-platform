import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext.jsx';
import toast from 'react-hot-toast';
import { ShoppingBag, Mail, Lock, ArrowRight } from 'lucide-react';
import './Auth.css';

function Login() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await login(formData.username, formData.password);
      
      if (result.success && result.role) {
        toast.success('Login successful!');
        const rolePath = result.role.toLowerCase();
        console.log('Navigating to:', `/${rolePath}`); // Debug log
        navigate(`/${rolePath}`);
      } else {
        toast.error(result.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error); // Debug log
      toast.error('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="logo">
              <ShoppingBag size={40} />
            </div>
            <h1>Welcome Back</h1>
            <p>Sign in to access your e-Ration portal</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>
                <Mail size={18} />
                Username or Email
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter your username"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label>
                <Lock size={18} />
                Password
              </label>
              <input
                type="password"
                className="form-control"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
              <ArrowRight size={20} />
            </button>
          </form>

          <div className="auth-footer">
            <p>Don't have an account? <Link to="/register">Register here</Link></p>
            <Link to="/" className="back-home">← Back to Home</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
