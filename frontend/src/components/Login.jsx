import React, { useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../AuthContext"; // Adjust path
import "./styling/Login.css";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:8000/login", {
        username,
        password,
      });
      localStorage.setItem("token", response.data.token);
      login();
      navigate("/");
    } catch (err) {
      alert("Login failed");
    }
  };

  return (
    <>
      <div className="hero">
        <div className="welcome-container">
          <div className="description">
            <h1>Welcome to BookHub</h1>
            <p>
              BookHub is the ultimate platform for college students to manage
              their books, share resources, and connect with peers. Whether
              you’re organizing your personal library or finding study partners,
              BookHub has you covered.
            </p>
            <ul>
              <li>📚 Organize your book collection with ease</li>
              <li>🔗 Share books and resources with classmates</li>
              <li>🔍 Discover new study materials and references</li>
              <li>👥 Connect with peers for collaborative learning</li>
              <li>📝 Track borrowed and lent books effortlessly</li>
            </ul>
          </div>
          <div className="login-container">
            <h2>Login</h2>
            <form className="login-form" onSubmit={handleSubmit}>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                required
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
              />
              <button type="submit">Login</button>
            </form>
          </div>
        </div>
      </div>
      <p className="text-align-center">
        Made by Eshaan Gupta[145] and Durga Sharma[120]
      </p>
    </>
  );
}

export default Login;
