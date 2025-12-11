import React, { useState } from 'react';
import Header from '../Components/Header';
import { openDB } from '../Utils/db';

const AddStudents = () => {
  const [formData, setFormData] = useState({ name: '', classVal: '', rollNo: '' });
  const [errors, setErrors] = useState({}); // New state for field errors
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    setErrors({});

    const { name, classVal, rollNo } = formData;

    let validationErrors = {};

    if (name.trim().length < 6) {
      validationErrors.name = "Full Name must be at least 6 characters long.";
    } 
    else if (!/^[A-Za-z\s]+$/.test(name)) {
      validationErrors.name = "Full Name must contain only alphabets and spaces.";
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      return;
    }
    const cVal = parseInt(classVal);
    const rNo = parseInt(rollNo);

    try {
      const db = await openDB();
      
      const txCheck = db.transaction("students", "readonly");
      const index = txCheck.objectStore("students").index("ClassAndRollNo");
      
      index.get([cVal, rNo]).onsuccess = (ev) => {
        if (ev.target.result) {
          alert(`Error: Roll No ${rNo} already exists in Class ${cVal}`);
          setIsSubmitting(false);
        } else {
          const txAdd = db.transaction("students", "readwrite");
          const store = txAdd.objectStore("students");
          
          store.openCursor(null, 'prev').onsuccess = (cursorEvent) => {
            const cursor = cursorEvent.target.result;
            const newId = cursor ? cursor.value.StudentId + 1 : 1;
            
            store.add({ StudentId: newId, Name: name, Class: cVal, RollNo: rNo });
            
            alert(`Student ${name} successfully added!`);
            setFormData({ name: '', classVal: '', rollNo: '' });
            setErrors({}); 
            setIsSubmitting(false);
          };
        }
      };
    } catch (error) {
      console.error(error);
      alert("An error occurred");
      setIsSubmitting(false);
    }
  };

  const styles = {
    pageContainer: {
      backgroundColor: '#f3f4f6',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
    },
    mainContent: {
      flex: 1,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px',
    },
    card: {
      backgroundColor: 'white',
      width: '100%',
      maxWidth: '480px',
      padding: '40px',
      borderRadius: '16px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
    },
    headerSection: {
      textAlign: 'center',
      marginBottom: '30px',
    },
    title: {
      fontSize: '1.5rem',
      fontWeight: '700',
      color: '#1f2937',
      marginBottom: '5px',
    },
    subtitle: {
      fontSize: '0.9rem',
      color: '#6b7280',
    },
    formGroup: {
      marginBottom: '20px',
    },
    row: {
      display: 'flex',
      gap: '15px',
    },
    label: {
      display: 'block',
      fontSize: '0.9rem',
      fontWeight: '600',
      color: '#374151',
      marginBottom: '8px',
    },
    input: {
      width: '100%',
      padding: '12px 16px',
      fontSize: '1rem',
      borderRadius: '8px',
      border: '1px solid #d1d5db',
      backgroundColor: '#f9fafb',
      outline: 'none',
      transition: 'all 0.2s',
      boxSizing: 'border-box',
    },
    select: {
      width: '100%',
      padding: '12px 16px',
      fontSize: '1rem',
      borderRadius: '8px',
      border: '1px solid #d1d5db',
      backgroundColor: '#f9fafb',
      appearance: 'none',
      backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'right 1rem center',
      backgroundSize: '1em',
    },
    button: {
      width: '100%',
      padding: '14px',
      marginTop: '10px',
      backgroundColor: '#b98c0e',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer',
      boxShadow: '0 4px 6px rgba(79, 70, 229, 0.2)',
      transition: 'transform 0.1s',
    },
    footer: {
      textAlign: 'center',
      padding: '20px',
      color: '#9ca3af',
      fontSize: '0.85rem',
    },
    // New style for error text
    errorText: {
      color: '#ef4444',
      fontSize: '0.85rem',
      marginTop: '6px',
      display: 'block'
    }
  };

  return (
    <div style={styles.pageContainer}>
      <Header title="Admin Portal" />
      
      <main style={styles.mainContent}>
        <div style={styles.card}>
          <div style={styles.headerSection}>
            <div style={{ 
              width:'50px', height:'50px', background:'#e0e7ff', borderRadius:'50%', 
              margin:'0 auto 15px', display:'flex', alignItems:'center', justifyContent:'center', color:'#4f46e5' 
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="8.5" cy="7" r="4"></circle>
                <line x1="20" y1="8" x2="20" y2="14"></line>
                <line x1="23" y1="11" x2="17" y2="11"></line>
              </svg>
            </div>
            <h2 style={styles.title}>New Student</h2>
            <p style={styles.subtitle}>Enter the student's details below to register.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Full Name</label>
              <input 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                style={{
                  ...styles.input, 
                  // Change border color if error exists
                  borderColor: errors.name ? '#ef4444' : '#d1d5db' 
                }} 
                placeholder="Ex. Arun Kumar"
                required 
              />
              {/* Display Error Message Here */}
              {errors.name && <span style={styles.errorText}>{errors.name}</span>}
            </div>
            
            <div style={styles.row}>
              <div style={{...styles.formGroup, flex: 1}}>
                <label style={styles.label}>Class</label>
                <select 
                  name="classVal" 
                  value={formData.classVal} 
                  onChange={handleChange} 
                  style={styles.select} 
                  required
                >
                  <option value="">Select</option>
                  {[6,7,8,9,10].map(c => <option key={c} value={c}>Class {c}</option>)}
                </select>
              </div>

              <div style={{...styles.formGroup, flex: 1}}>
                <label style={styles.label}>Roll No</label>
                <input 
                  name="rollNo" 
                  type="number" 
                  value={formData.rollNo} 
                  onChange={handleChange} 
                  style={styles.input} 
                  placeholder="Ex. 601"
                  required 
                />
              </div>
            </div>

            <button 
              type="submit" 
              style={{...styles.button, opacity: isSubmitting ? 0.7 : 1}} 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Add Student'}
            </button>
          </form>
        </div>
      </main>
      
      <footer style={styles.footer}>&copy; 2025 Soruban Vidhyalaya</footer>
    </div>
  );
};

export default AddStudents;