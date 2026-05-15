import { useEffect, useState } from "react";
import { NavLink, Route, Routes } from "react-router-dom";
import "./App.css";

function App() {
  //Lab card information and local progress
  const initialLabs = [
    {
      id: 1,
      title: "Throwing an SQL error",
      description: "Use an apostrophe to see how user input can break an SQL query.",
      objective: "Throw an SQL error to understand how input fields affects backend queries.",
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
      objective: "Log in as the admin user by commenting out the rest of the query.",
      difficulty: "Easy",
      available: true,
      status: "Not started",
      progress: 0,
      url: null,
      submittedFlag: "",
    },
    {
      id: 3,
      title: "Always-True Login Bypass",
      description: "Use a true condition to make the login query return a valid user.",
      objective: "Log in as admin by passing an always true Booleon condition.",
      difficulty: "Medium",
      available: true,
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
      available: true,
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
  
  //Load saved state from localStorage to maintain progress
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

  //Persist login, lab, and note progress locally (browser, not user)
  useEffect(() => {
    if (loggedInUser) {
      localStorage.setItem("loggedInUser", loggedInUser);
    } else {
      localStorage.removeItem("loggedInUser");
    }

    localStorage.setItem("labs", JSON.stringify(labs));
    localStorage.setItem("completedNotes", JSON.stringify(completedNotes));
  }, [loggedInUser, labs, completedNotes]);

  //Display temporary messages to the user
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

  //Update only the current lab
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
    const labUrls = {
      1: "http://localhost:4000",
      2: "http://localhost:4000/lab2",
      3: "http://localhost:4000/lab3",
      4: "http://localhost:4000/lab4",
    };

    updateLab(labID, {
      status: "Running",
      url: labUrls[labID] || null,
      progress: 25,
    });

    showToast("Lab started", "success");
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

  //Backend receives submitted flags to avoid storing them in the frontend
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
          labID,
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

  //Calculate total course progress: labs are worth 75%, notes are worth 25%.
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

  //User must check the correct answer in order to mark note as complete
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

  //Home page displays current user level and progress, and buttons to navigate to labs and notes
  function HomePage() {
    return (
      <div className="dashboard">
        <div className="home-hero">
          <h2>Welcome back, {loggedInUser}.</h2>
          <p className="hero-text">
            Build your SQL injection skills through beginner-friendly notes,
            quizzes, and hands-on practical labs from easy to challenging.
          </p>

          <div className="home-actions">
            <NavLink to="/labs" className="primary-link"> Continue to Labs</NavLink>
            <NavLink to="/notes" className="secondary-link">Read Notes</NavLink>
          </div>
        </div>

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

  //Lab page contains all 5 labs alongside their URLs
  function LabsPage() {
    return (
      <div className="dashboard">
        <h2>Labs</h2>
        <p>Complete SQL injection labs to earn 75% of your total progress.</p>

        <div className="labs-section">
          {labs.map((lab) => (
            <div className="lab-card" key={lab.id}>
              <div className="lab-title-row">
                <span className="lab-number">Lab {lab.id}</span>
                <h4>{lab.title}</h4>
              </div>

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
                {lab.available ? "Available now" : "Planned"}
              </p>

              {lab.url && (
                <p>
                  Lab URL:{" "}
                  <a href={lab.url} target="_blank" rel="noreferrer">
                    {lab.url}
                  </a>
                </p>
              )}

              {(lab.id === 1 || lab.id === 2 || lab.id === 3 || lab.id === 4) &&
               lab.status === "Running" && (
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
                {lab.id === 1 || lab.id === 2 || lab.id === 3 || lab.id === 4 ? (
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
                    Preview
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  //Notes page contains SQL injection guides and quizzes
  function NotesPage() {
    const notes = [
      {
        id: 0,
        title: "Introduction to SQL injections",
        description: "Understand what SQL injection is and why it is dangerous.",
        content: (
          <>
            <p>
              To understand what SQL injection is, it is important to first understand
              how websites use databases to store user information. SQL is a language
              used to create and query databases that websites rely on to personalise
              the experience for each user.
            </p>

            <p>
              These databases can hold important information such as usernames,
              passwords, telephone numbers, addresses, credit card information, and much
              more. A user is usually shown their information after logging into the
              website.
            </p>

            <p>
              A login form normally has two input fields: one for a username and one for
              a password. The input is then placed into a SQL query that asks the
              database whether that user exists.
            </p>

            <p>
              For example, if a user has the username <strong>ed</strong> and the
              password <strong>London</strong>, the query might look like this:
            </p>

            <pre className="code-block">
              <code>
                {`SELECT * FROM users WHERE username = 'ed' AND password = 'London';`}
              </code>
            </pre>

            <p>
              If the database finds this user, the login is successful. If the input
              cannot be found in the database, the login fails.
            </p>

            <p>
              The danger lies in malicious users manipulating the SQL query to gain
              access to user or admin accounts, or to retrieve information from the
              database.
            </p>
          </>
        ),
        question: null,
        answers: [],
        correctAnswer: null,
      },
      {
        id: 1,
        title: "Breaking a query",
        description: "Learn how to throw an error in a query.",
        content:(
          <>
            <p>
              The simplest way to demonstrate SQL query manipulation is to get the database to throw an error.
              This means something we have inputted has affected the query.
            </p>
            
            <p>
              An easy way to demonstrate this is to throw a syntax error. If a website has a login page 
              and low security, putting an apostrophe between characters in the user input fields. 
              This disrupts the query and closes it early, leaving characters outside the argument 
              and the program returns an error.
            </p>
          </>
        ),
        question: "Why does an apostrophe throw a syntax error?",
        answers: [
          "It closes the argument early and leave characters out",
          "SQL does not use apostrophes",
          "Apostrophes are only used for math",
        ],
        correctAnswer: "It closes the argument early and leave characters out",
      },
      {
        id: 2,
        title: "Comment out query",
        description: "Learn how quotes and SQL comments affect a query.",
        content:(
          <>
            <p>
              Now that we know SQL can be manipulated, and it takes user input as raw data, 
              the opportunities widen and allow for more dangerous SQL injections. 
            </p>
            
            <p>
              SQL uses two hyphens -- to comment out data. A comment-based injection 
              comments out the remaining argument to force true conditions. 
            </p>

            <p>In a login system, both the username and password conditions must match 
              the database values. By inserting " ' -- " in the username field, 
              SQL effectively ignores the password check and returns that user based purely 
              on knowing the username.
            </p>
          </>
        ),
        question: "What does -- do in SQL?",
        answers: [
          "Syntax to subtract",
          "Syntax to comment",
          "Throws a syntax error",
        ],
        correctAnswer: "Syntax to comment",
      },
      {
        id: 3,
        title: "Always-true conditions",
        description: "Understand how weak login queries can be bypassed.",
        content:(
          <>
            <p>
              SQL injections rely heavily on returning true. An effective SQL injection forces 
              true statements into the argument by using Boolean values.
            </p>
            
            <p>
              The statement "username= 'user' OR '1'='1" will always return true. As long as 
              one argument in an OR statement is true, the whole statement returns true.
            </p>

            <p>
              Logic manipulation provides dangerous access to unauthorised users and the SQL 
              will return database entries with a simple bypass.
            </p>
          </>
        ),
        question: "Which Boolean value returns a true if at least one parameter is true?",
        answers: [
          "OR",
          "AND",
          "XOR",
        ],
        correctAnswer: "OR",
      },
      {
        id: 4,
        title: "UNION-Based Injection",
        description: "Learn how UNION can combine results from different queries.",
        content: (
          <>
            <p>
              UNION SELECT is a SQL command following a primary SELECT used to retrieve value from 
              other tables and must both return the same number of columns. This is dangerous as 
              sensitive information can be retrieved with a WHERE clause. 
            </p>

            <p>
              The more information on the database is available, the more dangerous this injection is. 
              Without this information, the number of columns, the names of databases, the injection 
              cannot be written.
            </p>
          </>
        ),
        question: "What information is key to craft a UNION-based execution?",
        answers: [
          "Admin password",
          "SQL version",
          "Database structure",
        ],
        correctAnswer: "Database structure",
      },
      {
        id: 5,
        title: "Blind SQL Injection",
        description: "Understand how attackers infer data without direct output.",
        content:(
          <>
            <p>
              Blind SQL relies on true or false questions asked to the database and 
              inferring answers based off the response. For example, 1=1 can be injected 
              and if the page responds differently, then this indicates the query is vulnerable 
              to an SQL injection.
            </p>

            <p>
              Furthermore, a condition can be checked if true by executing a time delay on the page. 
              If the page waits to load, then the parameter is true. This is a brute-force method 
              that is very time consuming and so is typically automated.
            </p>
          </>
        ), 
        question: "What makes an SQL injection blind?",
        answers: [
          "Answers get deleted from the database",
          "Answers are inferred by page behaviour",
          "Answers are irretrievable",
        ],
        correctAnswer:
          "Answers are inferred by page behaviour",
      },
      {
        id: 6,
        title: "Defending Against SQL Injection",
        description: "Learn the basic solutions that prevent SQL injection vulnerabilities.",
        content: (
          <>
            <p>
              SQL injections get executed when user input is treated as a command and not data. 
              To prevent these kinds of attacks, it is vital to properly handle user input. 
              Instead of directly inputting whatever the user has submitted into the SQL query, 
              the input is converted from code to data. 
            </p>

            <p>
              The most secure method is using prepared statements with parameterised queries. 
              Prepared statements maintain the integrity of the SQL query, and user input is passed 
              through parameterised queries to disregard any commands and stored as data. 
              For example, when taking a username, an unsafe SQL query would look like this:
            </p>

            <pre className="code-block">
              <code>
                {"SELECT * FROM users WHERE username = 'username';"}
              </code>
            </pre>

            <p>
              The user input is submitted directly into the query with no checks, this is very 
              dangerous. A better version using prepared statements and parameterised queries 
              looks like this:
            </p>

            <pre className="code-block">
              <code>
                {"SELECT * FROM users WHERE username = ?;"}
              </code>
            </pre>

            <p>All queries should be parameterised to secure against SQL injections.</p>
          </>
        ),
        question: null,
        answers: [],
        correctAnswer: null,
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
                <div className="lab-title-row">
                  <span className="lab-number">
                    {note.id === 0 ? "Intro" : note.id === 6 ? "Final" : `Note ${note.id}`}
                  </span>
                  <h4>{note.title}</h4>
                </div>

                <p>{note.description}</p>

                {isOpen && (
                  <div className="note-content">
                    <div>{note.content}</div>
                      {note.question && (
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
                      )}
                  </div>
                )}

                {note.question && (
                  <p className="lab-status">
                    Status: {isComplete ? "Completed" : "Not completed"}
                  </p>
                )}
                
                <div className="lab-actions">
                  <button
                    onClick={() =>
                      setOpenNoteId(isOpen ? null : note.id)
                    }
                  >
                    {isOpen ? "Hide Note" : "Read Note"}
                  </button>

                  {note.question && (
                    <button
                      onClick={() => handleCompleteNote(note.id, note.correctAnswer)}
                      disabled={isComplete}
                    >
                      {isComplete ? "Completed" : "Mark Complete"}
                    </button>
                  )}
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
              <span className="brand-mark">SHA</span>
              <span className="brand-name">SQL Hacking Academy</span>
            </div>

            <nav className="navbar">
              <NavLink to="/">Home</NavLink>
              <NavLink to="/labs">Labs</NavLink>
              <NavLink to="/notes">Notes</NavLink>
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