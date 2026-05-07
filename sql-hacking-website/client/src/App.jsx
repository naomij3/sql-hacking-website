import { useState } from "react";
import "./App.css";

function App() {
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [message, setMessage] = useState("");

  const [loggedInUser, setLoggedInUser] = useState(null);

  const [labStatus, setLabStatus] = useState("Not started");

  const [labUrl, setLabUrl] = useState(null);

  async function handleRegister(e) {
    e.preventDefault();

    const response = await fetch("http://localhost:3000/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: registerEmail,
        password: registerPassword,
      }),
    });

    const text = await response.text();
    setMessage(text);
  }

async function handleLogin(e) {
  e.preventDefault();

  try {
    const response = await fetch("http://localhost:3000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: loginEmail,
        password: loginPassword,
      }),
    });

    if (response.ok) {
      const data = await response.json();

      setMessage(data.message);
      setLoggedInUser(data.user.email);
    } else {
      const text = await response.text();
      setMessage(text);
    }
  } catch (err) {
    console.error(err);
    setMessage("Something went wrong while logging in");
  }
}

  function handleLogout() {
    setLoggedInUser(null);
    setMessage("Logged out");
  }

  async function handleStartLab() {
    const response = await fetch("http://localhost:3000/labs/start", {
      method: "POST",
    });

    const data = await response.json();

    setLabStatus(data.lab.status);
    setLabUrl(data.lab.url);
    setMessage(data.message);
  }

  return (
    <div className="page">
      <h1>SQL Hacking Website</h1>

      {loggedInUser && (
        <div className="logged-in-box">
          <p>Logged in as {loggedInUser}</p>
          <button onClick={handleLogout}>Logout</button>
        </div>
      )}

      {!loggedInUser ? (
        <div className="forms">
          <form onSubmit={handleRegister} className="card">
            <h2>Register</h2>

            <input
              type="email"
              placeholder="Email"
              value={registerEmail}
              onChange={(e) => setRegisterEmail(e.target.value)}
            />

            <input
              type="password"
              placeholder="Password"
              value={registerPassword}
              onChange={(e) => setRegisterPassword(e.target.value)}
            />

            <button type="submit">Create Account</button>
          </form>

          <form onSubmit={handleLogin} className="card">
            <h2>Login</h2>

            <input
              type="email"
              placeholder="Email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
            />

            <input
              type="password"
              placeholder="Password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
            />

            <button type="submit">Login</button>
          </form>
        </div>
      ) : (
        <div className="dashboard">
          <h2>Dashboard</h2>
          <p>Welcome, {loggedInUser}.</p>

          <div className="labs-section">
            <h3>SQL Labs</h3>

            <div className="lab-card">
              <h4>SQL Injection Hacks</h4>
              <p>Learn how attackers can use SQL queries to bypass login systems.</p>

              <p className="lab-status">Status: {labStatus}</p>
              
              {labUrl && (
                <p>
                  Lab URL:{" "}
                  <a href={labUrl} target="_blank" rel="noreferrer">
                    {labUrl}
                  </a>
                </p>
              )}

              <button onClick={handleStartLab}>Start Lab</button>
            </div>
          </div>
        </div>
      )}

      {message && <p className="message">{message}</p>}
    </div>
  );
}

export default App;