// import React, { useState, useEffect } from 'react';
// import Header from '../Components/Header';
// import { openDB, getAllFromStore, deleteFromStore } from '../Utils/db';
// import { FaTrash } from 'react-icons/fa'; 

// const AdminDashboard = () => {
//   const [students, setStudents] = useState([]);
//   const [filteredStudents, setFilteredStudents] = useState([]);
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 8;

//   useEffect(() => {
//     const fetchData = async () => {
//       const allStudents = await getAllFromStore("students");
//       const sorted = allStudents.sort((a, b) => a.RollNo - b.RollNo);
//       setStudents(sorted);
//       setFilteredStudents(sorted);
//     };
//     fetchData();
//   }, []);

//   const handleClassFilter = async (classFilter) => {
//     if (classFilter === 'all') {
//       setFilteredStudents(students);
//     } else {
//       const db = await openDB();
//       const tx = db.transaction("students", "readonly");
//       const index = tx.objectStore("students").index("Class");
//       index.getAll(parseInt(classFilter)).onsuccess = (e) => {
//         setFilteredStudents(e.target.result.sort((a, b) => a.RollNo - b.RollNo));
//       };
//     }
//     setCurrentPage(1);
//   };

//   const handleDelete = async (studentId) => {
//     const confirmDelete = window.confirm("Are you sure you want to delete this student (Issue TC)?");
//     if (confirmDelete) {
//       try {
//         await deleteFromStore("students", studentId);
        
//         const updatedStudents = students.filter(s => s.StudentId !== studentId);
//         const updatedFiltered = filteredStudents.filter(s => s.StudentId !== studentId);
        
//         setStudents(updatedStudents);
//         setFilteredStudents(updatedFiltered);

//         if (updatedFiltered.length > 0 && updatedFiltered.length <= (currentPage - 1) * itemsPerPage) {
//            setCurrentPage(prev => Math.max(prev - 1, 1));
//         }
//       } catch (error) {
//         console.error("Error deleting student:", error);
//         alert("Failed to delete student");
//       }
//     }
//   };

//   const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
//   const startIndex = (currentPage - 1) * itemsPerPage;
//   const currentData = filteredStudents.slice(startIndex, startIndex + itemsPerPage);

//   return (
//     <div className="page-container">
//       <Header title="Admin Dashboard" />
//       <main>
//         <div className="class-buttons">
//           {[6, 7, 8, 9, 10].map(c => (
//             <button key={c} className="class-btn" onClick={() => handleClassFilter(c)}>Class {c}</button>
//           ))}
//           <button className="class-btn" onClick={() => handleClassFilter('all')}>View All</button>
//         </div>

//         <table>
//           <thead>
//             <tr>
//               <th>ID</th>
//               <th>Name</th>
//               <th>Class</th>
//               <th>Roll No</th>
//               <th style={{ textAlign: 'center' }}>Action</th>
//             </tr>
//           </thead>
//           <tbody>
//             {currentData.map(s => (
//               <tr key={s.StudentId}>
//                 <td>{s.StudentId}</td>
//                 <td>{s.Name}</td>
//                 <td>{s.Class}</td>
//                 <td>{s.RollNo}</td>
//                 <td style={{ textAlign: 'center' }}>
//                   <button 
//                     onClick={() => handleDelete(s.StudentId)}
//                     title="Issue TC / Delete"
//                     style={{ 
//                       backgroundColor: 'transparent', 
//                       border: 'none', 
//                       cursor: 'pointer', 
//                       padding: '5px',
//                       display: 'flex',
//                       justifyContent: 'center',
//                       alignItems: 'center',
//                       margin: '0 auto'
//                     }}
//                   >
//                     {/* 2. Used the FaTrash Icon here */}
//                     <FaTrash 
//                       size={20} 
//                       color="#d9534f" 
//                       style={{ transition: 'color 0.2s' }}
//                       onMouseOver={(e) => e.currentTarget.style.color = '#c9302c'}
//                       onMouseOut={(e) => e.currentTarget.style.color = '#d9534f'}
//                     />
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>

//         {totalPages > 1 && (
//           <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
//             <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Prev</button>
//             <span>Page {currentPage} of {totalPages}</span>
//             <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>Next</button>
//           </div>
//         )}
//       </main>
//       <footer>&copy; 2025 Soruban Vidhyalaya</footer>
//     </div>
//   );
// };

// export default AdminDashboard;


import React, { useState, useEffect } from 'react';
import Header from '../Components/Header';
import { openDB, getAllFromStore, deleteFromStore } from '../Utils/db';
import { FaTrash } from 'react-icons/fa'; 

const AdminDashboard = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  
  // 1. Changed itemsPerPage from const to useState (default 8)
  const [itemsPerPage, setItemsPerPage] = useState(8);

  useEffect(() => {
    const fetchData = async () => {
      const allStudents = await getAllFromStore("students");
      // Safety check in case db returns undefined/null
      const data = allStudents || [];
      const sorted = data.sort((a, b) => a.RollNo - b.RollNo);
      setStudents(sorted);
      setFilteredStudents(sorted);
    };
    fetchData();
  }, []);

  const handleClassFilter = async (classFilter) => {
    setCurrentPage(1); // Reset page on filter change
    if (classFilter === 'all') {
      setFilteredStudents(students);
    } else {
      const db = await openDB();
      const tx = db.transaction("students", "readonly");
      const index = tx.objectStore("students").index("Class");
      
      const request = index.getAll(parseInt(classFilter));
      
      request.onsuccess = (e) => {
        setFilteredStudents(e.target.result.sort((a, b) => a.RollNo - b.RollNo));
      };
    }
  };

  const handleDelete = async (studentId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this student (Issue TC)?");
    if (confirmDelete) {
      try {
        await deleteFromStore("students", studentId);
        
        const updatedStudents = students.filter(s => s.StudentId !== studentId);
        const updatedFiltered = filteredStudents.filter(s => s.StudentId !== studentId);
        
        setStudents(updatedStudents);
        setFilteredStudents(updatedFiltered);

        // Adjust page if we deleted the last item on the current page
        if (updatedFiltered.length > 0 && updatedFiltered.length <= (currentPage - 1) * itemsPerPage) {
           setCurrentPage(prev => Math.max(prev - 1, 1));
        }
      } catch (error) {
        console.error("Error deleting student:", error);
        alert("Failed to delete student");
      }
    }
  };

  // 2. Handler for changing rows per page
  const handleItemsPerPageChange = (e) => {
    const newValue = parseInt(e.target.value);
    setItemsPerPage(newValue);
    setCurrentPage(1); // Reset to first page to avoid out-of-bounds
  };

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = filteredStudents.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="page-container">
      <Header title="Admin Dashboard" />
      <main>
        {/* Controls Container: Holds Filter Buttons (Left) and Row Selector (Right) */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '15px',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          
          <div className="class-buttons">
            {[6, 7, 8, 9, 10].map(c => (
              <button key={c} className="class-btn" onClick={() => handleClassFilter(c)}>Class {c}</button>
            ))}
            <button className="class-btn" onClick={() => handleClassFilter('all')}>View All</button>
          </div>

          {/* 3. The Dropdown UI for Rows Per Page */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label htmlFor="rows-select" style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Rows per page:</label>
            <select 
              id="rows-select"
              value={itemsPerPage} 
              onChange={handleItemsPerPageChange}
              style={{
                padding: '5px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                cursor: 'pointer'
              }}
            >
              <option value={5}>5</option>
              <option value={8}>8</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              {/* Option to show everything */}
              <option value={filteredStudents.length > 0 ? filteredStudents.length : 100}>All</option>
            </select>
          </div>

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
            {currentData.length > 0 ? (
              currentData.map(s => (
                <tr key={s.StudentId}>
                  <td>{s.StudentId}</td>
                  <td>{s.Name}</td>
                  <td>{s.Class}</td>
                  <td>{s.RollNo}</td>
                  <td style={{ textAlign: 'center' }}>
                    <button 
                      onClick={() => handleDelete(s.StudentId)}
                      title="Issue TC / Delete"
                      style={{ 
                        backgroundColor: 'transparent', 
                        border: 'none', 
                        cursor: 'pointer', 
                        padding: '5px',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        margin: '0 auto'
                      }}
                    >
                      <FaTrash 
                        size={20} 
                        color="#d9534f" 
                        style={{ transition: 'color 0.2s' }}
                        onMouseOver={(e) => e.currentTarget.style.color = '#c9302c'}
                        onMouseOut={(e) => e.currentTarget.style.color = '#d9534f'}
                      />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{textAlign: 'center', padding: '20px'}}>No students found.</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '10px', alignItems: 'center' }}>
            <button 
              disabled={currentPage === 1} 
              onClick={() => setCurrentPage(p => p - 1)}
              style={{ padding: '5px 10px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
            >
              Prev
            </button>
            
            <span>Page <strong>{currentPage}</strong> of {totalPages}</span>
            
            <button 
              disabled={currentPage === totalPages} 
              onClick={() => setCurrentPage(p => p + 1)}
              style={{ padding: '5px 10px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
            >
              Next
            </button>
          </div>
        )}
      </main>
      <footer>&copy; 2025 Soruban Vidhyalaya</footer>
    </div>
  );
};

export default AdminDashboard;