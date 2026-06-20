import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import toast from 'react-hot-toast';
import api from '../../../api/axios';
import getApiErrorMessage from '../../../utils/getApiErrorMessage';
import inventoryService from '../inventory/inventoryService';
import restockRequestService from '../restock/restockRequestService';
import {
  Home, Package, Users, TrendingUp, LogOut, ShoppingBag, AlertTriangle,
  Plus, Menu, X, Send
} from 'lucide-react';
import './Dashboard.css';

const formatKg = (value) => {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    return '0';
  }

  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(numberValue);
};

function DealerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const dealerId = user?.profileId || user?.id;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [inventory, setInventory] = useState([]);
  const [stats, setStats] = useState({
    totalStock: 0,
    lowStock: 0,
    totalCitizens: 0,
    monthlyDistributions: 0
  });

  useEffect(() => {
    if (dealerId) {
      fetchData();
    }
  }, [dealerId]);

  const fetchData = async () => {
    try {
      // Fetch inventory
      const invRes = await api.get(`/inventory/dealer/${dealerId}`);
      setInventory(invRes.data.data || []);

      // Calculate stats
      const total = invRes.data.data?.reduce((sum, item) => sum + (Number(item.currentStock) || 0), 0) || 0;
      const low = invRes.data.data?.filter(item => item.currentStock < 50).length || 0;

      setStats({
        totalStock: total,
        lowStock: low,
        totalCitizens: 150, // Mock data
        monthlyDistributions: 45 // Mock data
      });
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className={`dashboard-sidebar dealer-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <ShoppingBag size={32} />
            <span>Dealer Portal</span>
          </div>
          <button className="close-sidebar" onClick={() => setSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <div className="sidebar-user">
          <div className="user-avatar dealer">
            <ShoppingBag size={24} />
          </div>
          <div className="user-info">
            <h4>{user?.shopName}</h4>
            <p>{user?.fullName}</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <Link to="/dealer" className="nav-item" onClick={() => setSidebarOpen(false)}>
            <Home size={20} /> Dashboard
          </Link>
          <Link to="/dealer/inventory" className="nav-item" onClick={() => setSidebarOpen(false)}>
            <Package size={20} /> Manage Inventory
          </Link>
          <Link to="/dealer/distribute" className="nav-item" onClick={() => setSidebarOpen(false)}>
            <Send size={20} /> Distribute Ration
          </Link>
          <Link to="/dealer/citizens" className="nav-item" onClick={() => setSidebarOpen(false)}>
            <Users size={20} /> My Citizens
          </Link>
          <Link to="/dealer/restock" className="nav-item" onClick={() => setSidebarOpen(false)}>
            <TrendingUp size={20} /> Request Restock
          </Link>
        </nav>

        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={20} /> Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="dashboard-header">
          <button className="menu-btn" onClick={() => setSidebarOpen(true)}>
            <Menu size={24} />
          </button>
          <h1>Dealer Dashboard</h1>
          <div className="header-actions">
            <span className="badge badge-success">Active</span>
          </div>
        </div>

        <Routes>
          <Route path="/" element={<DealerHome stats={stats} inventory={inventory} />} />
          <Route path="/inventory" element={<InventoryManagement dealerId={dealerId} inventory={inventory} fetchData={fetchData} />} />
          <Route path="/distribute" element={<DistributeRation dealerId={dealerId} />} />
          <Route path="/citizens" element={<MyCitizens dealerId={dealerId} />} />
          <Route path="/restock" element={<RequestRestock dealerId={dealerId} />} />
        </Routes>
      </main>
    </div>
  );
}

// Dealer Home Component
function DealerHome({ stats, inventory }) {
  const lowStockItems = inventory.filter(item => item.currentStock < 50);

  return (
    <div className="dashboard-content">
      <div className="stats-grid">
        <div className="stat-card success">
          <div className="stat-icon">
            <Package />
          </div>
          <div className="stat-details">
            <h3>{stats.totalStock.toFixed(0)} kg</h3>
            <p>Total Stock</p>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon">
            <AlertTriangle />
          </div>
          <div className="stat-details">
            <h3>{stats.lowStock}</h3>
            <p>Low Stock Items</p>
          </div>
        </div>

        <div className="stat-card info">
          <div className="stat-icon">
            <Users />
          </div>
          <div className="stat-details">
            <h3>{stats.totalCitizens}</h3>
            <p>Registered Citizens</p>
          </div>
        </div>

        <div className="stat-card primary">
          <div className="stat-icon">
            <TrendingUp />
          </div>
          <div className="stat-details">
            <h3>{stats.monthlyDistributions}</h3>
            <p>Distributions This Month</p>
          </div>
        </div>
      </div>

      {lowStockItems.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h2><AlertTriangle size={20} /> Low Stock Alerts</h2>
          </div>
          <div className="alert-list">
            {lowStockItems.map((item, idx) => (
              <div key={idx} className="alert alert-warning">
                <strong>{item.productName}</strong> - Only {formatKg(item.currentStock)} kg remaining
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <h2>Current Inventory</h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Current Stock (kg)</th>
                <th>Received (kg)</th>
                <th>Last Updated</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.productName}</td>
                  <td>{formatKg(item.currentStock)}</td>
                  <td>{formatKg(item.stockReceived)}</td>
                  <td>{new Date(item.lastUpdated).toLocaleDateString()}</td>
                  <td>
                    <span className={`badge ${item.currentStock > 50 ? 'badge-success' : 'badge-danger'}`}>
                      {item.currentStock > 50 ? 'Good' : 'Low'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Inventory Management Component
function InventoryManagement({ dealerId, inventory, fetchData }) {
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('');

  useEffect(() => {
    api.get('/products')
      .then((response) => {
        setProducts(response.data?.data || []);
      })
      .catch(() => {
        setProducts([]);
      })
      .finally(() => {
        setLoadingProducts(false);
      });
  }, []);

  const handleAddStock = async (e) => {
    e.preventDefault();
    try {
      await inventoryService.addStock({
        dealerId,
        productId,
        quantity: Number(quantity)
      });
      toast.success('Stock added successfully');
      fetchData();
      setProductId('');
      setQuantity('');
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to add stock'));
    }
  };

  return (
    <div className="dashboard-content">
      <div className="card">
        <h2><Plus size={20} /> Add Stock</h2>
        <form onSubmit={handleAddStock}>
          <div className="form-row">
            <div className="form-group">
              <label>Product</label>
              <select
                className="form-control"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                required
              >
                <option value="">Select product</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.productName} (Product ID: {product.id})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Quantity (kg)</label>
              <input
                type="number"
                className="form-control"
                placeholder="Enter quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
                step="0.01"
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={loadingProducts || products.length === 0}>
            {loadingProducts ? 'Loading...' : 'Add Stock'}
          </button>
        </form>
        {!loadingProducts && products.length === 0 && (
          <p className="text-muted">No products available. Create a product before adding stock.</p>
        )}
      </div>

      <div className="card">
        <h2>Current Inventory</h2>
        <div className="inventory-grid">
          {inventory.map((item, idx) => (
            <div key={idx} className="inventory-item">
              <h3>{item.productName}</h3>
              <div className="inventory-quantity">{formatKg(item.currentStock)} kg</div>
              <p className="text-muted">Received: {formatKg(item.stockReceived)} kg</p>
              <span className={`badge ${item.currentStock > 50 ? 'badge-success' : 'badge-warning'}`}>
                {item.currentStock > 50 ? 'Sufficient' : 'Low Stock'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Distribute Ration Component
function DistributeRation({ dealerId }) {
  const [citizens, setCitizens] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [rationCardNumber, setRationCardNumber] = useState('');
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    Promise.all([
      api.get(`/citizens/dealer/${dealerId}`),
      api.get('/products'),
    ])
      .then(([citizensResponse, productsResponse]) => {
        setCitizens(citizensResponse.data?.data || []);
        setProducts(productsResponse.data?.data || []);
      })
      .catch(() => {
        setCitizens([]);
        setProducts([]);
      })
      .finally(() => {
        setLoadingOptions(false);
      });
  }, [dealerId]);

  const handleDistribute = async (e) => {
    e.preventDefault();
    try {
      await api.post('/distributions/distribute', {
        rationCardNumber,
        dealerId,
        productId: parseInt(productId, 10),
        quantity: parseFloat(quantity),
        remarks,
      });
      toast.success('Ration distributed successfully');
      setRationCardNumber('');
      setProductId('');
      setQuantity('');
      setRemarks('');
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Distribution failed'));
    }
  };

  return (
    <div className="dashboard-content">
      <div className="card">
        <h2><Send size={20} /> Distribute Ration</h2>
        <form onSubmit={handleDistribute}>
          <div className="form-group">
            <label>Citizen Ration Card</label>
            <select
              className="form-control"
              value={rationCardNumber}
              onChange={(e) => setRationCardNumber(e.target.value)}
              required
            >
              <option value="">Select citizen</option>
              {citizens.map((citizen) => (
                <option key={citizen.id} value={citizen.rationCardNumber}>
                  {citizen.fullName} ({citizen.rationCardNumber})
                </option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Product</label>
              <select
                className="form-control"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                required
              >
                <option value="">Select product</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.productName} (Product ID: {product.id})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Quantity (kg)</label>
              <input
                type="number"
                className="form-control"
                placeholder="Enter quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
                step="0.01"
              />
            </div>
          </div>
          <div className="form-group">
            <label>Remarks</label>
            <textarea
              className="form-control"
              placeholder="Optional remarks"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows="3"
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loadingOptions || citizens.length === 0 || products.length === 0}>
            {loadingOptions ? 'Loading...' : 'Distribute'}
          </button>
        </form>
        {!loadingOptions && citizens.length === 0 && (
          <p className="text-muted">No citizens are assigned to this dealer yet.</p>
        )}
        {!loadingOptions && products.length === 0 && (
          <p className="text-muted">No products available. Create a product before distributing ration.</p>
        )}
      </div>
    </div>
  );
}

// My Citizens Component
function MyCitizens({ dealerId }) {
  const [citizens, setCitizens] = useState([]);

  useEffect(() => {
    fetchCitizens();
  }, [dealerId]);

  const fetchCitizens = async () => {
    try {
      const res = await api.get(`/citizens/dealer/${dealerId}`);
      setCitizens(res.data.data || []);
    } catch (error) {
      console.error('Failed to fetch citizens');
    }
  };

  return (
    <div className="dashboard-content">
      <div className="card">
        <h2>Registered Citizens</h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Ration Card</th>
                <th>Category</th>
                <th>Family Size</th>
                <th>Phone</th>
              </tr>
            </thead>
            <tbody>
              {citizens.map((citizen) => (
                <tr key={citizen.id}>
                  <td>{citizen.fullName}</td>
                  <td>{citizen.rationCardNumber}</td>
                  <td><span className="badge badge-info">{citizen.category}</span></td>
                  <td>{citizen.familySize}</td>
                  <td>{citizen.phoneNumber}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Request Restock Component
function RequestRestock({ dealerId }) {
  const [products, setProducts] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');

  const fetchRestockData = async () => {
    setLoading(true);
    try {
      const [productsResponse, requestData] = await Promise.all([
        api.get('/products'),
        restockRequestService.getByDealer(dealerId),
      ]);
      setProducts(productsResponse.data?.data || []);
      setRequests(requestData || []);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to load restock data'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (dealerId) {
      fetchRestockData();
    }
  }, [dealerId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await restockRequestService.create({
        dealerId,
        productId,
        quantity,
        reason,
      });
      toast.success('Restock request submitted');
      setProductId('');
      setQuantity('');
      setReason('');
      await fetchRestockData();
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to submit restock request'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="dashboard-content">
      <div className="card">
        <h2><TrendingUp size={20} /> Request Stock Replenishment</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Product</label>
              <select
                className="form-control"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                required
              >
                <option value="">Select product</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.productName} (Product ID: {product.id})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Requested Quantity (kg)</label>
              <input
                type="number"
                className="form-control"
                placeholder="Enter quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
                min="0.01"
                step="0.01"
              />
            </div>
          </div>
          <div className="form-group">
            <label>Reason</label>
            <textarea
              className="form-control"
              placeholder="Why do you need this restock?"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              rows="4"
            ></textarea>
          </div>
          <button type="submit" className="btn btn-primary" disabled={submitting || loading || products.length === 0}>
            {submitting ? 'Submitting...' : 'Submit Request'}
          </button>
        </form>
        {!loading && products.length === 0 && (
          <p className="text-muted">No products available. Ask admin to create products before requesting stock.</p>
        )}
      </div>

      <div className="card">
        <h2>Request History</h2>
        {loading ? (
          <p className="empty-state">Loading requests...</p>
        ) : requests.length === 0 ? (
          <p className="empty-state">No restock requests submitted yet.</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Admin remarks</th>
                  <th>Requested on</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr key={request.id}>
                    <td>{request.productName}</td>
                    <td>{formatKg(request.quantity)} kg</td>
                    <td>{request.reason}</td>
                    <td>
                      <span className={`badge ${
                        request.status === 'APPROVED'
                          ? 'badge-success'
                          : request.status === 'REJECTED'
                            ? 'badge-danger'
                            : 'badge-warning'
                      }`}>
                        {request.status}
                      </span>
                    </td>
                    <td>{request.adminRemarks || 'Pending review'}</td>
                    <td>{request.createdAt ? new Date(request.createdAt).toLocaleString() : 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default DealerDashboard;
