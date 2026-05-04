// --- Firebase config (tumhara hi rakho) ---
const firebaseConfig = {
  apiKey: "AIzaSyBIp13Spia77JzBY6yVVemucuk1BmjiNEs",
  authDomain: "hostel-complaints-5c927.firebaseapp.com",
  projectId: "hostel-complaints-5c927",
  storageBucket: "hostel-complaints-5c927.appspot.com",
  messagingSenderId: "645641630138",
  appId: "1:645641630138:web:113119bd053891b326ad83",
  measurementId: "G-2L5QEDVS4Q"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// ----------------------------------------------------
// STUDENT SIGN UP
// ----------------------------------------------------
const signupForm = document.getElementById("studentSignupForm");

if (signupForm) {
  signupForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("signupName").value.trim();
    const email = document.getElementById("signupEmail").value.trim();
    const pass = document.getElementById("signupPass").value;

    auth.createUserWithEmailAndPassword(email, pass)
      .then(cred => {
        return cred.user.updateProfile({ displayName: name });
      })
      .then(() => {
        alert("Account created! You are now logged in.");
        window.location.href = "complaint.html"; // go to complaint form
      })
      .catch(err => alert(err.message));
  });
}

// ----------------------------------------------------
// STUDENT LOGIN
// ----------------------------------------------------
const loginForm = document.getElementById("studentLoginForm");

if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value.trim();
    const pass = document.getElementById("loginPass").value;

    auth.signInWithEmailAndPassword(email, pass)
      .then(() => {
        alert("Login successful!");
        window.location.href = "complaint.html";
      })
      .catch(err => alert(err.message));
  });
}

// ----------------------------------------------------
// STUDENT SUBMIT COMPLAINT  (only if logged in)
// ----------------------------------------------------
const form = document.getElementById('complaintForm');

if (form) {
  auth.onAuthStateChanged(user => {
    if (!user) {
      // not logged in -> send to login page
      window.location.href = "student-login.html";
      return;
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      db.collection("complaints").add({
        uid: user.uid,                                   // ⭐ unique user
        email: user.email,
        name: document.getElementById("name").value,
        room: document.getElementById("room").value,
        category: document.getElementById("category").value,
        description: document.getElementById("description").value,
        status: "Pending",
        created: Date.now()
      })
      .then(() => {
        alert("Complaint Submitted!");
        form.reset();
      })
      .catch(err => {
        console.error("Error adding complaint:", err);
        alert("Error submitting complaint. Check console.");
      });
    });
  });
}

// ----------------------------------------------------
// STUDENT: MY COMPLAINTS  (only his own)
// ----------------------------------------------------
const list = document.getElementById("complaintList");

if (list) {
  auth.onAuthStateChanged(user => {
    if (!user) {
      window.location.href = "student-login.html";
      return;
    }

    db.collection("complaints")
      .where("uid", "==", user.uid)
      // .orderBy("created", "desc")
      .onSnapshot(snapshot => {
        list.innerHTML = "";

        if (snapshot.empty) {
          list.innerHTML = "<p>No complaints found.</p>";
          return;
        }

        snapshot.forEach(doc => {
          const c = doc.data();
          list.innerHTML += `
            <div class="complaint-box">
              <b>${c.category}</b><br>
              ${c.description}<br>
              <b>Status:</b> ${c.status}
            </div>
          `;
        });
      }, err => {
        console.error("Error loading complaints:", err);
        alert("Error loading complaints. Check console.");
      });
  });
}

// ----------------------------------------------------
// ADMIN LOGIN  (same as before)
// ----------------------------------------------------
function adminLogin() {
  const email = document.getElementById("adminEmail").value;
  const pass = document.getElementById("adminPass").value;

  auth.signInWithEmailAndPassword(email, pass)
    .then(() => window.location.href = "admin-dashboard.html")
    .catch(e => alert(e.message));
}
window.adminLogin = adminLogin; // so onclick can see it

// ----------------------------------------------------
// ADMIN DASHBOARD  (see all complaints)
// ----------------------------------------------------
const adminList = document.getElementById("adminList");

if (adminList) {
  db.collection("complaints")
    .orderBy("created", "desc")
    .onSnapshot(snapshot => {
      adminList.innerHTML = "";
      snapshot.forEach(doc => {
        const c = doc.data();
        adminList.innerHTML += `
          <div class="complaint-box">
            <b>${c.name || c.email || "Student"} (Room ${c.room || "-"})</b><br>
            ${c.category} - ${c.description}<br>
            <b>Status:</b> ${c.status}
            <div class="admin-buttons">
              <button onclick="updateStatus('${doc.id}', 'In Progress')">In Progress</button>
              <button onclick="updateStatus('${doc.id}', 'Resolved')">Resolved</button>
            </div>
          </div>
        `;
      });
    });
}

function updateStatus(id, status) {
  db.collection("complaints").doc(id).update({ status });
}
window.updateStatus = updateStatus;
