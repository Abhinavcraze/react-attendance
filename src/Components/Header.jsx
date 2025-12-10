// import React from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { useAuth } from '../Context/AuthContext';

// const Header = ({ title }) => {
//   const { user, logout } = useAuth();
//   const navigate = useNavigate();

//   const handleLogout = (e) => {
//     e.preventDefault();
//     logout();
//     navigate('/login');
//   };

//   return (
//     <header>
//       <h1>{title}</h1>
//       <nav>
//         <ul>
//           {user?.Role === 'Admin' && (
//             <>
//               <li><Link to="/admin-dashboard">Dashboard</Link></li>
//               <li><Link to="/add-students">Add Students</Link></li>
//             </>
//           )}
//           <li><Link to="/attendance">Attendance</Link></li>
//           <li><Link to="/reports">Reports</Link></li>
//           <li><a href="/" onClick={handleLogout}>Logout</a></li>
//         </ul>
//       </nav>
//     </header>
//   );
// };

// export default Header;

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
import { FaSchool } from 'react-icons/fa'; 

const Header = ({ title }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
    navigate('/login');
  };

  return (
    <header style={styles.header}>
      <div style={styles.brandContainer}>
        <FaSchool size={30} style={styles.icon} />
        <div>
          <h2 style={styles.schoolName}>Soruban Tech School</h2>
          <span style={styles.pageTitle}>{title}</span>
        </div>
      </div>

      <nav>
        <ul style={styles.navList}>
          {user?.Role === 'Admin' && (
            <>
              <li><Link to="/admin-dashboard" style={styles.link}>Dashboard</Link></li>
              <li><Link to="/add-students" style={styles.link}>Add Students</Link></li>
            </>
          )}
          <li><Link to="/attendance" style={styles.link}>Attendance</Link></li>
          <li><Link to="/reports" style={styles.link}>Reports</Link></li>
          <li><button onClick={handleLogout}>Logout</button>
          </li>
        </ul>
      </nav>
    </header>
  );
};

// Basic Styling Object (You can move this to a CSS file)
const styles = {
  brandContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  icon: {
    color: 'black',
  },
  schoolName: {
    margin: 0,
    fontSize: '1.2rem',
    fontWeight: 'bold',
  },
  pageTitle: {
    fontSize: '0.9rem',
    color: '#bdc3c7',
    fontWeight: 'normal',
  },
  navList: {
    display: 'flex',
    listStyle: 'none',
    gap: '20px',
    margin: 0,
    padding: 0,
    alignItems: 'center',
  },
  link: {
    color: 'white',
    textDecoration: 'none',
    fontWeight: 500,
  }
};

export default Header;