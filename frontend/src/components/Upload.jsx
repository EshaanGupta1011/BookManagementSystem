import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../AuthContext"; // Adjust path if needed
import "./styling/Upload.css";

function Upload() {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [year, setYear] = useState("");
  const { isLoggedIn } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login");
    }
  }, [isLoggedIn, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      alert("Select a file");
      return;
    }

    const formData = new FormData();
    formData.append("pdf", file);
    formData.append("title", title);
    formData.append("subject", subject);
    formData.append("year", year);

    const token = localStorage.getItem("token");
    try {
      await axios.post("http://localhost:8000/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      alert("Upload successful");
    } catch (err) {
      alert("Upload failed");
      console.error(err);
    }
  };

  return (
    <div className="upload-container">
      <h2>Upload PDF</h2>
      <form className="upload-form" onSubmit={handleSubmit}>
        <label>Title:</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <label>Subject:</label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
        />

        <label>Year:</label>
        <input
          type="number"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          required
        />

        <label>PDF File:</label>
        <div className="file-input">
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            accept="application/pdf"
            required
          />
        </div>
        <button type="submit">Upload</button>
      </form>
    </div>
  );
}

export default Upload;
