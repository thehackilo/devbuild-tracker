import { useState, useEffect } from "react";

// tiny id helper
function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

// localStorage helpers
function saveLocal(key, value) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function loadLocal(key, fallback) {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

// pill badge
function Pill({ children, color }) {
  const colorMap = {
    feature: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    bug: "bg-rose-500/20 text-rose-300 border-rose-500/40",
    polish: "bg-sky-500/20 text-sky-300 border-sky-500/40",
    sev: "bg-amber-500/20 text-amber-300 border-amber-500/40",
  };

  return (
    <span
      className={
        "text-[10px] font-semibold px-2 py-[2px] rounded-full border " +
        (colorMap[color] ||
          "bg-neutral-700/60 text-neutral-300 border-neutral-600")
      }
    >
      {children}
    </span>
  );
}

// card wrapper
function Card({ title, subtitle, className, children }) {
  return (
    <section
      className={
        "bg-neutral-800/60 border border-neutral-700 rounded-2xl p-5 shadow-xl " +
        (className || "")
      }
    >
      <header className="flex flex-col gap-1 mb-4">
        <h2 className="text-white text-lg font-semibold tracking-tight flex items-center gap-2">
          {title}
        </h2>
        {subtitle && (
          <p className="text-[11px] text-neutral-400 leading-snug">
            {subtitle}
          </p>
        )}
      </header>
      {children}
    </section>
  );
}

export default function DevBuildTrackerPage() {
  // ----- STATE -----
  const [projectName, setProjectName] = useState("My Roblox Horror Game");
  const [nextMilestone, setNextMilestone] = useState(
    "Halloween Playtest 10/31"
  );

  // tasks = {id, text, status:'todo'|'doing'|'done', tag:'feature'|'bug'|'polish'}
  const [tasks, setTasks] = useState([]);
  const [newTaskText, setNewTaskText] = useState("");
  const [newTaskTag, setNewTaskTag] = useState("feature");

  // feedbackList = {id, tester, note, severity:'low'|'med'|'high'}
  const [feedbackList, setFeedbackList] = useState([]);
  const [testerName, setTesterName] = useState("");
  const [testerNote, setTesterNote] = useState("");
  const [testerSeverity, setTesterSeverity] = useState("med");

  // checklist toggles
  const [checkReleaseNotes, setCheckReleaseNotes] = useState(false);
  const [checkIconScreenshots, setCheckIconScreenshots] = useState(false);
  const [checkMonetizationPass, setCheckMonetizationPass] = useState(false);
  const [checkQAPlaytest, setCheckQAPlaytest] = useState(false);

  // ----- LOAD ONCE FROM LOCALSTORAGE -----
  useEffect(() => {
    setTasks(loadLocal("devtracker_tasks", []));
    setFeedbackList(loadLocal("devtracker_feedback", []));

    const meta = loadLocal("devtracker_meta", {
      projectName,
      nextMilestone,
    });
    setProjectName(meta.projectName || projectName);
    setNextMilestone(meta.nextMilestone || nextMilestone);

    const checks = loadLocal("devtracker_checks", {
      rn: checkReleaseNotes,
      art: checkIconScreenshots,
      monet: checkMonetizationPass,
      qa: checkQAPlaytest,
    });
    setCheckReleaseNotes(checks.rn || false);
    setCheckIconScreenshots(checks.art || false);
    setCheckMonetizationPass(checks.monet || false);
    setCheckQAPlaytest(checks.qa || false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ----- SAVE WHENEVER THINGS CHANGE -----
  useEffect(() => {
    saveLocal("devtracker_tasks", tasks);
  }, [tasks]);

  useEffect(() => {
    saveLocal("devtracker_feedback", feedbackList);
  }, [feedbackList]);

  useEffect(() => {
    saveLocal("devtracker_meta", { projectName, nextMilestone });
  }, [projectName, nextMilestone]);

  useEffect(() => {
    saveLocal("devtracker_checks", {
      rn: checkReleaseNotes,
      art: checkIconScreenshots,
      monet: checkMonetizationPass,
      qa: checkQAPlaytest,
    });
  }, [
    checkReleaseNotes,
    checkIconScreenshots,
    checkMonetizationPass,
    checkQAPlaytest,
  ]);

  // ----- TASK ACTIONS -----
  function addTask() {
    if (!newTaskText.trim()) return;
    const t = {
      id: uid("task"),
      text: newTaskText.trim(),
      status: "todo",
      tag: newTaskTag,
    };
    setTasks((prev) => [t, ...prev]);
    setNewTaskText("");
  }

  function updateTaskStatus(id, status) {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status } : t))
    );
  }

  function removeTask(id) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  // ----- FEEDBACK ACTIONS -----
  function addFeedback() {
    if (!testerNote.trim()) return;
    const f = {
      id: uid("fb"),
      tester: testerName.trim() || "Anonymous",
      note: testerNote.trim(),
      severity: testerSeverity,
    };
    setFeedbackList((prev) => [f, ...prev]);
    setTesterName("");
    setTesterNote("");
    setTesterSeverity("med");
  }

  function removeFeedback(id) {
    setFeedbackList((prev) => prev.filter((f) => f.id !== id));
  }

  // ----- RENDER -----
  return (
    <main className="min-h-screen bg-neutral-900 text-white flex flex-col items-center p-6">
      <div className="w-full max-w-6xl flex flex-col gap-6">
        {/* HEADER */}
        <header className="bg-neutral-800/60 border border-neutral-700 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex-1">
            <div className="flex flex-col gap-2">
              <label className="text-xs text-neutral-400">Project Name</label>
              <input
                className="bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-white text-base font-semibold tracking-tight max-w-sm"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2 mt-4 max-w-sm">
              <label className="text-xs text-neutral-400">
                Next Milestone / Deadline
              </label>
              <input
                className="bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-white text-sm"
                value={nextMilestone}
                onChange={(e) => setNextMilestone(e.target.value)}
              />
              <p className="text-[11px] text-neutral-500 leading-snug">
                Example: "Alpha Playtest 10/31", "Patch v0.2 Friday", etc.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-center text-xs w-full md:w-auto">
            <div className="bg-neutral-900 border border-neutral-700 rounded-xl p-3">
              <div className="text-neutral-400">Open Tasks</div>
              <div className="text-white font-semibold text-xl">
                {tasks.filter((t) => t.status !== "done").length}
              </div>
            </div>
            <div className="bg-neutral-900 border border-neutral-700 rounded-xl p-3">
              <div className="text-neutral-400">Feedback</div>
              <div className="text-white font-semibold text-xl">
                {feedbackList.length}
              </div>
            </div>
          </div>
        </header>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* COLUMN 1: TASKS */}
          <Card
            title="Backlog / Sprint Board"
            subtitle="Track features, bugs, polish. Click status buttons to move it."
            className="lg:col-span-1"
          >
            {/* new task form */}
            <div className="bg-neutral-900 border border-neutral-700 rounded-xl p-4 flex flex-col gap-3 text-sm">
              <div className="flex flex-col gap-1">
                <label className="text-neutral-400 text-[11px] uppercase tracking-wider">
                  Task / Feature
                </label>
                <input
                  className="bg-neutral-800 border border-neutral-600 rounded-lg px-3 py-2 text-white text-sm"
                  placeholder="ex: Add sprint animation to Killer"
                  value={newTaskText}
                  onChange={(e) => setNewTaskText(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-neutral-400 text-[11px] uppercase tracking-wider">
                  Tag
                </label>
                <select
                  className="bg-neutral-800 border border-neutral-600 rounded-lg px-3 py-2 text-white text-sm"
                  value={newTaskTag}
                  onChange={(e) => setNewTaskTag(e.target.value)}
                >
                  <option value="feature">Feature</option>
                  <option value="bug">Bug</option>
                  <option value="polish">Polish</option>
                </select>
              </div>

              <button
                onClick={addTask}
                className="w-full bg-white text-neutral-900 font-semibold py-2 rounded-lg hover:bg-neutral-200 transition text-sm"
              >
                + Add Task
              </button>
              <p className="text-[10px] text-neutral-500 leading-snug">
                Tasks save to this browser automatically. No account needed.
              </p>
            </div>

            {/* task list */}
            <ul className="mt-4 flex flex-col gap-3 text-sm max-h-[320px] overflow-y-auto pr-2">
              {tasks.length === 0 && (
                <li className="text-neutral-600 text-center text-xs py-6 border border-dashed border-neutral-700 rounded-xl">
                  No tasks yet.
                </li>
              )}

              {tasks.map((t) => (
                <li
                  key={t.id}
                  className="bg-neutral-900 border border-neutral-700 rounded-xl p-3 flex flex-col gap-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-col">
                      <div className="text-white font-medium leading-snug break-words">
                        {t.text}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Pill color={t.tag}>{t.tag}</Pill>
                        <Pill>{t.status}</Pill>
                      </div>
                    </div>
                    <button
                      className="text-[10px] text-neutral-500 hover:text-rose-400 transition"
                      onClick={() => removeTask(t.id)}
                    >
                      ✕
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 text-[10px] text-neutral-300">
                    <button
                      className="px-2 py-1 rounded-md border border-neutral-600 bg-neutral-800 hover:bg-neutral-700 transition"
                      onClick={() => updateTaskStatus(t.id, "todo")}
                    >
                      To-Do
                    </button>
                    <button
                      className="px-2 py-1 rounded-md border border-neutral-600 bg-neutral-800 hover:bg-neutral-700 transition"
                      onClick={() => updateTaskStatus(t.id, "doing")}
                    >
                      Doing
                    </button>
                    <button
                      className="px-2 py-1 rounded-md border border-neutral-600 bg-neutral-800 hover:bg-neutral-700 transition"
                      onClick={() => updateTaskStatus(t.id, "done")}
                    >
                      Done ✅
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </Card>

          {/* COLUMN 2: FEEDBACK */}
          <Card
            title="Playtest Feedback"
            subtitle="Log bugs / pain points from testers during playtests."
            className="lg:col-span-1"
          >
            {/* new feedback form */}
            <div className="bg-neutral-900 border border-neutral-700 rounded-xl p-4 flex flex-col gap-3 text-sm">
              <div className="flex flex-col gap-1">
                <label className="text-neutral-400 text-[11px] uppercase tracking-wider">
                  Tester Name
                </label>
                <input
                  className="bg-neutral-800 border border-neutral-600 rounded-lg px-3 py-2 text-white text-sm"
                  placeholder="ex: Razy / playtester #12"
                  value={testerName}
                  onChange={(e) => setTesterName(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-neutral-400 text-[11px] uppercase tracking-wider">
                  What happened?
                </label>
                <textarea
                  className="bg-neutral-800 border border-neutral-600 rounded-lg px-3 py-2 text-white text-sm min-h-[70px]"
                  placeholder="ex: Got stuck in gate collider in castle map when sprinting sideways"
                  value={testerNote}
                  onChange={(e) => setTesterNote(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-neutral-400 text-[11px] uppercase tracking-wider">
                  Severity
                </label>
                <select
                  className="bg-neutral-800 border border-neutral-600 rounded-lg px-3 py-2 text-white text-sm"
                  value={testerSeverity}
                  onChange={(e) => setTesterSeverity(e.target.value)}
                >
                  <option value="low">low (annoying)</option>
                  <option value="med">med (hurts gameplay)</option>
                  <option value="high">high (game breaking)</option>
                </select>
              </div>

              <button
                onClick={addFeedback}
                className="w-full bg-white text-neutral-900 font-semibold py-2 rounded-lg hover:bg-neutral-200 transition text-sm"
              >
                + Add Feedback
              </button>
              <p className="text-[10px] text-neutral-500 leading-snug">
                Saves in this browser. Copy/paste top issues into your patch
                notes.
              </p>
            </div>

            {/* feedback list */}
            <ul className="mt-4 flex flex-col gap-3 text-sm max-h-[320px] overflow-y-auto pr-2">
              {feedbackList.length === 0 && (
                <li className="text-neutral-600 text-center text-xs py-6 border border-dashed border-neutral-700 rounded-xl">
                  No feedback logged.
                </li>
              )}

              {feedbackList.map((f) => (
                <li
                  key={f.id}
                  className="bg-neutral-900 border border-neutral-700 rounded-xl p-3 flex flex-col gap-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 text-[11px] text-neutral-400">
                        <span className="font-medium text-white">
                          {f.tester}
                        </span>
                        <Pill color="sev">{f.severity} sev</Pill>
                      </div>
                      <div className="text-white text-sm leading-snug break-words mt-1">
                        {f.note}
                      </div>
                    </div>
                    <button
                      className="text-[10px] text-neutral-500 hover:text-rose-400 transition"
                      onClick={() => removeFeedback(f.id)}
                    >
                      ✕
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </Card>

          {/* COLUMN 3: CHECKLIST */}
          <Card
            title="Release Checklist"
            subtitle="Run this before you push an update or ship a patch."
            className="lg:col-span-1"
          >
            <div className="flex flex-col gap-4 text-sm">
              <label className="flex items-start gap-3 bg-neutral-900 border border-neutral-700 rounded-xl p-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-1 accent-white"
                  checked={checkReleaseNotes}
                  onChange={(e) => setCheckReleaseNotes(e.target.checked)}
                />
                <div className="flex flex-col">
                  <div className="text-white font-medium leading-tight">
                    Patch Notes Written
                  </div>
                  <div className="text-[11px] text-neutral-400 leading-snug">
                    Bullet list of changes, fixes, known issues.
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 bg-neutral-900 border border-neutral-700 rounded-xl p-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-1 accent-white"
                  checked={checkIconScreenshots}
                  onChange={(e) => setCheckIconScreenshots(e.target.checked)}
                />
                <div className="flex flex-col">
                  <div className="text-white font-medium leading-tight">
                    Store Icon / Screenshots Updated
                  </div>
                  <div className="text-[11px] text-neutral-400 leading-snug">
                    Thumbnail, game icon, promo images match new build.
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 bg-neutral-900 border border-neutral-700 rounded-xl p-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-1 accent-white"
                  checked={checkMonetizationPass}
                  onChange={(e) => setCheckMonetizationPass(e.target.checked)}
                />
                <div className="flex flex-col">
                  <div className="text-white font-medium leading-tight">
                    Monetization Pass
                  </div>
                  <div className="text-[11px] text-neutral-400 leading-snug">
                    Gamepasses / devproducts still work, no paywall bugs.
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 bg-neutral-900 border border-neutral-700 rounded-xl p-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-1 accent-white"
                  checked={checkQAPlaytest}
                  onChange={(e) => setCheckQAPlaytest(e.target.checked)}
                />
                <div className="flex flex-col">
                  <div className="text-white font-medium leading-tight">
                    QA / Final Playtest
                  </div>
                  <div className="text-[11px] text-neutral-400 leading-snug">
                    You (or a friend) actually ran through main loop with no admin powers.
                  </div>
                </div>
              </label>

              <div className="text-[10px] text-neutral-500 leading-snug text-center">
                All of this is saved locally only. Team version = paid.
              </div>
            </div>

            {/* upsell box */}
            <div className="bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/30 rounded-xl p-4 mt-6 text-center shadow-[0_0_20px_rgba(251,191,36,0.15)]">
              <div className="text-amber-400 text-[11px] font-semibold mb-1">
                COMING SOON
              </div>
              <div className="text-white text-sm font-semibold">
                Team Dashboard & Email Reminders
              </div>
              <div className="text-[11px] text-neutral-400 leading-snug mt-1">
                Invite 1-3 collaborators, assign tasks, get pre-release
                reminder emails.
              </div>
              <button className="mt-3 bg-amber-400 text-neutral-900 font-semibold py-2 px-4 rounded-xl text-[12px] hover:bg-amber-300 transition w-full">
                Get Early Access ($5/mo)
              </button>
              <div className="text-[10px] text-neutral-500 mt-2">
                instant access • cancel anytime
              </div>
            </div>
          </Card>
        </div>

        {/* FOOTER */}
        <footer className="text-center text-[11px] text-neutral-600 pb-10">
          <div>dev build tracker • local beta</div>
          <div className="mt-1 text-neutral-500">
            © {new Date().getFullYear()} Hackilo
          </div>
        </footer>
      </div>
    </main>
  );
}
