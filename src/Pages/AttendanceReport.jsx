import React, { useState } from 'react';
import Header from '../Components/Header';
import { openDB, getStudentsByClass } from '../Utils/db';

const AttendanceReport = () => {
  const [reportData, setReportData] = useState(null);
  const [reportType, setReportType] = useState(''); // 'range', 'month', 'date'

  // 1. Date Range Logic
  const handleDateRange = async (e) => {
    e.preventDefault();
    const start = e.target.start.value;
    const end = e.target.end.value;
    const cls = e.target.cls.value;

    const db = await openDB();
    const tx = db.transaction("attendance", "readonly");
    const index = tx.objectStore("attendance").index("Date");
    const range = IDBKeyRange.bound(start, end);
    
    index.getAll(range).onsuccess = (ev) => {
      let res = ev.target.result;
      if (cls !== 'all') {
        res = res.filter(r => r.class === parseInt(cls));
      }
      setReportData(res);
      setReportType('range');
    };
  };

  // 2. Monthly Logic
  const handleMonthly = async (e) => {
    e.preventDefault();
    const monthStr = e.target.month.value; // "2025-10"
    const cls = parseInt(e.target.cls.value);
    
    const [year, month] = monthStr.split('-').map(Number);
    // Start of month
    const start = `${year}-${String(month).padStart(2,'0')}-01`;
    // Start of next month (exclusive)
    const nextMonth = new Date(year, month, 1).toISOString().split('T')[0];

    const db = await openDB();
    
    // Get All Students of Class
    const students = await getStudentsByClass(cls);

    // Get Attendance Range
    const tx = db.transaction("attendance", "readonly");
    const index = tx.objectStore("attendance").index("Date");
    const range = IDBKeyRange.bound(start, nextMonth, false, true);
    
    index.getAll(range).onsuccess = (ev) => {
      const records = ev.target.result;
      
      // Calculate Stats
      const stats = students.map(stu => {
        const stuRecords = records.filter(r => r.studentId === stu.StudentId);
        const total = stuRecords.length;
        const present = stuRecords.filter(r => r.status === 'Present').length;
        const absent = total - present;
        const pct = total ? ((present/total)*100).toFixed(2) : 'N/A';
        
        return { ...stu, total, present, absent, pct };
      });
      
      setReportData(stats);
      setReportType('month');
    };
  };

  // 3. Report by Date Logic (New Feature)
  const handleByDate = async (e) => {
    e.preventDefault();
    const date = e.target.date.value;

    if (!date) return;

    const db = await openDB();
    const tx = db.transaction("attendance", "readonly");
    const index = tx.objectStore("attendance").index("Date");
    
    // Fetch records strictly for this date
    index.getAll(IDBKeyRange.only(date)).onsuccess = (ev) => {
      let res = ev.target.result;
      
      res.sort((a, b) => a.class - b.class || a.name.localeCompare(b.name));

      setReportData(res);
      setReportType('date');
    };
  };

  return (
    <div className="page-container">
      <Header title="Attendance Reports" />
      <main>
        <section className="report-card" style={{ textAlign: 'left' }}>
        <h2>Attendance Period Summary</h2>
        <p style={{ marginBottom: '15px', color: '#666' }}>
            Analyze attendance for students over a specific date range.
        </p>
        <form onSubmit={handleDateRange} style={{ boxShadow: 'none', padding: 0, width: '100%' }}>
    
        <div style={{ 
          display: 'flex', 
          alignItems: 'flex-end', 
          justifyContent: 'flex-start', 
          gap: '20px', 
          flexWrap: 'wrap' 
        }}>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <label style={{ marginBottom: '5px', fontWeight: 'bold', fontSize: '0.9rem' }}>
            Start Date
          </label>
          <input 
            name="start" 
            type="date" 
            required 
            style={{ width: 'auto', padding: '8px' }} 
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <label style={{ marginBottom: '5px', fontWeight: 'bold', fontSize: '0.9rem' }}>
            End Date
          </label>
          <input 
            name="end" 
            type="date" 
            required 
            style={{ width: 'auto', padding: '8px' }} 
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <label style={{ marginBottom: '5px', fontWeight: 'bold', fontSize: '0.9rem' }}>
            Class
          </label>
          <select 
            name="cls" 
            style={{ width: 'auto', padding: '9px', minWidth: '120px' }} 
          >
            <option value="all">All Classes</option>
            {[6, 7, 8, 9, 10].map(c => <option key={c} value={c}>Class {c}</option>)}
          </select>
        </div>

        <div style={{ display: 'flex', paddingBottom: '1px' }}> 
          <button className="btn"
            type="submit" 
            style={{ 
              padding: '10px 20px', 
              cursor: 'pointer',
              // backgroundColor: '#800080',
              color: 'white',
              border: 'none',
              borderRadius: '4px'
            }}
          >
            Generate
          </button>
        </div>

      </div>
    </form>

    {reportType === 'range' && reportData && (
      <div style={{ marginTop: '20px' }}>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Name</th>
              <th>Class</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {reportData.length === 0 ? (
              <tr><td colSpan="4" style={{ textAlign: 'center' }}>No records found.</td></tr>
            ) : (
              reportData.map((r, i) => (
                <tr key={i}>
                  <td>{r.date}</td>
                  <td>{r.name}</td>
                  <td>{r.class}</td>
                  <td className={r.status.toLowerCase()}>{r.status}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    )}
  </section>



        {/* Section 2: Monthly Summary */}
        <section className="report-card">
        <h2>Monthly Summary</h2>
        <p style={{ marginBottom: '15px', color: '#666' }}>
          Analyze attendance for students on a monthly basis.
        </p>
        
        <form onSubmit={handleMonthly} style={{ boxShadow: 'none', padding: 0, width: '100%' }}>
          
          <div style={{ 
            display: 'flex', 
            alignItems: 'flex-end',  
            justifyContent: 'flex-start',
            gap: '20px',            
            flexWrap: 'wrap'         
          }}>

            {/* 1. Month Input Block */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ marginBottom: '5px', fontWeight: 'bold', fontSize: '0.9rem' }}>
                Month of Attendance
              </label>
              <input 
                name="month" 
                type="month" 
                required 
                style={{ width: 'auto', padding: '8px' }} // "auto" makes it compact
              />
            </div>

            {/* 2. Class Selection Block */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ marginBottom: '5px', fontWeight: 'bold', fontSize: '0.9rem' }}>
                Class
              </label>
              <select 
                name="cls" 
                required 
                style={{ width: 'auto', padding: '9px', minWidth: '150px' }} // Adjusted padding and min-width
              >
                <option value="">Select Class</option>
                {[6, 7, 8, 9, 10].map(c => <option key={c} value={c}>Class {c}</option>)}
              </select>
            </div>

            {/* 3. Generate Button Block */}
            <div style={{ display: 'flex', flexDirection: 'column',paddingBottom: '2px' }}> {/* Slight padding to align with input borders */}
              <button className="btn"
                type="submit" 
                style={{ 
                  padding: '10px 20px', 
                  height: '100%', 
                  cursor: 'pointer',
                  whiteSpace: 'nowrap' 
                }}
              >
                Generate Summary
              </button>
            </div>

          </div>
        </form>

        {reportType === 'month' && reportData && (
          <div style={{ marginTop: '20px' }}>
            <table>
              <thead>
                <tr>
                  <th>Roll No</th>
                  <th>Name</th>
                  <th>Total Days</th>
                  <th>Present</th>
                  <th>Absent</th>
                  <th>%</th>
                </tr>
              </thead>
              <tbody>
                {reportData.length === 0 ? (
                  <tr><td colSpan="6" style={{ textAlign: 'center' }}>No students found for this class.</td></tr>
                ) : (
                  reportData.map((s) => (
                    <tr key={s.StudentId}>
                      <td>{s.RollNo}</td>
                      <td>{s.Name}</td>
                      <td>{s.total}</td>
                      <td className="present" style={{ color: 'green' }}>{s.present}</td>
                      <td className="absent" style={{ color: 'red' }}>{s.absent}</td>
                      <td><strong>{s.pct}%</strong></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

        {/* Section 3: Report by Date (Added) */}
        <section className="report-card">
        <h2>Report by Date</h2>
        <p style={{ marginBottom: '15px', color: '#666' }}>
          Analyze attendance for students on a specific day.
        </p>

        <form onSubmit={handleByDate} style={{ boxShadow: 'none', padding: 0, width: '100%' }}>
          
          <div style={{ 
            display: 'flex', 
            alignItems: 'flex-end',    
            justifyContent: 'flex-start', 
            gap: '20px',               
            flexWrap: 'wrap'          
          }}>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ marginBottom: '5px', fontWeight: 'bold', fontSize: '0.9rem' }}>
                Select Date
              </label>
              <input 
                name="date" 
                type="date" 
                required 
                style={{ width: 'auto', padding: '8px' }} 
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ marginBottom: '5px', fontWeight: 'bold', fontSize: '0.9rem' }}>
                Class
              </label>
              <select 
                name="cls" 
                style={{ width: 'auto', padding: '9px', minWidth: '130px' }}
              >
                <option value="all">All Classes</option>
                {[6, 7, 8, 9, 10].map(c => <option key={c} value={c}>Class {c}</option>)}
              </select>
            </div>

            <div style={{display: 'flex', flexDirection: 'column' ,paddingBottom: '2px' }}> 
              <button className="btn"
                type="submit" 
                style={{ 
                  padding: '10px 20px', 
                  height: '100%',
                  cursor: 'pointer'
                }}
              >
                View Attendance
              </button>
            </div>

          </div>
        </form>

        {reportType === 'date' && reportData && (
          <div style={{ marginTop: '20px' }}>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Class</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {reportData.length === 0 ? (
                  <tr><td colSpan="3" style={{ textAlign: 'center' }}>No attendance records found for this date.</td></tr>
                ) : (
                  reportData.map((r, i) => (
                    <tr key={i}>
                      <td>{r.name}</td>
                      <td>{r.class}</td>
                      <td className={r.status.toLowerCase()} style={{ fontWeight: 'bold' }}>
                        {r.status}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      </main>
      <footer>&copy; 2025 Soruban Vidhyalaya</footer>
    </div>
  );
};

export default AttendanceReport;