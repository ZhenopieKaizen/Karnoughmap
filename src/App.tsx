import { useEffect, useState } from "react";
import KMap from "./KMap";
import {
  Variables,
  bits,
  expressionGroups,
  makeProblem,
  normalizeExpression,
  pretty,
  simplify,
  validateGroup,
} from "./logic";
type Page = "home" | "learn" | "practice" | "quiz" | "circuits" | "progress";
type Progress = {
  attempted: number;
  correct: number;
  streak: number;
  best: number;
  topics: string[];
};
const initial: Progress = {
  attempted: 0,
  correct: 0,
  streak: 0,
  best: 0,
  topics: [],
};

export default function App() {
  const [page, setPage] = useState<Page>("home"),
    [dark, setDark] = useState(() => localStorage.getItem("theme") === "dark"),
    [beginner, setBeginner] = useState(
      () => localStorage.getItem("beginner") !== "false",
    );
  const [progress, setProgress] = useState<Progress>(() => {
    try {
      return JSON.parse(localStorage.getItem("progress") || "null") || initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);
  useEffect(
    () => localStorage.setItem("beginner", String(beginner)),
    [beginner],
  );
  useEffect(
    () => localStorage.setItem("progress", JSON.stringify(progress)),
    [progress],
  );
  const nav = (p: Page) => (
    <button
      className={page === p ? "nav active" : "nav"}
      onClick={() => setPage(p)}
    >
      {p[0].toUpperCase() + p.slice(1)}
    </button>
  );
  return (
    <>
      <header>
        <button className="brand" onClick={() => setPage("home")}>
          <span>K</span> K-Map Practice Lab
        </button>
        <nav>
          {nav("home")}
          {nav("learn")}
          {nav("practice")}
          {nav("quiz")}
          {nav("circuits")}
          {nav("progress")}
        </nav>
        <div className="settings">
          <label>
            <input
              type="checkbox"
              checked={beginner}
              onChange={(e) => setBeginner(e.target.checked)}
            />{" "}
            Beginner
          </label>
          <button
            className="icon"
            onClick={() => setDark(!dark)}
            aria-label="Toggle theme"
          >
            {dark ? "☀" : "☾"}
          </button>
        </div>
      </header>
      <main>
        {page === "home" ? (
          <Home go={setPage} progress={progress} />
        ) : page === "learn" ? (
          <Learn beginner={beginner} />
        ) : page === "practice" ? (
          <Practice beginner={beginner} update={setProgress} />
        ) : page === "quiz" ? (
          <Quiz update={setProgress} />
        ) : page === "circuits" ? (
          <Circuits />
        ) : (
          <ProgressView p={progress} />
        )}
      </main>
      <footer>Learn one cell at a time · Progress stays on this device</footer>
    </>
  );
}
function Home({ go, progress }: { go: (p: Page) => void; progress: Progress }) {
  const topics = [
    "Binary & Truth Tables",
    "Boolean Expressions",
    "Minterms",
    "2-Variable K-Map",
    "3-Variable K-Map",
    "4-Variable K-Map",
    "K-Map Grouping",
    "Simplification",
  ];
  return (
    <>
      <section className="hero">
        <div>
          <span className="eyebrow">
            COMBINATIONAL LOGIC · BEGINNER FRIENDLY
          </span>
          <h1>
            Make Boolean logic
            <br />
            <em>click.</em>
          </h1>
          <p>
            Learn the pattern, place the 1s, and simplify with confidence. Short
            lessons meet hands-on practice.
          </p>
          <div className="actions">
            <button className="primary" onClick={() => go("practice")}>
              {progress.attempted ? "Continue practice" : "Start practicing"} →
            </button>
            <button onClick={() => go("learn")}>Browse lessons</button>
          </div>
        </div>
        <div className="demo">
          <div className="demo-head">
            <span>YOUR NEXT MAP</span>
            <span className="pill">3 variables</span>
          </div>
          <div className="mini-map">
            {[
              "",
              "00",
              "01",
              "11",
              "10",
              "0",
              "0",
              "1",
              "1",
              "0",
              "1",
              "1",
              "1",
              "0",
              "1",
            ].map((x, i) => (
              <i
                key={i}
                className={
                  i > 5 && ["1", "2", "3", "7", "8", "10"].includes(String(i))
                    ? "on"
                    : ""
                }
              >
                {x}
              </i>
            ))}
          </div>
          <p>Adjacent cells differ by one bit.</p>
        </div>
      </section>
      <section>
        <div className="section-title">
          <div>
            <span className="eyebrow">LEARNING PATH</span>
            <h2>From bits to minimal expressions</h2>
          </div>
          <button onClick={() => go("learn")}>See all lessons →</button>
        </div>
        <div className="topic-grid">
          {topics.map((t, i) => (
            <button
              className="topic"
              key={t}
              onClick={() => go(i < 3 ? "learn" : "practice")}
            >
              <b>{String(i + 1).padStart(2, "0")}</b>
              <span>{t}</span>
              <small>
                {i < 3 ? "Foundation" : i < 6 ? "Practice" : "Mastery"} ·{" "}
                {(i % 3) + 3} min
              </small>
            </button>
          ))}
        </div>
      </section>
      <section className="stats">
        <div>
          <b>{progress.attempted}</b>
          <span>Problems attempted</span>
        </div>
        <div>
          <b>
            {progress.attempted
              ? Math.round((progress.correct / progress.attempted) * 100)
              : 0}
            %
          </b>
          <span>Accuracy</span>
        </div>
        <div>
          <b>{progress.streak}</b>
          <span>Current streak</span>
        </div>
      </section>
    </>
  );
}
function Learn({ beginner }: { beginner: boolean }) {
  const [orientation, setOrientation] = useState<"wide" | "tall">("wide");
  return (
    <>
      <div className="page-head">
        <span className="eyebrow">THE ESSENTIALS</span>
        <h1>Learn Karnaugh maps</h1>
        <p>Small ideas, visual examples, no mystery.</p>
      </div>
      <div className="lesson-list">
        <Lesson n="01" title="Inputs, outputs & truth tables">
          <p>
            <b>A, B, C</b> are inputs. <b>F</b> is the output. Sometimes F is
            given; if a Boolean function or circuit is given, calculate F for
            every input row.
          </p>
          <div className="formula">
            A B C │ F<br />0 0 1 │ 1
          </div>
        </Lesson>
        <Lesson n="02" title="Binary place values">
          <p>
            Each position has a weight. For 2 bits: <b>2, 1</b>. For 3:{" "}
            <b>4, 2, 1</b>. For 4: <b>8, 4, 2, 1</b>.
          </p>
          <div className="formula accent">
            101₂ = 1(4) + 0(2) + 1(1) = <b>5</b>
          </div>
        </Lesson>
        <Lesson n="03" title="Minterms">
          <p>
            A minterm is the decimal address of a truth-table row: 000 = m0, 001
            = m1, …, 111 = m7.
          </p>
          <div className="formula">
            F = 1 at 001, 011, 100, 101, 110
            <br />
            <b>F = Σm(1,3,4,5,6)</b>
          </div>
        </Lesson>
        <Lesson n="04" title="Why Gray code?">
          <p>
            K-maps use <b>00, 01, 11, 10</b>. Neighbors change one bit: 01 → 11
            changes only the first bit. Binary order would put 01 beside 10,
            where two bits change.
          </p>
          <div className="gray-row">
            <i>00</i>
            <i>01</i>
            <i>11</i>
            <i>10</i>
          </div>
        </Lesson>
        <Lesson n="05" title="Two valid 3-variable layouts">
          <div className="toggle">
            <button
              className={orientation === "wide" ? "active" : ""}
              onClick={() => setOrientation("wide")}
            >
              AB / C
            </button>
            <button
              className={orientation === "tall" ? "active" : ""}
              onClick={() => setOrientation("tall")}
            >
              A / BC
            </button>
          </div>
          <KMap
            count={3}
            orientation={orientation}
            values={[0, 1, 0, 1, 1, 1, 1, 0]}
            showMinterms={beginner}
          />
          <p>The shape changes, but every minterm keeps the same value.</p>
        </Lesson>
        <Lesson n="06" title="Grouping & simplifying">
          <ul>
            <li>Groups contain 1, 2, 4, 8… cells and must be rectangles.</li>
            <li>Use the largest groups; overlap is allowed.</li>
            <li>Edges wrap, so corners can be adjacent.</li>
            <li>
              If a variable changes, remove it. Keep 1 normally and write 0
              complemented.
            </li>
          </ul>
          <div className="rule">
            <b>A changes → remove A</b>
            <b>B stays 1 → B</b>
            <b>C stays 0 → C'</b>
            <span>Result: BC' · {pretty("BC'")}</span>
          </div>
        </Lesson>
      </div>
    </>
  );
}
function Lesson({
  n,
  title,
  children,
}: {
  n: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <article className="lesson">
      <div className="lesson-num">{n}</div>
      <div>
        <h2>{title}</h2>
        {children}
      </div>
    </article>
  );
}

function Practice({
  beginner,
  update,
}: {
  beginner: boolean;
  update: React.Dispatch<React.SetStateAction<Progress>>;
}) {
  const [count, setCount] = useState<Variables>(3),
    [type, setType] = useState<
      "truth" | "minterms" | "simplify" | "group" | "gray" | "expanded"
    >("truth"),
    [orientation, setOrientation] = useState<"wide" | "tall">("wide");
  const [problem, setProblem] = useState(() => makeProblem(3, "truth")),
    [values, setValues] = useState<(0 | 1 | null)[]>(Array(8).fill(null)),
    [status, setStatus] = useState<"idle" | "checked">("idle"),
    [message, setMessage] = useState(
      "Fill every cell, then check your answer.",
    ),
    [showM, setShowM] = useState(beginner),
    [selected, setSelected] = useState<number[]>([]),
    [groups, setGroups] = useState<{ cells: number[]; term: string }[]>([]),
    [expr, setExpr] = useState("");
  const answer = simplify(problem.minterms, count);
  const newProblem = (c = count, t = type) => {
    const mapped = t === "minterms" ? "minterms" : "truth";
    const nextProblem = makeProblem(c, mapped);
    setProblem(nextProblem);
    setValues(
      t === "simplify"
        ? Array.from({ length: 2 ** c }, (_, i) =>
            nextProblem.minterms.includes(i) ? 1 : 0,
          )
        : Array(2 ** c).fill(null),
    );
    setStatus("idle");
    setSelected([]);
    setGroups([]);
    setExpr("");
    setMessage(
      t === "group"
        ? "Select neighboring 1-cells, then create a group."
        : "Work through the problem, then check your answer.",
    );
  };
  useEffect(() => {
    newProblem(count, type);
  }, [count, type]);
  const record = (correct: boolean) =>
    update((p) => ({
      attempted: p.attempted + 1,
      correct: p.correct + (correct ? 1 : 0),
      streak: correct ? p.streak + 1 : 0,
      best: Math.max(p.best, correct ? p.streak + 1 : 0),
      topics: [...new Set([...p.topics, type])],
    }));
  const click = (n: number) => {
    if (type === "group") {
      setSelected((s) =>
        s.includes(n) ? s.filter((x) => x !== n) : [...s, n],
      );
      return;
    }
    if (type === "simplify") {
      const nextValue = values[n] === 1 ? 0 : 1;
      setValues((current) => {
        const next = [...current];
        next[n] = nextValue;
        return next;
      });
      setProblem((current) => ({
        ...current,
        minterms:
          nextValue === 1
            ? [...current.minterms.filter((m) => m !== n), n].sort(
                (a, b) => a - b,
              )
            : current.minterms.filter((m) => m !== n),
      }));
      setExpr("");
      setMessage(
        `K-map cell m${n} changed to ${nextValue}. Enter the simplified expression for this custom map.`,
      );
      return;
    }
    setValues((v) => {
      const x = [...v];
      x[n] = x[n] === null ? 0 : x[n] === 0 ? 1 : null;
      return x;
    });
    setStatus("idle");
  };
  const checkMap = () => {
    const ok = values.every(
      (v, i) => v === (problem.minterms.includes(i) ? 1 : 0),
    );
    setStatus("checked");
    setMessage(
      ok
        ? "Excellent — every minterm is in its Gray-code position."
        : `Not quite. ${values.filter((v) => v === null).length ? "Some cells are still blank. " : "Red cells do not match the truth table."}Use the row bits to find each minterm.`,
    );
    record(ok);
  };
  const createGroup = () => {
    const r = validateGroup(selected, count, problem.minterms, orientation);
    setMessage(r.message);
    if (r.ok) {
      setGroups((g) => [...g, { cells: selected, term: r.term! }]);
      setSelected([]);
    }
  };
  const checkExpr = () => {
    const ok = normalizeExpression(expr) === normalizeExpression(answer);
    setMessage(
      ok
        ? `Correct! F = ${answer} (${pretty(answer)})`
        : `That is not the minimal expression yet. Check which variables stay constant inside each largest group.`,
    );
    record(ok);
  };
  const displayValues =
    type === "group"
      ? (Array.from({ length: 2 ** count }, (_, i) =>
          problem.minterms.includes(i) ? 1 : 0,
        ) as (0 | 1)[])
      : values;
  return (
    <>
      <div className="page-head compact">
        <span className="eyebrow">PRACTICE WORKSPACE</span>
        <h1>Build the pattern</h1>
      </div>
      <div className="practice-layout">
        <aside>
          <label>
            Variables
            <select
              value={count}
              onChange={(e) => setCount(Number(e.target.value) as Variables)}
            >
              <option value="2">2 variables</option>
              <option value="3">3 variables</option>
              <option value="4">4 variables</option>
            </select>
          </label>
          <label>
            Problem type
            <select
              value={type}
              onChange={(e) => setType(e.target.value as typeof type)}
            >
              <option value="truth">Truth table → K-map</option>
              <option value="minterms">Minterms → K-map</option>
              <option value="simplify">K-map → expression</option>
              <option value="group">Identify grouping</option>
              <option value="gray">Gray code ordering</option>
              <option value="expanded">
                Expanded: map → groups → expression
              </option>
            </select>
          </label>
          {count === 3 && (
            <div className="toggle">
              <button
                className={orientation === "wide" ? "active" : ""}
                onClick={() => setOrientation("wide")}
              >
                AB / C
              </button>
              <button
                className={orientation === "tall" ? "active" : ""}
                onClick={() => setOrientation("tall")}
              >
                A / BC
              </button>
            </div>
          )}
          <label className="check">
            <input
              type="checkbox"
              checked={showM}
              onChange={(e) => setShowM(e.target.checked)}
            />{" "}
            Show minterm numbers
          </label>
          <button onClick={() => newProblem()}>↻ New problem</button>
        </aside>
        <section className="workspace">
          {type === "gray" ? (
            <GrayExercise onRecord={record} />
          ) : type === "expanded" ? (
            <ExpandedQuiz
              key={problem.id}
              problem={problem}
              count={count}
              orientation={orientation}
              showMinterms={showM}
              duration={0}
              update={update}
              onExit={() => newProblem()}
              practiceMode
            />
          ) : (
            <>
              <div className="prompt">
                <span className="pill">{count} variables</span>
                <h2>
                  {type === "truth"
                    ? "Transfer the output column into the K-map"
                    : type === "minterms"
                      ? "Place a 1 in every listed minterm"
                      : type === "simplify"
                        ? "Find the minimal SOP expression"
                        : "Create valid groups of 1s"}
                </h2>
              </div>
              <div className="edit-instruction" role="note">
                <div>
                  <b>
                    {type === "truth"
                      ? "The truth table and K-map are editable"
                      : type === "simplify"
                        ? "This K-map is editable"
                        : type === "group"
                          ? "Select cells to build a group"
                          : "The K-map is editable"}
                  </b>
                  <small>
                    {type === "truth"
                      ? "Click an F value to change 0 ↔ 1. Click a K-map cell to cycle blank → 0 → 1."
                      : type === "simplify"
                        ? "Click any K-map cell to change 0 ↔ 1 and create your own expression problem."
                        : type === "group"
                          ? "Click 1-cells to select or deselect them, then choose Create group."
                          : "Click a K-map cell to cycle blank → 0 → 1."}
                  </small>
                </div>
              </div>
              <div
                className={
                  "exercise-stage " + (type === "truth" ? "truth-stage" : "")
                }
              >
                {type === "truth" ? (
                  <TruthTable
                    count={count}
                    mins={problem.minterms}
                    editable
                    onToggle={(n) => {
                      setProblem((current) => ({
                        ...current,
                        minterms: current.minterms.includes(n)
                          ? current.minterms.filter((m) => m !== n)
                          : [...current.minterms, n].sort((a, b) => a - b),
                      }));
                      setValues(Array(2 ** count).fill(null));
                      setStatus("idle");
                      setMessage(
                        `Output F for m${n} changed. Fill the K-map for your customized table.`,
                      );
                    }}
                  />
                ) : type === "minterms" ? (
                  <div className="formula">
                    F = Σm({problem.minterms.join(", ")})
                  </div>
                ) : null}
                <KMap
                  count={count}
                  orientation={orientation}
                  values={displayValues}
                  answer={problem.minterms}
                  status={status}
                  selected={selected}
                  groups={groups.map((group) => group.cells)}
                  onCell={click}
                  showMinterms={showM}
                />
              </div>
              {groups.length > 0 && (
                <div className="group-chips">
                  {groups.map((g, i) => (
                    <span key={i}>
                      Group {i + 1}: {g.term} · m(
                      {g.cells.sort((a, b) => a - b).join(",")})
                    </span>
                  ))}
                </div>
              )}
              {type === "simplify" && (
                <div className="expression">
                  <label htmlFor="expression-input">Your expression</label>
                  <div className="expression-input-row">
                    <span aria-hidden="true">F =</span>
                    <input
                      id="expression-input"
                      value={expr}
                      onChange={(e) => setExpr(e.target.value)}
                      placeholder="e.g. AB' + BC'"
                    />
                  </div>
                  <div
                    className="expression-keypad"
                    aria-label="Boolean expression keypad"
                  >
                    {"ABCD"
                      .slice(0, count)
                      .split("")
                      .map((variable) => (
                        <span key={variable}>
                          <button
                            onClick={() => setExpr((text) => text + variable)}
                          >
                            {variable}
                          </button>
                          <button
                            onClick={() =>
                              setExpr((text) => text + variable + "'")
                            }
                            title={`NOT ${variable}`}
                            aria-label={`Insert NOT ${variable}`}
                          >
                            {variable}′ <small>NOT</small>
                          </button>
                        </span>
                      ))}
                    <button onClick={() => setExpr((text) => text + " + ")}>
                      + OR
                    </button>
                    <button
                      onClick={() => setExpr((text) => text.slice(0, -1))}
                    >
                      ⌫
                    </button>
                  </div>
                  <small>Rendered: {pretty(expr) || "—"}</small>
                  <small>Accepted NOT forms: B', B′, B̅, or !B</small>
                </div>
              )}
              <div
                className={
                  "feedback " +
                  (message.startsWith("Correct") ||
                  message.startsWith("Excellent") ||
                  message.startsWith("Valid")
                    ? "success"
                    : "")
                }
              >
                <b>{message}</b>
                {beginner && type !== "simplify" && (
                  <span>
                    Hint: each cell’s minterm number is its binary input read as
                    decimal.
                  </span>
                )}
              </div>
              <div className="actions">
                <button
                  onClick={() =>
                    setMessage(
                      type === "group"
                        ? "Select a rectangle containing only 1s. It may wrap across opposite edges."
                        : `The 1-cells are minterms ${problem.minterms.join(", ")}.`,
                    )
                  }
                >
                  Hint
                </button>
                <button
                  onClick={() => {
                    setValues(
                      Array(2 ** count).fill(type === "simplify" ? 0 : null),
                    );
                    if (type === "simplify") {
                      setProblem((current) => ({ ...current, minterms: [] }));
                    }
                    setSelected([]);
                    setGroups([]);
                    setExpr("");
                    setStatus("idle");
                    setMessage(
                      "All answers cleared. You can start this problem again.",
                    );
                  }}
                >
                  Clear all answers
                </button>
                {type === "group" ? (
                  <button className="primary" onClick={createGroup}>
                    Create group
                  </button>
                ) : type === "simplify" ? (
                  <button className="primary" onClick={checkExpr}>
                    Check expression
                  </button>
                ) : (
                  <button className="primary" onClick={checkMap}>
                    Check answer
                  </button>
                )}
                <button
                  onClick={() => {
                    if (type === "simplify") setExpr(answer);
                    else {
                      setValues(
                        Array.from({ length: 2 ** count }, (_, i) =>
                          problem.minterms.includes(i) ? 1 : 0,
                        ),
                      );
                      if (type === "group") {
                        setGroups(
                          expressionGroups(answer, problem.minterms, count),
                        );
                        setSelected([]);
                      }
                    }
                    setMessage(
                      `Solution shown. The simplified expression is ${answer}.`,
                    );
                  }}
                >
                  Show solution
                </button>
              </div>
            </>
          )}
        </section>
      </div>
    </>
  );
}
function Quiz({
  update,
}: {
  update: React.Dispatch<React.SetStateAction<Progress>>;
}) {
  const total = 5;
  const [started, setStarted] = useState(false);
  const [variableCount, setVariableCount] = useState<Variables>(3);
  const [quizType, setQuizType] = useState<
    "truth" | "minterms" | "simplify" | "expanded"
  >("truth");
  const [duration, setDuration] = useState(2);
  const [orientation, setOrientation] = useState<"wide" | "tall">("wide");
  const [showQuizMinterms, setShowQuizMinterms] = useState(true);
  const [questions, setQuestions] = useState<ReturnType<typeof makeProblem>[]>(
    [],
  );
  const [index, setIndex] = useState(0),
    [values, setValues] = useState<(0 | 1 | null)[]>(Array(8).fill(null)),
    [expression, setExpression] = useState(""),
    [seconds, setSeconds] = useState(120),
    [finished, setFinished] = useState(false);
  const [results, setResults] = useState<
    {
      correct: boolean;
      wrong: number[];
      given: (0 | 1 | null)[];
      entered?: string;
    }[]
  >([]);
  useEffect(() => {
    if (!started || finished || quizType === "expanded") return;
    const timer = window.setInterval(
      () =>
        setSeconds((s) => {
          if (s <= 1) {
            setFinished(true);
            return 0;
          }
          return s - 1;
        }),
      1000,
    );
    return () => window.clearInterval(timer);
  }, [started, finished]);
  const initialValues = (q: ReturnType<typeof makeProblem>) =>
    quizType === "simplify"
      ? Array.from({ length: 2 ** variableCount }, (_, n) =>
          q.minterms.includes(n) ? 1 : 0,
        )
      : Array(2 ** variableCount).fill(null);
  const startQuiz = () => {
    const next = Array.from({ length: total }, () =>
      makeProblem(
        variableCount,
        quizType === "minterms" ? "minterms" : "truth",
      ),
    );
    setQuestions(next);
    setIndex(0);
    setValues(initialValues(next[0]));
    setExpression("");
    setResults([]);
    setSeconds(duration * 60);
    setFinished(false);
    setStarted(true);
  };
  const click = (n: number) =>
    setValues((v) => {
      const next = [...v];
      next[n] = next[n] === null ? 0 : next[n] === 0 ? 1 : null;
      return next;
    });
  const submit = () => {
    const q = questions[index];
    const wrong =
      quizType === "simplify"
        ? []
        : values
            .map((v, n) => (v === (q.minterms.includes(n) ? 1 : 0) ? -1 : n))
            .filter((n) => n >= 0);
    const correct =
      quizType === "simplify"
        ? normalizeExpression(expression) ===
          normalizeExpression(simplify(q.minterms, variableCount))
        : !wrong.length;
    const next = [
      ...results,
      { correct, wrong, given: [...values], entered: expression },
    ];
    setResults(next);
    update((p) => ({
      ...p,
      attempted: p.attempted + 1,
      correct: p.correct + (correct ? 1 : 0),
      streak: correct ? p.streak + 1 : 0,
      best: Math.max(p.best, correct ? p.streak + 1 : 0),
      topics: [...new Set([...p.topics, "quiz"])],
    }));
    if (index === total - 1) setFinished(true);
    else {
      const nextIndex = index + 1;
      setIndex(nextIndex);
      setValues(initialValues(questions[nextIndex]));
      setExpression("");
    }
  };
  const restart = () => {
    setStarted(false);
    setFinished(false);
  };
  const score = results.filter((r) => r.correct).length;
  if (!started)
    return (
      <>
        <div className="page-head compact">
          <span className="eyebrow">QUIZ SETUP</span>
          <h1>Ready for a challenge?</h1>
          <p>
            Choose your quiz settings. The timer starts only when you press
            Start quiz.
          </p>
        </div>
        <section className="quiz-setup">
          <label>
            Variables
            <select
              value={variableCount}
              onChange={(e) =>
                setVariableCount(Number(e.target.value) as Variables)
              }
            >
              <option value="2">2 variables</option>
              <option value="3">3 variables</option>
              <option value="4">4 variables</option>
            </select>
          </label>
          <label>
            Quiz type
            <select
              value={quizType}
              onChange={(e) => setQuizType(e.target.value as typeof quizType)}
            >
              <option value="truth">Truth table → K-map</option>
              <option value="minterms">Minterms → K-map</option>
              <option value="simplify">K-map → expression</option>
              <option value="expanded">
                Expanded: map → groups → expression
              </option>
            </select>
          </label>
          <label>
            Duration
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
            >
              <option value="1">1 minute</option>
              <option value="2">2 minutes</option>
              <option value="5">5 minutes</option>
              <option value="10">10 minutes</option>
            </select>
          </label>
          {variableCount === 3 && (
            <div>
              <span className="setup-label">K-map orientation</span>
              <div className="toggle">
                <button
                  className={orientation === "wide" ? "active" : ""}
                  onClick={() => setOrientation("wide")}
                >
                  AB / C
                </button>
                <button
                  className={orientation === "tall" ? "active" : ""}
                  onClick={() => setOrientation("tall")}
                >
                  A / BC
                </button>
              </div>
            </div>
          )}
          <label className="check">
            <input
              type="checkbox"
              checked={showQuizMinterms}
              onChange={(e) => setShowQuizMinterms(e.target.checked)}
            />{" "}
            Show minterm numbers
          </label>
          <div className="quiz-ready">
            <span>
              {quizType === "expanded" ? "1 connected problem" : "5 questions"}{" "}
              · {duration} minute{duration === 1 ? "" : "s"}
            </span>
            <button className="primary" onClick={startQuiz}>
              Start quiz →
            </button>
          </div>
        </section>
      </>
    );
  if (quizType === "expanded")
    return (
      <ExpandedQuiz
        problem={questions[0]}
        count={variableCount}
        orientation={orientation}
        showMinterms={showQuizMinterms}
        duration={duration}
        update={update}
        onExit={() => setStarted(false)}
      />
    );
  if (finished)
    return (
      <>
        <div className="page-head compact">
          <span className="eyebrow">QUIZ COMPLETE</span>
          <h1>
            {score}/{total}
          </h1>
          <p>
            {score === total
              ? "Perfect score — excellent work!"
              : score >= 3
                ? "Good progress. Review the assessments below."
                : "Keep practicing. The review below shows exactly what to fix."}
          </p>
        </div>
        <section className="quiz-summary">
          <div className="quiz-score">
            <b>{Math.round((score / total) * 100)}%</b>
            <span>Final score</span>
          </div>
          <div className="assessment-list">
            {questions.map((q, i) => {
              const r = results[i];
              return (
                <article
                  className={
                    r?.correct ? "assessment correct-answer" : "assessment"
                  }
                  key={q.id}
                >
                  <div>
                    <b>Question {i + 1}</b>
                    <span>
                      {r?.correct
                        ? "✓ Correct"
                        : r
                          ? "✕ Needs review"
                          : "— Not answered"}
                    </span>
                  </div>
                  <p>
                    <strong>Final answer:</strong> 1s in m(
                    {q.minterms.join(", ")})
                  </p>
                  <p>
                    <strong>Simplified:</strong> F ={" "}
                    {simplify(q.minterms, variableCount)}
                  </p>
                  {r && !r.correct && (
                    <p className="why">
                      <strong>Assessment:</strong>{" "}
                      {quizType === "simplify"
                        ? `You entered “${r.entered || "blank"}”. Compare each term with the largest valid groups.`
                        : `Your incorrect cells were ${r.wrong.map((n) => `m${n}`).join(", ")}. ${r.wrong.map((n) => (r.given[n] === null ? `m${n} was blank` : `m${n} should be ${q.minterms.includes(n) ? 1 : 0}`)).join("; ")}.`}
                    </p>
                  )}
                  {!r && (
                    <p className="why">
                      <strong>Assessment:</strong> Time ended before this
                      question was answered.
                    </p>
                  )}
                </article>
              );
            })}
          </div>
          <button className="primary" onClick={restart}>
            Try another quiz
          </button>
        </section>
      </>
    );
  const q = questions[index];
  return (
    <>
      <div className="page-head compact">
        <span className="eyebrow">TIMED QUIZ · {variableCount} VARIABLES</span>
        <h1>Test your mapping</h1>
      </div>
      <div className="quiz-bar">
        <span>
          Question <b>{index + 1}</b> of {total}
        </span>
        <span>
          Score <b>{score}</b>
        </span>
        <span
          className={seconds <= 20 ? "timer urgent" : "timer"}
          aria-live="polite"
        >
          ◷ {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}
        </span>
      </div>
      <section className="workspace quiz-workspace">
        <div className="prompt">
          <h2>
            {quizType === "truth"
              ? "Transfer this truth table into the K-map"
              : quizType === "minterms"
                ? "Place the listed minterms into the K-map"
                : "Simplify this K-map"}
          </h2>
          <p>
            {quizType === "simplify"
              ? "Enter the minimal SOP expression."
              : "Click each cell to cycle blank → 0 → 1."}
          </p>
        </div>
        <div
          className={
            "exercise-stage " + (quizType === "truth" ? "truth-stage" : "")
          }
        >
          {quizType === "truth" ? (
            <TruthTable count={variableCount} mins={q.minterms} />
          ) : quizType === "minterms" ? (
            <div className="formula">F = Σm({q.minterms.join(", ")})</div>
          ) : null}
          <KMap
            count={variableCount}
            orientation={orientation}
            values={values}
            onCell={quizType === "simplify" ? undefined : click}
            showMinterms={showQuizMinterms}
          />
        </div>
        {quizType === "simplify" && (
          <div className="expression">
            <label htmlFor="quiz-expression">Your answer</label>
            <div className="expression-input-row">
              <span>F =</span>
              <input
                id="quiz-expression"
                value={expression}
                onChange={(e) => setExpression(e.target.value)}
                placeholder="e.g. AB' + BC'"
              />
            </div>
            <small>Rendered: {pretty(expression) || "—"}</small>
          </div>
        )}
        <div className="quiz-submit">
          <span>
            {quizType === "simplify"
              ? expression
                ? "Answer entered"
                : "Enter an answer"
              : `${values.filter((v) => v === null).length} cells blank`}
          </span>
          <div className="quiz-submit-actions">
            <button
              onClick={() =>
                quizType === "simplify"
                  ? setExpression("")
                  : setValues(Array(2 ** variableCount).fill(null))
              }
            >
              Clear all answers
            </button>
            <button className="primary" onClick={submit}>
              {index === total - 1 ? "Finish quiz" : "Submit & next"} →
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
function ExpandedQuiz({
  problem,
  count,
  orientation,
  showMinterms,
  duration,
  update,
  onExit,
  practiceMode = false,
}: {
  problem: ReturnType<typeof makeProblem>;
  count: Variables;
  orientation: "wide" | "tall";
  showMinterms: boolean;
  duration: number;
  update: React.Dispatch<React.SetStateAction<Progress>>;
  onExit: () => void;
  practiceMode?: boolean;
}) {
  const [stage, setStage] = useState<"map" | "groups" | "expression" | "done">(
    "map",
  );
  const [seconds, setSeconds] = useState(duration * 60);
  const [timedOut, setTimedOut] = useState(false);
  const [values, setValues] = useState<(0 | 1 | null)[]>(
    Array(2 ** count).fill(null),
  );
  const [selected, setSelected] = useState<number[]>([]);
  const [groups, setGroups] = useState<{ cells: number[]; term: string }[]>([]);
  const [expression, setExpression] = useState("");
  const [message, setMessage] = useState(
    "Step 1: transfer every F value into the K-map.",
  );
  const [mistakes, setMistakes] = useState<string[]>([]);
  const answer = simplify(problem.minterms, count);
  useEffect(() => {
    if (practiceMode || stage === "done" || timedOut) return;
    const timer = window.setInterval(
      () =>
        setSeconds((current) => {
          if (current <= 1) {
            setTimedOut(true);
            return 0;
          }
          return current - 1;
        }),
      1000,
    );
    return () => window.clearInterval(timer);
  }, [stage, timedOut, practiceMode]);
  const recordMistake = (text: string) => {
    setMessage(text);
    setMistakes((all) => [...all, text]);
  };
  const checkMap = () => {
    const wrong = values
      .map((v, n) => (v === (problem.minterms.includes(n) ? 1 : 0) ? -1 : n))
      .filter((n) => n >= 0);
    if (wrong.length) {
      recordMistake(
        `Map assessment: check ${wrong.map((n) => `m${n}`).join(", ")}. Each cell must match its truth-table F value.`,
      );
      return;
    }
    setStage("groups");
    setMessage(
      "Step 1 correct. Now select 1-cells and create the largest valid groups.",
    );
  };
  const createGroup = () => {
    const result = validateGroup(
      selected,
      count,
      problem.minterms,
      orientation,
    );
    if (!result.ok) {
      recordMistake(`Grouping assessment: ${result.message}`);
      return;
    }
    if (groups.some((g) => g.term === result.term)) {
      recordMistake(
        `Grouping assessment: the term ${result.term} is already represented by a group.`,
      );
      return;
    }
    setGroups((all) => [...all, { cells: [...selected], term: result.term! }]);
    setSelected([]);
    setMessage(
      `${result.message} Add any other group needed for the minimal expression.`,
    );
  };
  const checkGroups = () => {
    const groupedExpression = groups.map((g) => g.term).join(" + ");
    if (
      normalizeExpression(groupedExpression) !== normalizeExpression(answer)
    ) {
      recordMistake(
        "Grouping assessment: your groups do not yet produce the minimal expression. Cover every 1 using the largest useful groups; overlap is allowed.",
      );
      return;
    }
    setStage("expression");
    setMessage(
      "Step 2 correct. Write the Boolean expression produced by these same groups.",
    );
  };
  const finish = () => {
    if (normalizeExpression(expression) !== normalizeExpression(answer)) {
      recordMistake(
        "Expression assessment: the expression does not match your correct groups. Remove variables that change inside a group.",
      );
      return;
    }
    setStage("done");
    update((p) => ({
      ...p,
      attempted: p.attempted + 1,
      correct: p.correct + 1,
      streak: p.streak + 1,
      best: Math.max(p.best, p.streak + 1),
      topics: [...new Set([...p.topics, "expanded quiz"])],
    }));
  };
  if (stage === "done" || timedOut)
    return (
      <>
        <div className="page-head compact">
          <span className="eyebrow">
            {practiceMode
              ? "EXPANDED PRACTICE COMPLETE"
              : `EXPANDED QUIZ ${timedOut ? "ENDED" : "COMPLETE"}`}
          </span>
          <h1>{timedOut ? "Time’s up" : "3/3"}</h1>
          <p>
            {timedOut
              ? "Review the connected solution and try again."
              : `You completed the connected ${practiceMode ? "practice" : "quiz"} from truth table to final expression.`}
          </p>
        </div>
        <section className="quiz-summary">
          <div className="assessment correct-answer">
            <div>
              <b>Final connected answer</b>
              <span>{timedOut ? "Review" : "✓ Correct"}</span>
            </div>
            <p>
              <strong>K-map:</strong> 1s in m({problem.minterms.join(", ")})
            </p>
            <p>
              <strong>Groups:</strong>{" "}
              {answer
                .split("+")
                .map((x) => x.trim())
                .join(", ")}
            </p>
            <p>
              <strong>Expression:</strong> F = {answer}
            </p>
          </div>
          {mistakes.length > 0 && (
            <div className="assessment-list">
              <h2>Your assessments</h2>
              {mistakes.map((text, i) => (
                <article className="assessment" key={i}>
                  <p className="why">{text}</p>
                </article>
              ))}
            </div>
          )}
          <button className="primary" onClick={onExit}>
            {practiceMode ? "Practice another problem" : "Back to quiz setup"}
          </button>
        </section>
      </>
    );
  const fixedValues = Array.from({ length: 2 ** count }, (_, n) =>
    problem.minterms.includes(n) ? 1 : 0,
  ) as (0 | 1)[];
  return (
    <>
      {!practiceMode && (
        <div className="page-head compact">
          <span className="eyebrow">EXPANDED QUIZ · ONE CONNECTED PROBLEM</span>
          <h1>Step {stage === "map" ? 1 : stage === "groups" ? 2 : 3} of 3</h1>
        </div>
      )}
      {practiceMode && (
        <div className="prompt">
          <span className="pill">Connected practice</span>
          <h2>Step {stage === "map" ? 1 : stage === "groups" ? 2 : 3} of 3</h2>
          <p>
            Use the same problem from truth table to final expression. There is
            no timer.
          </p>
        </div>
      )}
      <div className="expanded-progress">
        <span className="complete">1. Map</span>
        <span className={stage !== "map" ? "complete" : ""}>2. Groups</span>
        <span className={stage === "expression" ? "complete" : ""}>
          3. Expression
        </span>
        {!practiceMode && (
          <b className={seconds <= 20 ? "timer urgent" : "timer"}>
            ◷ {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}
          </b>
        )}
      </div>
      <section
        className={
          practiceMode
            ? "expanded-practice-workspace"
            : "workspace quiz-workspace"
        }
      >
        <div className="feedback">
          <b>{message}</b>
        </div>
        {stage === "map" && (
          <>
            <div className="exercise-stage truth-stage">
              <TruthTable count={count} mins={problem.minterms} />
              <KMap
                count={count}
                orientation={orientation}
                values={values}
                onCell={(n) =>
                  setValues((current) => {
                    const next = [...current];
                    next[n] = next[n] === null ? 0 : next[n] === 0 ? 1 : null;
                    return next;
                  })
                }
                showMinterms={showMinterms}
              />
            </div>
            <div className="quiz-submit">
              <button onClick={() => setValues(Array(2 ** count).fill(null))}>
                Clear all answers
              </button>
              <button className="primary" onClick={checkMap}>
                Check map & continue →
              </button>
            </div>
          </>
        )}
        {stage === "groups" && (
          <>
            <KMap
              count={count}
              orientation={orientation}
              values={fixedValues}
              selected={selected}
              onCell={(n) =>
                setSelected((current) =>
                  current.includes(n)
                    ? current.filter((x) => x !== n)
                    : [...current, n],
                )
              }
              showMinterms={showMinterms}
            />
            {groups.length > 0 && (
              <div className="group-chips">
                {groups.map((g, i) => (
                  <span key={i}>
                    Group {i + 1}: {g.term} · m(
                    {g.cells.sort((a, b) => a - b).join(",")})
                  </span>
                ))}
              </div>
            )}
            <div className="quiz-submit">
              <button
                onClick={() => {
                  setSelected([]);
                  setGroups([]);
                }}
              >
                Clear groups
              </button>
              <div className="quiz-submit-actions">
                <button onClick={createGroup}>Create group</button>
                <button className="primary" onClick={checkGroups}>
                  Check groups & continue →
                </button>
              </div>
            </div>
          </>
        )}
        {stage === "expression" && (
          <>
            <KMap
              count={count}
              orientation={orientation}
              values={fixedValues}
              showMinterms={showMinterms}
            />
            <div className="group-chips">
              {groups.map((g, i) => (
                <span key={i}>{g.term}</span>
              ))}
            </div>
            <div className="expression">
              <label htmlFor="expanded-expression">Final expression</label>
              <div className="expression-input-row">
                <span>F =</span>
                <input
                  id="expanded-expression"
                  value={expression}
                  onChange={(e) => setExpression(e.target.value)}
                  placeholder="e.g. AB' + BC'"
                />
              </div>
              <small>Rendered: {pretty(expression) || "—"}</small>
            </div>
            <div className="quiz-submit">
              <button onClick={() => setExpression("")}>Clear answer</button>
              <button className="primary" onClick={finish}>
                Check final answer
              </button>
            </div>
          </>
        )}
      </section>
    </>
  );
}

function TruthTable({
  count,
  mins,
  editable = false,
  onToggle,
}: {
  count: Variables;
  mins: number[];
  editable?: boolean;
  onToggle?: (minterm: number) => void;
}) {
  const names = "ABCD".slice(0, count).split("");
  return (
    <div className="truth-wrap">
      <table className="truth">
        {editable && (
          <caption>Click any F value to customize the problem</caption>
        )}
        <thead>
          <tr>
            {names.map((name) => (
              <th key={name}>{name}</th>
            ))}
            <th className="output-head">F</th>
            <th className="minterm-head">Minterm →</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 2 ** count }, (_, n) => (
            <tr key={n}>
              {bits(n, count)
                .split("")
                .map((bit, i) => (
                  <td key={i}>{bit}</td>
                ))}
              <td className="output">
                {editable ? (
                  <button
                    className="output-toggle"
                    onClick={() => onToggle?.(n)}
                    aria-label={`Change output F for minterm ${n}, currently ${mins.includes(n) ? 1 : 0}`}
                    title={`Click to change F for m${n}`}
                  >
                    {mins.includes(n) ? 1 : 0}
                  </button>
                ) : mins.includes(n) ? (
                  1
                ) : (
                  0
                )}
              </td>
              <td className="minterm">m{n}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
function GrayExercise({ onRecord }: { onRecord: (x: boolean) => void }) {
  const [order, setOrder] = useState<string[]>(["01", "10", "00", "11"]),
    [msg, setMsg] = useState("Move the cards into Gray-code order.");
  const move = (i: number, d: number) =>
    setOrder((o) => {
      const x = [...o],
        j = i + d;
      if (j < 0 || j > 3) return o;
      [x[i], x[j]] = [x[j], x[i]];
      return x;
    });
  return (
    <>
      <div className="prompt">
        <span className="pill">Gray code</span>
        <h2>Arrange so neighbors differ by one bit</h2>
      </div>
      <div className="sort-row">
        {order.map((x, i) => (
          <div key={x}>
            <b>{x}</b>
            <button onClick={() => move(i, -1)} aria-label={`Move ${x} left`}>
              ←
            </button>
            <button onClick={() => move(i, 1)} aria-label={`Move ${x} right`}>
              →
            </button>
          </div>
        ))}
      </div>
      <div className="feedback">
        <b>{msg}</b>
      </div>
      <button
        className="primary"
        onClick={() => {
          const ok =
            order.join(",") === "00,01,11,10" ||
            order.join(",") === "10,11,01,00";
          setMsg(
            ok
              ? "Correct — each step changes exactly one bit."
              : "Try again. In 01 → 10, both bits change.",
          );
          onRecord(ok);
        }}
      >
        Check order
      </button>
    </>
  );
}
function Circuits() {
  return (
    <>
      <div className="page-head">
        <span className="eyebrow">CONNECT THE REPRESENTATIONS</span>
        <h1>From gates to a K-map</h1>
        <p>
          A circuit, expression, truth table, and K-map can all describe the
          same function.
        </p>
      </div>
      <article className="circuit-card">
        <svg
          viewBox="0 0 700 270"
          role="img"
          aria-label="A AND NOT B, and B AND NOT C, feeding an OR gate"
        >
          <defs>
            <marker
              id="arrow"
              markerWidth="8"
              markerHeight="8"
              refX="7"
              refY="4"
              orient="auto"
            >
              <path d="M0,0 L8,4 L0,8z" fill="currentColor" />
            </marker>
          </defs>
          <g fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M110 45v70h45M110 45h45" />
            <path d="M110 150v70h45M110 150h45" />
            <path d="M155 25v40a40 40 0 010 80z" />
            <path d="M155 130v40a40 40 0 010 80z" />
            <circle cx="110" cy="115" r="8" />
            <circle cx="110" cy="220" r="8" />
            <path d="M235 85h100M235 190h100" />
            <path d="M335 60q55 0 90 78q-35 78-90 78q35-78 0-156z" />
            <path d="M425 138h110" markerEnd="url(#arrow)" />
          </g>
          <g fontSize="20" fill="currentColor">
            <text x="45" y="50">
              A
            </text>
            <text x="45" y="120">
              B
            </text>
            <text x="45" y="155">
              B
            </text>
            <text x="45" y="225">
              C
            </text>
            <text x="170" y="90">
              AND
            </text>
            <text x="170" y="195">
              AND
            </text>
            <text x="355" y="145">
              OR
            </text>
            <text x="550" y="145">
              F
            </text>
          </g>
        </svg>
        <div>
          <span className="eyebrow">READ LEFT TO RIGHT</span>
          <h2>F = AB' + BC'</h2>
          <p>
            The small circles invert B and C. The two AND results are joined by
            OR. Evaluate this expression for each input row, then place the
            resulting 1s into the K-map.
          </p>
          <div className="formula">
            NOT: B' &nbsp; · &nbsp; AND: AB' &nbsp; · &nbsp; OR: AB' + BC'
          </div>
        </div>
      </article>
    </>
  );
}
function ProgressView({ p }: { p: Progress }) {
  return (
    <>
      <div className="page-head">
        <span className="eyebrow">YOUR PROGRESS</span>
        <h1>Small wins add up</h1>
      </div>
      <section className="stats large">
        <div>
          <b>{p.attempted}</b>
          <span>Attempted</span>
        </div>
        <div>
          <b>{p.correct}</b>
          <span>Correct</span>
        </div>
        <div>
          <b>
            {p.attempted ? Math.round((p.correct / p.attempted) * 100) : 0}%
          </b>
          <span>Accuracy</span>
        </div>
        <div>
          <b>{p.best}</b>
          <span>Best streak</span>
        </div>
      </section>
      <article className="progress-card">
        <h2>Topics practiced</h2>
        {p.topics.length ? (
          <div className="group-chips">
            {p.topics.map((x) => (
              <span key={x}>✓ {x}</span>
            ))}
          </div>
        ) : (
          <p>
            Complete your first practice problem to start tracking progress.
          </p>
        )}
      </article>
    </>
  );
}
