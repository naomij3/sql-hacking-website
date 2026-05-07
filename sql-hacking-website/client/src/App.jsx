import { useState } from "react";
import "./App.css";

function App() {
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [message, setMessage] = useState("");

  const [loggedInUser, setLoggedInUser] = useState(null);

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

    const text = await response.text();
    setMessage(text);
    
    if (response.ok) {
      setLoggedInUser(loginEmail);
    }
  }

  function handleLogout() {
    setLoggedInUser(null);
    setMessage("Logged out");
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

      {message && <p className="message">{message}</p>}
    </div>
  );
}

export default App;