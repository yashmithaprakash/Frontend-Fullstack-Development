import React, { useState, useEffect } from "react";
import "./App.css";
import Login from "./Login";

function App() {
  const [user, setUser] = useState(null);
  const studyHours = Number(localStorage.getItem("hours")) || 2;

  const [page, setPage] = useState("main");

  const [subjects, setSubjects] = useState([]);
  const [subjectInput, setSubjectInput] = useState("");
  const [taskInput, setTaskInput] = useState("");
  const [selectedSubject, setSelectedSubject] = useState(null);

  const [plan, setPlan] = useState([]);
  const [finishedList, setFinishedList] = useState({});

  const [myPlan, setMyPlan] = useState([]);
  const [myPlanInput, setMyPlanInput] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("subjects");
    if (saved) setSubjects(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("subjects", JSON.stringify(subjects));
  }, [subjects]);

  if (!user) return <Login setUser={setUser} />;

  // SUBJECT
  const addSubject = () => {
    if (!subjectInput) return;
    setSubjects([...subjects, { id: Date.now(), name: subjectInput, tasks: [] }]);
    setSubjectInput("");
  };

  const deleteSubject = (id) => {
    setSubjects(subjects.filter((s) => s.id !== id));
  };

  // TASK
  const addTask = () => {
    if (!taskInput || selectedSubject === null) return;

    setSubjects(
      subjects.map((s) =>
        s.id === selectedSubject
          ? {
              ...s,
              tasks: [...s.tasks, { id: Date.now(), text: taskInput, completed: false }],
            }
          : s
      )
    );
    setTaskInput("");
  };

  const deleteTask = (sid, tid) => {
    setSubjects(
      subjects.map((s) =>
        s.id === sid ? { ...s, tasks: s.tasks.filter((t) => t.id !== tid) } : s
      )
    );
  };

  const toggleTask = (sid, tid) => {
    setSubjects(
      subjects.map((s) =>
        s.id === sid
          ? {
              ...s,
              tasks: s.tasks.map((t) =>
                t.id === tid ? { ...t, completed: !t.completed } : t
              ),
            }
          : s
      )
    );
  };

  const getProgress = (tasks) => {
    if (!tasks.length) return 0;
    return Math.round((tasks.filter((t) => t.completed).length / tasks.length) * 100);
  };

  // AI PLAN
  const generatePlan = () => {
    let allTasks = subjects.flatMap((s) => s.tasks.map((t) => t.text));

    if (!allTasks.length) {
      setPlan(["No tasks available"]);
      return;
    }

    let totalMinutes = studyHours * 60;
    let timePerTask = Math.floor(totalMinutes / (allTasks.length + 1));

    let remaining = totalMinutes;
    let slots = [];

    allTasks.forEach((task) => {
      if (remaining <= 0) return;
      let time = Math.min(timePerTask, remaining);
      slots.push(`${task} — ${time} min`);
      remaining -= time;
    });

    if (remaining > 0) {
      slots.push(`Revision — ${remaining} min`);
    }

    setPlan(slots);
  };

  // FINISH TASK (DATE-WISE)
  const addFinished = (text) => {
    const today = new Date().toDateString();

    setFinishedList((prev) => ({
      ...prev,
      [today]: [...(prev[today] || []), text],
    }));

    setSubjects(
      subjects.map((s) => ({
        ...s,
        tasks: s.tasks.map((t) =>
          t.text === text ? { ...t, completed: true } : t
        ),
      }))
    );
  };

  // MY PLAN
  const addMyPlan = () => {
    if (!myPlanInput) return;
    setMyPlan([...myPlan, { id: Date.now(), text: myPlanInput, completed: false }]);
    setMyPlanInput("");
  };

  const toggleMyPlan = (id) => {
    setMyPlan(myPlan.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteMyPlan = (id) => {
    setMyPlan(myPlan.filter(t => t.id !== id));
  };

  const finishMyPlan = (text) => {
    const today = new Date().toDateString();

    setFinishedList((prev) => ({
      ...prev,
      [today]: [...(prev[today] || []), text],
    }));

    setMyPlan(
      myPlan.map((t) =>
        t.text === text ? { ...t, completed: true } : t
      )
    );
  };

  return (
    <div className="container">

      {/* NAVBAR */}
      <div className="nav">
        <button onClick={() => setPage("main")}>🏠 Home</button>
        <button onClick={() => setPage("finished")}>📊 Finished</button>
        <button className="logout-btn" onClick={() => {
          localStorage.clear();
          setUser(null);
        }}>Logout</button>
      </div>

      {/* DATE */}
      <h3>📅 {new Date().toDateString()}</h3>

      {/* MAIN PAGE */}
      {page === "main" && (
        <>
          <h1>📚 AI Study Planner</h1>
          <h3>Study Hours: {studyHours}</h3>

          <div style={{ textAlign: "center" }}>
            <input
              value={subjectInput}
              onChange={(e) => setSubjectInput(e.target.value)}
              placeholder="Add Subject"
            />
            <button onClick={addSubject}>Add</button>
          </div>

          {subjects.map((s) => (
            <div key={s.id} className="subject-box">
              <div className="subject-header">
                <h3 onClick={() => setSelectedSubject(s.id)}>
                  📂 {s.name} — {getProgress(s.tasks)}%
                </h3>
                <button onClick={() => deleteSubject(s.id)}>❌</button>
              </div>

              {selectedSubject === s.id && (
                <>
                  <input
                    value={taskInput}
                    onChange={(e) => setTaskInput(e.target.value)}
                    placeholder="Add task"
                  />
                  <button onClick={addTask}>Add Task</button>

                  <ul>
                    {s.tasks.map((t) => (
                      <li key={t.id}>
                        <span onClick={() => toggleTask(s.id, t.id)}>
                          {t.completed ? "✔️" : "⬜"} {t.text}
                        </span>
                        <div>
                          <button onClick={() => deleteTask(s.id, t.id)}>❌</button>
                          <button onClick={() => addFinished(t.text)}>Finish</button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          ))}

          <h2>🤖 AI Plan</h2>
          <button onClick={generatePlan}>Generate</button>

          <div className="plan-box">
            {plan.map((p, i) => <div key={i}>{p}</div>)}
          </div>

          <h2>✍️ My Plan</h2>

          <input
            value={myPlanInput}
            onChange={(e) => setMyPlanInput(e.target.value)}
          />
          <button onClick={addMyPlan}>Add</button>

          <ul>
            {myPlan.map((t) => (
              <li key={t.id}>
                <span onClick={() => toggleMyPlan(t.id)}>
                  {t.completed ? "✔️" : "⬜"} {t.text}
                </span>
                <div>
                  <button onClick={() => deleteMyPlan(t.id)}>❌</button>
                  <button onClick={() => finishMyPlan(t.text)}>Finish</button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      {/* FINISHED PAGE */}
      {page === "finished" && (
        <>
          <h2>📊 Finished Tasks</h2>

          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Tasks Completed</th>
              </tr>
            </thead>

            <tbody>
              {Object.keys(finishedList).map((date) => (
                <tr key={date}>
                  <td>{date}</td>
                  <td>
                    {finishedList[date].map((task, i) => (
                      <div key={i}>✔ {task}</div>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

    </div>
  );
}

export default App;