import React, { useState, useEffect } from "react";
import axios from "axios";
import "./styling/Search.css";

function Search() {
  const [subject, setSubject] = useState("");
  const [year, setYear] = useState("");
  const [results, setResults] = useState([]);
  const [allPdfs, setAllPdfs] = useState([]);

  useEffect(() => {
    const fetchAllPdfs = async () => {
      try {
        const response = await axios.get("http://localhost:8000/search");
        setResults(response.data); // Show all PDFs initially
        setAllPdfs(response.data);
      } catch (err) {
        alert("Failed to load PDFs");
      }
    };
    fetchAllPdfs();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    let query = "?";
    if (subject) query += `subject=${subject}&`;
    if (year) query += `year=${year}`;

    try {
      if (!subject && !year) {
        setResults(allPdfs); // If no filters, show all PDFs
        return;
      }
      const response = await axios.get("http://localhost:8000/search" + query);
      setResults(response.data);
    } catch (err) {
      alert("Search failed");
    }
  };

  return (
    <div className="search-container">
      <h2>Search PDFs</h2>
      <form onSubmit={handleSearch} className="search-form">
        <div className="input-group">
          <label>Subject:</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Enter subject..."
          />
        </div>
        <div className="input-group">
          <label>Year:</label>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder="Enter year..."
          />
        </div>
        <button type="submit" className="search-btn">
          Search
        </button>
      </form>

      <div className="search-results">
        <h3>Available PDFs:</h3>
        {results.length === 0 ? (
          <p>No PDFs found</p>
        ) : (
          <div className="pdf-grid">
            {results.map((pdf, index) => (
              <div className="result-card" key={index}>
                <h4>{pdf.title}</h4>
                <p>
                  Subject: {pdf.subject} | Year: {pdf.year}
                </p>
                <a
                  href={`http://localhost:8000/uploads/${pdf.filePath}`}
                  target="_blank"
                  rel="noreferrer"
                  className="view-link"
                >
                  View PDF
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Search;
