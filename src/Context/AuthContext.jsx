import React, { createContext, useState, useEffect, useContext } from 'react';
import { openDB, seedInitialData } from '../Utils/db';

const AuthContext = createContext(null);

// AuthProvider Component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        await seedInitialData(); 
        const storedUser = localStorage.getItem('loggedInUser');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Auth initialization failed:", error);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (username, password) => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("users", "readonly");
      const index = tx.objectStore("users").index("Name");
      const req = index.get(username);
      
      req.onsuccess = () => {
        const result = req.result;
        if (result && result.Password === password) {
          setUser(result);
          localStorage.setItem('loggedInUser', JSON.stringify(result));
          resolve(result);
        } else {
          reject("Invalid Credentials / Thavarana Password");
        }
      };
      req.onerror = () => reject("Database Error");
    });
  };

  const logout = () => {
    localStorage.removeItem('loggedInUser');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}