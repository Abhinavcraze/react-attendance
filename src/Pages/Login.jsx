import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await login(username, password);
      navigate(user.Role === 'Admin' ? '/admin-dashboard' : '/staff-dashboard');
    } catch (err) {
      setError(err);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Admin / Staff Login</h2>
        <form onSubmit={handleSubmit} style={{ boxShadow: 'none', padding: 0 }}>
          <div style={{ marginBottom: '15px', textAlign: 'left' }}>
            <label>Name</label>
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              required 
            />
          </div>
          <div style={{ marginBottom: '15px', textAlign: 'left' }}>
            <label>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>
          <button type="submit" style={{ width: '100%' }}>Login</button>
        </form>
        {error && <p className="error-msg">{error}</p>}
      </div>
    </div>
  );
};

export default Login;