// src/components/GoalTracker.jsx

import React, { useState, useEffect } from "react";
import axios from "axios";
import "./styling/GoalTracker.css"; // make sure the path is correct

function GoalTracker() {
  const [goal, setGoal] = useState("");
  const [currentGoal, setCurrentGoal] = useState(0);

  const fetchGoal = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    try {
      const response = await axios.get("http://localhost:8000/goal", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCurrentGoal(response.data.readingGoal);
      setGoal(response.data.readingGoal.toString());
    } catch (error) {
      console.error("Error fetching goal:", error);
    }
  };

  useEffect(() => {
    fetchGoal();
  }, []);

  const handleSetGoal = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    try {
      await axios.post(
        "http://localhost:8000/goal",
        { goal: Number(goal) },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("Goal set successfully");
      // immediately update local state so both views reflect the new goal
      setCurrentGoal(Number(goal));
    } catch (err) {
      alert("Setting goal failed");
      console.error("Error setting goal:", err);
    }
  };

  return (
    <div className="goal-tracker">
      <h2>Goal Tracker</h2>
      <form onSubmit={handleSetGoal}>
        <label>
          Set your reading goal (number of PDFs to read):
          <input
            type="number"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            required
          />
        </label>
        <button type="submit">Set Goal</button>
      </form>
      {currentGoal > 0 ? (
        <p>Your current goal: {currentGoal}</p>
      ) : (
        <p>No goal set yet</p>
      )}
    </div>
  );
}

export default GoalTracker;
