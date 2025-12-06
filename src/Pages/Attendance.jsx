import React, { useState } from 'react';
import Header from '../Components/Header';
import { openDB, getStudentsByClass } from '../Utils/db';

const Attendance = () => {
  const [selectedClass, setSelectedClass] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // Default to today
  const [students, setStudents] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({}); // { studentId: true/false }

  // Derived state for stats
  const totalStudents = students.length;
  const presentCount = Object.values(attendanceMap).filter(val => val === true).length;
  const absentCount = totalStudents - presentCount;

  const handleClassChange = async (e) => {
    const val = e.target.value;
    setSelectedClass(val);
    if (val) {
      const result = await getStudentsByClass(val);
      // Sort by RollNo for better order
      const sorted = result.sort((a, b) => a.RollNo - b.RollNo);
      setStudents(sorted);
      
      // Default everyone to present
      const initialMap = {};
      sorted.forEach(s => initialMap[s.StudentId] = true);
      setAttendanceMap(initialMap);
    } else {
      setStudents([]);
      setAttendanceMap({});
    }
  };

  const toggleAttendance = (id) => {
    setAttendanceMap(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const markAll = (status) => {
    const newMap = {};
    students.forEach(s => newMap[s.StudentId] = status);
    setAttendanceMap(newMap);
  };

  const handleSave = async () => {
    if (!date || !selectedClass) return alert("Please select Class and Date.");

    const db = await openDB();
    const tx = db.transaction("attendance", "readwrite");
    const store = tx.objectStore("attendance");
    
    // Logic: We are simply adding new records. 
    // In a real app, you might want to check if records exist for this Date+Class and update them.
    
    const recordsToAdd = students.map(s => ({
      studentId: s.StudentId,
      name: s.Name,
      class: s.Class,
      date: date,
      status: attendanceMap[s.StudentId] ? "Present" : "Absent"
    }));

    let completed = 0;
    recordsToAdd.forEach(rec => {
        const req = store.add(rec);
        req.onsuccess = () => {
            completed++;
            if(completed === recordsToAdd.length) {
                alert(`Attendance saved for ${recordsToAdd.length} students!`);
                // Optional: Clear selection or stay on page
            }
        }
    });
  };

  // --- Styles ---
  const styles = {
    controlPanel: {
      backgroundColor: '#fff',
      padding: '20px',
      borderRadius: '12px',
      boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
      display: 'flex',
      flexWrap: 'wrap',
      gap: '20px',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '20px',
    },
    inputGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '5px',
      flex: '1 1 200px',
    },
    label: {
      fontSize: '0.85rem',
      fontWeight: '600',
      color: '#666',
    },
    select: {
      padding: '10px 15px',
      borderRadius: '8px',
      border: '1px solid #ddd',
      fontSize: '1rem',
      backgroundColor: '#f9f9f9',
      outline: 'none',
    },
    statsBar: {
      display: 'flex',
      gap: '15px',
      marginBottom: '20px',
      justifyContent: 'center',
    },
    statCard: {
      flex: 1,
      background: 'white',
      padding: '10px',
      borderRadius: '8px',
      textAlign: 'center',
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
      borderLeft: '4px solid #ddd',
    },
    listContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: '15px',
    },
    studentCard: {
      backgroundColor: 'white',
      borderRadius: '10px',
      padding: '15px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
      transition: 'transform 0.2s',
      border: '1px solid #eee',
    },
    avatar: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      backgroundColor: '#e0e7ff',
      color: '#4338ca',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 'bold',
      marginRight: '15px',
      fontSize: '1.1rem',
    },
    info: {
      flex: 1,
      textAlign: 'left',
    },
    name: {
      fontWeight: '600',
      fontSize: '1rem',
      color: '#333',
      margin: 0,
    },
    roll: {
      fontSize: '0.85rem',
      color: '#888',
      margin: 0,
    },
    toggleBtn: (isPresent) => ({
      padding: '8px 16px',
      borderRadius: '20px',
      border: 'none',
      cursor: 'pointer',
      fontWeight: '600',
      fontSize: '0.9rem',
      transition: 'background-color 0.3s',
      backgroundColor: isPresent ? '#d1fae5' : '#fee2e2',
      color: isPresent ? '#065f46' : '#991b1b',
      minWidth: '80px',
    }),
    saveBtn: {
      position: 'fixed',
      bottom: '30px',
      right: '30px',
      backgroundColor: '#4f46e5',
      color: 'white',
      border: 'none',
      borderRadius: '50px',
      padding: '15px 30px',
      fontSize: '1.1rem',
      fontWeight: 'bold',
      boxShadow: '0 4px 20px rgba(79, 70, 229, 0.4)',
      cursor: 'pointer',
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
    },
    bulkActions: {
      display: 'flex',
      gap: '10px',
      marginTop: '10px',
    },
    bulkBtn: {
      fontSize: '0.8rem',
      padding: '5px 10px',
      border: '1px solid #ddd',
      backgroundColor: 'white',
      borderRadius: '5px',
      cursor: 'pointer',
    }
  };

  return (
    <div className="page-container" style={{ backgroundColor: '#f3f4f6', minHeight: '100vh' }}>
      <Header title="Mark Attendance" />
      
      <main style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto', paddingBottom: '100px' }}>
        
        {/* Top Control Panel */}
        <div style={styles.controlPanel}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Select Class</label>
            <select style={styles.select} value={selectedClass} onChange={handleClassChange}>
              <option value="">-- Choose --</option>
              {[6,7,8,9,10].map(c => <option key={c} value={c}>Class {c}</option>)}
            </select>
          </div>
          
          <div style={styles.inputGroup}>
            <label style={styles.label}>Date</label>
            <input 
              type="date" 
              style={styles.select} 
              value={date} 
              onChange={(e) => setDate(e.target.value)} 
            />
          </div>

          {students.length > 0 && (
            <div style={styles.inputGroup}>
              <label style={styles.label}>Quick Actions</label>
              <div style={styles.bulkActions}>
                <button style={styles.bulkBtn} onClick={() => markAll(true)}>All Present</button>
                <button style={styles.bulkBtn} onClick={() => markAll(false)}>All Absent</button>
              </div>
            </div>
          )}
        </div>

        {students.length > 0 ? (
          <>
            {/* Live Stats */}
            <div style={styles.statsBar}>
              <div style={{...styles.statCard, borderLeftColor: '#4f46e5'}}>
                <div style={{fontSize:'0.8rem', color:'#666'}}>Total</div>
                <div style={{fontWeight:'bold', fontSize:'1.2rem'}}>{totalStudents}</div>
              </div>
              <div style={{...styles.statCard, borderLeftColor: '#10b981'}}>
                <div style={{fontSize:'0.8rem', color:'#666'}}>Present</div>
                <div style={{fontWeight:'bold', fontSize:'1.2rem', color:'#059669'}}>{presentCount}</div>
              </div>
              <div style={{...styles.statCard, borderLeftColor: '#ef4444'}}>
                <div style={{fontSize:'0.8rem', color:'#666'}}>Absent</div>
                <div style={{fontWeight:'bold', fontSize:'1.2rem', color:'#dc2626'}}>{absentCount}</div>
              </div>
            </div>

            {/* Student Grid */}
            <div style={styles.listContainer}>
              {students.map(s => {
                const isPresent = attendanceMap[s.StudentId];
                return (
                  <div key={s.StudentId} style={{
                    ...styles.studentCard,
                    borderLeft: isPresent ? '5px solid #10b981' : '5px solid #ef4444'
                  }}>
                    <div style={{ display:'flex', alignItems:'center', flex:1 }}>
                      <div style={styles.avatar}>
                        {s.Name.charAt(0).toUpperCase()}
                      </div>
                      <div style={styles.info}>
                        <h4 style={styles.name}>{s.Name}</h4>
                        <p style={styles.roll}>Roll: {s.RollNo}</p>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => toggleAttendance(s.StudentId)}
                      style={styles.toggleBtn(isPresent)}
                    >
                      {isPresent ? 'Present' : 'Absent'}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Floating Save Button */}
            <button onClick={handleSave} style={styles.saveBtn}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 21H5C4.44772 21 4 20.5523 4 20V4C4 3.44772 4.44772 3 5 3H16L20 7V20C20 20.5523 19.5523 21 19 21Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M17 21V13H7V21" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M7 3V8H15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Save Attendance
            </button>
          </>
        ) : (
          <div style={{ textAlign: 'center', color: '#999', marginTop: '50px' }}>
            <p>Select a class to load the student list.</p>
          </div>
        )}

      </main>
      <footer style={{ textAlign: 'center', padding: '20px', color: '#888', fontSize: '0.9rem' }}>
        &copy; 2025 Soruban Vidhyalaya
      </footer>
    </div>
  );
};

export default Attendance;