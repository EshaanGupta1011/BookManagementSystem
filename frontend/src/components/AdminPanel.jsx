import React, { useState, useEffect } from "react";
import axios from "axios";
import "./styling/AdminPanel.css";

function AdminPanel() {
  const [step, setStep] = useState("login");
  const [password, setPassword] = useState("");
  const [adminToken, setAdminToken] = useState("");
  const [users, setUsers] = useState([]);
  const [uploads, setUploads] = useState([]);
  const [newPdf, setNewPdf] = useState({ title: "", subject: "", year: "" });
  const [file, setFile] = useState(null);

  useEffect(() => {
    if (step === "panel") {
      const headers = { Authorization: `Bearer ${adminToken}` };
      axios
        .get("http://localhost:8000/admin/users", { headers })
        .then((res) => setUsers(res.data))
        .catch((err) => console.error("Error fetching users:", err));

      axios
        .get("http://localhost:8000/admin/uploads", { headers })
        .then((res) => setUploads(res.data))
        .catch((err) => console.error("Error fetching uploads:", err));
    }
  }, [step, adminToken]);

  const handleLogin = (e) => {
    e.preventDefault();
    axios
      .post("http://localhost:8000/admin/login", { password })
      .then((res) => {
        setAdminToken(res.data.token);
        setStep("panel");
      })
      .catch((err) => {
        console.error("Login failed:", err);
        alert("Authentication failed");
      });
  };

  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to delete this PDF?")) return;
    axios
      .delete(`http://localhost:8000/admin/pdf/${id}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      })
      .then(() => setUploads((prev) => prev.filter((pdf) => pdf.id !== id)))
      .catch((err) => console.error("Error deleting PDF:", err));
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select a file");

    const formData = new FormData();
    formData.append("pdf", file);
    formData.append("title", newPdf.title);
    formData.append("subject", newPdf.subject);
    formData.append("year", newPdf.year);

    try {
      await axios.post("http://localhost:8000/admin/upload", formData, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
          "Content-Type": "multipart/form-data",
        },
      });

      const res = await axios.get("http://localhost:8000/admin/uploads", {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      setUploads(res.data);
      setNewPdf({ title: "", subject: "", year: "" });
      setFile(null);
    } catch (err) {
      console.error("Error uploading PDF:", err);
    }
  };

  if (step === "login") {
    return (
      <div className="admin-login">
        <h2>Admin Login</h2>
        <form onSubmit={handleLogin}>
          <input
            type="password"
            placeholder="Admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Login</button>
        </form>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <h2>Admin Dashboard</h2>

      <section>
        <h3>All Users</h3>
        <ul>
          {users.map((user) => (
            <li key={user.id}>
              {user.username} ({user.email})
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3>All Uploads</h3>
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Uploaded By</th>
              <th>Year</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {uploads.map((upload) => (
              <tr key={upload.id}>
                <td>{upload.title}</td>
                <td>{upload.uploadedBy}</td>
                <td>{upload.year}</td>
                <td>
                  <button onClick={() => handleDelete(upload.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h3>Add New PDF</h3>
        <form onSubmit={handleAdd}>
          <input
            type="text"
            placeholder="Title"
            value={newPdf.title}
            onChange={(e) => setNewPdf({ ...newPdf, title: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Subject"
            value={newPdf.subject}
            onChange={(e) => setNewPdf({ ...newPdf, subject: e.target.value })}
            required
          />
          <input
            type="number"
            placeholder="Year"
            value={newPdf.year}
            onChange={(e) => setNewPdf({ ...newPdf, year: e.target.value })}
            required
          />
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files[0])}
            required
          />
          <button type="submit">Upload PDF</button>
        </form>
      </section>
    </div>
  );
}

export default AdminPanel;
