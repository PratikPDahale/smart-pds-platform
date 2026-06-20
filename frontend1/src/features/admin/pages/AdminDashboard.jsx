// import React, { useState, useEffect } from 'react';
// import { Routes, Route, Link, useNavigate } from 'react-router-dom';
// import { useAuth } from '../../../context/AuthContext';
// import toast from 'react-hot-toast';
// import api from '../../../api/axios';
// import {
//   Home, Users, ShoppingBag, Package, TrendingUp, BarChart3, Settings,
//   LogOut, Menu, X, User, AlertTriangle, CheckCircle, Clock, Activity
// } from 'lucide-react';
// import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
// import './Dashboard.css';

// const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

// function AdminDashboard() {
//   const { user, logout } = useAuth();
//   const navigate = useNavigate();
//   const [sidebarOpen, setSidebarOpen] = useState(false);

//   const handleLogout = () => {
//     logout();
//     toast.success('Logged out successfully');
//     navigate('/');
//   };

//   return (
//     <div className="dashboard-layout">
//       {/* Sidebar */}
//       <aside className={`dashboard-sidebar admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
//         <div className="sidebar-header">
//           <div className="logo">
//             <BarChart3 size={32} />
//             <span>Admin Portal</span>
//           </div>
//           <button className="close-sidebar" onClick={() => setSidebarOpen(false)}>
//             <X size={24} />
//           </button>
//         </div>

//         <div className="sidebar-user">
//           <div className="user-avatar admin">
//             <User size={24} />
//           </div>
//           <div className="user-info">
//             <h4>{user?.fullName || 'Administrator'}</h4>
//             <p>System Admin</p>
//           </div>
//         </div>

//         <nav className="sidebar-nav">
//           <Link to="/admin" className="nav-item" onClick={() => setSidebarOpen(false)}>
//             <Home size={20} /> Dashboard
//           </Link>
//           <Link to="/admin/forecast" className="nav-item" onClick={() => setSidebarOpen(false)}>
//             <TrendingUp size={20} /> Smart Forecasting
//           </Link>
//           <Link to="/admin/inventory" className="nav-item" onClick={() => setSidebarOpen(false)}>
//             <Package size={20} /> Network Inventory
//           </Link>
//           <Link to="/admin/dealers" className="nav-item" onClick={() => setSidebarOpen(false)}>
//             <ShoppingBag size={20} /> Manage Dealers
//           </Link>
//           <Link to="/admin/citizens" className="nav-item" onClick={() => setSidebarOpen(false)}>
//             <Users size={20} /> Manage Citizens
//           </Link>
//           <Link to="/admin/analytics" className="nav-item" onClick={() => setSidebarOpen(false)}>
//             <BarChart3 size={20} /> Analytics
//           </Link>
//           <Link to="/admin/settings" className="nav-item" onClick={() => setSidebarOpen(false)}>
//             <Settings size={20} /> Settings
//           </Link>
//         </nav>

//         <button className="logout-btn" onClick={handleLogout}>
//           <LogOut size={20} /> Logout
//         </button>
//       </aside>

//       {/* Main Content */}
//       <main className="dashboard-main">
//         <div className="dashboard-header">
//           <button className="menu-btn" onClick={() => setSidebarOpen(true)}>
//             <Menu size={24} />
//           </button>
//           <h1>Admin Dashboard</h1>
//           <div className="header-actions">
//             <span className="badge badge-danger">Admin</span>
//           </div>
//         </div>

//         <Routes>
//           <Route path="/" element={<AdminHome />} />
//           <Route path="/forecast" element={<SmartForecasting />} />
//           <Route path="/inventory" element={<NetworkInventory />} />
//           <Route path="/dealers" element={<ManageDealers />} />
//           <Route path="/citizens" element={<ManageCitizens />} />
//           <Route path="/analytics" element={<Analytics />} />
//           <Route path="/settings" element={<SystemSettings />} />
//         </Routes>
//       </main>
//     </div>
//   );
// }

// // Admin Home Component
// function AdminHome() {
//   const [stats, setStats] = useState({
//     totalCitizens: 0,
//     totalDealers: 0,
//     totalStock: 0,
//     monthlyDistributions: 0,
//     lowStockAlerts: 0,
//     pendingRequests: 0
//   });
//   const [recentActivity, setRecentActivity] = useState([]);

//   useEffect(() => {
//     fetchStats();
//   }, []);

//   const fetchStats = async () => {
//     try {
//       const [citizensRes, dealersRes, inventoryRes] = await Promise.all([
//         api.get('/citizens'),
//         api.get('/dealers'),
//         api.get('/inventory')
//       ]);

//       const totalStock = inventoryRes.data.data?.reduce((sum, item) => sum + item.currentStock, 0) || 0;
//       const lowStock = inventoryRes.data.data?.filter(item => item.currentStock < 50).length || 0;

//       setStats({
//         totalCitizens: citizensRes.data.data?.length || 0,
//         totalDealers: dealersRes.data.data?.length || 0,
//         totalStock,
//         monthlyDistributions: 1250, // Mock
//         lowStockAlerts: lowStock,
//         pendingRequests: 12 // Mock
//       });
//     } catch (error) {
//       console.error('Failed to fetch stats');
//     }
//   };

//   return (
//     <div className="dashboard-content">
//       <div className="stats-grid-large">
//         <div className="stat-card primary">
//           <div className="stat-icon">
//             <Users />
//           </div>
//           <div className="stat-details">
//             <h3>{stats.totalCitizens.toLocaleString()}</h3>
//             <p>Total Citizens</p>
//           </div>
//         </div>

//         <div className="stat-card success">
//           <div className="stat-icon">
//             <ShoppingBag />
//           </div>
//           <div className="stat-details">
//             <h3>{stats.totalDealers}</h3>
//             <p>Active Dealers</p>
//           </div>
//         </div>

//         <div className="stat-card info">
//           <div className="stat-icon">
//             <Package />
//           </div>
//           <div className="stat-details">
//             <h3>{stats.totalStock.toFixed(0)} kg</h3>
//             <p>Total Stock</p>
//           </div>
//         </div>

//         <div className="stat-card warning">
//           <div className="stat-icon">
//             <Activity />
//           </div>
//           <div className="stat-details">
//             <h3>{stats.monthlyDistributions}</h3>
//             <p>Monthly Distributions</p>
//           </div>
//         </div>

//         <div className="stat-card danger">
//           <div className="stat-icon">
//             <AlertTriangle />
//           </div>
//           <div className="stat-details">
//             <h3>{stats.lowStockAlerts}</h3>
//             <p>Low Stock Alerts</p>
//           </div>
//         </div>

//         <div className="stat-card secondary">
//           <div className="stat-icon">
//             <Clock />
//           </div>
//           <div className="stat-details">
//             <h3>{stats.pendingRequests}</h3>
//             <p>Pending Requests</p>
//           </div>
//         </div>
//       </div>

//       <div className="grid-2-col">
//         <div className="card">
//           <h2>System Health</h2>
//           <div className="health-indicators">
//             <div className="health-item">
//               <CheckCircle className="icon-success" size={20} />
//               <span>Database: Online</span>
//             </div>
//             <div className="health-item">
//               <CheckCircle className="icon-success" size={20} />
//               <span>API Services: Healthy</span>
//             </div>
//             <div className="health-item">
//               <CheckCircle className="icon-success" size={20} />
//               <span>Forecasting Engine: Active</span>
//             </div>
//             <div className="health-item">
//               <AlertTriangle className="icon-warning" size={20} />
//               <span>Storage: 75% Used</span>
//             </div>
//           </div>
//         </div>

//         <div className="card">
//           <h2>Quick Actions</h2>
//           <div className="quick-actions">
//             <Link to="/admin/dealers" className="action-btn primary">
//               <ShoppingBag size={20} /> Manage Dealers
//             </Link>
//             <Link to="/admin/forecast" className="action-btn success">
//               <TrendingUp size={20} /> View Forecasts
//             </Link>
//             <Link to="/admin/inventory" className="action-btn info">
//               <Package size={20} /> Check Inventory
//             </Link>
//             <Link to="/admin/analytics" className="action-btn warning">
//               <BarChart3 size={20} /> Analytics
//             </Link>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// // Smart Forecasting Component
// function SmartForecasting() {
//   const [forecastData, setForecastData] = useState([
//     { month: 'Jan', actual: 4500, predicted: 4200, lower: 3900, upper: 4500 },
//     { month: 'Feb', actual: 4800, predicted: 4700, lower: 4400, upper: 5000 },
//     { month: 'Mar', actual: 5200, predicted: 5100, lower: 4800, upper: 5400 },
//     { month: 'Apr', predicted: 5300, lower: 5000, upper: 5600 },
//     { month: 'May', predicted: 5500, lower: 5200, upper: 5800 },
//     { month: 'Jun', predicted: 5700, lower: 5400, upper: 6000 }
//   ]);

//   return (
//     <div className="dashboard-content">
//       <div className="card">
//         <h2><TrendingUp size={24} /> AI-Powered Demand Forecasting</h2>
//         <p className="text-muted">Time-series prediction for intelligent stock management</p>
        
//         <div className="forecast-chart">
//           <ResponsiveContainer width="100%" height={400}>
//             <LineChart data={forecastData}>
//               <CartesianGrid strokeDasharray="3 3" />
//               <XAxis dataKey="month" />
//               <YAxis />
//               <Tooltip />
//               <Legend />
//               <Line type="monotone" dataKey="actual" stroke="#2563eb" strokeWidth={2} name="Actual Demand" />
//               <Line type="monotone" dataKey="predicted" stroke="#10b981" strokeWidth={2} name="Predicted Demand" strokeDasharray="5 5" />
//               <Line type="monotone" dataKey="lower" stroke="#94a3b8" strokeWidth={1} name="Lower Bound" strokeDasharray="3 3" />
//               <Line type="monotone" dataKey="upper" stroke="#94a3b8" strokeWidth={1} name="Upper Bound" strokeDasharray="3 3" />
//             </LineChart>
//           </ResponsiveContainer>
//         </div>
//       </div>

//       <div className="grid-2-col">
//         <div className="card">
//           <h3>Forecast Insights</h3>
//           <div className="insights-list">
//             <div className="insight-item success">
//               <CheckCircle size={20} />
//               <div>
//                 <strong>Rice Demand Stable</strong>
//                 <p>Expected to remain within normal range</p>
//               </div>
//             </div>
//             <div className="insight-item warning">
//               <AlertTriangle size={20} />
//               <div>
//                 <strong>Wheat Shortage Alert</strong>
//                 <p>30% increase predicted next month</p>
//               </div>
//             </div>
//             <div className="insight-item info">
//               <TrendingUp size={20} />
//               <div>
//                 <strong>Sugar Trend Rising</strong>
//                 <p>Gradual 15% increase over 3 months</p>
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="card">
//           <h3>Recommended Actions</h3>
//           <div className="actions-list">
//             <div className="action-item">
//               <div className="action-badge primary">High Priority</div>
//               <p>Order 2000 kg wheat for Region A</p>
//             </div>
//             <div className="action-item">
//               <div className="action-badge warning">Medium</div>
//               <p>Redistribute surplus rice from Region B</p>
//             </div>
//             <div className="action-item">
//               <div className="action-badge success">Low</div>
//               <p>Monitor sugar consumption patterns</p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// // Network Inventory Component
// function NetworkInventory() {
//   const [inventory, setInventory] = useState([]);

//   useEffect(() => {
//     fetchInventory();
//   }, []);

//   const fetchInventory = async () => {
//     try {
//       const res = await api.get('/inventory');
//       setInventory(res.data.data || []);
//     } catch (error) {
//       toast.error('Failed to fetch inventory');
//     }
//   };

//   const distributionData = [
//     { name: 'Rice', value: 45000 },
//     { name: 'Wheat', value: 35000 },
//     { name: 'Sugar', value: 12000 },
//     { name: 'Oil', value: 8000 }
//   ];

//   return (
//     <div className="dashboard-content">
//       <div className="grid-2-col">
//         <div className="card">
//           <h2>Stock Distribution</h2>
//           <ResponsiveContainer width="100%" height={300}>
//             <PieChart>
//               <Pie
//                 data={distributionData}
//                 cx="50%"
//                 cy="50%"
//                 labelLine={false}
//                 label={entry => `${entry.name}: ${entry.value} kg`}
//                 outerRadius={100}
//                 fill="#8884d8"
//                 dataKey="value"
//               >
//                 {distributionData.map((entry, index) => (
//                   <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                 ))}
//               </Pie>
//               <Tooltip />
//             </PieChart>
//           </ResponsiveContainer>
//         </div>

//         <div className="card">
//           <h2>Low Stock Alerts</h2>
//           <div className="alert-list">
//             {inventory.filter(item => item.currentStock < 50).map((item, idx) => (
//               <div key={idx} className="alert alert-danger">
//                 <AlertTriangle size={20} />
//                 <div>
//                   <strong>{item.productName}</strong>
//                   <p>Only {item.currentStock} kg remaining at Dealer #{item.dealerId}</p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       <div className="card">
//         <h2>All Inventory</h2>
//         <div className="table-container">
//           <table>
//             <thead>
//               <tr>
//                 <th>Product</th>
//                 <th>Dealer ID</th>
//                 <th>Current Stock</th>
//                 <th>Received</th>
//                 <th>Last Updated</th>
//                 <th>Status</th>
//               </tr>
//             </thead>
//             <tbody>
//               {inventory.map((item, idx) => (
//                 <tr key={idx}>
//                   <td>{item.productName}</td>
//                   <td>#{item.dealerId}</td>
//                   <td>{item.currentStock} kg</td>
//                   <td>{item.stockReceived} kg</td>
//                   <td>{new Date(item.lastUpdated).toLocaleDateString()}</td>
//                   <td>
//                     <span className={`badge ${item.currentStock > 50 ? 'badge-success' : 'badge-danger'}`}>
//                       {item.currentStock > 50 ? 'Sufficient' : 'Low'}
//                     </span>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// }

// // Manage Dealers Component
// function ManageDealers() {
//   const [dealers, setDealers] = useState([]);

//   useEffect(() => {
//     fetchDealers();
//   }, []);

//   const fetchDealers = async () => {
//     try {
//       const res = await api.get('/dealers');
//       setDealers(res.data.data || []);
//     } catch (error) {
//       toast.error('Failed to fetch dealers');
//     }
//   };

//   return (
//     <div className="dashboard-content">
//       <div className="card">
//         <div className="card-header-flex">
//           <h2>All Dealers</h2>
//           <button className="btn btn-primary">Add New Dealer</button>
//         </div>
        
//         <div className="table-container">
//           <table>
//             <thead>
//               <tr>
//                 <th>ID</th>
//                 <th>Shop Name</th>
//                 <th>Owner</th>
//                 <th>Region</th>
//                 <th>License</th>
//                 <th>Status</th>
//                 <th>Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {dealers.map((dealer) => (
//                 <tr key={dealer.id}>
//                   <td>#{dealer.id}</td>
//                   <td>{dealer.shopName}</td>
//                   <td>{dealer.fullName}</td>
//                   <td>{dealer.region}</td>
//                   <td>{dealer.shopLicense}</td>
//                   <td>
//                     <span className={`badge ${dealer.active ? 'badge-success' : 'badge-danger'}`}>
//                       {dealer.active ? 'Active' : 'Inactive'}
//                     </span>
//                   </td>
//                   <td>
//                     <button className="btn btn-sm btn-outline">View Details</button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// }

// // Manage Citizens Component
// function ManageCitizens() {
//   const [citizens, setCitizens] = useState([]);

//   useEffect(() => {
//     fetchCitizens();
//   }, []);

//   const fetchCitizens = async () => {
//     try {
//       const res = await api.get('/citizens');
//       setCitizens(res.data.data || []);
//     } catch (error) {
//       toast.error('Failed to fetch citizens');
//     }
//   };

//   return (
//     <div className="dashboard-content">
//       <div className="card">
//         <div className="card-header-flex">
//           <h2>All Citizens</h2>
//           <button className="btn btn-primary">Add Citizen</button>
//         </div>
        
//         <div className="table-container">
//           <table>
//             <thead>
//               <tr>
//                 <th>ID</th>
//                 <th>Name</th>
//                 <th>Ration Card</th>
//                 <th>Category</th>
//                 <th>Family Size</th>
//                 <th>Dealer ID</th>
//                 <th>Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {citizens.map((citizen) => (
//                 <tr key={citizen.id}>
//                   <td>#{citizen.id}</td>
//                   <td>{citizen.fullName}</td>
//                   <td>{citizen.rationCardNumber}</td>
//                   <td><span className="badge badge-info">{citizen.category}</span></td>
//                   <td>{citizen.familySize}</td>
//                   <td>#{citizen.dealerId || 'N/A'}</td>
//                   <td>
//                     <button className="btn btn-sm btn-outline">View</button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// }

// // Analytics Component
// function Analytics() {
//   const monthlyData = [
//     { month: 'Jan', distributions: 1050, stock: 15000 },
//     { month: 'Feb', distributions: 1200, stock: 14500 },
//     { month: 'Mar', distributions: 1350, stock: 14000 },
//     { month: 'Apr', distributions: 1100, stock: 15200 },
//     { month: 'May', distributions: 1250, stock: 14800 },
//     { month: 'Jun', distributions: 1400, stock: 14200 }
//   ];

//   return (
//     <div className="dashboard-content">
//       <div className="card">
//         <h2>Distribution Trends</h2>
//         <ResponsiveContainer width="100%" height={400}>
//           <BarChart data={monthlyData}>
//             <CartesianGrid strokeDasharray="3 3" />
//             <XAxis dataKey="month" />
//             <YAxis />
//             <Tooltip />
//             <Legend />
//             <Bar dataKey="distributions" fill="#2563eb" name="Distributions" />
//             <Bar dataKey="stock" fill="#10b981" name="Stock (kg)" />
//           </BarChart>
//         </ResponsiveContainer>
//       </div>

//       <div className="grid-2-col">
//         <div className="card">
//           <h3>Performance Metrics</h3>
//           <div className="metrics-list">
//             <div className="metric-item">
//               <span>Distribution Efficiency</span>
//               <strong className="text-success">96.5%</strong>
//             </div>
//             <div className="metric-item">
//               <span>Stock Turnover Rate</span>
//               <strong className="text-info">8.2 days</strong>
//             </div>
//             <div className="metric-item">
//               <span>Citizen Satisfaction</span>
//               <strong className="text-success">4.7/5.0</strong>
//             </div>
//             <div className="metric-item">
//               <span>Forecast Accuracy</span>
//               <strong className="text-warning">91.3%</strong>
//             </div>
//           </div>
//         </div>

//         <div className="card">
//           <h3>Regional Performance</h3>
//           <div className="regional-stats">
//             <div className="region-item">
//               <span>North Region</span>
//               <div className="progress-bar">
//                 <div className="progress-fill success" style={{width: '92%'}}>92%</div>
//               </div>
//             </div>
//             <div className="region-item">
//               <span>South Region</span>
//               <div className="progress-bar">
//                 <div className="progress-fill info" style={{width: '88%'}}>88%</div>
//               </div>
//             </div>
//             <div className="region-item">
//               <span>East Region</span>
//               <div className="progress-bar">
//                 <div className="progress-fill warning" style={{width: '75%'}}>75%</div>
//               </div>
//             </div>
//             <div className="region-item">
//               <span>West Region</span>
//               <div className="progress-bar">
//                 <div className="progress-fill danger" style={{width: '68%'}}>68%</div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// // Settings Component
// function SystemSettings() {
//   return (
//     <div className="dashboard-content">
//       <div className="card">
//         <h2>System Settings</h2>
//         <div className="settings-grid">
//           <div className="setting-item">
//             <h4>Forecast Settings</h4>
//             <p>Configure AI forecasting parameters</p>
//             <button className="btn btn-outline">Configure</button>
//           </div>
//           <div className="setting-item">
//             <h4>Notification Settings</h4>
//             <p>Manage system alerts and notifications</p>
//             <button className="btn btn-outline">Manage</button>
//           </div>
//           <div className="setting-item">
//             <h4>User Management</h4>
//             <p>Add/remove admins and manage roles</p>
//             <button className="btn btn-outline">Manage Users</button>
//           </div>
//           <div className="setting-item">
//             <h4>System Logs</h4>
//             <p>View system activity and audit trails</p>
//             <button className="btn btn-outline">View Logs</button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default AdminDashboard;



import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import toast from 'react-hot-toast';

import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';

import AdminHome from './AdminHome';
import SmartForecasting from '../forecast/pages/SmartForecasting';
import NetworkInventory from '../inventory/pages/NetworkInventory';
import ManageDealers from '../dealer/pages/ManageDealers';
import ManageCitizens from '../citizen/pages/ManageCitizens';
import ManageProducts from '../product/pages/ManageProducts';
import RestockRequests from '../restock/pages/RestockRequests';
import GrievanceQueue from '../grievance/pages/GrievanceQueue';
import Analytics from './Analytics';
import Settings from './Settings';
import './Dashboard.css';

function AdminDashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  return (
    <div className="dashboard-layout admin-dashboard-layout">
      
      <Sidebar 
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        handleLogout={handleLogout}
      />

      <main className="dashboard-main admin-dashboard-main">
        <Header setSidebarOpen={setSidebarOpen} />

        <Routes>
          <Route path="/" element={<AdminHome />} />
          <Route path="/forecast" element={<SmartForecasting />} />
          <Route path="/inventory" element={<NetworkInventory />} />
          <Route path="/restock-requests" element={<RestockRequests />} />
          <Route path="/grievances" element={<GrievanceQueue title="Citizen grievances" />} />
          <Route path="/products" element={<ManageProducts />} />
          <Route path="/dealers" element={<ManageDealers />} />
          <Route path="/citizens" element={<ManageCitizens />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  );
}

export default AdminDashboard;
