import React, { useState } from "react";
import "./App.css";

function Login({ setUser }) {
  const [name, setName] = useState("");
  const [hours, setHours] = useState("");

  const login = () => {
    if (!name.trim() || !hours) {
      alert("Enter name and study hours");
      return;
    }

    localStorage.setItem("user", name);
    localStorage.setItem("hours", hours);
    setUser(name);
  };

  return (
    <div className="container">
      <h2>👤 Login</h2>

      <input
        placeholder="Enter name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        type="number"
        placeholder="Study hours per day"
        value={hours}
        onChange={(e) => setHours(e.target.value)}
      />

      <button onClick={login}>Login</button>
    </div>
  );
}

export default Login;