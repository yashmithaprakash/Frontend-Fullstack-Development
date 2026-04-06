import React, { useState, useEffect } from "react";
import "./App.css";
import Login from "./Login";

function App() {
  const [user, setUser] = useState(null);
  const studyHours = Number(localStorage.getItem("hours")) || 2;

  const [subjects, setSubjects] = useState([]);
  const [subjectInput, setSubjectInput] = useState("");
  const [taskInput, setTaskInput] = useState("");
  const [selectedSubject, setSelectedSubject] = useState(null);

  const [plan, setPlan] = useState([]);
  const [finishedList, setFinishedList] = useState([]);

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
    const subject = subjects.find(s => s.id === id);
    const texts = subject.tasks.map(t => t.text.toLowerCase());

    setSubjects(subjects.filter((s) => s.id !== id));

    setPlan(plan.filter(p => !texts.some(t => p.toLowerCase().includes(t))));
    setFinishedList(finishedList.filter(f => !texts.includes(f.toLowerCase())));
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

  const deleteTask = (sid, tid, text) => {
    setSubjects(
      subjects.map((s) =>
        s.id === sid ? { ...s, tasks: s.tasks.filter((t) => t.id !== tid) } : s
      )
    );

    setPlan(plan.filter((p) => !p.toLowerCase().includes(text.toLowerCase())));
    setFinishedList(
      finishedList.filter((f) => f.toLowerCase() !== text.toLowerCase())
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

  // TIME FORMAT
  const formatTime = (mins) => {
    if (mins >= 60) {
      if (mins % 60 === 0) return `${mins / 60} hr`;
      return `${Math.floor(mins / 60)} hr ${mins % 60} min`;
    }
    return `${mins} min`;
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
    if (timePerTask < 30) timePerTask = 30;

    let remaining = totalMinutes;
    let slots = [];

    allTasks.forEach((task) => {
      if (remaining <= 0) return;
      let time = Math.min(timePerTask, remaining);
      slots.push(`${task} — ${formatTime(time)}`);
      remaining -= time;
    });

    if (remaining > 0) {
      slots.push(`Revision — ${formatTime(remaining)}`);
    }

    setPlan(slots);
  };

  // FINISHED
  const addFinished = (text) => {
    setFinishedList([...finishedList, text]);

    setSubjects(
      subjects.map((s) => ({
        ...s,
        tasks: s.tasks.map((t) =>
          t.text.toLowerCase() === text.toLowerCase()
            ? { ...t, completed: true }
            : t
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

  const deleteMyPlan = (id, text) => {
    setMyPlan(myPlan.filter(t => t.id !== id));
    setFinishedList(finishedList.filter(f => f !== text));
  };

  const finishMyPlan = (text) => {
    setFinishedList([...finishedList, text]);
    setMyPlan(myPlan.map(t => t.text === text ? { ...t, completed: true } : t));
  };

  const myPlanProgress = myPlan.length
    ? Math.round((myPlan.filter((t) => t.completed).length / myPlan.length) * 100)
    : 0;

  return (
    <div className="container">

      <button className="logout-btn" onClick={() => {
        localStorage.clear();
        setUser(null);
      }}>Logout</button>

      <h1>📚 AI Study Planner</h1>
      <h3>Study Hours: {studyHours}</h3>

      <input value={subjectInput} onChange={(e) => setSubjectInput(e.target.value)} placeholder="Add Subject"/>
      <button onClick={addSubject}>Add</button>

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
              <input value={taskInput} onChange={(e) => setTaskInput(e.target.value)} placeholder="Add task"/>
              <button onClick={addTask}>Add Task</button>

              <ul>
                {s.tasks.map((t) => (
                  <li key={t.id}>
                    <span onClick={() => toggleTask(s.id, t.id)}>
                      {t.completed ? "✔️" : "⬜"} {t.text}
                    </span>
                    <button onClick={() => deleteTask(s.id, t.id, t.text)}>❌</button>
                    <button onClick={() => addFinished(t.text)}>✅</button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      ))}

      <h2 className="section-title">🤖 AI Plan</h2>
      <button onClick={generatePlan}>Generate</button>

      <div className="plan-box">
        {plan.map((p, i) => <div key={i}>{p}</div>)}
      </div>

      <h2 className="section-title">✍️ My Plan ({myPlanProgress}%)</h2>

      <input value={myPlanInput} onChange={(e) => setMyPlanInput(e.target.value)} />
      <button onClick={addMyPlan}>Add</button>

      <ul>
        {myPlan.map((t) => (
          <li key={t.id}>
            <span onClick={() => toggleMyPlan(t.id)}>
              {t.completed ? "✔️" : "⬜"} {t.text}
            </span>
            <button onClick={() => deleteMyPlan(t.id, t.text)}>❌</button>
            <button onClick={() => finishMyPlan(t.text)}>✅</button>
          </li>
        ))}
      </ul>

      <h2 className="section-title">✅ Finished</h2>

      <ul>
        {finishedList.map((f, i) => <li key={i}>✔ {f}</li>)}
      </ul>

    </div>
  );
}

export default App;