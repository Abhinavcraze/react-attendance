import React, { useState, useEffect } from 'react';
import Header from '../Components/Header';
import { openDB, getAllFromStore, deleteFromStore } from '../Utils/db';

const AdminDashboard = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    const fetchData = async () => {
      const allStudents = await getAllFromStore("students");
      // Sort by RollNo
      const sorted = allStudents.sort((a, b) => a.RollNo - b.RollNo);
      setStudents(sorted);
      setFilteredStudents(sorted);
    };
    fetchData();
  }, []);

  const handleClassFilter = async (classFilter) => {
    if (classFilter === 'all') {
      setFilteredStudents(students);
    } else {
      const db = await openDB();
      const tx = db.transaction("students", "readonly");
      const index = tx.objectStore("students").index("Class");
      index.getAll(parseInt(classFilter)).onsuccess = (e) => {
        setFilteredStudents(e.target.result.sort((a, b) => a.RollNo - b.RollNo));
      };
    }
    setCurrentPage(1);
  };

  // Handle Delete (TC Issue)
  const handleDelete = async (studentId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this student (Issue TC)?");
    if (confirmDelete) {
      try {
        await deleteFromStore("students", studentId);
        
        // Update local state
        const updatedStudents = students.filter(s => s.StudentId !== studentId);
        const updatedFiltered = filteredStudents.filter(s => s.StudentId !== studentId);
        
        setStudents(updatedStudents);
        setFilteredStudents(updatedFiltered);

        // Adjust pagination if page becomes empty
        if (updatedFiltered.length > 0 && updatedFiltered.length <= (currentPage - 1) * itemsPerPage) {
           setCurrentPage(prev => Math.max(prev - 1, 1));
        }
      } catch (error) {
        console.error("Error deleting student:", error);
        alert("Failed to delete student");
      }
    }
  };

  // Pagination Logic
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = filteredStudents.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="page-container">
      <Header title="Admin Dashboard" />
      <main>
        <div className="class-buttons">
          {[6, 7, 8, 9, 10].map(c => (
            <button key={c} className="class-btn" onClick={() => handleClassFilter(c)}>Class {c}</button>
          ))}
          <button className="class-btn" onClick={() => handleClassFilter('all')}>View All</button>
        </div>

        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Class</th>
              <th>Roll No</th>
              <th style={{ textAlign: 'center' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentData.map(s => (
              <tr key={s.StudentId}>
                <td>{s.StudentId}</td>
                <td>{s.Name}</td>
                <td>{s.Class}</td>
                <td>{s.RollNo}</td>
                <td style={{ textAlign: 'center' }}>
                  <button 
                    onClick={() => handleDelete(s.StudentId)}
                    style={{ 
                      backgroundColor: 'transparent', // No bg-color
                      border: 'none', 
                      cursor: 'pointer', 
                      padding: '0' 
                    }}
                  >
                    <img 
                      src="delete.png" 
                      alt="DELETE(TC)" 
                      style={{ width: '20px', height: '20px' }} // Adjusted to 20px for visibility (5px is invisible)
                    />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Prev</button>
            <span>Page {currentPage} of {totalPages}</span>
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>Next</button>
          </div>
        )}
      </main>
      <footer>&copy; 2025 Soruban Vidhyalaya</footer>
    </div>
  );
};

export default AdminDashboard;