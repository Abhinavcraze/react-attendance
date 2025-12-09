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
      
      // Sort results by Class, then by Name for better readability
      res.sort((a, b) => a.class - b.class || a.name.localeCompare(b.name));

      setReportData(res);
      setReportType('date');
    };
  };

  return (
    <div className="page-container">
      <Header title="Attendance Reports" />
      <main>
        {/* Section 1: Date Range */}
        <section className="report-card">
          <h2>Date Range Report</h2>
      
          <form onSubmit={handleDateRange} style={{ boxShadow: 'none', padding: 0, width: '100%', maxWidth: '100%' }}>
            <div className="input-group-row">
              <label>Start Date</label>
              <input name="start" type="date" required />
              <label>End Date</label>
              <input name="end" type="date" required />
              <label>Class</label>
              <select name="cls">
                <option value="all">All Classes</option>
                {[6,7,8,9,10].map(c => <option key={c} value={c}>Class {c}</option>)}
              </select>
              <button type="submit">Generate</button>
            </div>
          </form>
          {reportType === 'range' && reportData && (
            <table>
              <thead><tr><th>Date</th><th>Name</th><th>Class</th><th>Status</th></tr></thead>
              <tbody>
                {reportData.length === 0 ? (
                  <tr><td colSpan="4">No records found.</td></tr>
                ) : (
                  reportData.map((r, i) => (
                    <tr key={i}>
                      <td>{r.date}</td><td>{r.name}</td><td>{r.class}</td>
                      <td className={r.status.toLowerCase()}>{r.status}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </section>

        {/* Section 2: Monthly Summary */}
        <section className="report-card">
          <h2>Monthly Summary</h2>
          <form onSubmit={handleMonthly} style={{ boxShadow: 'none', padding: 0, width: '100%', maxWidth: '100%' }}>
            <div className="input-group-row">
              <label>Month of an Attendance</label>
              <input name="month" type="month" required />
              <select name="cls" required>
                <option value="">Select Class</option>
                {[6,7,8,9,10].map(c => <option key={c} value={c}>Class {c}</option>)}
              </select>
              <button type="submit">Generate Summary</button>
            </div>
          </form>
          {reportType === 'month' && reportData && (
            <table>
              <thead><tr><th>Roll No</th><th>Name</th><th>Total Days</th><th>Present</th><th>Absent</th><th>%</th></tr></thead>
              <tbody>
                {reportData.length === 0 ? (
                    <tr><td colSpan="6">No students found for this class.</td></tr>
                ) : (
                    reportData.map((s) => (
                      <tr key={s.StudentId}>
                        <td>{s.RollNo}</td><td>{s.Name}</td><td>{s.total}</td>
                        <td className="present">{s.present}</td><td className="absent">{s.absent}</td>
                        <td><strong>{s.pct}%</strong></td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          )}
        </section>

        {/* Section 3: Report by Date (Added) */}
        <section className="report-card">
          <h2>Report by Date</h2>
          <p style={{marginBottom: '10px', color: '#666'}}>Analyze attendance for all students for a specific day.</p>
          <form onSubmit={handleByDate} style={{ boxShadow: 'none', padding: 0, width: '100%', maxWidth: '100%' }}>
            <div className="input-group-row">
              <input name="date" type="date" required />
              <button type="submit">View Attendance</button>
            </div>
          </form>
          {reportType === 'date' && reportData && (
             <table>
              <thead><tr><th>Name</th><th>Class</th><th>Status</th></tr></thead>
              <tbody>
                {reportData.length === 0 ? (
                  <tr><td colSpan="3">No attendance records found for this date.</td></tr>
                ) : (
                  reportData.map((r, i) => (
                    <tr key={i}>
                      <td>{r.name}</td>
                      <td>{r.class}</td>
                      <td className={r.status.toLowerCase()}>{r.status}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </section>

      </main>
      <footer>&copy; 2025 Soruban Vidhyalaya</footer>
    </div>
  );
};

export default AttendanceReport;