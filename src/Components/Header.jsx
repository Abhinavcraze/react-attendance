import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';

const Header = ({ title }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
    navigate('/login');
  };

  return (
    <header>
      <h1>{title}</h1>
      <nav>
        <ul>
          {user?.Role === 'Admin' && (
            <>
              <li><Link to="/admin-dashboard">Dashboard</Link></li>
              <li><Link to="/add-students">Add Students</Link></li>
            </>
          )}
          <li><Link to="/attendance">Attendance</Link></li>
          <li><Link to="/reports">Reports</Link></li>
          <li><a href="/" onClick={handleLogout}>Logout</a></li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;