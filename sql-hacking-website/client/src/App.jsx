import { useEffect, useState } from "react";
import {Link, Route, Routes } from "react-router-dom";
import "./App.css";

function App() {
  const initialLabs = [
    {
      id: 1,
      title: "SQL Injection Basics",
      description: "Bypass a vulnerable login form using basic SQL injection.",
      objective: "Log in without knowing the correct password.",
      difficulty: "Very Easy",
      status: "Not started",
      progress: 0,
      url: null,
      submittedFlag: "",
    },
    {
      id: 2,
      title: "Comment-Based Login Bypass",
      description: "Use SQL comments to bypass password checks.",
      objective: "Log in as the admin user by commenting out part of the query.",
      difficulty: "Easy",
      status: "Not started",
      progress: 0,
      url: null,
      submittedFlag: "",
    },
    {
      id: 3,
      title: "Error-Based SQL Injection",
      description: "Use database errors to understand vulnerable query structure.",
      objective: "Trigger an error and use it to craft a working payload.",
      difficulty: "Medium",
      status: "Not started",
      progress: 0,
      url: null,
      submittedFlag: "",
    },
    {
      id: 4,
      title: "UNION-Based Extraction",
      description: "Use UNION queries to extract hidden information.",
      objective: "Extract a hidden flag from another database table.",
      difficulty: "Hard",
      status: "Not started",
      progress: 0,
      url: null,
      submittedFlag: "",
    },
    {
      id: 5,
      title: "Blind SQL Injection Challenge",
      description: "Infer hidden data using true/false responses.",
      objective: "Recover the flag without seeing direct database output.",
      difficulty: "Challenging",
      status: "Not started",
      progress: 0,
      url: null,
      submittedFlag: "",
    },
  ];

  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [message, setMessage] = useState("");
  
  const [loggedInUser, setLoggedInUser] = useState(
    localStorage.getItem("loggedInUser")
  );

  const [labs, setLabs] = useState(() => {
    const savedLabs = localStorage.getItem("labs");
    return savedLabs ? JSON.parse(savedLabs) :initialLabs;
  });

  const [completedNotes, setCompletedNotes] = useState(() => {
    const saved = localStorage.getItem("completedNotes");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    if (loggedInUser) {
      localStorage.setItem("loggedInUser", loggedInUser);
    } else {
      localStorage.removeItem("loggedInUser");
    }

    localStorage.setItem("labs", JSON.stringify(labs));
    localStorage.setItem("completedNotes", JSON.stringify(completedNotes));
  }, [loggedInUser, labs, completedNotes]);

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

  function updateLab(labID, updates) {
    setLabs((currentLabs) =>
      currentLabs.map((lab) =>
        lab.id === labID ? { ...lab, ...updates } : lab
      )   
    );
  }

  function getLab(labID) {
    return labs.find((lab) => lab.id === labID);
  }

  async function handleStartLab(labID) {
    const response = await fetch("http://localhost:3000/labs/start", {
      method: "POST",
    });

    const data = await response.json();

    updateLab(labID, {
      status: data.lab.status,
      url: data.lab.url,
      progress: 25,
    });

    setMessage(data.message);
  }

  async function handleStopLab(labID) {
    const response = await fetch("http://localhost:3000/labs/stop", {
      method: "POST",
    });

    const data = await response.json();

    updateLab(labID, {
      status: data.lab.status,
      url: data.lab.url,
      progress: 0,
      submittedFlag: "",
    });

    setMessage(data.message);
  }

  async function handleResetLab(labID) {
    const response = await fetch("http://localhost:3000/labs/reset", {
      method: "POST",
    });

    const data = await response.json();

    updateLab(labID, {
      status: data.lab.status,
      url: data.lab.url,
      progress: data.lab.progress,
      submittedFlag: "",
    });

    setMessage(data.message);
  }

  async function handleSubmitFlag(e) {
    e.preventDefault();

    const lab = getLab(labID);

    try {
      const response = await fetch("http://localhost:3000/labs/submit-flag", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          flag: lab.submittedFlag,
        }),
      });

      const data = await response.json();

      setMessage(data.message);

      updateLab(labID, {
        status: data.lab.status,
        progress: data.lab.progress,
        submittedFlag: data.correct ? "" : lab.submittedFlag,
      });
    } catch (err) {
        console.error("Flag submit failed:", err);
        setMessage("Could not submit flag");
    }
  }

  const completedLabCount = labs.filter((lab) => lab.status === "Completed").length;

  const labContribution = completedLabCount * 15;
  const notesContribution = completedNotes.length * 5;
  const overallProgress = labContribution + notesContribution;

  let currentLevel = "Level 1";
  if (overallProgress >= 80) {
    currentLevel = "Level 5";
  } else if (overallProgress >=60) {
    currentLevel = "Level 4";
  } else if (overallProgress >= 40) {
    currentLevel = "Level 3";
  } else if (overallProgress >= 20) {
    currentLevel = "Level 2";
  }

  const currentLevelNumber = Math.min(5, Math.floor(overallProgress / 20) + 1);

  function handleCompleteNote(noteID) {
    if (!completedNotes.includes(noteID)) {
      setCompletedNotes([...completedNotes, noteID]);
      setMessage("Note completed")
    }
  }

  function HomePage() {
    return (
      <div className="dashboard">
        <h2>Home</h2>
        <p>Welcome, {loggedInUser}.</p>
        <p>SQL Learning Dashboard</p>

        <div className="overall-progress">
          <h3>{currentLevel}</h3>
          <p>Overall Progress: {overallProgress}%</p>

          <div className="progress-bar">
            <div className="progress-fill"
            style={{ width : `${overallProgress}%`}}>
            </div>  
          </div> 

          <div className="level-track">
            {[1, 2, 3, 4, 5].map((level) => (
              <div
              key={level}
              className={
                level <= currentLevelNumber
                  ? "level-box level-box-active"
                  : "level-box"
              } >
                Level {level}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  function LabsPage() {
    return (
      <div className="dashboard">
        <h2>Labs</h2>
        <p>Complete SQL injection labs to earn 75% of your total progress.</p>

        <div className="labs-section">
          {labs.map((lab) => (
            <div className="lab-card" key={lab.id}>
              <h4>{lab.title}</h4>
              <p>{lab.description}</p>

              <p className="lab-meta">Difficulty: {lab.difficulty}</p>
              <p className="lab-objective">Objective: {lab.objective}</p>

              <p className="lab-status">Status: {lab.status}</p>
              <p className="lab-progress">Progress: {lab.progress}%</p>

              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${lab.progress}%` }}
                ></div>
              </div>

              {lab.url && (
                <p>
                  Lab URL:{" "}
                  <a href={lab.url} target="_blank" rel="noreferrer">
                    {lab.url}
                  </a>
                </p>
              )}

              {lab.id === 1 && lab.status === "Running" && (
                <form
                  onSubmit={(e) => handleSubmitFlag(e, lab.id)}
                  className="flag-form"
                >
                  <input
                    type="text"
                    placeholder="Submit flag"
                    value={lab.submittedFlag}
                    onChange={(e) =>
                      updateLab(lab.id, { submittedFlag: e.target.value })
                    }
                  />
                  <button type="submit">Submit Flag</button>
                </form>
              )}

              <div className="lab-actions">
                {lab.id === 1 ? (
                  <>
                    {lab.status !== "Running" && lab.status !== "Completed" && (
                      <button onClick={() => handleStartLab(lab.id)}>
                        Start Lab
                      </button>
                    )}

                    {lab.status === "Running" && (
                      <button onClick={() => handleStopLab(lab.id)}>
                        Stop Lab
                      </button>
                    )}

                    {(lab.status === "Running" || lab.status === "Completed") && (
                      <button onClick={() => handleResetLab(lab.id)}>
                        Reset Lab
                      </button>
                    )}
                  </>
                ) : (
                  <button
                    onClick={() =>
                      setMessage(`${lab.title} is planned for the next build.`)
                    }
                  >
                    Start Lab
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function NotesPage() {
    const notes = [
      {
        id: 1,
        title: "What is SQL Injection?",
        description: "Learn what SQL injection is and how it works.",
      },
      {
        id: 2,
        title: "Login Bypass Basics",
        description: "Understand how weak login queries can be bypassed.",
      },
      {
        id: 3,
        title: "Quotes, Comments, and Query Structure",
        description: "Learn how quotes and SQL comments affect a query.",
      },
      {
        id: 4,
        title: "UNION-Based Injection",
        description: "Learn how UNION can combine results from different queries.",
      },
      {
        id: 5,
        title: "Blind SQL Injection",
        description: "Understand how attackers infer data without direct output.",
      },
    ];

    return (
      <div className="dashboard">
        <h2>Notes</h2>
        <p>SQL injection guides to complete</p>

        <div className="labs-section">
          {notes.map((note) => {
            const isComplete = completedNotes.includes(note.id);

            return (
              <div className="lab-card" key={note.id}>
                <h4>{note.title}</h4>
                <p>{note.description}</p>

                <p className="lab-status">
                  Status: {isComplete ? "Completed" : "Not completed"}
                </p>

                <button onClick={() => handleCompleteNote(note.id)}
                disabled={isComplete}>
                  {isComplete ? "Completed" : "Mark Complete"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
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
        <div>
          <nav className="navbar">
            <Link to="/">Home</Link>
            <Link to="/labs">Labs</Link>
            <Link to="/notes">Notes</Link>
          </nav>

          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/labs" element={<LabsPage />} />
            <Route path="/notes" element={<NotesPage />} />
          </Routes>
        </div>
      )}

      {message && <p className="message">{message}</p>}
    </div>
  );
}

export default App;