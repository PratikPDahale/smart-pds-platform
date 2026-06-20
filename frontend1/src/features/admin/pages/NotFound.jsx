import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import './NotFound.css';

function NotFound() {
  return (
    <div className="not-found-page">
      <div className="not-found-content">
        <h1>404</h1>
        <h2>Page Not Found</h2>
        <p>The page you are looking for doesn't exist or has been moved.</p>
        <Link to="/" className="btn btn-primary">
          <Home size={20} />
          Go to Home
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
