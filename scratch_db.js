const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs } = require("firebase/firestore");

const firebaseConfig = {
  apiKey: "AIzaSyDznvG4rU9Xny_d7M8pOSCNzS2UJQghYDg",
  authDomain: "msbte-results.firebaseapp.com",
  projectId: "msbte-results",
  storageBucket: "msbte-results.firebasestorage.app",
  messagingSenderId: "607793749368",
  appId: "1:607793749368:web:10d377c358653316693c8d",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  const q = collection(db, "analyses");
  const snap = await getDocs(q);
  console.log(`Found ${snap.size} analyses.`);
  snap.forEach(doc => {
    const data = doc.data();
    console.log(`ID: ${doc.id}, Dept: ${data.departmentName}, Sem: ${data.semesterNumber}`);
    if (data.students && data.students.length > 0) {
      console.log("First Student Name:", data.students[0].name);
      console.log("First Student Subjects:", JSON.stringify(data.students[0].subjects.slice(0, 5), null, 2));
    }
  });
}
run();
