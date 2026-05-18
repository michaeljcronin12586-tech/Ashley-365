import { useState, useEffect, useCallback } from "react";

// ─── VALKYRIE 365 — Paul Carter Inspired ─────────────────────────────────────
// 5-day split: Mon=Lower A (Quad/Glute), Tue=Upper Push, Wed=Lower B (Hinge/Glute),
//              Thu=Upper Pull + Shoulders, Fri=Glute/Ham Specialization
// Rest: Sat + Sun
//
// Philosophy mirrors Valkyrie:
// - High glute/ham frequency (3x/week direct)
// - Quad work twice weekly
// - Upper push/pull split with shoulder health priority
// - Progressive overload via load, volume, and intensity techniques
// - 5 phases across 52 weeks

const PHASES = [
  { name: "Foundation",        weeks: [1,8],   focus: "4×10-12 | RPE 7 | Build work capacity & movement quality", color: "#E040FB", short: "FOUND" },
  { name: "Volume Drive",      weeks: [9,20],  focus: "4-5×8-12 | RPE 7-8 | 18-20 sets/muscle/wk | Accumulation", color: "#FF6B9D", short: "VOL" },
  { name: "Intensification",   weeks: [21,32], focus: "4-5×6-10 | RPE 8-9 | Slow eccentrics | Mechanical tension", color: "#FF9A3C", short: "INT" },
  { name: "Peak Strength",     weeks: [33,44], focus: "5×4-8 | RPE 9 | Heavy compounds + high-rep isolation", color: "#00D4AA", short: "PEAK" },
  { name: "Recomp & Maintain", weeks: [45,52], focus: "4×8-12 | RPE 7-8 | Deload every 4th week | Body recomp", color: "#4FACFE", short: "RECOMP" },
];

// Days: Mon=1, Tue=2, Wed=3, Thu=4, Fri=5, Sat=6, Sun=0
const SESSION_MAP = { 1:"A", 2:"B", 3:"C", 4:"D", 5:"E", 6:null, 0:null };
const SESSION_COLORS = { A:"#E040FB", B:"#FF6B9D", C:"#FF9A3C", D:"#00D4AA", E:"#4FACFE" };
const SESSION_LABELS = {
  A: "Lower A · Quad/Glute",
  B: "Upper Push",
  C: "Lower B · Hinge/Glute",
  D: "Upper Pull · Shoulders",
  E: "Glute/Ham Special",
};

function getPhaseNum(w) {
  for (let i=0; i<PHASES.length; i++) {
    if (w >= PHASES[i].weeks[0] && w <= PHASES[i].weeks[1]) return i+1;
  }
  return 5;
}
function getBlock(w) { return Math.floor((w-1)/4) % 3; }
function isDeload(w) {
  if ([16,20,28,32,40,44].includes(w)) return true;
  if (w >= 45 && (w-45) % 4 === 3) return true;
  return false;
}

function getSR(phase) {
  return [
    { sets:"4",   comp:"10-12", iso:"12-15", glute:"12-15" },
    { sets:"4-5", comp:"8-12",  iso:"10-12", glute:"10-15" },
    { sets:"4-5", comp:"6-10",  iso:"10-12", glute:"8-12"  },
    { sets:"5",   comp:"4-8",   iso:"8-12",  glute:"8-12"  },
    { sets:"4",   comp:"8-12",  iso:"10-15", glute:"10-15" },
  ][phase-1] || { sets:"4", comp:"8-12", iso:"12-15", glute:"12-15" };
}

function tech(phase, block) {
  if (phase < 3) return "";
  const t = [
    ["2-sec eccentric","Pause at peak contraction","1.5-rep method"],
    ["Drop set on last set","Rest-pause (10+5)","Mechanical drop set"],
    ["3-sec eccentric + squeeze","Triple drop set","21s method"],
    ["Double rest-pause","Heavy partials at top","Slow eccentric + pause"],
    ["Drop set","Rest-pause","Slow eccentric"],
  ][phase-1];
  return t[block % 3];
}

function ex(name, sets, reps, notes="") { return { exercise:name, sets, reps, notes }; }

function getWorkout(session, weekNum) {
  const p = getPhaseNum(weekNum);
  const b = getBlock(weekNum);
  const sr = getSR(p);
  const t = tech(p, b);
  const adv = p >= 3 ? t : "";

  // ── SESSION A: Lower A — Quad Focus + Glute ─────────────────────────────
  if (session === "A") return {
    name: "Lower A — Quad & Glute",
    session: "A",
    warmup: "10 min bike + hip flexor stretch + banded clamshells ×20 + glute bridges ×15",
    exercises: [
      ex([["Barbell Back Squat","Barbell Back Squat (pause)","High-Bar Squat"],["Barbell Back Squat (2-sec)","Front Squat","Barbell Back Squat (tempo)"],["Barbell Back Squat (drop set)","Pause Squat (heavy)","Front Squat (heavy)"],["Barbell Back Squat (heavy)","Front Squat (heavy)","Low-Bar Squat"],["Barbell Back Squat","Pause Squat","Front Squat"]][p-1][b], sr.sets, sr.comp, adv),
      ex([["Leg Press (high foot)","Leg Press (wide)","Leg Press (low foot)"],["Leg Press (slow eccentric)","Single-Leg Press","Leg Press (pause at bottom)"],["Leg Press (drop set)","Leg Press (rest-pause)","Single-Leg Press (heavy)"],["Leg Press (heavy)","Single-Leg Press (heavy)","Leg Press (1.5-rep)"],["Leg Press","Single-Leg Press","Leg Press (slow)"]][p-1][b], sr.sets, sr.comp, adv),
      ex([["DB Bulgarian Split Squat","Reverse Lunge (BB)","Step-Up (DB)"],["Bulgarian Split Squat (pause)","Reverse Lunge (deficit)","Step-Up (heavy)"],["Bulgarian Split Squat (1.5-rep)","Lunge (drop set)","Deficit Reverse Lunge (slow)"],["Bulgarian Split Squat (heavy)","Walking Lunge (BB)","Split Squat (heavy)"],["Bulgarian Split Squat","Reverse Lunge","Step-Up"]][p-1][b], "4", sr.comp, adv),
      ex([["Barbell Hip Thrust","BB Hip Thrust (2-sec pause)","BB Hip Thrust (band)"],["BB Hip Thrust (slow ecc)","Single-Leg Hip Thrust","Hip Thrust (band+BB)"],["BB Hip Thrust (rest-pause)","Hip Thrust (drop set)","Hip Thrust (1.5-rep)"],["BB Hip Thrust (heavy)","Hip Thrust (paused, heavy)","Single-Leg Hip Thrust (heavy)"],["Barbell Hip Thrust","BB Hip Thrust (pause)","Single-Leg Hip Thrust"]][p-1][b], sr.sets, sr.glute, adv),
      ex([["Leg Extension","Leg Extension (slow ecc)","Leg Extension (1.5-rep)"],["Leg Extension (2-sec ecc)","Leg Extension (unilateral)","Leg Extension (pause top)"],["Leg Extension (drop set)","Leg Extension (rest-pause)","Leg Extension (mech drop)"],["Leg Extension (heavy)","Leg Extension (triple drop)","Leg Extension (21s)"],["Leg Extension","Leg Extension (slow)","Leg Extension (unilateral)"]][p-1][b], "4", sr.iso, adv),
      ex([["Seated Calf Raise","Standing Calf Raise","Single-Leg Calf Raise"],["Single-Leg Calf (slow)","Calf Raise (pause stretch)","Seated Calf (heavy)"],["Calf Raise (drop set)","Calf Raise (rest-pause)","Single-Leg Calf (ecc only)"],["Calf Raise (heavy)","Single-Leg Calf Raise","Calf Raise (1.5-rep)"],["Seated Calf Raise","Standing Calf Raise","Single-Leg Calf Raise"]][p-1][b], "4", "12-15", "Full ROM, pause at stretch"),
      ex("McGill Curl-Up", "3", "10 ea", "No lumbar flexion"),
      ex("Dead Bug", "3", "10 ea", "Exhale, flat back"),
    ]
  };

  // ── SESSION B: Upper Push ────────────────────────────────────────────────
  if (session === "B") return {
    name: "Upper Push",
    session: "B",
    warmup: "Band pull-aparts ×20 + shoulder CARs + thoracic rotations + push-up warm-up ×10",
    exercises: [
      ex([["Barbell Bench Press","DB Bench Press","Close-Grip Bench"],["Barbell Bench (2-sec ecc)","DB Bench (pause at chest)","Barbell Bench (tempo)"],["Barbell Bench (rest-pause)","DB Bench (drop set)","Barbell Bench (1.5-rep)"],["Barbell Bench (heavy)","Close-Grip Bench (heavy)","DB Bench (mechanical drop)"],["Barbell Bench Press","DB Bench Press","Close-Grip Bench"]][p-1][b], sr.sets, sr.comp, adv),
      ex([["DB Incline Press","Barbell Incline","Machine Incline Press"],["DB Incline (2-sec lower)","DB Incline (pause chest)","Cable Incline Fly"],["DB Incline (rest-pause)","DB Incline (drop set)","DB Incline (1.5-rep)"],["DB Incline (heavy)","Barbell Incline (heavy)","Machine Incline (pause)"],["DB Incline Press","Cable Incline Fly","DB Incline (slow)"]][p-1][b], sr.sets, sr.comp, adv),
      ex([["Low-to-High Cable Fly","Pec Dec","DB Fly"],["Cable Fly (2-sec peak)","Pec Dec (slow ecc)","DB Fly (pause peak)"],["Cable Fly (drop set)","Pec Dec (rest-pause)","Cable Fly (1.5-rep)"],["Cable Fly (heavy)","Pec Dec (triple drop)","Weighted Dip"],["Low-to-High Cable Fly","Pec Dec","High-to-Low Cable Fly"]][p-1][b], "4", sr.iso, adv),
      ex([["DB Shoulder Press","Arnold Press","Barbell OHP"],["DB Press (slow ecc)","Arnold Press (pause)","Cable Shoulder Press"],["DB Press (rest-pause)","DB Press (drop set)","DB Press (1.5-rep)"],["Barbell OHP (heavy)","DB Press (heavy)","Z-Press"],["DB Shoulder Press","Arnold Press","Machine Shoulder Press"]][p-1][b], sr.sets, sr.comp, adv),
      ex([["DB Lateral Raise","Cable Lateral Raise","Machine Lateral"],["Lateral (drop set)","Cable Lateral (cross-body)","Lean-Away Cable Lateral"],["Lateral (rest-pause)","Lateral (2-sec hold)","Lateral (cheat + control)"],["Cable Lateral (heavy)","Lateral (triple drop)","Lateral (1.5-rep)"],["DB Lateral Raise","Cable Lateral Raise","Machine Lateral"]][p-1][b], "4", sr.iso, adv),
      ex([["Tricep Pushdown (rope)","EZ-Bar Skull Crusher","Overhead Cable Ext."],["Skull Crusher (2-sec ecc)","Overhead Ext. (pause)","Pushdown (slow)"],["Pushdown (drop set)","Skull Crusher (drop)","Overhead (rest-pause)"],["Weighted Dip","JM Press","Skull Crusher (heavy)"],["Tricep Pushdown","Skull Crusher","Overhead Ext."]][p-1][b], "3-4", sr.iso, ""),
    ]
  };

  // ── SESSION C: Lower B — Hinge/Glute/Hamstring ───────────────────────────
  if (session === "C") return {
    name: "Lower B — Hinge & Glute",
    session: "C",
    warmup: "5 min bike + lying hamstring stretch + hip circles + banded clamshells ×20",
    exercises: [
      ex([["Romanian Deadlift (BB)","DB Romanian Deadlift","Trap Bar Deadlift"],["BB RDL (3-sec ecc)","Single-Leg RDL (BB)","BB RDL (pause knee)"],["BB RDL (rest-pause)","BB RDL (drop set)","Single-Leg RDL (slow)"],["Deadlift (conventional)","BB RDL (heavy)","Trap Bar DL (heavy)"],["Romanian Deadlift (BB)","Single-Leg RDL","DB RDL"]][p-1][b], sr.sets, sr.comp, adv),
      ex([["Barbell Hip Thrust","BB Hip Thrust (pause)","Hip Thrust (band+BB)"],["BB Hip Thrust (3-sec ecc)","Single-Leg Hip Thrust (BB)","Hip Thrust (slow+pause)"],["BB Hip Thrust (rest-pause)","Hip Thrust (drop set)","Hip Thrust (1.5-rep)"],["BB Hip Thrust (heavy)","Single-Leg Hip Thrust (heavy)","Hip Thrust (pause, heavy)"],["Barbell Hip Thrust","BB Hip Thrust (pause)","Single-Leg Hip Thrust"]][p-1][b], sr.sets, sr.glute, adv),
      ex([["Lying Leg Curl","Single-Leg Curl","Nordic Eccentric Curl"],["Leg Curl (3-sec ecc)","Nordic Eccentric","Single-Leg Curl (slow)"],["Leg Curl (drop set)","Leg Curl (rest-pause)","Leg Curl (1.5-rep)"],["Leg Curl (heavy)","Nordic Curl","Leg Curl (triple drop)"],["Lying Leg Curl","Single-Leg Curl","Leg Curl (slow)"]][p-1][b], sr.sets, sr.iso, adv),
      ex([["45-Degree Back Extension","Good Morning (BB)","Reverse Hyper"],["Back Ext (slow, weighted)","Good Morning (slow)","Reverse Hyper (weighted)"],["Back Ext (rest-pause)","Good Morning (pause)","Rev Hyper (drop set)"],["Good Morning (heavy)","Back Ext (heavy)","Reverse Hyper (heavy)"],["45-Degree Back Extension","Good Morning","Reverse Hyper"]][p-1][b], "4", "10-12", "Hip hinge — neutral spine"),
      ex([["Cable Pull-Through","KB Swing","Sumo Deadlift (light)"],["Cable Pull-Through (slow)","KB Swing (heavy)","Sumo DL (pause)"],["Pull-Through (rest-pause)","KB Swing (explosive)","Sumo DL (drop set)"],["KB Swing (heavy)","Pull-Through (heavy)","Sumo DL (heavy)"],["Cable Pull-Through","KB Swing","Hip Extension Machine"]][p-1][b], "3", "12-15", "Drive hips, not back"),
      ex([["Hip Abductor Machine","Cable Hip Abduction","Band Side Walk"],["Abductor (slow ecc)","Cable Abduction (standing)","Clamshell (weighted)"],["Abductor (drop set)","Cable Abduction (1.5-rep)","Monster Walk (band)"],["Abductor (heavy)","Cable Abduction (heavy)","Fire Hydrant (band)"],["Hip Abductor Machine","Band Side Walk","Cable Hip Abduction"]][p-1][b], "3", "15-20", ""),
      ex("Pallof Press", "3", "12 ea", "Anti-rotation — stay square"),
      ex("Plank (weighted)", "3", "30-45s", "Plate on back, full brace"),
    ]
  };

  // ── SESSION D: Upper Pull + Shoulders ───────────────────────────────────
  if (session === "D") return {
    name: "Upper Pull & Shoulders",
    session: "D",
    warmup: "Face pulls ×20 + band pull-aparts ×20 + prone Y/T/W ×10 + external rotation ×15",
    exercises: [
      ex("Cable Face Pull (rope)", "4", "15-20", "Every session — scapular health priority"),
      ex([["Weighted Pull-Up","Barbell Row","Weighted Chin-Up"],["Pull-Up (3-sec ecc)","BB Row (pause)","Chin-Up (slow)"],["Pull-Up (rest-pause)","BB Row (drop set)","Chin-Up (1.5-rep)"],["Weighted Pull-Up (heavy)","BB Row (heavy)","Chin-Up (heavy)"],["Weighted Pull-Up","Barbell Row","Weighted Chin-Up"]][p-1][b], sr.sets, sr.comp, adv),
      ex([["Seated Cable Row (wide)","Chest-Supported Row","Meadows Row"],["Cable Row (close, slow)","CS Row (slow ecc)","Single-Arm DB Row"],["Pendlay Row","Kroc Row","Seal Row"],["Meadows Row (heavy)","BB Row (heavy)","Cable Row (heavy)"],["Seated Cable Row","Chest-Supported Row","Single-Arm DB Row"]][p-1][b], sr.sets, sr.comp, adv),
      ex([["Lat Pulldown (wide)","Lat Pulldown (neutral)","Single-Arm LPD"],["LPD (underhand, slow)","Single-Arm LPD (slow)","Cable Pullover"],["LPD (drop set)","Straight-Arm Pulldown","LPD (rest-pause)"],["LPD (heavy)","Weighted Pull-Up","Cable Pullover (heavy)"],["Lat Pulldown","Single-Arm LPD","Cable Pullover"]][p-1][b], sr.sets, sr.comp, ""),
      ex([["Rear Delt DB Fly","Cable Reverse Fly","Prone Rear Delt Fly"],["Rear Delt (slow, 2-sec)","Cable RD (pause peak)","Prone RD (weighted)"],["Rear Delt (drop set)","Cable RD (rest-pause)","Rear Delt (1.5-rep)"],["Rear Delt (heavy)","Cable RD (triple drop)","Prone RD (heavy)"],["Rear Delt DB Fly","Cable Reverse Fly","Rear Delt Machine"]][p-1][b], "4", "15-20", adv),
      ex([["Barbell Shrug","DB Shrug","Cable Shrug"],["Shrug (3-sec hold)","DB Shrug (slow)","Farmer Carry"],["Shrug (drop set)","Shrug (rest-pause)","Farmer Carry (heavy)"],["Shrug (heavy)","Farmer Carry (heavy)","Trap Bar Shrug"],["Barbell Shrug","DB Shrug","Farmer Carry"]][p-1][b], "3", "12-15", "Full depression to elevation"),
      ex([["EZ-Bar Curl","DB Curl","Cable Curl"],["Barbell Drag Curl","Incline DB Curl","Preacher Curl"],["Bayesian Cable Curl","Curl (rest-pause)","DB Curl (1.5-rep)"],["Barbell Curl (heavy)","Preacher (heavy)","Curl (drop set)"],["EZ-Bar Curl","Incline DB Curl","Cable Curl"]][p-1][b], "3-4", sr.iso, adv),
    ]
  };

  // ── SESSION E: Glute/Hamstring Specialization ────────────────────────────
  if (session === "E") return {
    name: "Glute & Ham Specialization",
    session: "E",
    warmup: "10 min incline walk + hip flexor stretch ×60s + banded glute bridges ×20 + clamshells ×20",
    exercises: [
      ex([["Barbell Hip Thrust (pyramid)","BB Hip Thrust (high vol)","Hip Thrust (bands+BB)"],["BB Hip Thrust (3-sec ecc+pause)","Single-Leg Hip Thrust (BB)","Hip Thrust (slow+squeeze)"],["BB Hip Thrust (rest-pause ×3)","Hip Thrust (drop set)","Hip Thrust (1.5-rep, heavy)"],["BB Hip Thrust (max load)","Single-Leg Hip Thrust (heavy)","Hip Thrust (paused, max)"],["BB Hip Thrust (5×10)","Hip Thrust (pause)","Single-Leg Hip Thrust"]][p-1][b], "5", sr.glute, adv),
      ex([["Romanian Deadlift (BB)","DB RDL","Single-Leg RDL (BB)"],["BB RDL (3-sec ecc)","Single-Leg RDL (slow)","BB RDL (pause)"],["BB RDL (drop set)","Single-Leg RDL (rest-pause)","BB RDL (1.5-rep)"],["BB RDL (heavy)","Single-Leg RDL (heavy)","Trap Bar RDL"],["Romanian Deadlift (BB)","Single-Leg RDL","DB RDL"]][p-1][b], sr.sets, sr.comp, adv),
      ex([["Nordic Eccentric Curl","Lying Leg Curl","Stability Ball Curl"],["Nordic Curl (slow)","Leg Curl (3-sec ecc)","SB Curl (slow)"],["Nordic (drop: ecc only → full)","Leg Curl (drop set)","Leg Curl (1.5-rep)"],["Nordic Curl (weighted)","Leg Curl (heavy)","GHR"],["Nordic Eccentric Curl","Lying Leg Curl","Stability Ball Curl"]][p-1][b], "4", sr.iso, adv),
      ex([["Cable Kickback","Donkey Kick (band)","Hip Extension Machine"],["Cable Kickback (slow)","Donkey Kick (slow, weighted)","Hip Ext (slow ecc)"],["Cable Kickback (drop set)","Donkey Kick (rest-pause)","Hip Ext (rest-pause)"],["Cable Kickback (heavy)","Hip Ext (heavy)","Single-Leg Press (glute focus)"],["Cable Kickback","Donkey Kick (band)","Hip Extension Machine"]][p-1][b], "4", "12-15", "Squeeze at top, full ROM"),
      ex([["Sumo Deadlift","Sumo Stance KB Swing","Wide Stance Leg Press"],["Sumo DL (slow)","KB Swing (heavy)","Wide Press (slow ecc)"],["Sumo DL (drop set)","KB Swing (explosive)","Wide Press (rest-pause)"],["Sumo DL (heavy)","KB Swing (max)","Wide Press (heavy)"],["Sumo Deadlift","KB Swing","Wide Stance Leg Press"]][p-1][b], "3-4", sr.comp, "Inner glute/adductor emphasis"),
      ex([["Abductor Machine","Band Side Walk","Fire Hydrant (band)"],["Abductor (slow ecc)","Monster Walk","Cable Abduction (standing)"],["Abductor (drop set)","Side Walk (heavy band)","Cable Abduction (1.5-rep)"],["Abductor (heavy)","Fire Hydrant (weighted)","Cable Abduction (heavy)"],["Abductor Machine","Band Side Walk","Fire Hydrant"]][p-1][b], "3", "20-25", "High rep burnout — feel the burn"),
      ex("Glute Bridge (banded, BW — burnout)", "3", "25-30", "Squeeze hard at top, slow eccentric"),
    ]
  };

  return null;
}

// ─── STORAGE ──────────────────────────────────────────────────────────────────
const LS = {
  get: (k) => { try { return localStorage.getItem(k); } catch { return null; } },
  set: (k, v) => { try { localStorage.setItem(k, v); } catch {} },
};

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [currentWeek, setCurrentWeek] = useState(() => parseInt(LS.get("val_week") || "1"));
  const [weights, setWeights] = useState(() => { try { return JSON.parse(LS.get("val_weights") || "{}"); } catch { return {}; } });
  const [completed, setCompleted] = useState(() => { try { return JSON.parse(LS.get("val_completed") || "{}"); } catch { return {}; } });
  const [activeDay, setActiveDay] = useState(null);
  const [view, setView] = useState("schedule");

  const saveWeek = (w) => { setCurrentWeek(w); LS.set("val_week", String(w)); };
  const saveWeights = useCallback((w) => { setWeights(w); LS.set("val_weights", JSON.stringify(w)); }, []);
  const saveCompleted = useCallback((c) => { setCompleted(c); LS.set("val_completed", JSON.stringify(c)); }, []);

  const phaseNum = getPhaseNum(currentWeek);
  const phase = PHASES[phaseNum - 1];
  const deload = isDeload(currentWeek);

  const weekDays = [
    { label: "MON", dow: 1 }, { label: "TUE", dow: 2 }, { label: "WED", dow: 3 },
    { label: "THU", dow: 4 }, { label: "FRI", dow: 5 }, { label: "SAT", dow: 6 }, { label: "SUN", dow: 0 },
  ];

  if (view === "workout" && activeDay) {
    return <WorkoutView weekNum={activeDay.weekNum} session={activeDay.session}
      weights={weights} onSaveWeights={saveWeights}
      onComplete={(key) => saveCompleted({ ...completed, [key]: true })}
      completed={completed} onBack={() => setView("schedule")} deload={isDeload(activeDay.weekNum)} />;
  }
  if (view === "progress") {
    return <ProgressView weights={weights} completed={completed} onBack={() => setView("schedule")} currentWeek={currentWeek} />;
  }

  return (
    <div style={S.app}>
      {/* Header */}
      <div style={S.header}>
        <div style={S.headerRow}>
          <div>
            <div style={S.logo}>VALKYRIE<span style={{ color: phase.color }}>365</span></div>
            <div style={S.sublogo}>Ashley · 5-Day Split · Paul Carter Inspired</div>
          </div>
          <button onClick={() => setView("progress")} style={S.progressBtn}>📈 Progress</button>
        </div>
      </div>

      {/* Phase Banner */}
      <div style={{ ...S.phaseBanner, borderColor: phase.color, background: phase.color + "0d" }}>
        <div style={S.phaseBannerRow}>
          <div>
            <div style={{ ...S.phaseLabel, color: phase.color }}>PHASE {phaseNum} · WEEK {currentWeek} OF 52</div>
            <div style={S.phaseName}>{phase.name}</div>
            <div style={S.phaseFocus}>{phase.focus}</div>
          </div>
          {deload && <div style={S.deloadBadge}>🔄 DELOAD</div>}
        </div>
      </div>

      {/* Week Nav */}
      <div style={S.weekNav}>
        <button onClick={() => saveWeek(Math.max(1, currentWeek-1))} style={{ ...S.navBtn, borderColor: phase.color + "55" }} disabled={currentWeek===1}>‹</button>
        <div style={S.weekCenter}>
          <div style={S.weekBig}>Week {currentWeek}</div>
          <div style={S.weekSub}>of 52</div>
        </div>
        <button onClick={() => saveWeek(Math.min(52, currentWeek+1))} style={{ ...S.navBtn, borderColor: phase.color + "55" }} disabled={currentWeek===52}>›</button>
      </div>

      {/* Day Grid */}
      <div style={S.dayGrid}>
        {weekDays.map(({ label, dow }) => {
          const session = SESSION_MAP[dow];
          const isTraining = !!session;
          const key = `w${currentWeek}_${session}`;
          const done = completed[key];
          const color = session ? SESSION_COLORS[session] : "#333";
          return (
            <div key={dow}
              onClick={() => { if (isTraining) { setActiveDay({ weekNum: currentWeek, session }); setView("workout"); } }}
              style={{ ...S.dayCard, borderColor: done ? color : isTraining ? color+"44" : "#1e1a2a", background: done ? color+"15" : isTraining ? "#140f1e" : "#0f0d16", cursor: isTraining ? "pointer" : "default", opacity: isTraining ? 1 : 0.35 }}>
              <div style={S.dayLabel}>{label}</div>
              {isTraining ? (<>
                <div style={{ ...S.sessionBadge, color, background: color+"20" }}>{session}</div>
                <div style={{ fontSize: 8, color: done ? color : "#666", lineHeight: 1.3, textAlign: "center" }}>{SESSION_LABELS[session]}</div>
                {done && <div style={{ color, fontSize: 14, fontWeight: 700 }}>✓</div>}
              </>) : <div style={{ fontSize: 8, color: "#2a2535", letterSpacing: 1 }}>REST</div>}
            </div>
          );
        })}
      </div>

      {/* Phase Bar */}
      <div style={S.phaseBar}>
        <div style={S.phaseBarLabel}>PHASE PROGRESS — TAP TO JUMP</div>
        <div style={S.phaseTrack}>
          {PHASES.map((ph, i) => {
            const pNum = i+1;
            const wks = ph.weeks[1] - ph.weeks[0] + 1;
            const pct = (wks/52)*100;
            const active = phaseNum === pNum;
            const done = currentWeek > ph.weeks[1];
            return (
              <div key={i} onClick={() => saveWeek(ph.weeks[0])} title={`Phase ${pNum}: ${ph.name}`}
                style={{ width:`${pct}%`, height:"100%", background: done ? ph.color : active ? ph.color+"66" : "#1a1525", cursor:"pointer", position:"relative", transition:"all 0.3s" }}>
                {active && <div style={{ position:"absolute", inset:-2, border:`2px solid ${ph.color}`, borderRadius:2 }} />}
              </div>
            );
          })}
        </div>
        <div style={S.phaseLabels}>
          {PHASES.map((ph, i) => (
            <div key={i} onClick={() => saveWeek(ph.weeks[0])}
              style={{ fontSize: 9, cursor:"pointer", letterSpacing:1, color: phaseNum===i+1 ? ph.color : "#3a3050", fontWeight: phaseNum===i+1 ? 700 : 400 }}>
              {ph.short}
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div style={S.statsRow}>
        {[
          { label: "Sessions", val: Object.keys(completed).length, color: phase.color },
          { label: "Sets Logged", val: Object.values(weights).reduce((a,b) => a+(b.sets?.filter(s=>s.weight)?.length||0), 0), color: "#FF9A3C" },
          { label: "Weeks Done", val: [...new Set(Object.keys(completed).map(k=>k.split("_")[0]))].length, color: "#00D4AA" },
        ].map(({ label, val, color }) => (
          <div key={label} style={S.statCard}>
            <div style={{ ...S.statVal, color }}>{val}</div>
            <div style={S.statLabel}>{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── WORKOUT VIEW ─────────────────────────────────────────────────────────────
function WorkoutView({ weekNum, session, weights, onSaveWeights, onComplete, completed, onBack, deload }) {
  const workout = getWorkout(session, weekNum);
  const phaseNum = getPhaseNum(weekNum);
  const phase = PHASES[phaseNum-1];
  const key = `w${weekNum}_${session}`;
  const isDone = completed[key];
  const color = SESSION_COLORS[session];
  const [note, setNote] = useState(() => LS.get(`val_note_${key}`) || "");

  const saveNote = (v) => { setNote(v); LS.set(`val_note_${key}`, v); };
  const getKey = (i) => `w${weekNum}_${session}_${i}`;
  const updateSet = (ei, si, field, value) => {
    const k = getKey(ei);
    const prev = weights[k] || { sets: Array(8).fill(null).map(() => ({ weight:"", reps:"" })) };
    const sets = [...prev.sets];
    sets[si] = { ...sets[si], [field]: value };
    onSaveWeights({ ...weights, [k]: { ...prev, sets } });
  };
  const getSD = (ei, si) => weights[getKey(ei)]?.sets?.[si] || { weight:"", reps:"" };
  const nSets = (s) => { const m = s.match(/(\d+)/); return m ? parseInt(m[1]) : 3; };
  const isBW = (n) => ["Pallof","Plank","Dead Bug","McGill","Glute Bridge (banded"].some(k => n.includes(k));

  if (!workout) return null;

  return (
    <div style={S.app}>
      <div style={{ ...S.workoutHeader, borderBottomColor: color }}>
        <button onClick={onBack} style={S.backBtn}>← Back</button>
        <div style={{ flex:1, textAlign:"center" }}>
          <div style={{ ...S.sessionTag, color }}>WEEK {weekNum} · SESSION {session}</div>
          <div style={S.workoutTitle}>{workout.name}</div>
          <div style={S.phaseTag}>Phase {phaseNum}: {phase.name}</div>
        </div>
        {!isDone
          ? <button onClick={() => onComplete(key)} style={{ ...S.completeBtn, background: color }}>Done ✓</button>
          : <div style={{ color, fontSize:13, fontWeight:700, whiteSpace:"nowrap" }}>✓ Done</div>
        }
      </div>

      {deload && <div style={S.deloadAlert}>🔄 DELOAD — 60-70% load. Same reps. Full ROM. Recovery focus.</div>}

      <div style={S.warmupBar}>
        <span style={S.warmupLabel}>WARM-UP</span>
        <span style={S.warmupText}>{workout.warmup}</span>
      </div>

      <div style={S.exList}>
        {workout.exercises.map((ex, ei) => (
          <div key={ei} style={S.exCard}>
            <div style={S.exHeader}>
              <div style={{ ...S.exNum, background: color+"20", color }}>{ei+1}</div>
              <div style={{ flex:1 }}>
                <div style={S.exName}>{ex.exercise}</div>
                <div style={S.exMeta}>
                  <span style={{ ...S.pill, borderColor: color+"44" }}>{ex.sets} sets</span>
                  <span style={{ ...S.pill, borderColor: color+"44" }}>{ex.reps} reps</span>
                  {ex.notes && <span style={S.techPill}>{ex.notes}</span>}
                </div>
              </div>
            </div>
            {!isBW(ex.exercise) ? (
              <div style={S.setsGrid}>
                <div style={S.setsHead}>
                  <span style={S.setHdr}>SET</span>
                  <span style={S.setHdr}>WEIGHT (lbs)</span>
                  <span style={S.setHdr}>REPS DONE</span>
                </div>
                {Array.from({ length: nSets(ex.sets) }).map((_, si) => {
                  const sd = getSD(ei, si);
                  return (
                    <div key={si} style={S.setRow}>
                      <span style={{ ...S.setNum, color }}>{si+1}</span>
                      <input type="number" placeholder="lbs" value={sd.weight}
                        onChange={e => updateSet(ei, si, "weight", e.target.value)}
                        style={S.wInput} inputMode="decimal" />
                      <input type="number" placeholder={ex.reps} value={sd.reps}
                        onChange={e => updateSet(ei, si, "reps", e.target.value)}
                        style={S.rInput} inputMode="decimal" />
                    </div>
                  );
                })}
              </div>
            ) : <div style={S.bwNote}>Bodyweight / Band — log in notes if needed</div>}
          </div>
        ))}
      </div>

      <div style={S.noteBox}>
        <div style={S.noteLabel}>SESSION NOTES</div>
        <textarea placeholder="Energy, PRs, pain, mood..." value={note}
          onChange={e => saveNote(e.target.value)} style={S.noteInput} />
      </div>
    </div>
  );
}

// ─── PROGRESS VIEW ────────────────────────────────────────────────────────────
function ProgressView({ weights, completed, onBack, currentWeek }) {
  const totalSessions = Object.keys(completed).length;
  const totalSets = Object.values(weights).reduce((a,b) => a+(b.sets?.filter(s=>s.weight)?.length||0), 0);
  const weeksLogged = [...new Set(Object.keys(completed).map(k=>k.split("_")[0]))].length;

  const prs = {};
  Object.entries(weights).forEach(([key, data]) => {
    const parts = key.split("_");
    if (parts.length < 3) return;
    const wk = parseInt(parts[0].replace("w",""));
    const sess = parts[1];
    const ei = parseInt(parts[2]);
    try {
      const wo = getWorkout(sess, wk);
      const ex = wo?.exercises?.[ei];
      if (!ex) return;
      data.sets?.forEach(s => {
        if (!s?.weight) return;
        const w = parseFloat(s.weight);
        if (!prs[ex.exercise] || w > prs[ex.exercise]) prs[ex.exercise] = w;
      });
    } catch {}
  });
  const prList = Object.entries(prs).sort((a,b) => b[1]-a[1]).slice(0, 12);
  const topPhase = PHASES[getPhaseNum(currentWeek)-1];

  return (
    <div style={S.app}>
      <div style={{ ...S.workoutHeader, borderBottomColor: topPhase.color }}>
        <button onClick={onBack} style={S.backBtn}>← Back</button>
        <div style={{ flex:1, textAlign:"center" }}>
          <div style={{ ...S.sessionTag, color: topPhase.color }}>ASHLEY'S PROGRESS</div>
          <div style={S.workoutTitle}>Stats & PRs</div>
        </div>
        <div style={{ width:60 }} />
      </div>

      <div style={S.statsRow2}>
        {[
          { label:"Sessions", val:totalSessions, color:"#E040FB" },
          { label:"Sets", val:totalSets, color:"#FF9A3C" },
          { label:"Weeks", val:weeksLogged, color:"#00D4AA" },
          { label:"Cur Wk", val:currentWeek, color:"#4FACFE" },
        ].map(({ label, val, color }) => (
          <div key={label} style={S.statCard2}>
            <div style={{ ...S.statVal, color }}>{val}</div>
            <div style={S.statLabel}>{label}</div>
          </div>
        ))}
      </div>

      <div style={S.sectionTitle}>TOP WEIGHTS LOGGED</div>
      {prList.length === 0
        ? <div style={S.empty}>No weights logged yet — start a session!</div>
        : <div style={{ padding:"0 12px", display:"flex", flexDirection:"column", gap:6 }}>
            {prList.map(([name, w], i) => {
              const phColor = ["#E040FB","#FF6B9D","#FF9A3C","#00D4AA","#4FACFE"][i%5];
              return (
                <div key={name} style={{ ...S.prRow, borderColor: phColor+"33" }}>
                  <div style={{ fontSize:11, color:"#444", width:20, textAlign:"right" }}>{i+1}</div>
                  <div style={{ flex:1, fontSize:13, color:"#ddd" }}>{name}</div>
                  <div style={{ fontSize:16, fontWeight:700, color: phColor }}>{w} <span style={{ color:"#444", fontSize:11 }}>lbs</span></div>
                </div>
              );
            })}
          </div>
      }

      <div style={S.sectionTitle}>PHASE COMPLETION</div>
      <div style={{ padding:"0 12px 40px", display:"flex", flexDirection:"column", gap:8 }}>
        {PHASES.map((ph, i) => {
          const sessInPhase = Object.keys(completed).filter(k => {
            const wk = parseInt(k.split("_")[0].replace("w",""));
            return wk >= ph.weeks[0] && wk <= ph.weeks[1];
          }).length;
          const maxSess = (ph.weeks[1]-ph.weeks[0]+1)*5; // 5 training days
          const pct = Math.min(100, Math.round((sessInPhase/maxSess)*100));
          return (
            <div key={i} style={S.phaseCard}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                <div>
                  <div style={{ fontSize:9, color:"#3a3050", letterSpacing:2 }}>PHASE {i+1}</div>
                  <div style={{ fontSize:14, fontWeight:700, color: ph.color }}>{ph.name}</div>
                  <div style={{ fontSize:10, color:"#55455a", marginTop:2 }}>Wk {ph.weeks[0]}–{ph.weeks[1]}</div>
                </div>
                <div style={{ fontSize:20, fontWeight:700, color: ph.color }}>{pct}%</div>
              </div>
              <div style={{ height:4, background:"#1a1525", borderRadius:2 }}>
                <div style={{ width:`${pct}%`, height:"100%", background: ph.color, borderRadius:2, transition:"width 0.5s" }} />
              </div>
              <div style={{ fontSize:10, color:"#3a3050", marginTop:4 }}>{sessInPhase} / {maxSess} sessions</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const S = {
  app: { background:"#0d0a14", minHeight:"100vh", color:"#e8e0f0", fontFamily:"'DM Sans', sans-serif", maxWidth:520, margin:"0 auto", paddingBottom:60 },
  header: { padding:"18px 18px 12px", borderBottom:"1px solid #1a1525" },
  headerRow: { display:"flex", justifyContent:"space-between", alignItems:"center" },
  logo: { fontSize:22, fontWeight:900, letterSpacing:3, color:"#fff", fontFamily:"'Cinzel', serif" },
  sublogo: { fontSize:10, color:"#4a3d5a", letterSpacing:2, marginTop:3 },
  progressBtn: { background:"#1a1525", border:"1px solid #2a1f3d", color:"#8870aa", padding:"8px 14px", borderRadius:8, cursor:"pointer", fontSize:13, fontFamily:"inherit" },
  phaseBanner: { margin:"12px 14px", padding:"14px 16px", borderLeft:"3px solid", borderRadius:"0 10px 10px 0" },
  phaseBannerRow: { display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:8 },
  phaseLabel: { fontSize:9, letterSpacing:3, fontWeight:700, marginBottom:4 },
  phaseName: { fontSize:19, fontWeight:700, color:"#fff", fontFamily:"'Cinzel', serif", marginBottom:4 },
  phaseFocus: { fontSize:11, color:"#6a5580", lineHeight:1.6 },
  deloadBadge: { background:"#1a0a1f", border:"1px solid #E040FB44", color:"#E040FB", padding:"6px 12px", borderRadius:20, fontSize:10, fontWeight:700, letterSpacing:1 },
  weekNav: { display:"flex", alignItems:"center", justifyContent:"center", gap:24, padding:"14px 20px" },
  navBtn: { background:"#140f1e", border:"1px solid", color:"#fff", width:38, height:38, borderRadius:"50%", cursor:"pointer", fontSize:18, fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center" },
  weekCenter: { textAlign:"center" },
  weekBig: { fontSize:22, fontWeight:700, color:"#fff" },
  weekSub: { fontSize:12, color:"#4a3d5a" },
  dayGrid: { display:"grid", gridTemplateColumns:"repeat(7, 1fr)", gap:5, padding:"0 10px 14px" },
  dayCard: { border:"1px solid", borderRadius:10, padding:"8px 4px", textAlign:"center", transition:"all 0.15s", minHeight:90, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:4 },
  dayLabel: { fontSize:8, letterSpacing:1, color:"#3a3050", fontWeight:700 },
  sessionBadge: { fontSize:15, fontWeight:700, padding:"2px 8px", borderRadius:6, letterSpacing:1 },
  phaseBar: { padding:"0 14px 14px" },
  phaseBarLabel: { fontSize:9, color:"#3a3050", letterSpacing:2, marginBottom:8 },
  phaseTrack: { display:"flex", height:6, borderRadius:3, overflow:"hidden", gap:2 },
  phaseLabels: { display:"flex", justifyContent:"space-between", marginTop:6 },
  statsRow: { display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:8, padding:"0 12px" },
  statCard: { background:"#110d1a", border:"1px solid #1e1830", borderRadius:12, padding:"14px 8px", textAlign:"center" },
  statVal: { fontSize:26, fontWeight:700 },
  statLabel: { fontSize:9, color:"#4a3d5a", letterSpacing:1, marginTop:3 },
  workoutHeader: { display:"flex", alignItems:"center", gap:10, padding:"14px 14px", borderBottom:"1px solid", position:"sticky", top:0, background:"#0d0a14", zIndex:10 },
  backBtn: { background:"none", border:"none", color:"#6a5580", cursor:"pointer", fontSize:14, padding:"6px 0", fontFamily:"inherit" },
  sessionTag: { fontSize:9, letterSpacing:3, fontWeight:700, marginBottom:2 },
  workoutTitle: { fontSize:15, fontWeight:700, color:"#fff", fontFamily:"'Cinzel', serif" },
  phaseTag: { fontSize:10, color:"#4a3d5a", marginTop:2 },
  completeBtn: { border:"none", color:"#0d0a14", fontWeight:700, padding:"8px 12px", borderRadius:8, cursor:"pointer", fontSize:12, fontFamily:"inherit", whiteSpace:"nowrap" },
  deloadAlert: { background:"#1a0a1f", borderLeft:"3px solid #E040FB", color:"#E040FB", padding:"10px 16px", fontSize:12, lineHeight:1.6 },
  warmupBar: { background:"#110d1a", padding:"10px 16px", display:"flex", gap:10, alignItems:"flex-start" },
  warmupLabel: { fontSize:9, color:"#4a3d5a", letterSpacing:2, fontWeight:700, whiteSpace:"nowrap", paddingTop:1 },
  warmupText: { fontSize:12, color:"#6a5580", lineHeight:1.6 },
  exList: { padding:"8px 12px", display:"flex", flexDirection:"column", gap:10 },
  exCard: { background:"#110d1a", border:"1px solid #1e1830", borderRadius:12, overflow:"hidden" },
  exHeader: { display:"flex", gap:10, padding:"12px 12px 8px", alignItems:"flex-start" },
  exNum: { width:28, height:28, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, flexShrink:0, marginTop:2 },
  exName: { fontSize:14, fontWeight:700, color:"#f0e8ff", marginBottom:6, lineHeight:1.3 },
  exMeta: { display:"flex", gap:5, flexWrap:"wrap" },
  pill: { border:"1px solid", borderRadius:4, padding:"2px 7px", fontSize:10, color:"#6a5580" },
  techPill: { background:"#1f0a2f", border:"1px solid #E040FB33", borderRadius:4, padding:"2px 7px", fontSize:10, color:"#E040FB" },
  setsGrid: { padding:"0 12px 12px" },
  setsHead: { display:"grid", gridTemplateColumns:"26px 1fr 1fr", gap:6, marginBottom:4 },
  setHdr: { fontSize:9, color:"#2a2035", letterSpacing:1 },
  setRow: { display:"grid", gridTemplateColumns:"26px 1fr 1fr", gap:6, marginBottom:6, alignItems:"center" },
  setNum: { fontSize:12, fontWeight:700, textAlign:"center" },
  wInput: { background:"#0a0810", border:"1px solid #2a1f3d", borderRadius:6, padding:"8px 6px", color:"#f0e8ff", fontSize:16, fontFamily:"inherit", width:"100%", boxSizing:"border-box", textAlign:"center" },
  rInput: { background:"#0a0810", border:"1px solid #2a1f3d", borderRadius:6, padding:"8px 6px", color:"#8870aa", fontSize:16, fontFamily:"inherit", width:"100%", boxSizing:"border-box", textAlign:"center" },
  bwNote: { padding:"4px 12px 12px", fontSize:11, color:"#3a3050", fontStyle:"italic" },
  noteBox: { padding:"12px 16px" },
  noteLabel: { fontSize:9, color:"#4a3d5a", letterSpacing:2, marginBottom:8 },
  noteInput: { width:"100%", background:"#110d1a", border:"1px solid #1e1830", borderRadius:10, padding:12, color:"#8870aa", fontSize:13, fontFamily:"inherit", resize:"vertical", minHeight:80, boxSizing:"border-box" },
  statsRow2: { display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:8, padding:"16px 12px 8px" },
  statCard2: { background:"#110d1a", border:"1px solid #1e1830", borderRadius:10, padding:"10px 6px", textAlign:"center" },
  sectionTitle: { fontSize:9, color:"#3a3050", letterSpacing:3, padding:"16px 16px 8px", fontWeight:700 },
  empty: { textAlign:"center", color:"#3a3050", padding:"30px 0", fontSize:13 },
  prRow: { display:"flex", alignItems:"center", gap:12, background:"#110d1a", border:"1px solid", borderRadius:10, padding:"10px 14px" },
  phaseCard: { background:"#110d1a", border:"1px solid #1e1830", borderRadius:10, padding:"12px 14px" },
};
