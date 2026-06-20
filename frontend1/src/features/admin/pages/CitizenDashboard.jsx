// import React, { useState, useEffect } from 'react';
// import { Routes, Route, Link, useNavigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// import toast from 'react-hot-toast';
// import api from '../api/axios';
// import {
//   Home, FileText, History, MapPin, MessageSquare, LogOut,
//   ShoppingBag, Calendar, Download, User, Menu, X
// } from 'lucide-react';
// import './Dashboard.css';

// function CitizenDashboard() {
//   const { user, logout } = useAuth();
//   const navigate = useNavigate();
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [quotas, setQuotas] = useState([]);
//   const [distributions, setDistributions] = useState([]);
//   const [stats, setStats] = useState({
//     totalDistributions: 0,
//     currentMonth: 0,
//     pendingQuota: 0
//   });

//   useEffect(() => {
//     fetchData();
//   }, []);

//   const fetchData = async () => {
//     try {
//       // Fetch quotas
//       const quotaRes = await api.get('/quotas');
//       setQuotas(quotaRes.data.data || []);

//       // Fetch distributions
//       const distRes = await api.get(`/distributions/citizen/${user.id}`);
//       setDistributions(distRes.data.data || []);

//       // Calculate stats
//       const total = distRes.data.data?.length || 0;
//       const currentMonth = distRes.data.data?.filter(d => {
//         const date = new Date(d.date);
//         const now = new Date();
//         return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
//       }).length || 0;

//       setStats({
//         totalDistributions: total,
//         currentMonth,
//         pendingQuota: quotas.length - currentMonth
//       });
//     } catch (error) {
//       console.error('Failed to fetch data:', error);
//     }
//   };

//   const handleLogout = () => {
//     logout();
//     toast.success('Logged out successfully');
//     navigate('/');
//   };

//   return (
//     <div className="dashboard-layout">
//       {/* Sidebar */}
//       <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`}>
//         <div className="sidebar-header">
//           <div className="logo">
//             <ShoppingBag size={32} />
//             <span>Citizen Portal</span>
//           </div>
//           <button className="close-sidebar" onClick={() => setSidebarOpen(false)}>
//             <X size={24} />
//           </button>
//         </div>

//         <div className="sidebar-user">
//           <div className="user-avatar">
//             <User size={24} />
//           </div>
//           <div className="user-info">
//             <h4>{user?.fullName || 'Citizen'}</h4>
//             <p>{user?.rationCardNumber}</p>
//           </div>
//         </div>

//         <nav className="sidebar-nav">
//           <Link to="/citizen" className="nav-item" onClick={() => setSidebarOpen(false)}>
//             <Home size={20} /> Dashboard
//           </Link>
//           <Link to="/citizen/quota" className="nav-item" onClick={() => setSidebarOpen(false)}>
//             <FileText size={20} /> My Quota
//           </Link>
//           <Link to="/citizen/history" className="nav-item" onClick={() => setSidebarOpen(false)}>
//             <History size={20} /> Distribution History
//           </Link>
//           <Link to="/citizen/dealers" className="nav-item" onClick={() => setSidebarOpen(false)}>
//             <MapPin size={20} /> Nearby Dealers
//           </Link>
//           <Link to="/citizen/grievance" className="nav-item" onClick={() => setSidebarOpen(false)}>
//             <MessageSquare size={20} /> Grievances
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
//           <h1>Citizen Dashboard</h1>
//           <div className="header-actions">
//             <span className="badge badge-success">{user?.category}</span>
//           </div>
//         </div>

//         <Routes>
//           <Route path="/" element={<DashboardHome stats={stats} distributions={distributions} />} />
//           <Route path="/quota" element={<QuotaView quotas={quotas} user={user} />} />
//           <Route path="/history" element={<DistributionHistory distributions={distributions} />} />
//           <Route path="/dealers" element={<NearbyDealers />} />
//           <Route path="/grievance" element={<Grievances />} />
//         </Routes>
//       </main>
//     </div>
//   );
// }

// // Dashboard Home Component
// function DashboardHome({ stats, distributions }) {
//   const recentDistributions = distributions.slice(0, 5);

//   return (
//     <div className="dashboard-content">
//       <div className="stats-grid">
//         <div className="stat-card info">
//           <div className="stat-icon">
//             <ShoppingBag />
//           </div>
//           <div className="stat-details">
//             <h3>{stats.totalDistributions}</h3>
//             <p>Total Distributions</p>
//           </div>
//         </div>

//         <div className="stat-card success">
//           <div className="stat-icon">
//             <Calendar />
//           </div>
//           <div className="stat-details">
//             <h3>{stats.currentMonth}</h3>
//             <p>This Month</p>
//           </div>
//         </div>

//         <div className="stat-card warning">
//           <div className="stat-icon">
//             <FileText />
//           </div>
//           <div className="stat-details">
//             <h3>{stats.pendingQuota}</h3>
//             <p>Pending Quota</p>
//           </div>
//         </div>
//       </div>

//       <div className="card">
//         <h2>Recent Distributions</h2>
//         {recentDistributions.length > 0 ? (
//           <div className="table-container">
//             <table>
//               <thead>
//                 <tr>
//                   <th>Date</th>
//                   <th>Product</th>
//                   <th>Quantity</th>
//                   <th>Dealer</th>
//                   <th>Receipt</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {recentDistributions.map((dist, idx) => (
//                   <tr key={idx}>
//                     <td>{new Date(dist.date).toLocaleDateString()}</td>
//                     <td>{dist.productName}</td>
//                     <td>{dist.quantity} kg</td>
//                     <td>{dist.dealerName}</td>
//                     <td>
//                       <button className="btn btn-sm btn-outline">
//                         <Download size={16} /> Download
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         ) : (
//           <p className="empty-state">No distributions yet</p>
//         )}
//       </div>
//     </div>
//   );
// }

// // Quota View Component
// function QuotaView({ quotas, user }) {
//   return (
//     <div className="dashboard-content">
//       <div className="card">
//         <h2>My Monthly Quota - {user?.category}</h2>
//         <p className="text-muted">Family Size: {user?.familySize} members</p>
        
//         <div className="quota-grid">
//           {quotas.map((quota, idx) => (
//             <div key={idx} className="quota-card">
//               <h3>{quota.productName}</h3>
//               <div className="quota-amount">
//                 {(quota.quotaPerCitizen * (user?.familySize || 1)).toFixed(2)} kg
//               </div>
//               <p className="quota-per">Per citizen: {quota.quotaPerCitizen} kg</p>
//               <span className="badge badge-info">Month: {quota.month}/{quota.year}</span>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }

// // Distribution History Component
// function DistributionHistory({ distributions }) {
//   return (
//     <div className="dashboard-content">
//       <div className="card">
//         <h2>Distribution History</h2>
//         {distributions.length > 0 ? (
//           <div className="table-container">
//             <table>
//               <thead>
//                 <tr>
//                   <th>Date</th>
//                   <th>Product</th>
//                   <th>Quantity (kg)</th>
//                   <th>Dealer</th>
//                   <th>Receipt No</th>
//                   <th>Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {distributions.map((dist, idx) => (
//                   <tr key={idx}>
//                     <td>{new Date(dist.date).toLocaleDateString()}</td>
//                     <td>{dist.productName}</td>
//                     <td>{dist.quantity}</td>
//                     <td>{dist.dealerName}</td>
//                     <td>#{dist.receiptNo || `RCP${idx + 1000}`}</td>
//                     <td>
//                       <button className="btn btn-sm btn-primary">
//                         <Download size={14} /> Receipt
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         ) : (
//           <p className="empty-state">No distribution history</p>
//         )}
//       </div>
//     </div>
//   );
// }

// // Nearby Dealers Component
// function NearbyDealers() {
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
//         <h2>Nearby Fair Price Shops</h2>
//         <div className="dealers-grid">
//           {dealers.map((dealer) => (
//             <div key={dealer.id} className="dealer-card">
//               <div className="dealer-header">
//                 <h3>{dealer.shopName}</h3>
//                 <span className={`badge ${dealer.active ? 'badge-success' : 'badge-danger'}`}>
//                   {dealer.active ? 'Active' : 'Inactive'}
//                 </span>
//               </div>
//               <p><MapPin size={16} /> {dealer.address}</p>
//               <p><User size={16} /> {dealer.fullName}</p>
//               <p>Region: {dealer.region}</p>
//               <button className="btn btn-outline btn-sm">View Details</button>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }

// // Grievances Component
// function Grievances() {
//   const [subject, setSubject] = useState('');
//   const [description, setDescription] = useState('');

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     toast.success('Grievance submitted successfully');
//     setSubject('');
//     setDescription('');
//   };

//   return (
//     <div className="dashboard-content">
//       <div className="card">
//         <h2>File a Grievance</h2>
//         <form onSubmit={handleSubmit}>
//           <div className="form-group">
//             <label>Subject</label>
//             <input
//               type="text"
//               className="form-control"
//               placeholder="Brief subject"
//               value={subject}
//               onChange={(e) => setSubject(e.target.value)}
//               required
//             />
//           </div>
//           <div className="form-group">
//             <label>Description</label>
//             <textarea
//               className="form-control"
//               placeholder="Describe your issue"
//               value={description}
//               onChange={(e) => setDescription(e.target.value)}
//               required
//               rows="5"
//             ></textarea>
//           </div>
//           <button type="submit" className="btn btn-primary">Submit Grievance</button>
//         </form>
//       </div>
//     </div>
//   );
// }

// export default CitizenDashboard;


// new code

import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import toast from 'react-hot-toast';
import api from '../../../api/axios';
import getApiErrorMessage from '../../../utils/getApiErrorMessage';
import grievanceService from '../grievance/grievanceService';
import {
  Home, FileText, History, MapPin, MessageSquare, LogOut,
  ShoppingBag, Calendar, Download, User, Menu, X
} from 'lucide-react';
import './Dashboard.css';

const getDistributionDateValue = (distribution) =>
  distribution?.distributionDate || distribution?.date || null;

const formatDistributionDate = (distribution) => {
  const rawDate = getDistributionDateValue(distribution);
  if (!rawDate) {
    return 'N/A';
  }

  const parsedDate = new Date(rawDate);
  if (Number.isNaN(parsedDate.getTime())) {
    return 'N/A';
  }

  return parsedDate.toLocaleDateString();
};

const getReceiptNumber = (distribution, index) =>
  distribution?.receiptNo || `RCP${distribution?.id ?? index + 1000}`;

const formatKg = (value) => {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    return '0 kg';
  }

  return `${new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(numberValue)} kg`;
};

const getQuotaResponseData = (response) => {
  const payload = response?.data;
  return Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];
};

const downloadReceipt = (distribution, index) => {
  const receiptNumber = getReceiptNumber(distribution, index);
  const receiptLines = [
    'E-Ration PDS Receipt',
    `Receipt No: ${receiptNumber}`,
    `Date: ${formatDistributionDate(distribution)}`,
    `Citizen: ${distribution.citizenName || 'N/A'}`,
    `Ration Card: ${distribution.rationCardNumber || 'N/A'}`,
    `Dealer: ${distribution.dealerName || 'N/A'}`,
    `Product: ${distribution.productName || 'N/A'}`,
    `Quantity: ${distribution.quantity ?? 'N/A'} kg`,
    `Total Amount: ${distribution.totalAmount ?? 'N/A'}`,
    `Status: ${distribution.status || 'COMPLETED'}`,
    `Remarks: ${distribution.remarks || 'N/A'}`,
  ];

  const blob = new Blob([receiptLines.join('\n')], { type: 'text/plain;charset=utf-8' });
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = `${receiptNumber}.txt`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(objectUrl);
};

function CitizenDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [citizen, setCitizen] = useState(null);
  const [quotaStatus, setQuotaStatus] = useState([]);
  const [distributions, setDistributions] = useState([]);
  const [stats, setStats] = useState({
    totalDistributions: 0,
    currentMonth: 0,
    pendingQuota: 0
  });

  useEffect(() => {
    if (user?.id) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      // ✅ 1. Fetch Citizen using userId
      const citizenRes = await api.get(`/citizens/user/${user.userId || user.id}`);
      const citizenData = citizenRes.data.data;
      setCitizen(citizenData);

      // ✅ 2. Fetch quotas
      const quotaRes = await api.get(`/quotas/citizen/${citizenData.rationCardNumber}/current`);
      const quotaData = getQuotaResponseData(quotaRes);
      setQuotaStatus(quotaData);

      // ✅ 3. Fetch distributions using citizenId
      const distRes = await api.get(`/distributions/citizen/${citizenData.id}`);
      const distData = distRes.data.data || [];
      setDistributions(distData);

      // ✅ 4. Stats calculation
      const total = distData.length;

      const currentMonth = distData.filter(d => {
        const rawDate = getDistributionDateValue(d);
        const date = rawDate ? new Date(rawDate) : null;
        const now = new Date();
        if (!date || Number.isNaN(date.getTime())) {
          return false;
        }
        return (
          date.getMonth() === now.getMonth() &&
          date.getFullYear() === now.getFullYear()
        );
      }).length;

      setStats({
        totalDistributions: total,
        currentMonth,
        pendingQuota: quotaData.filter((quota) => Number(quota.remainingQuota || 0) > 0).length
      });

    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load dashboard data');
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
      <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <ShoppingBag size={32} />
            <span>Citizen Portal</span>
          </div>
          <button className="close-sidebar" onClick={() => setSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <div className="sidebar-user">
          <div className="user-avatar">
            <User size={24} />
          </div>
          <div className="user-info">
            <h4>{user?.fullName || 'Citizen'}</h4>
            <p>{citizen?.rationCardNumber || '-'}</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <Link to="/citizen" className="nav-item" onClick={() => setSidebarOpen(false)}>
            <Home size={20} /> Dashboard
          </Link>
          <Link to="/citizen/quota" className="nav-item" onClick={() => setSidebarOpen(false)}>
            <FileText size={20} /> My Quota
          </Link>
          <Link to="/citizen/history" className="nav-item" onClick={() => setSidebarOpen(false)}>
            <History size={20} /> Distribution History
          </Link>
          <Link to="/citizen/dealers" className="nav-item" onClick={() => setSidebarOpen(false)}>
            <MapPin size={20} /> Nearby Dealers
          </Link>
          <Link to="/citizen/grievance" className="nav-item" onClick={() => setSidebarOpen(false)}>
            <MessageSquare size={20} /> Grievances
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
          <h1>Citizen Dashboard</h1>
          <div className="header-actions">
            <span className="badge badge-success">
              {citizen?.category || 'N/A'}
            </span>
          </div>
        </div>

        <Routes>
          <Route path="/" element={
            <DashboardHome stats={stats} distributions={distributions} />
          } />
          <Route path="/quota" element={
            <QuotaView quotas={quotaStatus} citizen={citizen} />
          } />
          <Route path="/history" element={
            <DistributionHistory distributions={distributions} />
          } />
          <Route path="/dealers" element={<NearbyDealers />} />
          <Route path="/grievance" element={<Grievances citizen={citizen} />} />
        </Routes>
      </main>
    </div>
  );
}

// Dashboard Home
function DashboardHome({ stats, distributions }) {
  const recentDistributions = distributions.slice(0, 5);

  return (
    <div className="dashboard-content">
      <div className="stats-grid">
        <div className="stat-card info">
          <div className="stat-icon"><ShoppingBag /></div>
          <div className="stat-details">
            <h3>{stats.totalDistributions}</h3>
            <p>Total Distributions</p>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon"><Calendar /></div>
          <div className="stat-details">
            <h3>{stats.currentMonth}</h3>
            <p>This Month</p>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon"><FileText /></div>
          <div className="stat-details">
            <h3>{stats.pendingQuota}</h3>
            <p>Pending Quota</p>
          </div>
        </div>
      </div>

      <div className="card">
        <h2>Recent Distributions</h2>
        {recentDistributions.length > 0 ? (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Dealer</th>
                  <th>Receipt</th>
                </tr>
              </thead>
              <tbody>
                {recentDistributions.map((dist, idx) => (
                  <tr key={idx}>
                    <td>{formatDistributionDate(dist)}</td>
                    <td>{dist.productName}</td>
                    <td>{dist.quantity} kg</td>
                    <td>{dist.dealerName}</td>
                    <td>
                      <button className="btn btn-sm btn-outline" type="button" onClick={() => downloadReceipt(dist, idx)}>
                        <Download size={16} /> Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p className="empty-state">No distributions yet</p>}
      </div>
    </div>
  );
}

// Quota View
function QuotaView({ quotas, citizen }) {
  const monthLabel = quotas[0]
    ? new Date(quotas[0].year, quotas[0].month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })
    : 'Current Month';

  return (
    <div className="dashboard-content">
      <div className="card">
        <div className="section-heading quota-heading">
          <div>
            <h2>My Quota - {citizen?.category || 'N/A'}</h2>
            <p className="text-muted">
              {monthLabel} quota for {citizen?.familySize || 1} family member{(citizen?.familySize || 1) > 1 ? 's' : ''}
            </p>
          </div>
          <span className="badge badge-info">{quotas.length} product{quotas.length === 1 ? '' : 's'}</span>
        </div>

        {quotas.length === 0 ? (
          <p className="empty-state">No active quota has been assigned for your category this month.</p>
        ) : (
          <div className="quota-grid">
            {quotas.map((quota) => {
              const percentageUsed = Math.min(Number(quota.percentageUsed || 0), 100);
              const statusClass = quota.status === 'EXHAUSTED'
                ? 'badge-danger'
                : quota.status === 'ALMOST_EXHAUSTED'
                  ? 'badge-warning'
                  : 'badge-success';

              return (
                <div key={`${quota.productId}-${quota.month}-${quota.year}`} className="quota-card quota-status-card">
                  <div className="quota-card-header">
                    <h3>{quota.productName}</h3>
                    <span className={`badge ${statusClass}`}>{quota.status?.replace('_', ' ') || 'AVAILABLE'}</span>
                  </div>
                  <div className="quota-amount">
                    {formatKg(quota.remainingQuota)}
                  </div>
                  <p className="quota-per">Remaining from {formatKg(quota.totalQuota)} total family quota</p>

                  <div className="quota-progress" aria-label={`${percentageUsed}% used`}>
                    <span style={{ width: `${percentageUsed}%` }} />
                  </div>

                  <div className="quota-breakdown">
                    <div>
                      <span>Per citizen</span>
                      <strong>{formatKg(quota.quotaPerCitizen)}</strong>
                    </div>
                    <div>
                      <span>Redeemed</span>
                      <strong>{formatKg(quota.redeemedQuantity)}</strong>
                    </div>
                    <div>
                      <span>Used</span>
                      <strong>{percentageUsed.toFixed(0)}%</strong>
                    </div>
                  </div>

                  <span className="badge badge-info">
                    Month: {quota.month}/{quota.year}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// Distribution History (same)
function DistributionHistory({ distributions }) {
  return (
    <div className="dashboard-content">
      <div className="card">
        <h2>Distribution History</h2>
        {distributions.length > 0 ? (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Product</th>
                  <th>Quantity (kg)</th>
                  <th>Dealer</th>
                  <th>Receipt No</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {distributions.map((dist, idx) => (
                  <tr key={idx}>
                    <td>{formatDistributionDate(dist)}</td>
                    <td>{dist.productName}</td>
                    <td>{dist.quantity}</td>
                    <td>{dist.dealerName}</td>
                    <td>#{getReceiptNumber(dist, idx)}</td>
                    <td>
                      <button className="btn btn-sm btn-primary" type="button" onClick={() => downloadReceipt(dist, idx)}>
                        <Download size={14} /> Receipt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p className="empty-state">No distribution history</p>}
      </div>
    </div>
  );
}

// Nearby Dealers (same)
function NearbyDealers() {
  const [dealers, setDealers] = useState([]);

  useEffect(() => {
    api.get('/dealers')
      .then(res => setDealers(res.data.data || []))
      .catch(() => toast.error('Failed to fetch dealers'));
  }, []);

  return (
    <div className="dashboard-content">
      <div className="card">
        <h2>Nearby Fair Price Shops</h2>
        <div className="dealers-grid">
          {dealers.map((dealer) => (
            <div key={dealer.id} className="dealer-card">
              <h3>{dealer.shopName}</h3>
              <p>{dealer.address}</p>
              <p>{dealer.fullName}</p>
              <p>Region: {dealer.region}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Grievances({ citizen }) {
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('Dealer behavior');
  const [priority, setPriority] = useState('MEDIUM');
  const [description, setDescription] = useState('');
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchGrievances = async () => {
    if (!citizen?.id) {
      return;
    }

    setLoading(true);
    try {
      const data = await grievanceService.getByCitizen(citizen.id);
      setGrievances(data || []);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to load grievances'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrievances();
  }, [citizen?.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!citizen?.dealerId) {
      toast.error('You are not assigned to a dealer yet');
      return;
    }

    setSubmitting(true);
    try {
      await grievanceService.create({
        citizenId: citizen.id,
        dealerId: citizen.dealerId,
        subject,
        category,
        priority,
        description,
      });
      toast.success('Grievance submitted successfully');
      setSubject('');
      setCategory('Dealer behavior');
      setPriority('MEDIUM');
      setDescription('');
      await fetchGrievances();
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to submit grievance'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="dashboard-content">
      <div className="card">
        <div className="section-heading grievance-form-heading">
          <div>
            <h2>File a Grievance</h2>
            <p className="text-muted">
              Your complaint will be routed to {citizen?.dealerShopName || 'your assigned dealer'} and visible to admin.
            </p>
          </div>
          <span className="badge badge-info">{citizen?.rationCardNumber || 'Citizen'}</span>
        </div>

        <form onSubmit={handleSubmit} className="grievance-form">
          <div className="form-row">
            <div className="form-group">
              <label>Dealer</label>
              <input className="form-control" value={citizen?.dealerShopName || 'No dealer assigned'} disabled />
            </div>
            <div className="form-group">
              <label>Priority</label>
              <select className="form-control" value={priority} onChange={(event) => setPriority(event.target.value)} required>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Category</label>
              <select className="form-control" value={category} onChange={(event) => setCategory(event.target.value)} required>
                <option value="Dealer behavior">Dealer behavior</option>
                <option value="Stock unavailable">Stock unavailable</option>
                <option value="Incorrect quantity">Incorrect quantity</option>
                <option value="Overcharging">Overcharging</option>
                <option value="Shop closed">Shop closed</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Subject</label>
              <input
                className="form-control"
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                placeholder="Short title for your complaint"
                maxLength="100"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              className="form-control"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Explain what happened, when it happened, and what help you need"
              rows="5"
              maxLength="1000"
              required
            />
          </div>

          <button className="btn btn-primary" type="submit" disabled={submitting || !citizen?.dealerId}>
            {submitting ? 'Submitting...' : 'Submit Grievance'}
          </button>
        </form>
      </div>

      <div className="card">
        <h2>My Grievances</h2>
        {loading ? (
          <p className="empty-state">Loading grievances...</p>
        ) : grievances.length === 0 ? (
          <p className="empty-state">No grievances submitted yet.</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Dealer</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Response</th>
                </tr>
              </thead>
              <tbody>
                {grievances.map((grievance) => (
                  <tr key={grievance.id}>
                    <td>{grievance.subject}</td>
                    <td>{grievance.dealerName}</td>
                    <td>{grievance.category}</td>
                    <td>{grievance.priority}</td>
                    <td><span className="badge badge-info">{grievance.status?.replace('_', ' ')}</span></td>
                    <td>{grievance.response || 'Pending response'}</td>
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

export default CitizenDashboard;
