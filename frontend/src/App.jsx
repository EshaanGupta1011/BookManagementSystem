import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
} from "react-router-dom";
import { useContext } from "react";
import { AuthContext, AuthProvider } from "./AuthContext"; // Adjust path
import Login from "./components/Login";
import Signup from "./components/Signup";
import Dashboard from "./components/Dashboard";
import Upload from "./components/Upload";
import Search from "./components/Search";
import GoalTracker from "./components/GoalTracker";
import AdminPanel from "./components/AdminPanel";
import "./App.css";

// Separate Navigation component
function Navigation() {
  const { isLoggedIn, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <nav>
      <Link to="/">Dashboard</Link> | <Link to="/search">Search PDFs</Link> |{" "}
      <Link to="/goal">Goal Tracker</Link> |{" "}
      {isLoggedIn ? (
        <>
          <Link to="/upload">Upload PDF</Link> |{" "}
          <button
            onClick={() => {
              logout();
              navigate("/login", { replace: true });
            }}
          >
            Logout
          </button>
        </>
      ) : (
        <>
          <Link to="/login">Login</Link> | <Link to="/signup">Signup</Link>
        </>
      )}
    </nav>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div>
          <Navigation />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/search" element={<Search />} />
            <Route path="/goal" element={<GoalTracker />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/admin" element={<AdminPanel />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
