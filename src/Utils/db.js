const DB_NAME = "SchoolDB";
const DB_VERSION = 1;

export const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      
      // Users Store
      if (!db.objectStoreNames.contains("users")) {
        const userStore = db.createObjectStore("users", { keyPath: "UserId", autoIncrement: true });
        userStore.createIndex("Name", "Name", { unique: true });
      }

      // Students Store
      if (!db.objectStoreNames.contains("students")) {
        const studentStore = db.createObjectStore("students", { keyPath: "StudentId" });
        studentStore.createIndex("Class", "Class", { unique: false });
        studentStore.createIndex("ClassAndRollNo", ["Class", "RollNo"], { unique: true });
      }

      // Attendance Store
      if (!db.objectStoreNames.contains("attendance")) {
        const attStore = db.createObjectStore("attendance", { keyPath: "id", autoIncrement: true });
        attStore.createIndex("Date", "date", { unique: false });
        attStore.createIndex("StudentId", "studentId", { unique: false });
      }
    };

    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = (e) => reject(e.target.error);
  });
};

export const seedInitialData = async () => {
  const db = await openDB();
  
  const seedStore = (storeName, data) => {
    return new Promise((resolve) => {
      const tx = db.transaction(storeName, "readwrite");
      const store = tx.objectStore(storeName);
      store.count().onsuccess = (e) => {
        if (e.target.result === 0) {
          data.forEach(item => store.add(item));
          console.log(`Seeded ${storeName}`);
        }
        resolve();
      };
    });
  };

  const defaultUsers = [
    { Name: "Admin1", Role: "Admin", Password: "admin123" },
    { Name: "Staff1", Role: "Staff", Password: "staff123" },
  ];

  const defaultStudents = [
    { StudentId: 1, Name: "Arun Kumar", Class: 6, RollNo: 601 },
    { StudentId: 2, Name: "Priyadharshini", Class: 6, RollNo: 602 },
    { StudentId: 3, Name: "Karthick", Class: 6, RollNo: 603 },
    { StudentId: 4, Name: "Kavin", Class: 7, RollNo: 704 },
    { StudentId: 5, Name: "Kishore", Class: 7, RollNo: 703 },
    { StudentId: 6, Name: "Kavya", Class: 8, RollNo: 802 },
    { StudentId: 7, Name: "Kavimitraa", Class: 8, RollNo: 801 },
    { StudentId: 8, Name: "Jamuna", Class: 8, RollNo: 803 },
    { StudentId: 9, Name: "Kiruba", Class: 9, RollNo: 901 },
    { StudentId: 10, Name: "Naveen", Class: 9, RollNo: 902 },
    { StudentId: 11, Name: "Ravi Teja", Class: 6, RollNo: 604 },
    { StudentId: 12, Name: "Janaki", Class: 7, RollNo: 702 },
    { StudentId: 13, Name: "Sabarish", Class: 7, RollNo: 701 },
    { StudentId: 14, Name: "Thulasi", Class: 8, RollNo: 804 },
    { StudentId: 15, Name: "Abhinav", Class: 9, RollNo: 903 },
    { StudentId: 16, Name: "Priyanka", Class: 9, RollNo: 904 },
    { StudentId: 17, Name: "Gokul", Class: 10, RollNo: 1001 },
    { StudentId: 18, Name: "Gobika", Class: 10, RollNo: 1002 },
    { StudentId: 19, Name: "Jana", Class: 10, RollNo: 1003 },
    { StudentId: 20, Name: "Premja", Class: 10, RollNo: 1004 },
  ];

  await seedStore("users", defaultUsers);
  await seedStore("students", defaultStudents);
};

// Generic Helpers
export const getAllFromStore = async (storeName) => {
  const db = await openDB();
  return new Promise((resolve) => {
    const tx = db.transaction(storeName, "readonly");
    tx.objectStore(storeName).getAll().onsuccess = (e) => resolve(e.target.result);
  });
};

export const getStudentsByClass = async (classNum) => {
  const db = await openDB();
  return new Promise((resolve) => {
    const tx = db.transaction("students", "readonly");
    const index = tx.objectStore("students").index("Class");
    index.getAll(parseInt(classNum)).onsuccess = (e) => resolve(e.target.result);
  });
};

//work based on changes in UI
export const deleteFromStore = async (storeName, key) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    const request = tx.objectStore(storeName).delete(key);
    
    request.onsuccess = () => resolve(true);
    request.onerror = (e) => reject(e.target.error);
  });
};