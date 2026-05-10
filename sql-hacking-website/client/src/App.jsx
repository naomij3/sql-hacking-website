import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [message, setMessage] = useState("");
  
  const [loggedInUser, setLoggedInUser] = useState(
    localStorage.getItem("loggedInUser")
  );

  const [labStatus, setLabStatus] = useState(
    localStorage.getItem("labStatus") || "Not started"
  );

  const [labUrl, setLabUrl] = useState(
    localStorage.getItem("labUrl")
  );

  const [labProgress, setLabProgress] = useState(
    Number(localStorage.getItem("labProgress")) || 0
  );

  const [submittedFlag, setSubmittedFlag] = useState(
    localStorage.getItem("submittedFlag") || ""
  );

  useEffect(() => {
    if (loggedInUser) {
      localStorage.setItem("loggedInUser", loggedInUser);
    } else {
      localStorage.removeItem("loggedInUser");
    }

    localStorage.setItem("labStatus", labStatus);
    localStorage.setItem("labProgress", String(labProgress));
    localStorage.setItem("submittedFlag", submittedFlag);

    if (labUrl) {
      localStorage.setItem("labUrl", labUrl);
    } else {
      localStorage.removeItem("labUrl");
    }
  }, [loggedInUser, labStatus, labUrl, labProgress]);

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
    setLabStatus("Not started");
    setLabUrl(null);
    setLabProgress(0);
    setSubmittedFlag("");
    setMessage("Logged out");
  }

  async function handleStartLab() {
    const response = await fetch("http://localhost:3000/labs/start", {
      method: "POST",
    });

    const data = await response.json();

    setLabStatus(data.lab.status);
    setLabUrl(data.lab.url);
    setLabProgress(25);
    setMessage(data.message);
  }

  async function handleStopLab() {
    const response = await fetch("http://localhost:3000/labs/stop", {
      method: "POST",
    });

    const data = await response.json();

    setLabStatus(data.lab.status);
    setLabUrl(data.lab.url);
    setLabProgress(0);
    setSubmittedFlag("");
    setMessage(data.message);
  }

  async function handleResetLab() {
    const response = await fetch("http://localhost:3000/labs/reset", {
      method: "POST",
    });

    const data = await response.json();

    setLabStatus(data.lab.status);
    setLabUrl(data.lab.url);
    setLabProgress(data.lab.progress);
    setSubmittedFlag("");
    setMessage(data.message);
  }

  async function handleSubmitFlag(e) {
    e.preventDefault();

    console.log("Submit flag clicked");
    console.log("Submitted flag:", submittedFlag);

    try {
      const response = await fetch("http://localhost:3000/labs/submit-flag", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          flag: submittedFlag,
        }),
      });

      const data = await response.json();

      console.log("Backend response:", data);

      setMessage(data.message);
      setLabStatus(data.lab.status);
      setLabProgress(data.lab.progress);

      if (data.correct) {
        setSubmittedFlag("");
      }
    } catch (err) {
        console.error("Flag submit failed:", err);
        setMessage("Could not submit flag");
    }
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
              <p className="lab-progress">Progress: {labProgress}%</p>

              <div className="progress-bar">
                <div className="progress-fill" style={{width: `${labProgress}%`}}>
                </div>
              </div>

              {labUrl && (
                <p>
                  Lab URL:{" "}
                  <a href={labUrl} target="_blank" rel="noreferrer">
                    {labUrl}
                  </a>
                </p>
              )}

              {labStatus === "Running" && (
                <form onSubmit={handleSubmitFlag} className="flag-form">
                  <input
                    type="text"
                    placeholder="Submit flag"
                    value={submittedFlag}
                    onChange={(e) => setSubmittedFlag(e.target.value)}
                  />
                  <button type="submit">Submit Flag</button>
                </form>
              )}
              
              <div className="lab-actions">
                {labStatus !== "Running" && labStatus !== "Completed" && (
                  <button onClick={handleStartLab}>Start Lab</button>
                )}

                {labStatus === "Running" && (
                  <button onClick={handleStopLab}>Stop Lab</button>
                )}

                {(labStatus === "Running" || labStatus === "Completed") && (
                  <button onClick={handleResetLab}>Reset Lab</button>
                )}
              </div>
            </div>

            <div className="lab-card">
                <h4>SQL Injection Hacks 2</h4>
                <p>Learn how attackers can use SQL queries to bypass login systems.</p>

                <p className="lab-status">Status: Not Started</p>
                <p className="lab-progress">Progress: 0%</p>

                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: "0%" }}></div>
                </div>

                <button onClick={() => setMessage("SQL Injection Basics 2 will be added next.")}>
                  Start Lab
                </button>
              </div>
              
          </div>
        </div>
      )}

      {message && <p className="message">{message}</p>}
    </div>
  );
}

export default App;