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
      available: true,
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
      available: false,
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
      available: false,
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
      available: false,
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
      available: false,
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
  const [openNoteId, setOpenNoteId] = useState(null);
  const [noteAnswers, setNoteAnswers] = useState({}); 
  const [toast, setToast] = useState(null);
  
  const [loggedInUser, setLoggedInUser] = useState(
    localStorage.getItem("loggedInUser")
  );

  const [labs, setLabs] = useState(() => {
    const savedLabs = localStorage.getItem("labs");
    return savedLabs ? JSON.parse(savedLabs) : initialLabs;
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

  function showToast(text, type = "info") {
    setToast({ text, type });

    setTimeout(() => {
      setToast(null);
    }, 3000);
  }

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
    showToast(text, response.ok ? "success" : "error");
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

      showToast(data.message, "success");
      setLoggedInUser(data.user.email);
    } else {
      const text = await response.text();
      showToast(text, "error");
    }
  } catch (err) {
    console.error(err);
    showToast("Something went wrong while logging in", "error");
  }
}

  function handleLogout() {
    setLoggedInUser(null);
    showToast("Logged out");
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

    showToast(data.message, "success");
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

    showToast(data.message);
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

    showToast(data.message);
  }

  async function handleSubmitFlag(e, labID) {
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

      showToast(data.message, data.correct ? "success" : "error");

      updateLab(labID, {
        status: data.lab.status,
        progress: data.lab.progress,
        submittedFlag: data.correct ? "" : lab.submittedFlag,
      });
    } catch (err) {
        console.error("Flag submit failed:", err);
        showToast("Could not submit flag", "error");
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

  function handleCompleteNote(noteID, correctAnswer) {
    const selectedAnswer = noteAnswers[noteID];

    if (!selectedAnswer) {
      showToast("Please choose an answer first.");
      return;
    }

    if (selectedAnswer !== correctAnswer){
      showToast("Incorrect answer. Try reading the note again.", "error");
      return;
    }

    if (!completedNotes.includes(noteID)) {
      setCompletedNotes([...completedNotes, noteID]);
      showToast("Correct! Note completed.", "success");
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
            style={{ width : `${overallProgress}%` }}>
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

          <div className="progress-summary">
            <div className="summary-card">
              <h4>Labs</h4>
              <p>{completedLabCount} / 5 completed</p>
              <p>{labContribution}% / 75%</p>
            </div>

            <div className="summary-card">
              <h4>Notes</h4>
              <p>{completedNotes.length} / 5 completed</p>
              <p>{notesContribution}% / 25%</p>
            </div>
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

              <p className="lab-availability">
                {lab.available ? "Available now" : "Planned lab"}
              </p>

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
                      showToast(`${lab.title} is part of the 5-lab roadmap.`)
                    }
                  >
                    View Plan
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
        content:
          "SQL injection happens when user input is placed directly into a SQL query without being safely handled. This can let an attacker change the meaning of the query and access data or bypass checks.",
        question: "What causes SQL injection?",
        answers: [
          "Using CSS incorrectly",
          "Putting unsanitised user input directly into SQL queries",
          "Using too many React components",
        ],
        correctAnswer: "Putting unsanitised user input directly into SQL queries",
      },
      {
        id: 2,
        title: "Login Bypass Basics",
        description: "Understand how weak login queries can be bypassed.",
        content:
          "A login form usually checks whether a username and password match a database record. If the query is built unsafely, input like ' OR '1'='1 can make the condition always true.",
        question: "Why can ' OR '1'='1 bypass a weak login?",
        answers: [
          "It deletes the users table",
          "It makes the SQL condition always true",
          "It encrypts the password",
        ],
        correctAnswer: "It makes the SQL condition always true",
      },
      {
        id: 3,
        title: "Quotes, Comments, and Query Structure",
        description: "Learn how quotes and SQL comments affect a query.",
        content:
          "Single quotes can break out of string values in SQL. Comment markers such as -- can cause the rest of a query to be ignored, which is why payloads like admin' -- can bypass password checks.",
        question: "What does -- commonly do in SQL?",
        answers: [
          "Comments out the rest of the query",
          "Starts a new database",
          "Creates a password hash",
        ],
        correctAnswer: "Comments out the rest of the query",
      },
      {
        id: 4,
        title: "UNION-Based Injection",
        description: "Learn how UNION can combine results from different queries.",
        content:
          "UNION lets SQL combine results from multiple SELECT statements. In an injection attack, this can be abused to display data from other tables if the attacker can match the number and type of columns.",
        question: "What does UNION do in SQL?",
        answers: [
          "Combines results from multiple SELECT queries",
          "Blocks a login attempt",
          "Deletes duplicate users automatically",
        ],
        correctAnswer: "Combines results from multiple SELECT queries",
      },
      {
        id: 5,
        title: "Blind SQL Injection",
        description: "Understand how attackers infer data without direct output.",
        content:
          "Blind SQL injection happens when the page does not directly show database results. Instead, attackers infer information from differences in responses, such as true/false messages or delays.",
        question: "What makes blind SQL injection different?",
        answers: [
          "The attacker cannot use quotes",
          "The database is not SQL-based",
          "The attacker infers results indirectly from page behaviour",
        ],
        correctAnswer:
          "The attacker infers results indirectly from page behaviour",
      },
    ];

    return (
      <div className="dashboard">
        <h2>Notes</h2>
        <p>Complete notes and checks to earn 25% of your total progress.</p>

        <div className="labs-section">
          {notes.map((note) => {
            const isComplete = completedNotes.includes(note.id);
            const isOpen = openNoteId === note.id;

            return (
              <div className="lab-card" key={note.id}>
                <h4>{note.title}</h4>
                <p>{note.description}</p>

                {isOpen && (
                  <div className="note-content">
                    <p>{note.content}</p>

                    <div className="note-check">
                      <h5>Quick Check</h5>
                      <p>{note.question}</p>

                      {note.answers.map((answer) => (
                        <label className="answer-option" key = {answer}>
                          <input 
                            type="radio"
                            name={`note-${note.id}`}
                            value={answer}
                            checked={noteAnswers[note.id] === answer}
                            onChange={(e) =>
                              setNoteAnswers({ ...noteAnswers,
                                [note.id]: e.target.value,
                              })
                            }
                          />
                          {answer}
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <p className="lab-status">
                  Status: {isComplete ? "Completed" : "Not completed"}
                </p>

                <div className="lab-actions">
                  <button
                    onClick={() =>
                      setOpenNoteId(isOpen ? null : note.id)
                    }
                  >
                    {isOpen ? "Hide Note" : "Read Note"}
                  </button>

                  <button
                    onClick={() => handleCompleteNote(note.id, note.correctAnswer)}
                    disabled={isComplete}
                  >
                    {isComplete ? "Completed" : "Mark Complete"}
                  </button>
                </div>
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

      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.text}
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

          <header className="site-header">
            <div className="brand">
              <span className="brand-mark">SQL</span>
              <span className="brand-name">SQL Hacking Academy</span>
            </div>

            <nav className="navbar">
              <Link to="/">Home</Link>
              <Link to="/labs">Labs</Link>
              <Link to="/notes">Notes</Link>
            </nav>

            <div className="user-area">
              <span>{loggedInUser}</span>
              <button onClick={handleLogout}>Logout</button>
            </div>
          </header>

          <Routes>
            <Route path="/" element={HomePage()} />
            <Route path="/labs" element={LabsPage()} />
            <Route path="/notes" element={NotesPage()} />
          </Routes>
        </div>
      )}
    </div>
  );
}

export default App;