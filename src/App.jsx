import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './Context/AuthContext'; // Correct Import
import ProtectedRoute from './Components/ProtectedRoute';

// Pages
import Login from './Pages/Login';
import AdminDashboard from './Pages/AdminDashboard';
import StaffDashboard from './Pages/StaffDashboard';
import AddStudents from './Pages/AddStudents';
import Attendance from './Pages/Attendance';
import AttendanceReport from './Pages/AttendanceReport';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/admin-dashboard" element={
            <ProtectedRoute roles={['Admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />

          <Route path="/staff-dashboard" element={
            <ProtectedRoute roles={['Staff']}>
              <StaffDashboard />
            </ProtectedRoute>
          } />

          <Route path="/add-students" element={
            <ProtectedRoute roles={['Admin']}>
              <AddStudents />
            </ProtectedRoute>
          } />

          <Route path="/attendance" element={
            <ProtectedRoute roles={['Admin', 'Staff']}>
              <Attendance />
            </ProtectedRoute>
          } />

          <Route path="/reports" element={
            <ProtectedRoute roles={['Admin', 'Staff']}>
              <AttendanceReport />
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;