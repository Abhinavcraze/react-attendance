import React from 'react';
import Header from '../Components/Header';

const StaffDashboard = () => {
  return (
    <div className="page-container">
      <Header title="Staff Dashboard" />
      <main style={{ textAlign: 'center' }}>
        <h2>Welcome, Staff!</h2>
        <p>Use the navigation menu to Mark Attendance or View Reports.</p>
      </main>
      <footer>&copy; 2025 Soruban Vidhyalaya</footer>
    </div>
  );
};

export default StaffDashboard;