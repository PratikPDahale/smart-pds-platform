// import React, { useEffect } from 'react';
// import { Routes, Route, Navigate } from 'react-router-dom';
// import { useAuth } from './context/AuthContext';

// // Pages
// import Home from './pages/Home';
// import Login from './pages/Login';
// import Register from './pages/Register';
// import CitizenDashboard from './pages/CitizenDashboard';
// import DealerDashboard from './pages/DealerDashboard';
// import AdminDashboard from './pages/AdminDashboard';
// import NotFound from './pages/NotFound';

// function App() {
//   const { user, loading } = useAuth();

//   if (loading) {
//     return (
//       <div className="loading-screen">
//         <div className="loader"></div>
//         <p>Loading e-Ration PDS...</p>
//       </div>
//     );
//   }

//   // Debug log
//   useEffect(() => {
//     console.log('App render - User state:', user);
//   }, [user]);

//   return (
//     <Routes>
//       <Route path="/" element={<Home />} />
//       <Route path="/login" element={user ? <Navigate to={`/${(user.role || 'citizen').toLowerCase()}`} /> : <Login />} />
//       <Route path="/register" element={user ? <Navigate to={`/${(user.role || 'citizen').toLowerCase()}`} /> : <Register />} />
      
//       <Route 
//         path="/citizen/*" 
//         element={user && user.role === 'CITIZEN' ? <CitizenDashboard /> : <Navigate to="/login" />} 
//       />
//       <Route 
//         path="/dealer/*" 
//         element={user && user.role === 'DEALER' ? <DealerDashboard /> : <Navigate to="/login" />} 
//       />
//       <Route 
//         path="/admin/*" 
//         element={user && user.role === 'ADMIN' ? <AdminDashboard /> : <Navigate to="/login" />} 
//       />
      
//       <Route path="*" element={<NotFound />} />
//     </Routes>
//   );
// }

// export default App;



import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';

// Pages
import Home from '../src/features/admin/pages/Home.jsx';
import Login from '../src/features/admin/pages/Login.jsx';
import Register from '../src/features/admin/pages/Register.jsx';
import CitizenDashboard from './features/admin/pages/CitizenDashboard.jsx';
import DealerDashboard from './features/admin/pages/DealerDashboard.jsx';
import AdminDashboard from './features/admin/pages/AdminDashboard.jsx';
import NotFound from './features/admin/pages/NotFound.jsx';

// ✅ Protected Route Component
const ProtectedRoute = ({ user, role, children }) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to={`/${user.role.toLowerCase()}`} replace />;
  }

  return children;
};

function App() {
  const { user, loading } = useAuth();

  useEffect(() => {
    console.log('App render - User state:', user);
  }, [user]);

  // ✅ Loader
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader"></div>
        <p>Loading e-Ration PDS...</p>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />

      <Route
        path="/login"
        element={
          user
            ? <Navigate to={`/${user.role.toLowerCase()}`} replace />
            : <Login />
        }
      />

      <Route
        path="/register"
        element={
          user
            ? <Navigate to={`/${user.role.toLowerCase()}`} replace />
            : <Register />
        }
      />

      {/* Protected Routes */}
      <Route
        path="/citizen/*"
        element={
          <ProtectedRoute user={user} role="CITIZEN">
            <CitizenDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dealer/*"
        element={
          <ProtectedRoute user={user} role="DEALER">
            <DealerDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/*"
        element={
          <ProtectedRoute user={user} role="ADMIN">
            <AdminDashboard/>
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
