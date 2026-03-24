import { useState, useEffect, useCallback, useMemo } from "react";

// ─── Storage helpers ───
const KEYS = {
  programs: "wt-programs-v1",
  logs: "wt-logs-v1",
  adminPin: "wt-admin-pin-v1",
};

async function load(key) {
  try {
    const r = localStorage.getItem(key);
    return r ? JSON.parse(r) : null;
  } catch { return null; }
}
async function save(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { console.error(e); }
}

// ─── Default Programs ───
const DEFAULT_PROGRAMS = [
  {
    id: "beginner-1",
    level: "beginner",
    name: "기초 체력 다지기",
    description: "웨이트 트레이닝 입문자를 위한 전신 운동 프로그램",
    daysPerWeek: 3,
    days: [
      {
        dayName: "Day A — 상체 기초",
        exercises: [
          { name: "벤치프레스 (머신)", sets: 3, reps: "12", rest: "60초", note: "가벼운 무게로 시작" },
          { name: "랫풀다운", sets: 3, reps: "12", rest: "60초", note: "" },
          { name: "덤벨 숄더프레스", sets: 3, reps: "10", rest: "60초", note: "앉아서 실시" },
          { name: "덤벨 컬", sets: 2, reps: "12", rest: "45초", note: "" },
          { name: "트라이셉 푸시다운", sets: 2, reps: "12", rest: "45초", note: "" },
        ],
      },
      {
        dayName: "Day B — 하체 기초",
        exercises: [
          { name: "레그프레스", sets: 3, reps: "12", rest: "90초", note: "" },
          { name: "레그컬", sets: 3, reps: "12", rest: "60초", note: "" },
          { name: "레그익스텐션", sets: 3, reps: "12", rest: "60초", note: "" },
          { name: "카프레이즈", sets: 3, reps: "15", rest: "45초", note: "" },
          { name: "플랭크", sets: 3, reps: "30초", rest: "30초", note: "" },
        ],
      },
      {
        dayName: "Day C — 전신",
        exercises: [
          { name: "고블릿 스쿼트", sets: 3, reps: "10", rest: "60초", note: "덤벨 사용" },
          { name: "덤벨 로우", sets: 3, reps: "10", rest: "60초", note: "한 팔씩" },
          { name: "푸시업", sets: 3, reps: "최대", rest: "60초", note: "" },
          { name: "덤벨 런지", sets: 2, reps: "10 (각)", rest: "60초", note: "" },
          { name: "크런치", sets: 3, reps: "15", rest: "30초", note: "" },
        ],
      },
    ],
  },
  {
    id: "intermediate-1",
    level: "intermediate",
    name: "분할 근비대 프로그램",
    description: "근비대를 목표로 하는 중급자 4분할 프로그램",
    daysPerWeek: 4,
    days: [
      {
        dayName: "가슴 & 삼두",
        exercises: [
          { name: "바벨 벤치프레스", sets: 4, reps: "8-10", rest: "90초", note: "" },
          { name: "인클라인 덤벨프레스", sets: 4, reps: "10", rest: "75초", note: "30도" },
          { name: "케이블 플라이", sets: 3, reps: "12", rest: "60초", note: "" },
          { name: "딥스", sets: 3, reps: "최대", rest: "60초", note: "" },
          { name: "오버헤드 트라이셉 익스텐션", sets: 3, reps: "12", rest: "60초", note: "" },
        ],
      },
      {
        dayName: "등 & 이두",
        exercises: [
          { name: "데드리프트", sets: 4, reps: "6-8", rest: "120초", note: "컨벤셔널" },
          { name: "바벨 로우", sets: 4, reps: "8-10", rest: "90초", note: "" },
          { name: "풀업", sets: 3, reps: "최대", rest: "90초", note: "" },
          { name: "시티드 케이블 로우", sets: 3, reps: "12", rest: "60초", note: "" },
          { name: "바벨 컬", sets: 3, reps: "10", rest: "60초", note: "" },
          { name: "해머 컬", sets: 2, reps: "12", rest: "45초", note: "" },
        ],
      },
      {
        dayName: "어깨 & 복근",
        exercises: [
          { name: "오버헤드 프레스", sets: 4, reps: "8", rest: "90초", note: "" },
          { name: "사이드 레터럴 레이즈", sets: 4, reps: "15", rest: "45초", note: "" },
          { name: "페이스풀", sets: 3, reps: "15", rest: "45초", note: "" },
          { name: "리어 델트 플라이", sets: 3, reps: "15", rest: "45초", note: "" },
          { name: "행잉 레그레이즈", sets: 3, reps: "12", rest: "60초", note: "" },
          { name: "케이블 크런치", sets: 3, reps: "15", rest: "45초", note: "" },
        ],
      },
      {
        dayName: "하체",
        exercises: [
          { name: "바벨 스쿼트", sets: 4, reps: "8", rest: "120초", note: "" },
          { name: "루마니안 데드리프트", sets: 4, reps: "10", rest: "90초", note: "" },
          { name: "불가리안 스플릿 스쿼트", sets: 3, reps: "10 (각)", rest: "60초", note: "" },
          { name: "레그프레스", sets: 3, reps: "12", rest: "90초", note: "" },
          { name: "카프레이즈", sets: 4, reps: "15", rest: "45초", note: "" },
        ],
      },
    ],
  },
  {
    id: "advanced-1",
    level: "advanced",
    name: "파워빌딩 고급 프로그램",
    description: "근력 + 근비대를 동시에 추구하는 고급자 5분할",
    daysPerWeek: 5,
    days: [
      {
        dayName: "가슴 — 중량일",
        exercises: [
          { name: "바벨 벤치프레스", sets: 5, reps: "5", rest: "180초", note: "1RM의 80-85%" },
          { name: "클로즈그립 벤치", sets: 4, reps: "8", rest: "90초", note: "" },
          { name: "인클라인 덤벨프레스", sets: 4, reps: "10", rest: "75초", note: "" },
          { name: "웨이티드 딥스", sets: 3, reps: "8", rest: "90초", note: "" },
          { name: "펙덱 플라이", sets: 3, reps: "15", rest: "45초", note: "마무리" },
        ],
      },
      {
        dayName: "등 — 중량일",
        exercises: [
          { name: "데드리프트", sets: 5, reps: "3-5", rest: "240초", note: "1RM의 85-90%" },
          { name: "웨이티드 풀업", sets: 4, reps: "6", rest: "120초", note: "" },
          { name: "펜들레이 로우", sets: 4, reps: "6-8", rest: "90초", note: "" },
          { name: "체스트 서포티드 로우", sets: 3, reps: "12", rest: "60초", note: "" },
          { name: "바벨 슈러그", sets: 3, reps: "10", rest: "60초", note: "" },
        ],
      },
      {
        dayName: "어깨 & 팔",
        exercises: [
          { name: "오버헤드 프레스", sets: 5, reps: "5", rest: "120초", note: "" },
          { name: "아놀드 프레스", sets: 3, reps: "10", rest: "75초", note: "" },
          { name: "사이드 레터럴 레이즈", sets: 5, reps: "15", rest: "30초", note: "드랍세트" },
          { name: "EZ바 컬", sets: 4, reps: "10", rest: "60초", note: "" },
          { name: "스컬크러셔", sets: 4, reps: "10", rest: "60초", note: "" },
        ],
      },
      {
        dayName: "하체 — 중량일",
        exercises: [
          { name: "바벨 스쿼트", sets: 5, reps: "3-5", rest: "240초", note: "1RM의 85-90%" },
          { name: "프론트 스쿼트", sets: 3, reps: "8", rest: "120초", note: "" },
          { name: "루마니안 데드리프트", sets: 4, reps: "8", rest: "90초", note: "" },
          { name: "워킹 런지", sets: 3, reps: "12 (각)", rest: "60초", note: "" },
          { name: "시티드 카프레이즈", sets: 5, reps: "12", rest: "45초", note: "" },
        ],
      },
      {
        dayName: "전신 — 볼륨일",
        exercises: [
          { name: "포즈드 벤치프레스", sets: 4, reps: "6", rest: "90초", note: "2초 정지" },
          { name: "펜들레이 로우", sets: 4, reps: "8", rest: "90초", note: "" },
          { name: "오버헤드 프레스", sets: 3, reps: "10", rest: "75초", note: "" },
          { name: "레그프레스", sets: 4, reps: "15", rest: "90초", note: "" },
          { name: "페이스풀", sets: 3, reps: "20", rest: "30초", note: "" },
          { name: "플랭크", sets: 3, reps: "60초", rest: "30초", note: "" },
        ],
      },
    ],
  },
];

// ─── Icons ───
const Icons = {
  Dumbbell: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6.5 6.5h11M6.5 17.5h11M3 10h1.5M3 14h1.5M19.5 10H21M19.5 14H21M4.5 10v4M19.5 10v4M4.5 6.5v11M19.5 6.5v11"/>
    </svg>
  ),
  Check: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  Plus: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  Trash: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
    </svg>
  ),
  Back: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <polyline points="15 18 9 12 15 6"/>
    </svg>
  ),
  Admin: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
    </svg>
  ),
  Calendar: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  Chart: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  ),
  Edit: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  ),
  Fire: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M12 12c2-2.96 0-7-1-8 0 3.038-1.773 4.741-3 6-1.226 1.26-2 3.24-2 5a6 6 0 1012 0c0-1.532-1.056-3.94-2-5-1.786 3-2 2-4 2z"/>
    </svg>
  ),
};

// ─── Level Labels / Colors ───
const LEVELS = {
  beginner: { label: "초급", color: "#22c55e", bg: "#052e16" },
  intermediate: { label: "중급", color: "#f59e0b", bg: "#451a03" },
  advanced: { label: "고급", color: "#ef4444", bg: "#450a0a" },
};

// ─── Main App ───
export default function App() {
  const [mode, setMode] = useState("user"); // "user" | "admin"
  const [programs, setPrograms] = useState(DEFAULT_PROGRAMS);
  const [logs, setLogs] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [screen, setScreen] = useState("home");
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [editingProgram, setEditingProgram] = useState(null);
  const [adminAuth, setAdminAuth] = useState(false);

  useEffect(() => {
    (async () => {
      const p = await load(KEYS.programs);
      const l = await load(KEYS.logs);
      if (p && p.length) setPrograms(p);
      if (l) setLogs(l);
      setLoaded(true);
    })();
  }, []);

  useEffect(() => { if (loaded) save(KEYS.programs, programs); }, [programs, loaded]);
  useEffect(() => { if (loaded) save(KEYS.logs, logs); }, [logs, loaded]);

  const addLog = useCallback((entry) => {
    setLogs((prev) => [...prev, { ...entry, id: Date.now().toString(), timestamp: new Date().toISOString() }]);
  }, []);

  if (!loaded) return (
    <div style={styles.loading}>
      <div style={styles.loadingSpinner} />
      <p style={{ color: "#a0a0a0", marginTop: 16, fontFamily: "'Noto Sans KR', sans-serif" }}>불러오는 중...</p>
    </div>
  );

  return (
    <div style={styles.root}>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700;900&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet"/>
      
      {mode === "user" ? (
        <UserMode
          programs={programs} logs={logs} addLog={addLog}
          screen={screen} setScreen={setScreen}
          selectedProgram={selectedProgram} setSelectedProgram={setSelectedProgram}
          selectedDay={selectedDay} setSelectedDay={setSelectedDay}
          onSwitchAdmin={() => { setScreen("home"); setMode("admin"); }}
        />
      ) : (
        <AdminMode
          programs={programs} setPrograms={setPrograms}
          editingProgram={editingProgram} setEditingProgram={setEditingProgram}
          screen={screen} setScreen={setScreen}
          adminAuth={adminAuth} setAdminAuth={setAdminAuth}
          onSwitchUser={() => { setScreen("home"); setMode("user"); }}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════
// USER MODE
// ═══════════════════════════════════════
function UserMode({ programs, logs, addLog, screen, setScreen, selectedProgram, setSelectedProgram, selectedDay, setSelectedDay, onSwitchAdmin }) {
  
  if (screen === "workout" && selectedProgram && selectedDay !== null) {
    return (
      <WorkoutSession
        program={selectedProgram}
        dayIndex={selectedDay}
        onFinish={(logEntry) => { addLog(logEntry); setScreen("home"); setSelectedDay(null); }}
        onBack={() => { setScreen("daySelect"); setSelectedDay(null); }}
      />
    );
  }

  if (screen === "daySelect" && selectedProgram) {
    return (
      <DaySelect
        program={selectedProgram}
        onSelect={(i) => { setSelectedDay(i); setScreen("workout"); }}
        onBack={() => { setScreen("home"); setSelectedProgram(null); }}
      />
    );
  }

  if (screen === "history") {
    return <HistoryView logs={logs} onBack={() => setScreen("home")} />;
  }

  // Home
  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerTop}>
          <h1 style={styles.logo}>
            <img src="/icon-192.png" alt="IF" style={{ width: 28, height: 28, borderRadius: 6 }} />
            IF
          </h1>
          <button style={styles.adminBtn} onClick={onSwitchAdmin}>
            <Icons.Admin /> 관리
          </button>
        </div>
        <p style={styles.headerSub}>Intelligent Fitness Services</p>
      </header>

      <div style={styles.quickActions}>
        <button style={styles.historyBtn} onClick={() => setScreen("history")}>
          <Icons.Calendar />
          <span>운동 기록</span>
          <span style={styles.logCount}>{logs.length}회</span>
        </button>
      </div>

      <div style={styles.sectionTitle}>프로그램 선택</div>
      
      {Object.entries(LEVELS).map(([key, { label }]) => {
        const filtered = programs.filter((p) => p.level === key);
        if (!filtered.length) return null;
        return (
          <div key={key} style={{ marginBottom: 20 }}>
            <div style={styles.levelHeader}>
              <span style={{ ...styles.levelBadge, background: LEVELS[key].bg, color: LEVELS[key].color }}>
                {label}
              </span>
            </div>
            {filtered.map((prog) => (
              <button
                key={prog.id}
                style={styles.programCard}
                onClick={() => { setSelectedProgram(prog); setScreen("daySelect"); }}
              >
                <div style={styles.programCardInner}>
                  <div style={styles.programName}>{prog.name}</div>
                  <div style={styles.programDesc}>{prog.description}</div>
                  <div style={styles.programMeta}>
                    <span style={styles.metaChip}>주 {prog.daysPerWeek}일</span>
                    <span style={styles.metaChip}>{prog.days.length}개 루틴</span>
                  </div>
                </div>
                <div style={styles.programArrow}>›</div>
              </button>
            ))}
          </div>
        );
      })}
    </div>
  );
}

// ─── Day Select ───
function DaySelect({ program, onSelect, onBack }) {
  return (
    <div style={styles.container}>
      <button style={styles.backButton} onClick={onBack}>
        <Icons.Back /> 뒤로
      </button>
      <div style={{ ...styles.levelBadge, background: LEVELS[program.level].bg, color: LEVELS[program.level].color, display: "inline-block", marginBottom: 8 }}>
        {LEVELS[program.level].label}
      </div>
      <h2 style={styles.pageTitle}>{program.name}</h2>
      <p style={styles.pageDesc}>{program.description}</p>

      <div style={styles.dayGrid}>
        {program.days.map((day, i) => (
          <button key={i} style={styles.dayCard} onClick={() => onSelect(i)}>
            <div style={styles.dayNumber}>DAY {i + 1}</div>
            <div style={styles.dayName}>{day.dayName}</div>
            <div style={styles.dayExCount}>{day.exercises.length}종목</div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Workout Session ───
function WorkoutSession({ program, dayIndex, onFinish, onBack }) {
  const day = program.days[dayIndex];
  const [exerciseData, setExerciseData] = useState(
    day.exercises.map((ex) => ({
      name: ex.name,
      sets: Array.from({ length: ex.sets }, () => ({ weight: "", reps: "", done: false })),
      targetReps: ex.reps,
      rest: ex.rest,
      note: ex.note,
    }))
  );
  const [activeEx, setActiveEx] = useState(0);
  const [timer, setTimer] = useState(null);
  const [timerVal, setTimerVal] = useState(0);

  useEffect(() => {
    if (timer !== null && timerVal > 0) {
      const t = setTimeout(() => setTimerVal((v) => v - 1), 1000);
      return () => clearTimeout(t);
    }
    if (timer !== null && timerVal === 0) {
      setTimer(null);
      try { navigator.vibrate?.(200); } catch {}
    }
  }, [timer, timerVal]);

  const startTimer = (seconds) => {
    const s = parseInt(seconds) || 60;
    setTimer(Date.now());
    setTimerVal(s);
  };

  const updateSet = (exIdx, setIdx, field, value) => {
    setExerciseData((prev) => {
      const next = [...prev];
      next[exIdx] = { ...next[exIdx], sets: [...next[exIdx].sets] };
      next[exIdx].sets[setIdx] = { ...next[exIdx].sets[setIdx], [field]: value };
      return next;
    });
  };

  const toggleDone = (exIdx, setIdx) => {
    updateSet(exIdx, setIdx, "done", !exerciseData[exIdx].sets[setIdx].done);
    if (!exerciseData[exIdx].sets[setIdx].done) {
      const restStr = exerciseData[exIdx].rest;
      const restSec = parseInt(restStr) || 60;
      startTimer(restSec);
    }
  };

  const addSet = (exIdx) => {
    setExerciseData((prev) => {
      const next = [...prev];
      next[exIdx] = { ...next[exIdx], sets: [...next[exIdx].sets, { weight: "", reps: "", done: false }] };
      return next;
    });
  };

  const totalSets = exerciseData.reduce((a, e) => a + e.sets.length, 0);
  const doneSets = exerciseData.reduce((a, e) => a + e.sets.filter((s) => s.done).length, 0);
  const progress = totalSets > 0 ? (doneSets / totalSets) * 100 : 0;

  const handleFinish = () => {
    onFinish({
      programId: program.id,
      programName: program.name,
      dayName: day.dayName,
      level: program.level,
      exercises: exerciseData.map((ex) => ({
        name: ex.name,
        sets: ex.sets.filter((s) => s.done).map((s) => ({ weight: s.weight, reps: s.reps })),
      })),
    });
  };

  const ex = exerciseData[activeEx];

  return (
    <div style={styles.container}>
      {/* Timer overlay */}
      {timer !== null && (
        <div style={styles.timerOverlay} onClick={() => setTimer(null)}>
          <div style={styles.timerCircle}>
            <div style={styles.timerValue}>{timerVal}</div>
            <div style={styles.timerLabel}>휴식 중</div>
          </div>
          <div style={styles.timerSkip}>탭하여 건너뛰기</div>
        </div>
      )}

      <div style={styles.workoutHeader}>
        <button style={styles.backButton} onClick={onBack}><Icons.Back /></button>
        <div style={{ flex: 1 }}>
          <div style={styles.workoutTitle}>{day.dayName}</div>
          <div style={styles.progressBar}>
            <div style={{ ...styles.progressFill, width: `${progress}%` }} />
          </div>
          <div style={styles.progressText}>{doneSets}/{totalSets} 세트 완료</div>
        </div>
      </div>

      {/* Exercise Tabs (scrollable) */}
      <div style={styles.exTabs}>
        {exerciseData.map((e, i) => {
          const allDone = e.sets.every((s) => s.done);
          return (
            <button
              key={i}
              style={{
                ...styles.exTab,
                ...(i === activeEx ? styles.exTabActive : {}),
                ...(allDone ? styles.exTabDone : {}),
              }}
              onClick={() => setActiveEx(i)}
            >
              {allDone ? "✓" : i + 1}
            </button>
          );
        })}
      </div>

      {/* Current Exercise */}
      <div style={styles.currentExercise}>
        <h3 style={styles.exName}>{ex.name}</h3>
        <div style={styles.exInfo}>
          <span>목표: {ex.targetReps}회</span>
          <span>휴식: {ex.rest}</span>
        </div>
        {ex.note && <div style={styles.exNote}>{ex.note}</div>}

        {/* Sets */}
        <div style={styles.setsContainer}>
          <div style={styles.setHeader}>
            <span style={styles.setHeaderCell}>세트</span>
            <span style={styles.setHeaderCellWide}>무게(kg)</span>
            <span style={styles.setHeaderCellWide}>횟수</span>
            <span style={styles.setHeaderCell}>완료</span>
          </div>
          {ex.sets.map((s, si) => (
            <div key={si} style={{ ...styles.setRow, ...(s.done ? styles.setRowDone : {}) }}>
              <span style={styles.setCell}>{si + 1}</span>
              <span style={styles.setCellWide}>
                <input
                  type="number"
                  inputMode="decimal"
                  placeholder="0"
                  value={s.weight}
                  onChange={(e) => updateSet(activeEx, si, "weight", e.target.value)}
                  style={styles.setInput}
                />
              </span>
              <span style={styles.setCellWide}>
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder={ex.targetReps}
                  value={s.reps}
                  onChange={(e) => updateSet(activeEx, si, "reps", e.target.value)}
                  style={styles.setInput}
                />
              </span>
              <span style={styles.setCell}>
                <button
                  style={{ ...styles.doneBtn, ...(s.done ? styles.doneBtnActive : {}) }}
                  onClick={() => toggleDone(activeEx, si)}
                >
                  <Icons.Check />
                </button>
              </span>
            </div>
          ))}
        </div>
        <button style={styles.addSetBtn} onClick={() => addSet(activeEx)}>
          <Icons.Plus /> 세트 추가
        </button>
      </div>

      {/* Nav + Finish */}
      <div style={styles.workoutNav}>
        {activeEx > 0 && (
          <button style={styles.navBtn} onClick={() => setActiveEx((v) => v - 1)}>← 이전</button>
        )}
        {activeEx < exerciseData.length - 1 ? (
          <button style={{ ...styles.navBtn, ...styles.navBtnPrimary }} onClick={() => setActiveEx((v) => v + 1)}>다음 →</button>
        ) : (
          <button style={{ ...styles.navBtn, ...styles.finishBtn }} onClick={handleFinish}>
            <Icons.Fire /> 운동 완료!
          </button>
        )}
      </div>
    </div>
  );
}

// ─── History View ───
function HistoryView({ logs, onBack }) {
  const sorted = useMemo(() => [...logs].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)), [logs]);
  const [expandedId, setExpandedId] = useState(null);

  const groupByDate = useMemo(() => {
    const groups = {};
    sorted.forEach((log) => {
      const d = new Date(log.timestamp).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric", weekday: "short" });
      if (!groups[d]) groups[d] = [];
      groups[d].push(log);
    });
    return groups;
  }, [sorted]);

  return (
    <div style={styles.container}>
      <button style={styles.backButton} onClick={onBack}><Icons.Back /> 뒤로</button>
      <h2 style={styles.pageTitle}>운동 기록</h2>

      {sorted.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
          <p>아직 기록된 운동이 없습니다</p>
          <p style={{ fontSize: 13, color: "#666" }}>프로그램을 선택하고 운동을 시작해보세요!</p>
        </div>
      ) : (
        Object.entries(groupByDate).map(([date, entries]) => (
          <div key={date} style={{ marginBottom: 20 }}>
            <div style={styles.dateGroup}>{date}</div>
            {entries.map((log) => (
              <div key={log.id}>
                <button style={styles.logCard} onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}>
                  <div>
                    <span style={{ ...styles.levelBadgeSmall, background: LEVELS[log.level]?.bg, color: LEVELS[log.level]?.color }}>
                      {LEVELS[log.level]?.label}
                    </span>
                    <div style={styles.logTitle}>{log.dayName}</div>
                    <div style={styles.logMeta}>{log.programName}</div>
                  </div>
                  <div style={styles.logTime}>
                    {new Date(log.timestamp).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </button>
                {expandedId === log.id && (
                  <div style={styles.logDetail}>
                    {log.exercises?.map((ex, i) => (
                      <div key={i} style={styles.logExercise}>
                        <div style={styles.logExName}>{ex.name}</div>
                        {ex.sets?.map((s, si) => (
                          <div key={si} style={styles.logSet}>
                            세트 {si + 1}: {s.weight || "–"}kg × {s.reps || "–"}회
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
}

// ═══════════════════════════════════════
// ADMIN MODE
// ═══════════════════════════════════════
function AdminMode({ programs, setPrograms, editingProgram, setEditingProgram, screen, setScreen, adminAuth, setAdminAuth, onSwitchUser }) {
  const [pin, setPin] = useState("");

  if (!adminAuth) {
    return (
      <div style={styles.container}>
        <div style={styles.adminLogin}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔐</div>
          <h2 style={{ ...styles.pageTitle, textAlign: "center" }}>관리자 모드</h2>
          <p style={{ color: "#888", textAlign: "center", marginBottom: 24, fontSize: 14 }}>관리자 PIN을 입력하세요 (기본: 0000)</p>
          <input
            type="password"
            inputMode="numeric"
            maxLength={4}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
            placeholder="••••"
            style={styles.pinInput}
          />
          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <button style={styles.cancelBtn} onClick={onSwitchUser}>취소</button>
            <button
              style={styles.submitBtn}
              onClick={() => { if (pin === "0000") { setAdminAuth(true); setPin(""); } else { alert("잘못된 PIN입니다"); } }}
            >
              입장
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (screen === "editProgram" && editingProgram) {
    return (
      <ProgramEditor
        program={editingProgram}
        onSave={(prog) => {
          setPrograms((prev) => {
            const idx = prev.findIndex((p) => p.id === prog.id);
            if (idx >= 0) { const n = [...prev]; n[idx] = prog; return n; }
            return [...prev, prog];
          });
          setEditingProgram(null);
          setScreen("home");
        }}
        onCancel={() => { setEditingProgram(null); setScreen("home"); }}
      />
    );
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerTop}>
          <h1 style={styles.logo}>
            <span style={styles.logoIcon}><Icons.Admin /></span>
            관리자
          </h1>
          <button style={styles.adminBtn} onClick={onSwitchUser}>
            <Icons.Dumbbell /> 사용자
          </button>
        </div>
      </header>

      <button
        style={styles.createProgramBtn}
        onClick={() => {
          setEditingProgram({
            id: "prog-" + Date.now(),
            level: "beginner",
            name: "",
            description: "",
            daysPerWeek: 3,
            days: [{ dayName: "Day 1", exercises: [{ name: "", sets: 3, reps: "10", rest: "60초", note: "" }] }],
          });
          setScreen("editProgram");
        }}
      >
        <Icons.Plus /> 새 프로그램 만들기
      </button>

      {Object.entries(LEVELS).map(([key, { label }]) => {
        const filtered = programs.filter((p) => p.level === key);
        if (!filtered.length) return null;
        return (
          <div key={key} style={{ marginBottom: 20 }}>
            <div style={styles.levelHeader}>
              <span style={{ ...styles.levelBadge, background: LEVELS[key].bg, color: LEVELS[key].color }}>{label}</span>
              <span style={{ color: "#666", fontSize: 13 }}>{filtered.length}개</span>
            </div>
            {filtered.map((prog) => (
              <div key={prog.id} style={styles.adminProgramCard}>
                <div style={{ flex: 1 }}>
                  <div style={styles.programName}>{prog.name || "이름 없음"}</div>
                  <div style={styles.programDesc}>{prog.description}</div>
                  <div style={styles.programMeta}>
                    <span style={styles.metaChip}>주 {prog.daysPerWeek}일</span>
                    <span style={styles.metaChip}>{prog.days.length}개 루틴</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    style={styles.iconBtn}
                    onClick={() => { setEditingProgram({ ...prog }); setScreen("editProgram"); }}
                  >
                    <Icons.Edit />
                  </button>
                  <button
                    style={{ ...styles.iconBtn, color: "#ef4444" }}
                    onClick={() => { if (confirm("정말 삭제하시겠습니까?")) setPrograms((prev) => prev.filter((p) => p.id !== prog.id)); }}
                  >
                    <Icons.Trash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

// ─── Program Editor ───
function ProgramEditor({ program, onSave, onCancel }) {
  const [prog, setProg] = useState(JSON.parse(JSON.stringify(program)));

  const updateField = (field, value) => setProg((p) => ({ ...p, [field]: value }));

  const updateDay = (di, field, value) => {
    setProg((p) => {
      const days = [...p.days];
      days[di] = { ...days[di], [field]: value };
      return { ...p, days };
    });
  };

  const updateExercise = (di, ei, field, value) => {
    setProg((p) => {
      const days = [...p.days];
      const exercises = [...days[di].exercises];
      exercises[ei] = { ...exercises[ei], [field]: field === "sets" ? parseInt(value) || 0 : value };
      days[di] = { ...days[di], exercises };
      return { ...p, days };
    });
  };

  const addDay = () => setProg((p) => ({
    ...p,
    days: [...p.days, { dayName: `Day ${p.days.length + 1}`, exercises: [{ name: "", sets: 3, reps: "10", rest: "60초", note: "" }] }],
  }));

  const removeDay = (di) => setProg((p) => ({ ...p, days: p.days.filter((_, i) => i !== di) }));

  const addExercise = (di) => {
    setProg((p) => {
      const days = [...p.days];
      days[di] = { ...days[di], exercises: [...days[di].exercises, { name: "", sets: 3, reps: "10", rest: "60초", note: "" }] };
      return { ...p, days };
    });
  };

  const removeExercise = (di, ei) => {
    setProg((p) => {
      const days = [...p.days];
      days[di] = { ...days[di], exercises: days[di].exercises.filter((_, i) => i !== ei) };
      return { ...p, days };
    });
  };

  return (
    <div style={styles.container}>
      <button style={styles.backButton} onClick={onCancel}><Icons.Back /> 취소</button>
      <h2 style={styles.pageTitle}>프로그램 편집</h2>

      <div style={styles.formGroup}>
        <label style={styles.label}>프로그램 이름</label>
        <input style={styles.input} value={prog.name} onChange={(e) => updateField("name", e.target.value)} placeholder="예: 초보자 전신 운동" />
      </div>
      <div style={styles.formGroup}>
        <label style={styles.label}>설명</label>
        <input style={styles.input} value={prog.description} onChange={(e) => updateField("description", e.target.value)} placeholder="프로그램 설명" />
      </div>
      <div style={{ display: "flex", gap: 12 }}>
        <div style={{ ...styles.formGroup, flex: 1 }}>
          <label style={styles.label}>수준</label>
          <select style={styles.input} value={prog.level} onChange={(e) => updateField("level", e.target.value)}>
            <option value="beginner">초급</option>
            <option value="intermediate">중급</option>
            <option value="advanced">고급</option>
          </select>
        </div>
        <div style={{ ...styles.formGroup, flex: 1 }}>
          <label style={styles.label}>주간 횟수</label>
          <input style={styles.input} type="number" inputMode="numeric" value={prog.daysPerWeek} onChange={(e) => updateField("daysPerWeek", parseInt(e.target.value) || 0)} />
        </div>
      </div>

      <div style={styles.divider} />

      {prog.days.map((day, di) => (
        <div key={di} style={styles.dayEditor}>
          <div style={styles.dayEditorHeader}>
            <input
              style={{ ...styles.input, fontWeight: 600, fontSize: 15 }}
              value={day.dayName}
              onChange={(e) => updateDay(di, "dayName", e.target.value)}
            />
            {prog.days.length > 1 && (
              <button style={{ ...styles.iconBtn, color: "#ef4444" }} onClick={() => removeDay(di)}>
                <Icons.Trash />
              </button>
            )}
          </div>

          {day.exercises.map((ex, ei) => (
            <div key={ei} style={styles.exerciseEditor}>
              <div style={styles.exerciseEditorRow}>
                <input style={{ ...styles.inputSm, flex: 2 }} placeholder="운동 이름" value={ex.name} onChange={(e) => updateExercise(di, ei, "name", e.target.value)} />
                <button style={{ ...styles.iconBtn, color: "#ef4444", padding: 4 }} onClick={() => removeExercise(di, ei)}>
                  <Icons.Trash />
                </button>
              </div>
              <div style={styles.exerciseEditorRow}>
                <div style={styles.miniField}>
                  <span style={styles.miniLabel}>세트</span>
                  <input style={styles.inputSm} type="number" inputMode="numeric" value={ex.sets} onChange={(e) => updateExercise(di, ei, "sets", e.target.value)} />
                </div>
                <div style={styles.miniField}>
                  <span style={styles.miniLabel}>횟수</span>
                  <input style={styles.inputSm} value={ex.reps} onChange={(e) => updateExercise(di, ei, "reps", e.target.value)} />
                </div>
                <div style={styles.miniField}>
                  <span style={styles.miniLabel}>휴식</span>
                  <input style={styles.inputSm} value={ex.rest} onChange={(e) => updateExercise(di, ei, "rest", e.target.value)} />
                </div>
              </div>
            </div>
          ))}
          <button style={styles.addExBtn} onClick={() => addExercise(di)}>
            <Icons.Plus /> 운동 추가
          </button>
        </div>
      ))}

      <button style={styles.addDayBtn} onClick={addDay}>
        <Icons.Plus /> 루틴 일자 추가
      </button>

      <div style={styles.editorActions}>
        <button style={styles.cancelBtn} onClick={onCancel}>취소</button>
        <button style={styles.submitBtn} onClick={() => onSave(prog)}>저장</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// STYLES
// ═══════════════════════════════════════
const styles = {
  root: {
    fontFamily: "'Noto Sans KR', sans-serif",
    background: "#0a0a0a",
    color: "#e8e8e8",
    minHeight: "100vh",
    maxWidth: 480,
    margin: "0 auto",
    WebkitFontSmoothing: "antialiased",
  },
  container: {
    padding: "16px 16px 100px",
  },
  loading: {
    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    height: "100vh", background: "#0a0a0a",
  },
  loadingSpinner: {
    width: 32, height: 32, border: "3px solid #333", borderTopColor: "#22c55e",
    borderRadius: "50%", animation: "spin 0.8s linear infinite",
  },
  // Header
  header: { marginBottom: 24, paddingTop: 8 },
  headerTop: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  logo: {
    fontSize: 22, fontWeight: 900, letterSpacing: "0.08em", color: "#fff",
    display: "flex", alignItems: "center", gap: 8, margin: 0,
  },
  logoIcon: { color: "#22c55e" },
  headerSub: { color: "#555", fontSize: 13, marginTop: 4, fontWeight: 300 },
  adminBtn: {
    background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
    color: "#aaa", padding: "8px 14px", borderRadius: 10, fontSize: 13,
    display: "flex", alignItems: "center", gap: 6, cursor: "pointer",
    fontFamily: "'Noto Sans KR', sans-serif",
  },
  // Quick Actions
  quickActions: { marginBottom: 24 },
  historyBtn: {
    width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 14, padding: "14px 16px", display: "flex", alignItems: "center", gap: 10,
    color: "#e8e8e8", fontSize: 14, cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif",
  },
  logCount: {
    marginLeft: "auto", background: "rgba(34,197,94,0.15)", color: "#22c55e",
    padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600,
  },
  // Section
  sectionTitle: {
    fontSize: 12, fontWeight: 600, color: "#666", letterSpacing: "0.1em",
    textTransform: "uppercase", marginBottom: 12,
  },
  // Level
  levelHeader: { display: "flex", alignItems: "center", gap: 8, marginBottom: 10 },
  levelBadge: {
    fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 6,
    letterSpacing: "0.05em",
  },
  levelBadgeSmall: {
    fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 4,
    letterSpacing: "0.05em", display: "inline-block", marginBottom: 4,
  },
  // Program Card
  programCard: {
    width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 14, padding: "16px", marginBottom: 8, display: "flex",
    alignItems: "center", cursor: "pointer", textAlign: "left",
    fontFamily: "'Noto Sans KR', sans-serif", color: "#e8e8e8",
    transition: "background 0.15s",
  },
  programCardInner: { flex: 1 },
  programName: { fontSize: 15, fontWeight: 600, marginBottom: 4 },
  programDesc: { fontSize: 12, color: "#888", marginBottom: 8 },
  programMeta: { display: "flex", gap: 8 },
  metaChip: {
    fontSize: 11, color: "#666", background: "rgba(255,255,255,0.05)",
    padding: "2px 8px", borderRadius: 6,
  },
  programArrow: { fontSize: 24, color: "#444", marginLeft: 8 },
  // Admin Program Card
  adminProgramCard: {
    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 14, padding: 16, marginBottom: 8, display: "flex",
    alignItems: "center", gap: 12,
  },
  iconBtn: {
    background: "none", border: "none", color: "#aaa", cursor: "pointer", padding: 8,
    borderRadius: 8, display: "flex", alignItems: "center",
  },
  // Back
  backButton: {
    background: "none", border: "none", color: "#888", fontSize: 14,
    display: "flex", alignItems: "center", gap: 4, cursor: "pointer",
    padding: "8px 0", marginBottom: 8, fontFamily: "'Noto Sans KR', sans-serif",
  },
  // Pages
  pageTitle: { fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 6, marginTop: 0 },
  pageDesc: { fontSize: 13, color: "#888", marginBottom: 20 },
  // Day Grid
  dayGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 8 },
  dayCard: {
    background: "linear-gradient(135deg, rgba(34,197,94,0.08), rgba(34,197,94,0.02))",
    border: "1px solid rgba(34,197,94,0.15)", borderRadius: 14, padding: "20px 16px",
    cursor: "pointer", textAlign: "left", fontFamily: "'Noto Sans KR', sans-serif",
    color: "#e8e8e8", transition: "transform 0.15s, border-color 0.15s",
  },
  dayNumber: { fontSize: 10, fontWeight: 700, color: "#22c55e", letterSpacing: "0.12em", marginBottom: 6 },
  dayName: { fontSize: 14, fontWeight: 600, marginBottom: 8 },
  dayExCount: { fontSize: 12, color: "#666" },
  // Workout
  workoutHeader: { display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 16 },
  workoutTitle: { fontSize: 17, fontWeight: 700, color: "#fff", marginBottom: 8 },
  progressBar: { height: 6, background: "#1a1a1a", borderRadius: 3, overflow: "hidden" },
  progressFill: { height: "100%", background: "linear-gradient(90deg, #22c55e, #16a34a)", borderRadius: 3, transition: "width 0.3s" },
  progressText: { fontSize: 11, color: "#666", marginTop: 4 },
  // Exercise Tabs
  exTabs: {
    display: "flex", gap: 6, marginBottom: 16, overflowX: "auto",
    paddingBottom: 4, WebkitOverflowScrolling: "touch",
  },
  exTab: {
    minWidth: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center",
    justifyContent: "center", fontSize: 13, fontWeight: 600, cursor: "pointer",
    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
    color: "#888", flexShrink: 0, fontFamily: "'JetBrains Mono', monospace",
  },
  exTabActive: { background: "rgba(34,197,94,0.15)", borderColor: "#22c55e", color: "#22c55e" },
  exTabDone: { background: "rgba(34,197,94,0.1)", color: "#22c55e" },
  // Current Exercise
  currentExercise: {
    background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 16, padding: 16,
  },
  exName: { fontSize: 18, fontWeight: 700, color: "#fff", margin: "0 0 8px" },
  exInfo: { display: "flex", gap: 16, fontSize: 13, color: "#888", marginBottom: 8 },
  exNote: {
    fontSize: 12, color: "#f59e0b", background: "rgba(245,158,11,0.08)",
    padding: "6px 10px", borderRadius: 8, marginBottom: 12,
  },
  // Sets
  setsContainer: { marginTop: 12 },
  setHeader: {
    display: "flex", alignItems: "center", padding: "0 4px 6px",
    borderBottom: "1px solid rgba(255,255,255,0.06)", marginBottom: 4,
  },
  setHeaderCell: { width: 44, textAlign: "center", fontSize: 11, color: "#555", fontWeight: 600 },
  setHeaderCellWide: { flex: 1, textAlign: "center", fontSize: 11, color: "#555", fontWeight: 600 },
  setRow: {
    display: "flex", alignItems: "center", padding: "6px 4px",
    borderRadius: 8, marginBottom: 2, transition: "background 0.2s",
  },
  setRowDone: { background: "rgba(34,197,94,0.06)" },
  setCell: { width: 44, textAlign: "center", fontSize: 14, color: "#aaa", fontFamily: "'JetBrains Mono', monospace" },
  setCellWide: { flex: 1, display: "flex", justifyContent: "center" },
  setInput: {
    width: "80%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 8, padding: "10px 8px", color: "#fff", fontSize: 16, textAlign: "center",
    fontFamily: "'JetBrains Mono', monospace", outline: "none",
  },
  doneBtn: {
    width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center",
    justifyContent: "center", cursor: "pointer", transition: "all 0.2s",
    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "#555",
  },
  doneBtnActive: {
    background: "rgba(34,197,94,0.2)", borderColor: "#22c55e", color: "#22c55e",
  },
  addSetBtn: {
    width: "100%", background: "none", border: "1px dashed rgba(255,255,255,0.1)",
    borderRadius: 10, padding: "10px", color: "#666", fontSize: 13,
    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
    cursor: "pointer", marginTop: 8, fontFamily: "'Noto Sans KR', sans-serif",
  },
  // Workout Nav
  workoutNav: {
    display: "flex", gap: 10, marginTop: 16, position: "sticky", bottom: 16,
  },
  navBtn: {
    flex: 1, padding: "14px", borderRadius: 12, fontSize: 15, fontWeight: 600,
    cursor: "pointer", border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.04)", color: "#aaa",
    fontFamily: "'Noto Sans KR', sans-serif",
  },
  navBtnPrimary: {
    background: "rgba(34,197,94,0.15)", borderColor: "rgba(34,197,94,0.3)", color: "#22c55e",
  },
  finishBtn: {
    background: "linear-gradient(135deg, #22c55e, #16a34a)", borderColor: "transparent",
    color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
  },
  // Timer Overlay
  timerOverlay: {
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", zIndex: 100,
    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    cursor: "pointer",
  },
  timerCircle: {
    width: 180, height: 180, borderRadius: "50%",
    border: "4px solid #22c55e", display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
  },
  timerValue: { fontSize: 56, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: "#22c55e" },
  timerLabel: { fontSize: 14, color: "#888" },
  timerSkip: { marginTop: 24, fontSize: 13, color: "#555" },
  // History
  emptyState: {
    textAlign: "center", padding: "60px 20px", color: "#888",
  },
  dateGroup: {
    fontSize: 12, fontWeight: 600, color: "#555", marginBottom: 8,
    paddingBottom: 4, borderBottom: "1px solid rgba(255,255,255,0.04)",
  },
  logCard: {
    width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 12, padding: "12px 14px", marginBottom: 6,
    display: "flex", justifyContent: "space-between", alignItems: "center",
    cursor: "pointer", textAlign: "left", fontFamily: "'Noto Sans KR', sans-serif",
    color: "#e8e8e8",
  },
  logTitle: { fontSize: 14, fontWeight: 600, marginTop: 4 },
  logMeta: { fontSize: 11, color: "#666", marginTop: 2 },
  logTime: { fontSize: 12, color: "#555", fontFamily: "'JetBrains Mono', monospace" },
  logDetail: {
    background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)",
    borderRadius: 10, padding: 12, marginBottom: 8, marginTop: -2,
  },
  logExercise: { marginBottom: 10 },
  logExName: { fontSize: 13, fontWeight: 600, color: "#ccc", marginBottom: 4 },
  logSet: { fontSize: 12, color: "#777", paddingLeft: 8, fontFamily: "'JetBrains Mono', monospace" },
  // Admin Login
  adminLogin: { paddingTop: 80, display: "flex", flexDirection: "column", alignItems: "center" },
  pinInput: {
    width: 160, textAlign: "center", fontSize: 28, letterSpacing: "0.3em",
    padding: "14px", background: "rgba(255,255,255,0.05)",
    border: "2px solid rgba(255,255,255,0.1)", borderRadius: 14, color: "#fff",
    outline: "none", fontFamily: "'JetBrains Mono', monospace",
  },
  // Forms
  formGroup: { marginBottom: 14 },
  label: { display: "block", fontSize: 12, fontWeight: 600, color: "#888", marginBottom: 6 },
  input: {
    width: "100%", padding: "12px 14px", background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#e8e8e8",
    fontSize: 14, outline: "none", fontFamily: "'Noto Sans KR', sans-serif",
    boxSizing: "border-box",
  },
  inputSm: {
    flex: 1, padding: "8px 10px", background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#e8e8e8",
    fontSize: 13, outline: "none", fontFamily: "'Noto Sans KR', sans-serif",
    boxSizing: "border-box",
  },
  divider: { height: 1, background: "rgba(255,255,255,0.06)", margin: "20px 0" },
  // Day Editor
  dayEditor: {
    background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 14, padding: 14, marginBottom: 12,
  },
  dayEditorHeader: { display: "flex", gap: 8, alignItems: "center", marginBottom: 10 },
  exerciseEditor: {
    background: "rgba(255,255,255,0.02)", borderRadius: 10, padding: 10, marginBottom: 8,
  },
  exerciseEditorRow: { display: "flex", gap: 8, marginBottom: 6, alignItems: "center" },
  miniField: { flex: 1, display: "flex", flexDirection: "column", gap: 2 },
  miniLabel: { fontSize: 10, color: "#666", fontWeight: 600 },
  addExBtn: {
    width: "100%", background: "none", border: "1px dashed rgba(255,255,255,0.08)",
    borderRadius: 8, padding: 8, color: "#666", fontSize: 12,
    display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
    cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif",
  },
  addDayBtn: {
    width: "100%", background: "rgba(34,197,94,0.06)", border: "1px dashed rgba(34,197,94,0.2)",
    borderRadius: 12, padding: 14, color: "#22c55e", fontSize: 14, fontWeight: 600,
    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
    cursor: "pointer", marginBottom: 16, fontFamily: "'Noto Sans KR', sans-serif",
  },
  createProgramBtn: {
    width: "100%", background: "linear-gradient(135deg, rgba(34,197,94,0.15), rgba(34,197,94,0.05))",
    border: "1px solid rgba(34,197,94,0.2)", borderRadius: 14, padding: "16px",
    color: "#22c55e", fontSize: 15, fontWeight: 600,
    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
    cursor: "pointer", marginBottom: 24, fontFamily: "'Noto Sans KR', sans-serif",
  },
  // Buttons
  cancelBtn: {
    flex: 1, padding: "14px", borderRadius: 12, fontSize: 14, fontWeight: 600,
    cursor: "pointer", background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)", color: "#aaa",
    fontFamily: "'Noto Sans KR', sans-serif",
  },
  submitBtn: {
    flex: 1, padding: "14px", borderRadius: 12, fontSize: 14, fontWeight: 600,
    cursor: "pointer", background: "linear-gradient(135deg, #22c55e, #16a34a)",
    border: "none", color: "#fff", fontFamily: "'Noto Sans KR', sans-serif",
  },
  editorActions: { display: "flex", gap: 10, position: "sticky", bottom: 16, paddingTop: 8 },
};
