// src/components/Dashboard.jsx

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./styling/Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [featuredPDFs, setFeaturedPDFs] = useState([]);
  const [readingGoal, setReadingGoal] = useState(0);
  const [recentUploads, setRecentUploads] = useState([]);
  const [loadingUploads, setLoadingUploads] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUsername(payload.username);
      } catch (e) {
        console.error("Error decoding token:", e);
      }
    }

    // If no token, bounce to login
    if (!token) {
      window.location.href = "/login";
      return;
    }

    const authHeader = { Authorization: `Bearer ${token}` };

    axios
      .get("http://localhost:8000/myuploads", { headers: authHeader })
      .then((res) => setRecentUploads(res.data || []))
      .catch((err) => {
        if (err.response?.status === 401) {
          // invalid/expired token
          window.location.href = "/login";
        } else {
          console.error("Error fetching recent uploads:", err);
        }
      })
      .finally(() => setLoadingUploads(false));

    axios
      .get("http://localhost:8000/search")
      .then((res) => setFeaturedPDFs(res.data || []))
      .catch((err) => console.error("Error fetching featured PDFs:", err));

    axios
      .get("http://localhost:8000/goal", { headers: authHeader })
      .then((res) => setReadingGoal(res.data.readingGoal || 0))
      .catch((err) => {
        if (err.response?.status === 401) {
          window.location.href = "/login";
        } else {
          console.error("Error fetching reading goal:", err);
        }
      });
  }, [navigate]);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Welcome {username || "User"}</h2>
      </div>

      <div className="dashboard-info">
        <h3>Your Book Management Hub</h3>
        <p>
          Our app simplifies how you manage and interact with your books. Upload
          documents, search by subject or year, set reading goals, and track
          your progress—all in one place.
        </p>
      </div>

      <div className="dashboard-cards">
        <div className="card">
          <h3>Recent Uploads</h3>
          <p>View your recently uploaded books.</p>
          <ul>
            {loadingUploads ? (
              <li>Loading...</li>
            ) : recentUploads.length > 0 ? (
              recentUploads.map((pdf) => <li key={pdf.id}>{pdf.title}</li>)
            ) : (
              <li>No uploads yet</li>
            )}
          </ul>
        </div>

        <div className="card">
          <h3>Your Reading Goals</h3>
          <p>Track your progress towards your reading goals.</p>
          <p>Current Goal: {readingGoal} PDFs</p>
          <p>Completed: 0 PDFs</p>
        </div>

        <div className="card">
          <h3>Featured PDFs</h3>
          <p>Check out all available PDFs in the database.</p>
          <div className="gallery">
            {featuredPDFs.length > 0 ? (
              featuredPDFs.map((pdf) => (
                <div key={pdf.id} className="gallery-item">
                  {pdf.title}
                </div>
              ))
            ) : (
              <div className="gallery-item">No PDFs available</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
