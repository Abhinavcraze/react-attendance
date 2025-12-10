import React, { useState, useEffect, useMemo } from 'react';
import Header from '../Components/Header';
import { openDB, getAllFromStore, deleteFromStore } from '../Utils/db';
import { FaTrash, FaSort, FaSortUp, FaSortDown, FaSearch, FaFilter, FaFileCsv, FaPrint } from 'react-icons/fa'; 

const AdminDashboard = () => {
  const [allStudents, setAllStudents] = useState([]); 
  const [classFilteredStudents, setClassFilteredStudents] = useState([]); 
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: 'RollNo', direction: 'asc' });
  const [searchCol, setSearchCol] = useState('Name'); 
  const [searchText, setSearchText] = useState('');

  // --- Load Data ---
  useEffect(() => {
    const fetchData = async () => {
      const data = await getAllFromStore("students") || [];
      const sorted = data.sort((a, b) => a.RollNo - b.RollNo);
      setAllStudents(sorted);
      setClassFilteredStudents(sorted); 
    };
    fetchData();
  }, []);

  const handleClassFilter = async (classFilter) => {
    setSearchText(''); 
    setCurrentPage(1); 
    setSortConfig({ key: 'RollNo', direction: 'asc' });

    if (classFilter === 'all') {
      setClassFilteredStudents(allStudents);
    } 
    else {
      const db = await openDB();
      const tx = db.transaction("students", "readonly");
      const index = tx.objectStore("students").index("Class");
      const request = index.getAll(parseInt(classFilter));
      
      request.onsuccess = (e) => {
        setClassFilteredStudents(e.target.result);
      };
    }
  };

  // --- Logic: Search & Sort Pipeline ---
  const processedData = useMemo(() => {
    let data = [...classFilteredStudents];
    if (searchText) {
      data = data.filter(item => {
        const value = item[searchCol] ? item[searchCol].toString().toLowerCase() : '';
        return value.includes(searchText.toLowerCase());
      });
    }

    if (sortConfig.key) {
      data.sort((a, b) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];

        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();

        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return data;
  }, [classFilteredStudents, searchText, searchCol, sortConfig]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, itemsPerPage, classFilteredStudents]);

  const totalPages = Math.ceil(processedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = processedData.slice(startIndex, startIndex + itemsPerPage);

  // --- Handlers ---
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleDelete = async (studentId) => {
    if (window.confirm("Are you sure you want to delete this student (Issue TC)?")) {
      try {
        await deleteFromStore("students", studentId);
        const remaining = allStudents.filter(s => s.StudentId !== studentId);
        setAllStudents(remaining);
        setClassFilteredStudents(prev => prev.filter(s => s.StudentId !== studentId));
      } catch (error) {
        console.error("Error deleting:", error);
      }
    }
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(parseInt(e.target.value));
  };

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) return <FaSort color="#ccc" size={12} />;
    return sortConfig.direction === 'asc' ? <FaSortUp color="#333" size={12} /> : <FaSortDown color="#333" size={12} />;
  };

  // --- NEW: Export Function ---
  const handleExport = () => {
    if (processedData.length === 0) {
      alert("No data to export");
      return;
    }
    // Define Headers
    const headers = ["ID", "Name", "Class", "Roll No"];
    
    // Map data to CSV format
    const csvContent = [
      headers.join(","), 
      ...processedData.map(row => 
        `${row.StudentId},"${row.Name}",${row.Class},${row.RollNo}`
      )
    ].join("\n");

    // Trigger Download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "students_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- NEW: Print Function ---
  const handlePrint = () => {
    window.print();
  };

  const thStyle = { cursor: 'pointer', userSelect: 'none', position: 'relative', paddingRight: '20px' };

  return (
    <div className="page-container">
      <style>{`
        @media print {
          .no-print, header, footer, .class-buttons { display: none !important; }
          .page-container { margin: 0; padding: 0; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid black; padding: 8px; }
          th:last-child, td:last-child { display: none; } /* Hide Action Column */
        }
      `}</style>

      <Header title="Admin Dashboard" />
      <main>
        {/* Class Filter Buttons */}
        <div className="class-buttons no-print" style={{ marginBottom: '15px' }}>
          {[6, 7, 8, 9, 10].map(c => (
            <button key={c} className="class-btn" onClick={() => handleClassFilter(c)}>Class {c}</button>
          ))}
          <button className="class-btn" onClick={() => handleClassFilter('all')}>View All</button>
        </div>

        {/* Filter & Search Bar */}
        <div className="no-print" style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '15px',
          padding: '12px',
          backgroundColor: '#f8f9fa',
          border: '1px solid #ddd',
          borderRadius: '8px',
          flexWrap: 'wrap', 
          gap: '15px'
        }}>
          {/* Left: Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#555' }}>
              <FaFilter />
              <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Filter by:</span>
            </div>
            <select 
              value={searchCol} 
              onChange={(e) => setSearchCol(e.target.value)}
              style={{ padding: '6px 10px', borderRadius: '4px', border: '1px solid #ccc', cursor: 'pointer', backgroundColor: 'white' }}
            >
              <option value="Name">Name</option>
              <option value="StudentId">ID</option>
              <option value="Class">Class</option>
              <option value="RollNo">Roll No</option>
            </select>
          </div>

          {/* Right: Search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexGrow: 1, justifyContent: 'flex-end' }}>
            <FaSearch color="#888" />
            <input 
              type="text" 
              placeholder={`Search by ${searchCol}...`} 
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ padding: '7px', borderRadius: '4px', border: '1px solid #ccc', width: '100%', maxWidth: '250px' }}
             />
          </div>
        </div>

        {/* --- NEW SECTION: Export & Print Buttons --- */}
        <div className="no-print" style={{ 
          display: 'flex', 
          justifyContent: 'flex-end', // Aligns buttons to the right
          gap: '10px', 
          marginBottom: '10px' 
        }}>
          <button 
            onClick={handleExport}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '5px',
              backgroundColor: '#27ae60', color: 'white', border: 'none', 
              padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold'
            }}
          >
            <FaFileCsv /> Export CSV
          </button>
          <button 
            onClick={handlePrint}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '5px',
              backgroundColor: '#2980b9', color: 'white', border: 'none', 
              padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold'
            }}
          >
            <FaPrint /> Print
          </button>
        </div>
        <table>
          <thead>
            <tr>
              <th style={thStyle} onClick={() => handleSort('StudentId')}>
                ID <span style={{marginLeft: '5px'}}>{getSortIcon('StudentId')}</span>
              </th>
              <th style={thStyle} onClick={() => handleSort('Name')}>
                Name <span style={{marginLeft: '5px'}}>{getSortIcon('Name')}</span>
              </th>
              <th style={thStyle} onClick={() => handleSort('Class')}>
                Class <span style={{marginLeft: '5px'}}>{getSortIcon('Class')}</span>
              </th>
              <th style={thStyle} onClick={() => handleSort('RollNo')}>
                Roll No <span style={{marginLeft: '5px'}}>{getSortIcon('RollNo')}</span>
              </th>
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
                      className="no-print" // Hide delete button when printing
                      onClick={() => handleDelete(s.StudentId)}
                      title="Issue TC / Delete"
                      style={{ 
                        backgroundColor: 'transparent', border: 'none', cursor: 'pointer', 
                        padding: '5px', display: 'flex', justifyContent: 'center', 
                        alignItems: 'center', margin: '0 auto'
                      }}
                    >
                      <FaTrash size={15} color="#d9534f" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{textAlign: 'center', padding: '20px', color: '#666'}}>
                  {searchText ? `No matches found for "${searchText}"` : "No students found."}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination Footer */}
        <div className="no-print" style={{ 
          marginTop: '20px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          flexWrap: 'wrap',
          gap: '15px'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label htmlFor="rows-select" style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Rows per page:</label>
              <select 
                id="rows-select" 
                value={itemsPerPage} 
                onChange={handleItemsPerPageChange} 
                style={{ width: 'auto', padding: '5px', borderRadius: '4px', border: '1px solid #ccc', cursor: 'pointer' }}
              >
                <option value={5}>5</option>
                <option value={8}>8</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={allStudents.length > 0 ? allStudents.length : 100}>All</option>
              </select>
            </div>

            {totalPages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button 
                  className="btn" 
                  disabled={currentPage === 1} 
                  onClick={() => setCurrentPage(p => p - 1)} 
                  style={{ padding: '5px 10px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                >
                  Prev
                </button>
                <span>Page <strong>{currentPage}</strong> of {totalPages}</span>
                <button 
                  className="btn" 
                  disabled={currentPage === totalPages} 
                  onClick={() => setCurrentPage(p => p + 1)} 
                  style={{ padding: '5px 10px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                >
                  Next
                </button>
              </div>
            )}
        </div>

      </main>
      <footer>&copy; 2025 Soruban Vidhyalaya</footer>
    </div>
  );
};

export default AdminDashboard;