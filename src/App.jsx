import { useState, useCallback, useEffect, useRef } from "react";

// ─── VALKYRIE 365 — Paul Carter Inspired ──────────────────────────────────────
// 5-day split: Mon=Lower A, Tue=Upper Push, Wed=Lower B, Thu=Upper Pull, Fri=Glute Special
// Light theme · Per-exercise notes · Phase-appropriate rest periods

const PHASES = [
  { name: "Foundation",        weeks: [1,8],   focus: "4×10-12 | RPE 7 | Build work capacity", color: "#9333EA", bg: "#f5f0ff", short: "FOUND" },
  { name: "Volume Drive",      weeks: [9,20],  focus: "4-5×8-12 | RPE 7-8 | 18-20 sets/muscle/wk", color: "#DB2777", bg: "#fff0f7", short: "VOL" },
  { name: "Intensification",   weeks: [21,32], focus: "4-5×6-10 | RPE 8-9 | Slow eccentrics", color: "#EA580C", bg: "#fff7f0", short: "INT" },
  { name: "Peak Strength",     weeks: [33,44], focus: "5×4-8 | RPE 9 | Heavy compounds", color: "#059669", bg: "#f0fdf9", short: "PEAK" },
  { name: "Recomp & Maintain", weeks: [45,52], focus: "4×8-12 | RPE 7-8 | Deload every 4th wk", color: "#2563EB", bg: "#eff6ff", short: "RECOMP" },
];

function getRest(phase, exType) {
  const r = {
    1: { compound:"Rest 90 sec — moderate load, focus on form", isolation:"Rest 60 sec — keep intensity manageable", glute:"Rest 60-90 sec — full squeeze before next set", core:"Rest 45 sec", calf:"Rest 45 sec — full stretch each set" },
    2: { compound:"Rest 60-90 sec — high volume, keep rest tight", isolation:"Rest 45-60 sec — chase the pump", glute:"Rest 60 sec — feel the glute load each rep", core:"Rest 30-45 sec", calf:"Rest 45 sec" },
    3: { compound:"Rest 2-3 min — heavier loads need full recovery", isolation:"Rest 60-90 sec — advanced techniques need recovery", glute:"Rest 90 sec — heavy hip thrust needs full reset", core:"Rest 45 sec", calf:"Rest 60 sec" },
    4: { compound:"Rest 3-4 min — max effort, take every second", isolation:"Rest 90 sec — high intensity, recover fully", glute:"Rest 2 min — max load, full recovery required", core:"Rest 60 sec", calf:"Rest 60 sec" },
    5: { compound:"Rest 90 sec — moderate load, efficient sessions", isolation:"Rest 60 sec — moderate intensity", glute:"Rest 60-90 sec", core:"Rest 45 sec", calf:"Rest 45 sec" },
  };
  return r[phase]?.[exType] || "Rest 60-90 sec";
}

const SESSION_MAP    = { 1:"A", 2:"B", 3:"C", 4:"D", 5:"E", 6:null, 0:null };
const SESSION_COLORS = { A:"#9333EA", B:"#DB2777", C:"#EA580C", D:"#059669", E:"#2563EB" };
const SESSION_BG     = { A:"#f5f0ff", B:"#fff0f7", C:"#fff7f0", D:"#f0fdf9", E:"#eff6ff" };
const SESSION_LABELS = {
  A: "Lower A · Quad & Glute",
  B: "Upper Push",
  C: "Lower B · Hinge & Glute",
  D: "Upper Pull · Shoulders",
  E: "Glute & Ham Specialization",
};

function getPhaseNum(w) {
  for (let i = 0; i < PHASES.length; i++)
    if (w >= PHASES[i].weeks[0] && w <= PHASES[i].weeks[1]) return i + 1;
  return 5;
}
function getBlock(w) { return Math.floor((w - 1) / 4) % 3; }
function isDeload(w) {
  if ([16,20,28,32,40,44].includes(w)) return true;
  if (w >= 45 && (w - 45) % 4 === 3) return true;
  return false;
}
function getSR(phase) {
  return [
    { sets:"4",   comp:"10-12", iso:"12-15", glute:"12-15" },
    { sets:"4-5", comp:"8-12",  iso:"10-12", glute:"10-15" },
    { sets:"4-5", comp:"6-10",  iso:"10-12", glute:"8-12"  },
    { sets:"5",   comp:"4-8",   iso:"8-12",  glute:"8-12"  },
    { sets:"4",   comp:"8-12",  iso:"10-15", glute:"10-15" },
  ][phase - 1] || { sets:"4", comp:"8-12", iso:"12-15", glute:"12-15" };
}
function getTech(phase, block) {
  if (phase < 3) return "";
  return [
    ["2-sec eccentric","Pause at peak contraction","1.5-rep method"],
    ["Drop set on last set","Rest-pause (10+5)","Mechanical drop set"],
    ["3-sec eccentric + squeeze","Triple drop set","21s method"],
    ["Double rest-pause","Heavy partials at top","Slow eccentric + pause"],
    ["Drop set","Rest-pause","Slow eccentric"],
  ][phase - 1][block % 3];
}
function ex(name, sets, reps, notes, restType) { return { exercise:name, sets, reps, notes:notes||"", restType:restType||"isolation" }; }
function pick(table, p, b) { const row = table[Math.min(p-1,table.length-1)]; return row[b%row.length]; }

function getWorkout(session, weekNum) {
  const p = getPhaseNum(weekNum);
  const b = getBlock(weekNum);
  const sr = getSR(p);
  const adv = p >= 3 ? getTech(p, b) : "";

  if (session === "A") {
    const squat    = pick([["Barbell Back Squat","Barbell Back Squat (pause)","High-Bar Squat"],["Barbell Back Squat (2-sec)","Front Squat","BB Squat (tempo)"],["Barbell Squat (drop set)","Pause Squat (heavy)","Front Squat (heavy)"],["Barbell Back Squat (heavy)","Front Squat (heavy)","Low-Bar Squat"],["Barbell Back Squat","Pause Squat","Front Squat"]], p, b);
    const legPress = pick([["Leg Press (high foot)","Leg Press (wide)","Leg Press (low foot)"],["Leg Press (slow ecc)","Single-Leg Press","Leg Press (pause bottom)"],["Leg Press (drop set)","Leg Press (rest-pause)","Single-Leg Press (heavy)"],["Leg Press (heavy)","Single-Leg Press (heavy)","Leg Press (1.5-rep)"],["Leg Press","Single-Leg Press","Leg Press (slow)"]], p, b);
    const lunge    = pick([["DB Bulgarian Split Squat","Reverse Lunge (BB)","Step-Up (DB)"],["BSS (pause at bottom)","Reverse Lunge (deficit)","Step-Up (heavy)"],["BSS (1.5-rep)","Lunge (drop set)","Deficit Reverse Lunge (slow)"],["BSS (heavy)","Walking Lunge (BB)","Split Squat (heavy)"],["Bulgarian Split Squat","Reverse Lunge","Step-Up"]], p, b);
    const hipT     = pick([["Barbell Hip Thrust","BB Hip Thrust (2-sec pause)","BB Hip Thrust (band)"],["BB Hip Thrust (slow ecc)","Single-Leg Hip Thrust","Hip Thrust (band+BB)"],["BB Hip Thrust (rest-pause)","Hip Thrust (drop set)","Hip Thrust (1.5-rep)"],["BB Hip Thrust (heavy)","Hip Thrust (paused, heavy)","Single-Leg Hip Thrust (heavy)"],["Barbell Hip Thrust","BB Hip Thrust (pause)","Single-Leg Hip Thrust"]], p, b);
    const legExt   = pick([["Leg Extension","Leg Extension (slow ecc)","Leg Extension (1.5-rep)"],["Leg Extension (2-sec ecc)","Leg Extension (unilateral)","Leg Extension (pause top)"],["Leg Extension (drop set)","Leg Extension (rest-pause)","Leg Extension (mech drop)"],["Leg Extension (heavy)","Leg Extension (triple drop)","Leg Extension (21s)"],["Leg Extension","Leg Extension (slow)","Leg Extension (unilateral)"]], p, b);
    const calf     = pick([["Seated Calf Raise","Standing Calf Raise","Single-Leg Calf Raise"],["Single-Leg Calf (slow)","Calf Raise (pause stretch)","Seated Calf (heavy)"],["Calf Raise (drop set)","Calf Raise (rest-pause)","Single-Leg Calf (ecc only)"],["Calf Raise (heavy)","Single-Leg Calf Raise","Calf Raise (1.5-rep)"],["Seated Calf Raise","Standing Calf Raise","Single-Leg Calf Raise"]], p, b);
    return { name:"Lower A — Quad & Glute", session:"A",
      warmup:"10 min bike + hip flexor stretch + banded clamshells ×20 + glute bridges ×15",
      exercises:[
        ex(squat,   sr.sets, sr.comp, adv,                    "compound"),
        ex(legPress,sr.sets, sr.comp, adv,                    "compound"),
        ex(lunge,   "4",     sr.comp, "",                     "compound"),
        ex(hipT,    sr.sets, sr.glute,adv,                    "glute"),
        ex(legExt,  "4",     sr.iso,  adv,                    "isolation"),
        ex(calf,    "4",     "12-15", "Full ROM, pause at stretch","calf"),
        ex("McGill Curl-Up","3","10 ea","No lumbar flexion",  "core"),
        ex("Dead Bug",      "3","10 ea","Exhale, flat back",  "core"),
      ]};
  }

  if (session === "B") {
    const bench   = pick([["Barbell Bench Press","DB Bench Press","Close-Grip Bench"],["Barbell Bench (2-sec ecc)","DB Bench (pause chest)","Barbell Bench (tempo)"],["Barbell Bench (rest-pause)","DB Bench (drop set)","Barbell Bench (1.5-rep)"],["Barbell Bench (heavy)","Close-Grip Bench (heavy)","DB Bench (mech drop)"],["Barbell Bench Press","DB Bench Press","Close-Grip Bench"]], p, b);
    const incline = pick([["DB Incline Press","Barbell Incline","Machine Incline"],["DB Incline (2-sec lower)","DB Incline (pause chest)","Cable Incline Fly"],["DB Incline (rest-pause)","DB Incline (drop set)","DB Incline (1.5-rep)"],["DB Incline (heavy)","Barbell Incline (heavy)","Machine Incline (pause)"],["DB Incline Press","Cable Incline Fly","DB Incline (slow)"]], p, b);
    const fly     = pick([["Low-to-High Cable Fly","Pec Dec","DB Fly"],["Cable Fly (2-sec peak)","Pec Dec (slow ecc)","DB Fly (pause peak)"],["Cable Fly (drop set)","Pec Dec (rest-pause)","Cable Fly (1.5-rep)"],["Cable Fly (heavy)","Pec Dec (triple drop)","Weighted Dip"],["Low-to-High Cable Fly","Pec Dec","High-to-Low Cable Fly"]], p, b);
    const ohp     = pick([["DB Shoulder Press","Arnold Press","Barbell OHP"],["DB Press (slow ecc)","Arnold Press (pause)","Cable Shoulder Press"],["DB Press (rest-pause)","DB Press (drop set)","DB Press (1.5-rep)"],["Barbell OHP (heavy)","DB Press (heavy)","Z-Press"],["DB Shoulder Press","Arnold Press","Machine Shoulder Press"]], p, b);
    const lateral = pick([["DB Lateral Raise","Cable Lateral Raise","Machine Lateral"],["Lateral (drop set)","Cable Lateral (cross-body)","Lean-Away Cable Lateral"],["Lateral (rest-pause)","Lateral (2-sec hold)","Lateral (cheat + control)"],["Cable Lateral (heavy)","Lateral (triple drop)","Lateral (1.5-rep)"],["DB Lateral Raise","Cable Lateral Raise","Machine Lateral"]], p, b);
    const tri     = pick([["Tricep Pushdown (rope)","EZ-Bar Skull Crusher","Overhead Cable Ext."],["Skull Crusher (2-sec ecc)","Overhead Ext. (pause)","Pushdown (slow)"],["Pushdown (drop set)","Skull Crusher (drop)","Overhead (rest-pause)"],["Weighted Dip","JM Press","Skull Crusher (heavy)"],["Tricep Pushdown","Skull Crusher","Overhead Ext."]], p, b);
    return { name:"Upper Push", session:"B",
      warmup:"Band pull-aparts ×20 + shoulder CARs + thoracic rotations + push-up warm-up ×10",
      exercises:[
        ex(bench,  sr.sets, sr.comp, adv, "compound"),
        ex(incline,sr.sets, sr.comp, adv, "compound"),
        ex(fly,    "4",     sr.iso,  adv, "isolation"),
        ex(ohp,    sr.sets, sr.comp, adv, "compound"),
        ex(lateral,"4",     sr.iso,  adv, "isolation"),
        ex(tri,    "3-4",   sr.iso,  "",  "isolation"),
      ]};
  }

  if (session === "C") {
    const rdl      = pick([["Romanian Deadlift (BB)","DB Romanian Deadlift","Trap Bar Deadlift"],["BB RDL (3-sec ecc)","Single-Leg RDL (BB)","BB RDL (pause knee)"],["BB RDL (rest-pause)","BB RDL (drop set)","Single-Leg RDL (slow)"],["Deadlift (conventional)","BB RDL (heavy)","Trap Bar DL (heavy)"],["Romanian Deadlift (BB)","Single-Leg RDL","DB RDL"]], p, b);
    const hipT2    = pick([["Barbell Hip Thrust","BB Hip Thrust (pause)","Hip Thrust (band+BB)"],["BB Hip Thrust (3-sec ecc)","Single-Leg Hip Thrust (BB)","Hip Thrust (slow+pause)"],["BB Hip Thrust (rest-pause)","Hip Thrust (drop set)","Hip Thrust (1.5-rep)"],["BB Hip Thrust (heavy)","Single-Leg Hip Thrust (heavy)","Hip Thrust (pause, heavy)"],["Barbell Hip Thrust","BB Hip Thrust (pause)","Single-Leg Hip Thrust"]], p, b);
    const legCurl  = pick([["Lying Leg Curl","Single-Leg Curl","Nordic Eccentric Curl"],["Leg Curl (3-sec ecc)","Nordic Eccentric","Single-Leg Curl (slow)"],["Leg Curl (drop set)","Leg Curl (rest-pause)","Leg Curl (1.5-rep)"],["Leg Curl (heavy)","Nordic Curl","Leg Curl (triple drop)"],["Lying Leg Curl","Single-Leg Curl","Leg Curl (slow)"]], p, b);
    const backExt  = pick([["45-Degree Back Extension","Reverse Hyper","Good Morning (BB)"],["Back Ext (slow, weighted)","Reverse Hyper (weighted)","Good Morning (slow)"],["Back Ext (rest-pause)","Rev Hyper (drop set)","Good Morning (pause)"],["Back Ext (heavy)","Reverse Hyper (heavy)","Good Morning (heavy)"],["45-Degree Back Extension","Reverse Hyper","Good Morning"]], p, b);
    const pullThru = pick([["Cable Pull-Through","KB Swing","Sumo Deadlift (light)"],["Cable Pull-Through (slow)","KB Swing (heavy)","Sumo DL (pause)"],["Pull-Through (rest-pause)","KB Swing (explosive)","Sumo DL (drop set)"],["KB Swing (heavy)","Pull-Through (heavy)","Sumo DL (heavy)"],["Cable Pull-Through","KB Swing","Hip Extension Machine"]], p, b);
    const abduct   = pick([["Hip Abductor Machine","Cable Hip Abduction","Band Side Walk"],["Abductor (slow ecc)","Cable Abduction (standing)","Clamshell (weighted)"],["Abductor (drop set)","Cable Abduction (1.5-rep)","Monster Walk (band)"],["Abductor (heavy)","Cable Abduction (heavy)","Fire Hydrant (band)"],["Hip Abductor Machine","Band Side Walk","Cable Hip Abduction"]], p, b);
    return { name:"Lower B — Hinge & Glute", session:"C",
      warmup:"5 min bike + lying hamstring stretch + hip circles + banded clamshells ×20",
      exercises:[
        ex(rdl,     sr.sets, sr.comp, adv,                    "compound"),
        ex(hipT2,   sr.sets, sr.glute,adv,                    "glute"),
        ex(legCurl, sr.sets, sr.iso,  adv,                    "isolation"),
        ex(backExt, "4",     "10-12", "Hip hinge — neutral spine","compound"),
        ex(pullThru,"3",     "12-15", "Drive hips, not back", "isolation"),
        ex(abduct,  "3",     "15-20", "",                     "isolation"),
        ex("Pallof Press",    "3","12 ea","Anti-rotation — stay square","core"),
        ex("Plank (weighted)","3","30-45s","Plate on back, full brace","core"),
      ]};
  }

  if (session === "D") {
    const pullUp  = pick([["Weighted Pull-Up","Barbell Row","Weighted Chin-Up"],["Pull-Up (3-sec ecc)","BB Row (pause)","Chin-Up (slow)"],["Pull-Up (rest-pause)","BB Row (drop set)","Chin-Up (1.5-rep)"],["Weighted Pull-Up (heavy)","BB Row (heavy)","Chin-Up (heavy)"],["Weighted Pull-Up","Barbell Row","Weighted Chin-Up"]], p, b);
    const row     = pick([["Seated Cable Row (wide)","Chest-Supported Row","Meadows Row"],["Cable Row (close, slow)","CS Row (slow ecc)","Single-Arm DB Row"],["Pendlay Row","Kroc Row","Seal Row"],["Meadows Row (heavy)","BB Row (heavy)","Cable Row (heavy)"],["Seated Cable Row","Chest-Supported Row","Single-Arm DB Row"]], p, b);
    const lpd     = pick([["Lat Pulldown (wide)","Lat Pulldown (neutral)","Single-Arm LPD"],["LPD (underhand, slow)","Single-Arm LPD (slow)","Cable Pullover"],["LPD (drop set)","Straight-Arm Pulldown","LPD (rest-pause)"],["LPD (heavy)","Weighted Pull-Up","Cable Pullover (heavy)"],["Lat Pulldown","Single-Arm LPD","Cable Pullover"]], p, b);
    const rdelt   = pick([["Rear Delt DB Fly","Cable Reverse Fly","Prone Rear Delt Fly"],["Rear Delt (slow, 2-sec)","Cable RD (pause peak)","Prone RD (weighted)"],["Rear Delt (drop set)","Cable RD (rest-pause)","Rear Delt (1.5-rep)"],["Rear Delt (heavy)","Cable RD (triple drop)","Prone RD (heavy)"],["Rear Delt DB Fly","Cable Reverse Fly","Rear Delt Machine"]], p, b);
    const shrug   = pick([["Barbell Shrug","DB Shrug","Cable Shrug"],["Shrug (3-sec hold)","DB Shrug (slow)","Farmer Carry"],["Shrug (drop set)","Shrug (rest-pause)","Farmer Carry (heavy)"],["Shrug (heavy)","Farmer Carry (heavy)","Trap Bar Shrug"],["Barbell Shrug","DB Shrug","Farmer Carry"]], p, b);
    const curl    = pick([["EZ-Bar Curl","DB Curl","Cable Curl"],["Barbell Drag Curl","Incline DB Curl","Preacher Curl"],["Bayesian Cable Curl","Curl (rest-pause)","DB Curl (1.5-rep)"],["Barbell Curl (heavy)","Preacher (heavy)","Curl (drop set)"],["EZ-Bar Curl","Incline DB Curl","Cable Curl"]], p, b);
    return { name:"Upper Pull & Shoulders", session:"D",
      warmup:"Face pulls ×20 + band pull-aparts ×20 + prone Y/T/W ×10 + external rotation ×15",
      exercises:[
        ex("Cable Face Pull (rope)","4","15-20","Every session — scapular health priority","isolation"),
        ex(pullUp, sr.sets, sr.comp, adv, "compound"),
        ex(row,    sr.sets, sr.comp, adv, "compound"),
        ex(lpd,    sr.sets, sr.comp, "",  "compound"),
        ex(rdelt,  "4",     "15-20", adv, "isolation"),
        ex(shrug,  "3",     "12-15", "Full depression to elevation","isolation"),
        ex(curl,   "3-4",   sr.iso,  adv, "isolation"),
      ]};
  }

  if (session === "E") {
    const hipSpec = pick([["BB Hip Thrust (pyramid)","BB Hip Thrust (high vol)","Hip Thrust (bands+BB)"],["BB Hip Thrust (3-sec ecc+pause)","Single-Leg Hip Thrust (BB)","Hip Thrust (slow+squeeze)"],["BB Hip Thrust (rest-pause ×3)","Hip Thrust (drop set)","Hip Thrust (1.5-rep, heavy)"],["BB Hip Thrust (max load)","Single-Leg Hip Thrust (heavy)","Hip Thrust (paused, max)"],["BB Hip Thrust (5×10)","Hip Thrust (pause)","Single-Leg Hip Thrust"]], p, b);
    const rdlSpec = pick([["Romanian Deadlift (BB)","DB RDL","Single-Leg RDL (BB)"],["BB RDL (3-sec ecc)","Single-Leg RDL (slow)","BB RDL (pause)"],["BB RDL (drop set)","Single-Leg RDL (rest-pause)","BB RDL (1.5-rep)"],["BB RDL (heavy)","Single-Leg RDL (heavy)","Trap Bar RDL"],["Romanian Deadlift (BB)","Single-Leg RDL","DB RDL"]], p, b);
    const nordic  = pick([["Nordic Eccentric Curl","Lying Leg Curl","Stability Ball Curl"],["Nordic Curl (slow)","Leg Curl (3-sec ecc)","SB Curl (slow)"],["Nordic (drop: ecc only → full)","Leg Curl (drop set)","Leg Curl (1.5-rep)"],["Nordic Curl (weighted)","Leg Curl (heavy)","GHR"],["Nordic Eccentric Curl","Lying Leg Curl","Stability Ball Curl"]], p, b);
    const kick    = pick([["Cable Kickback","Donkey Kick (band)","Hip Extension Machine"],["Cable Kickback (slow)","Donkey Kick (weighted)","Hip Ext (slow ecc)"],["Cable Kickback (drop set)","Donkey Kick (rest-pause)","Hip Ext (rest-pause)"],["Cable Kickback (heavy)","Hip Ext (heavy)","Single-Leg Press (glute)"],["Cable Kickback","Donkey Kick (band)","Hip Extension Machine"]], p, b);
    const sumo    = pick([["Sumo Deadlift","Sumo Stance KB Swing","Wide Stance Leg Press"],["Sumo DL (slow)","KB Swing (heavy)","Wide Press (slow ecc)"],["Sumo DL (drop set)","KB Swing (explosive)","Wide Press (rest-pause)"],["Sumo DL (heavy)","KB Swing (max)","Wide Press (heavy)"],["Sumo Deadlift","KB Swing","Wide Stance Leg Press"]], p, b);
    const abdSpec = pick([["Abductor Machine","Band Side Walk","Fire Hydrant (band)"],["Abductor (slow ecc)","Monster Walk","Cable Abduction (standing)"],["Abductor (drop set)","Side Walk (heavy band)","Cable Abduction (1.5-rep)"],["Abductor (heavy)","Fire Hydrant (weighted)","Cable Abduction (heavy)"],["Abductor Machine","Band Side Walk","Fire Hydrant"]], p, b);
    return { name:"Glute & Ham Specialization", session:"E",
      warmup:"10 min incline walk + hip flexor stretch ×60s + banded glute bridges ×20 + clamshells ×20",
      exercises:[
        ex(hipSpec, "5",     sr.glute,adv,                              "glute"),
        ex(rdlSpec, sr.sets, sr.comp, adv,                              "compound"),
        ex(nordic,  "4",     sr.iso,  adv,                              "isolation"),
        ex(kick,    "4",     "12-15", "Squeeze at top, full ROM",       "isolation"),
        ex(sumo,    "3-4",   sr.comp, "Inner glute/adductor emphasis",  "compound"),
        ex(abdSpec, "3",     "20-25", "High rep burnout — feel it",     "isolation"),
        ex("Glute Bridge (banded, BW burnout)","3","25-30","Squeeze hard at top — slow eccentric","glute"),
      ]};
  }
  return null;
}

const LS = {
  get:    (k) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch { return null; } },
  set:    (k,v)=> { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
  getRaw: (k) => { try { return localStorage.getItem(k) || ""; } catch { return ""; } },
  setRaw: (k,v)=> { try { localStorage.setItem(k, v); } catch {} },
};

// ─── PROGRESSIVE LOAD SUGGESTION ──────────────────────────────────────────────
function baseMovement(name) {
  let s = String(name).replace(/\([^)]*\)/g, " ").toLowerCase();
  s = s.replace(/\bbb\b/g, "barbell").replace(/\bdb\b/g, "dumbbell");
  s = s.replace(/\b(heavy|slow|paused|pause|tempo|drop\s*set|drop|rest-pause|restpause|mechanical|mech|triple|double|1\.5-rep|21s|eccentric|ecc|deficit|hold|explosive|max|light)\b/gi, " ");
  s = s.replace(/\b\d+(\.\d+)?[- ]?(sec|rep|reps|s)\b/gi, " ");
  s = s.replace(/[-]/g, " ").replace(/\s+/g, " ").trim();
  return s;
}
function parseRepTarget(repStr) {
  const m = String(repStr).match(/(\d+)\s*-\s*(\d+)/);
  if (m) return { low: parseInt(m[1]), high: parseInt(m[2]) };
  const s = String(repStr).match(/(\d+)/);
  return s ? { low: parseInt(s[1]), high: parseInt(s[1]) } : { low: 8, high: 12 };
}
function isCompoundLift(name) {
  return /Bench|Squat|Press|Row|Deadlift|RDL|Pull-Up|Chin-Up|Pulldown|Hip Thrust|Leg Press|Hack|Dip|Lunge|Split Squat|Landmine|Good Morning|Sumo|Back Extension/i.test(name);
}
function findLastPerformance(allWeights, exerciseName, currentWeek, sessionsGetter) {
  const targetBase = baseMovement(exerciseName);
  for (let wk = currentWeek - 1; wk >= 1; wk--) {
    for (const sess of ["A","B","C","D","E"]) {
      const wo = sessionsGetter(sess, wk);
      if (!wo) continue;
      const idx = wo.exercises.findIndex(e => baseMovement(e.exercise) === targetBase);
      if (idx === -1) continue;
      const entry = allWeights[`w${wk}_${sess}_${idx}`];
      if (!entry?.sets) continue;
      const logged = entry.sets.filter(s => s?.weight && parseFloat(s.weight) > 0);
      if (logged.length === 0) continue;
      const weightsUsed = logged.map(s => parseFloat(s.weight));
      const repsArr     = logged.map(s => parseInt(s.reps) || 0).filter(r => r > 0);
      return {
        week: wk,
        topWeight: Math.max(...weightsUsed),
        minReps: repsArr.length ? Math.min(...repsArr) : 0,
      };
    }
  }
  return null;
}
function suggestNextWeight(last, repStr, exerciseName) {
  if (!last || !last.topWeight) return null;
  const { low, high } = parseRepTarget(repStr);
  const compound = isCompoundLift(exerciseName);
  const inc = compound ? 5 : 2.5;
  const w = last.topWeight;
  if (last.minReps >= high) return { weight: w + 5, note: `Last: ${w} lb × ${last.minReps}+ (wk ${last.week}). Hit the top — add 5 lb.` };
  if (last.minReps >= low)  return { weight: w + inc, note: `Last: ${w} lb × ${last.minReps} reps (wk ${last.week}). In range — try +${inc} lb or add a rep.` };
  if (last.minReps > 0)     return { weight: w, note: `Last: ${w} lb × ${last.minReps} reps (wk ${last.week}). Below target — repeat ${w} lb, aim for ${low}+.` };
  return { weight: w, note: `Last logged ${w} lb (wk ${last.week}).` };
}

// ─── REST TIMER ───────────────────────────────────────────────────────────────
// Parses the upper bound from rest text like "Rest 2-3 min — ..." or "Rest 60-90 sec"
function restTextToSeconds(text) {
  const t = String(text).toLowerCase();
  const isMin = /min/.test(t);
  const nums = (t.match(/\d+/g) || []).map(Number);
  if (nums.length === 0) return 90;
  const val = Math.max(...nums); // upper bound = full recovery
  return isMin ? val * 60 : val;
}
function fmtTime(s) {
  const m = Math.floor(s / 60), sec = s % 60;
  return m > 0 ? `${m}:${String(sec).padStart(2,"0")}` : `${sec}s`;
}
function RestTimer({ seconds, color }) {
  const [remaining, setRemaining] = useState(null);
  const [running, setRunning] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (running && remaining > 0) {
      ref.current = setTimeout(() => setRemaining(r => r - 1), 1000);
    } else if (running && remaining === 0) {
      setRunning(false);
      try { if (navigator.vibrate) navigator.vibrate([200,100,200]); } catch {}
      try {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (Ctx) { const ac = new Ctx(); const o = ac.createOscillator(); const g = ac.createGain();
          o.connect(g); g.connect(ac.destination); o.frequency.value = 880; o.start();
          g.gain.setValueAtTime(0.15, ac.currentTime); g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.5);
          o.stop(ac.currentTime + 0.5); }
      } catch {}
    }
    return () => clearTimeout(ref.current);
  }, [running, remaining]);

  const start = () => { setRemaining(seconds); setRunning(true); };
  const stop  = () => { setRunning(false); setRemaining(null); clearTimeout(ref.current); };

  if (remaining === null) {
    return (
      <button onClick={start}
        style={{ display:"flex", alignItems:"center", gap:6, background:"#fff", border:`1.5px solid ${color}`, color, borderRadius:8, padding:"7px 12px", cursor:"pointer", fontSize:12, fontFamily:"inherit", fontWeight:700 }}>
        ⏱ Start rest timer ({fmtTime(seconds)})
      </button>
    );
  }
  const done = remaining === 0;
  return (
    <button onClick={stop}
      style={{ display:"flex", alignItems:"center", gap:8, width:"100%", justifyContent:"center",
        background: done ? "#22c55e" : color, border:"none", color:"#fff",
        borderRadius:8, padding:"9px 12px", cursor:"pointer", fontSize:15, fontFamily:"inherit", fontWeight:800 }}>
      {done ? "✓ Rest done — tap to reset" : `⏱ ${fmtTime(remaining)}  ·  tap to stop`}
    </button>
  );
}

// ─── BACKUP / RESTORE ─────────────────────────────────────────────────────────
const APP_KEY_PREFIX = "val_";
function exportBackup() {
  const data = {};
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(APP_KEY_PREFIX)) data[k] = localStorage.getItem(k);
    }
  } catch {}
  const blob = new Blob([JSON.stringify({ app:"valkyrie365", exported:new Date().toISOString(), data }, null, 2)], { type:"application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `valkyrie365-backup-${new Date().toISOString().slice(0,10)}.json`;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function importBackup(file, onDone) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const parsed = JSON.parse(e.target.result);
      const data = parsed.data || parsed;
      Object.entries(data).forEach(([k, v]) => { if (k.startsWith(APP_KEY_PREFIX)) localStorage.setItem(k, v); });
      onDone(true);
    } catch { onDone(false); }
  };
  reader.onerror = () => onDone(false);
  reader.readAsText(file);
}

export default function App() {
  const [currentWeek, setCurrentWeek] = useState(() => parseInt(LS.get("val_week") || "1"));
  const [weights, setWeights]         = useState(() => LS.get("val_weights")   || {});
  const [completed, setCompleted]     = useState(() => LS.get("val_completed") || {});
  const [activeDay, setActiveDay]     = useState(null);
  const [view, setView]               = useState("schedule");

  const saveWeek      = (w) => { setCurrentWeek(w); LS.set("val_week", w); };
  const saveWeights   = useCallback((w) => { setWeights(w);   LS.set("val_weights", w);   }, []);
  const saveCompleted = useCallback((c) => { setCompleted(c); LS.set("val_completed", c); }, []);

  const phaseNum = getPhaseNum(currentWeek);
  const phase    = PHASES[phaseNum - 1];
  const deload   = isDeload(currentWeek);
  const weekDays = [{ label:"MON",dow:1 },{ label:"TUE",dow:2 },{ label:"WED",dow:3 },{ label:"THU",dow:4 },{ label:"FRI",dow:5 },{ label:"SAT",dow:6 },{ label:"SUN",dow:0 }];

  if (view === "workout" && activeDay)
    return <WorkoutView weekNum={activeDay.weekNum} session={activeDay.session} weights={weights} onSaveWeights={saveWeights} onComplete={(key) => saveCompleted({ ...completed, [key]: true })} completed={completed} onBack={() => setView("schedule")} deload={isDeload(activeDay.weekNum)} />;
  if (view === "progress")
    return <ProgressView weights={weights} completed={completed} onBack={() => setView("schedule")} currentWeek={currentWeek} />;

  return (
    <div style={S.app}>
      <div style={{ ...S.header, background: phase.bg }}>
        <div style={S.headerRow}>
          <div>
            <div style={S.logo}>VALKYRIE<span style={{ color: phase.color }}>365</span></div>
            <div style={S.sublogo}>Ashley · 5-Day Split · Paul Carter Inspired</div>
          </div>
          <button onClick={() => setView("progress")} style={{ ...S.progressBtn, borderColor: phase.color+"44", color: phase.color }}>📈 Progress</button>
        </div>
        <div style={{ display:"flex", gap:8, marginTop:12 }}>
          <button onClick={exportBackup} style={{ flex:1, background:"#fff", border:"1px solid #e5e7eb", color:"#6b7280", padding:"8px", borderRadius:8, cursor:"pointer", fontSize:12, fontFamily:"inherit", fontWeight:600 }}>⬇ Backup my data</button>
          <label style={{ flex:1, background:"#fff", border:"1px solid #e5e7eb", color:"#6b7280", padding:"8px", borderRadius:8, cursor:"pointer", fontSize:12, fontWeight:600, textAlign:"center" }}>
            ⬆ Restore
            <input type="file" accept="application/json" style={{ display:"none" }}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) importBackup(f, (ok) => { if (ok) { window.location.reload(); } else { alert("Could not read that backup file."); } }); }} />
          </label>
        </div>
      </div>

      <div style={{ ...S.phaseBanner, borderColor: phase.color, background: phase.bg }}>
        <div style={S.phaseBannerRow}>
          <div>
            <div style={{ ...S.phaseLabel, color: phase.color }}>PHASE {phaseNum} · WEEK {currentWeek} OF 52</div>
            <div style={{ ...S.phaseName, color:"#111827" }}>{phase.name}</div>
            <div style={S.phaseFocus}>{phase.focus}</div>
          </div>
          {deload && <div style={{ border:"2px solid #EA580C", color:"#EA580C", background:"#fff7f0", padding:"6px 14px", borderRadius:20, fontSize:11, fontWeight:700 }}>🔄 DELOAD</div>}
        </div>
      </div>

      <div style={S.weekNav}>
        <button onClick={() => saveWeek(Math.max(1, currentWeek-1))} style={{ ...S.navBtn, borderColor: phase.color, color: phase.color }} disabled={currentWeek===1}>‹</button>
        <div style={S.weekCenter}>
          <div style={{ ...S.weekBig, color:"#111827" }}>Week {currentWeek}</div>
          <div style={S.weekSub}>of 52</div>
        </div>
        <button onClick={() => saveWeek(Math.min(52, currentWeek+1))} style={{ ...S.navBtn, borderColor: phase.color, color: phase.color }} disabled={currentWeek===52}>›</button>
      </div>

      <div style={S.dayGrid}>
        {weekDays.map(({ label, dow }) => {
          const session = SESSION_MAP[dow];
          const isTrain = !!session;
          const key     = `w${currentWeek}_${session}`;
          const done    = completed[key];
          const color   = session ? SESSION_COLORS[session] : "#9ca3af";
          const bg      = session ? SESSION_BG[session]     : "#f3f4f6";
          return (
            <div key={dow} onClick={() => { if (isTrain) { setActiveDay({ weekNum:currentWeek, session }); setView("workout"); } }}
              style={{ ...S.dayCard, cursor: isTrain ? "pointer":"default", borderColor: done ? color : isTrain ? color+"55":"#e5e7eb", background: done ? bg : isTrain ? "#fff":"#f9fafb", boxShadow: isTrain && !done ? "0 1px 4px rgba(0,0,0,0.08)":"none" }}>
              <div style={{ ...S.dayLabel, color: isTrain ? "#6b7280":"#d1d5db" }}>{label}</div>
              {isTrain ? (<>
                <div style={{ ...S.sessionBadge, background: color, color:"#fff" }}>{session}</div>
                <div style={{ fontSize:8, color: done ? color:"#6b7280", lineHeight:1.3, textAlign:"center", fontWeight:600 }}>{SESSION_LABELS[session].split("·")[0].trim()}</div>
                {done && <div style={{ color, fontSize:16, fontWeight:800 }}>✓</div>}
              </>) : <div style={{ fontSize:8, color:"#d1d5db", letterSpacing:1 }}>REST</div>}
            </div>
          );
        })}
      </div>

      <div style={S.phaseBar}>
        <div style={S.phaseBarLabel}>PHASE PROGRESS — TAP TO JUMP</div>
        <div style={S.phaseTrack}>
          {PHASES.map((ph, i) => {
            const pct = ((ph.weeks[1]-ph.weeks[0]+1)/52)*100;
            const active = phaseNum===i+1;
            const past   = currentWeek>ph.weeks[1];
            return (
              <div key={i} onClick={() => saveWeek(ph.weeks[0])}
                style={{ width:`${pct}%`, height:"100%", cursor:"pointer", position:"relative", transition:"all 0.3s",
                  background: past ? ph.color : active ? ph.color+"99":"#e5e7eb",
                  borderRadius: i===0?"4px 0 0 4px":i===PHASES.length-1?"0 4px 4px 0":0 }}>
                {active && <div style={{ position:"absolute", inset:-2, border:`2px solid ${ph.color}`, borderRadius:4 }} />}
              </div>
            );
          })}
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", marginTop:8 }}>
          {PHASES.map((ph, i) => (
            <div key={i} onClick={() => saveWeek(ph.weeks[0])}
              style={{ fontSize:10, cursor:"pointer", fontWeight:700, color: phaseNum===i+1 ? ph.color:"#9ca3af" }}>
              {ph.short}
            </div>
          ))}
        </div>
      </div>

      <div style={S.statsRow}>
        {[
          { label:"Sessions",    val: Object.keys(completed).length, color: phase.color },
          { label:"Sets Logged", val: Object.values(weights).reduce((a,b)=>a+(Array.isArray(b?.sets)?b.sets.filter(s=>s?.weight).length:0),0), color:"#EA580C" },
          { label:"Weeks Done",  val: [...new Set(Object.keys(completed).map(k=>k.split("_")[0]))].length, color:"#059669" },
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

function WorkoutView({ weekNum, session, weights, onSaveWeights, onComplete, completed, onBack, deload }) {
  const workout  = getWorkout(session, weekNum);
  const phaseNum = getPhaseNum(weekNum);
  const phase    = PHASES[phaseNum - 1];
  const key      = `w${weekNum}_${session}`;
  const isDone   = completed[key];
  const color    = SESSION_COLORS[session];
  const bg       = SESSION_BG[session];

  const [exNotes, setExNotes] = useState(() => { try { return JSON.parse(localStorage.getItem(`val_exnotes_${key}`) || "{}"); } catch { return {}; } });
  const saveExNote = (ei, val) => { const next = { ...exNotes, [ei]:val }; setExNotes(next); try { localStorage.setItem(`val_exnotes_${key}`, JSON.stringify(next)); } catch {} };

  const [sessionNote, setSessionNote] = useState(() => LS.getRaw(`val_note_${key}`));
  const saveSessionNote = (v) => { setSessionNote(v); LS.setRaw(`val_note_${key}`, v); };

  const getKey    = (i) => `w${weekNum}_${session}_${i}`;
  const updateSet = (ei, si, field, value) => {
    const k    = getKey(ei);
    const prev = weights[k] || { sets: Array(8).fill(null).map(() => ({ weight:"", reps:"" })) };
    const sets = [...prev.sets];
    sets[si]   = { ...sets[si], [field]: value };
    onSaveWeights({ ...weights, [k]: { ...prev, sets } });
  };
  const getSD = (ei, si) => weights[getKey(ei)]?.sets?.[si] || { weight:"", reps:"" };
  const nSets = (s) => { const m = s.match(/(\d+)/); return m ? parseInt(m[1]) : 3; };
  const isBW  = (n) => ["Pallof","Plank","Dead Bug","McGill","Glute Bridge (banded","Cable Face Pull","Band Pull"].some(k => n.includes(k));
  const suggestionFor = (exItem) => suggestNextWeight(findLastPerformance(weights, exItem.exercise, weekNum, getWorkout), exItem.reps, exItem.exercise);

  if (!workout) return null;

  return (
    <div style={{ ...S.app, background:"#f8fafc" }}>
      <div style={{ ...S.workoutHeader, borderBottomColor: color, background:"#fff" }}>
        <button onClick={onBack} style={{ ...S.backBtn, color, borderColor: color+"44" }}>← Back</button>
        <div style={{ flex:1, textAlign:"center" }}>
          <div style={{ fontSize:10, letterSpacing:3, color, fontWeight:700, marginBottom:2 }}>WEEK {weekNum} · SESSION {session}</div>
          <div style={{ fontSize:16, fontWeight:800, color:"#111827" }}>{workout.name}</div>
          <div style={{ fontSize:11, color:"#6b7280", marginTop:2 }}>Phase {phaseNum}: {phase.name}</div>
        </div>
        {!isDone
          ? <button onClick={() => onComplete(key)} style={{ ...S.completeBtn, background:color }}>Done ✓</button>
          : <div style={{ color, fontSize:13, fontWeight:800, whiteSpace:"nowrap" }}>✓ Done</div>}
      </div>

      {deload && <div style={{ background:"#fff7ed", borderLeft:"4px solid #EA580C", color:"#9a3412", padding:"12px 16px", fontSize:13, lineHeight:1.5, fontWeight:500 }}>🔄 DELOAD WEEK — Use 60-70% of your normal load. Same reps. Full ROM. Recovery focus.</div>}

      <div style={{ background:"#fff", borderBottom:"1px solid #f3f4f6", padding:"12px 16px" }}>
        <div style={{ fontSize:10, color:"#9ca3af", letterSpacing:2, fontWeight:700, marginBottom:5 }}>WARM-UP</div>
        <div style={{ fontSize:13, color:"#374151", lineHeight:1.6 }}>{workout.warmup}</div>
      </div>

      <div style={{ padding:"10px 12px", display:"flex", flexDirection:"column", gap:12 }}>
        {workout.exercises.map((exItem, ei) => {
          const restText = getRest(phaseNum, exItem.restType);
          const bw = isBW(exItem.exercise);
          return (
            <div key={ei} style={{ background:"#fff", borderRadius:16, overflow:"hidden", boxShadow:"0 1px 6px rgba(0,0,0,0.07)", border:`1px solid ${color}22` }}>
              <div style={{ background: bg, padding:"12px 14px 10px", borderBottom:`1px solid ${color}22` }}>
                <div style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
                  <div style={{ width:28, height:28, borderRadius:"50%", background:color, color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:800, flexShrink:0 }}>{ei+1}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:15, fontWeight:700, color:"#111827", marginBottom:6, lineHeight:1.3 }}>{exItem.exercise}</div>
                    <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                      <span style={{ background:color, color:"#fff", borderRadius:20, padding:"3px 10px", fontSize:11, fontWeight:700 }}>{exItem.sets} sets</span>
                      <span style={{ background:"#f3f4f6", color:"#374151", borderRadius:20, padding:"3px 10px", fontSize:11, fontWeight:600 }}>{exItem.reps} reps</span>
                      {exItem.notes && <span style={{ background:"#fff7ed", border:"1px solid #fdba74", color:"#9a3412", borderRadius:20, padding:"3px 10px", fontSize:11, fontWeight:600 }}>{exItem.notes}</span>}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ background:"#fafafa", padding:"10px 14px", borderBottom:"1px solid #f3f4f6" }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                  <span style={{ fontSize:15 }}>⏱</span>
                  <span style={{ fontSize:12, color:"#4b5563", fontWeight:500 }}>{restText}</span>
                </div>
                <RestTimer seconds={restTextToSeconds(restText)} color={color} />
              </div>

              {!bw ? (
                <div style={{ padding:"10px 14px 2px" }}>
                  {(() => {
                    const sug = suggestionFor(exItem);
                    if (!sug) return null;
                    return (
                      <div style={{ display:"flex", alignItems:"center", gap:8, background:"#f0fdf4", border:"1px solid #86efac", borderRadius:8, padding:"8px 10px", marginBottom:10 }}>
                        <span style={{ fontSize:15 }}>📈</span>
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:13, fontWeight:700, color:"#15803d" }}>Suggested: {sug.weight} lb</div>
                          <div style={{ fontSize:11, color:"#4b5563", lineHeight:1.4, marginTop:2 }}>{sug.note}</div>
                        </div>
                      </div>
                    );
                  })()}
                  <div style={{ display:"grid", gridTemplateColumns:"28px 1fr 1fr", gap:8, marginBottom:6 }}>
                    <span style={{ fontSize:10, color:"#9ca3af", fontWeight:600 }}>SET</span>
                    <span style={{ fontSize:10, color:"#9ca3af", fontWeight:600 }}>WEIGHT (lbs)</span>
                    <span style={{ fontSize:10, color:"#9ca3af", fontWeight:600 }}>REPS DONE</span>
                  </div>
                  {Array.from({ length: nSets(exItem.sets) }).map((_,si) => {
                    const sd = getSD(ei,si);
                    return (
                      <div key={si} style={{ display:"grid", gridTemplateColumns:"28px 1fr 1fr", gap:8, marginBottom:8, alignItems:"center" }}>
                        <span style={{ fontSize:13, fontWeight:800, color, textAlign:"center" }}>{si+1}</span>
                        <input type="number" placeholder="lbs" value={sd.weight} onChange={e=>updateSet(ei,si,"weight",e.target.value)} inputMode="decimal"
                          style={{ background:"#f9fafb", border:`2px solid ${sd.weight?color:"#e5e7eb"}`, borderRadius:8, padding:"9px 8px", color:"#111827", fontSize:16, fontFamily:"inherit", width:"100%", boxSizing:"border-box", textAlign:"center", fontWeight:600 }} />
                        <input type="number" placeholder={exItem.reps} value={sd.reps} onChange={e=>updateSet(ei,si,"reps",e.target.value)} inputMode="decimal"
                          style={{ background:"#f9fafb", border:`2px solid ${sd.reps?color+"66":"#e5e7eb"}`, borderRadius:8, padding:"9px 8px", color:"#374151", fontSize:16, fontFamily:"inherit", width:"100%", boxSizing:"border-box", textAlign:"center", fontWeight:500 }} />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ padding:"10px 14px 2px", fontSize:12, color:"#9ca3af", fontStyle:"italic" }}>Bodyweight / Band — log in notes if needed</div>
              )}

              <div style={{ padding:"8px 14px 12px", borderTop:"1px solid #f3f4f6" }}>
                <div style={{ fontSize:10, color:"#9ca3af", letterSpacing:1, fontWeight:600, marginBottom:5 }}>EXERCISE NOTE</div>
                <textarea placeholder="How did it feel? Weight, form cues, adjustments..." value={exNotes[ei]||""} onChange={e=>saveExNote(ei,e.target.value)}
                  style={{ width:"100%", background:"#f9fafb", border:"1px solid #e5e7eb", borderRadius:8, padding:"8px 10px", color:"#374151", fontSize:13, fontFamily:"inherit", resize:"none", minHeight:52, boxSizing:"border-box", lineHeight:1.5 }} />
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ padding:"0 12px 50px" }}>
        <div style={{ background:"#fff", borderRadius:16, padding:"14px 16px", boxShadow:"0 1px 6px rgba(0,0,0,0.07)", border:"1px solid #e5e7eb" }}>
          <div style={{ fontSize:10, color:"#9ca3af", letterSpacing:2, fontWeight:700, marginBottom:8 }}>OVERALL SESSION NOTES</div>
          <textarea placeholder="Energy, PRs, pain, general notes for today..." value={sessionNote} onChange={e=>saveSessionNote(e.target.value)}
            style={{ width:"100%", background:"#f9fafb", border:"1px solid #e5e7eb", borderRadius:8, padding:"10px 12px", color:"#374151", fontSize:14, fontFamily:"inherit", resize:"vertical", minHeight:80, boxSizing:"border-box" }} />
        </div>
      </div>
    </div>
  );
}

function ProgressView({ weights, completed, onBack, currentWeek }) {
  const totalSessions = Object.keys(completed).length;
  const totalSets     = Object.values(weights).reduce((a,b)=>a+(Array.isArray(b?.sets)?b.sets.filter(s=>s?.weight).length:0),0);
  const weeksLogged   = [...new Set(Object.keys(completed).map(k=>k.split("_")[0]))].length;
  const topPhase      = PHASES[getPhaseNum(currentWeek)-1];

  const prs = {};
  Object.entries(weights).forEach(([key, data]) => {
    const parts = key.split("_");
    if (parts.length < 3) return;
    try {
      const wo = getWorkout(parts[1], parseInt(parts[0].replace("w","")));
      const e  = wo?.exercises?.[parseInt(parts[2])];
      if (!e) return;
      data.sets?.forEach(s => {
        if (!s?.weight) return;
        const w = parseFloat(s.weight);
        if (!prs[e.exercise] || w > prs[e.exercise]) prs[e.exercise] = w;
      });
    } catch {}
  });
  const prList = Object.entries(prs).sort((a,b)=>b[1]-a[1]).slice(0,12);

  return (
    <div style={{ ...S.app, background:"#f8fafc" }}>
      <div style={{ ...S.workoutHeader, borderBottomColor: topPhase.color, background:"#fff" }}>
        <button onClick={onBack} style={{ ...S.backBtn, color: topPhase.color, borderColor: topPhase.color+"44" }}>← Back</button>
        <div style={{ flex:1, textAlign:"center" }}>
          <div style={{ fontSize:10, letterSpacing:3, color: topPhase.color, fontWeight:700 }}>ASHLEY'S PROGRESS</div>
          <div style={{ fontSize:18, fontWeight:800, color:"#111827" }}>Stats & PRs</div>
        </div>
        <div style={{ width:70 }} />
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, padding:"16px 14px 8px" }}>
        {[{ label:"Sessions",val:totalSessions,color:"#9333EA" },{ label:"Sets Logged",val:totalSets,color:"#EA580C" },{ label:"Weeks Done",val:weeksLogged,color:"#059669" }].map(({ label, val, color }) => (
          <div key={label} style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:14, padding:"16px 8px", textAlign:"center", boxShadow:"0 1px 4px rgba(0,0,0,0.06)" }}>
            <div style={{ fontSize:28, fontWeight:800, color }}>{val}</div>
            <div style={{ fontSize:10, color:"#6b7280", letterSpacing:1, marginTop:4, fontWeight:600 }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ fontSize:10, color:"#9ca3af", letterSpacing:2, padding:"12px 16px 8px", fontWeight:700 }}>SESSIONS BY TYPE</div>
      <div style={{ padding:"0 14px 16px", display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:8 }}>
        {["A","B","C","D","E"].map(s => {
          const count = Object.keys(completed).filter(k=>k.includes(`_${s}`)).length;
          const color = SESSION_COLORS[s];
          const bg    = SESSION_BG[s];
          return (
            <div key={s} style={{ background:bg, border:`2px solid ${color}44`, borderRadius:12, padding:"12px 6px", textAlign:"center" }}>
              <div style={{ fontSize:22, fontWeight:800, color }}>{count}</div>
              <div style={{ fontSize:11, color, fontWeight:700, marginTop:2 }}>{s}</div>
            </div>
          );
        })}
      </div>

      <div style={{ fontSize:10, color:"#9ca3af", letterSpacing:2, padding:"4px 16px 8px", fontWeight:700 }}>TOP WEIGHTS LOGGED</div>
      {prList.length === 0
        ? <div style={{ textAlign:"center", color:"#d1d5db", padding:"30px 0", fontSize:15 }}>No weights logged yet — start a session!</div>
        : <div style={{ padding:"0 14px", display:"flex", flexDirection:"column", gap:8 }}>
            {prList.map(([name, w], i) => {
              const colors = ["#9333EA","#DB2777","#EA580C","#059669","#2563EB"];
              const c = colors[i%colors.length];
              return (
                <div key={name} style={{ display:"flex", alignItems:"center", gap:12, background:"#fff", border:`1px solid #e5e7eb`, borderLeft:`4px solid ${c}`, borderRadius:"0 10px 10px 0", padding:"12px 14px", boxShadow:"0 1px 3px rgba(0,0,0,0.05)" }}>
                  <div style={{ fontSize:12, color:"#9ca3af", width:22, textAlign:"right", fontWeight:600 }}>{i+1}</div>
                  <div style={{ flex:1, fontSize:14, color:"#111827", fontWeight:500 }}>{name}</div>
                  <div style={{ fontSize:18, fontWeight:800, color:c }}>{w} <span style={{ color:"#9ca3af", fontSize:12, fontWeight:400 }}>lbs</span></div>
                </div>
              );
            })}
          </div>
      }

      <div style={{ fontSize:10, color:"#9ca3af", letterSpacing:2, padding:"16px 16px 8px", fontWeight:700 }}>PHASE COMPLETION</div>
      <div style={{ padding:"0 14px 60px", display:"flex", flexDirection:"column", gap:10 }}>
        {PHASES.map((ph, i) => {
          const sessInPhase = Object.keys(completed).filter(k=>{ const wk=parseInt(k.split("_")[0].replace("w","")); return wk>=ph.weeks[0]&&wk<=ph.weeks[1]; }).length;
          const maxSess = (ph.weeks[1]-ph.weeks[0]+1)*5;
          const pct = Math.min(100, Math.round((sessInPhase/maxSess)*100));
          return (
            <div key={i} style={{ background:"#fff", border:`1px solid ${ph.color}33`, borderRadius:14, padding:"14px 16px", boxShadow:"0 1px 4px rgba(0,0,0,0.06)" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                <div>
                  <div style={{ fontSize:10, color:"#9ca3af", letterSpacing:2, fontWeight:600 }}>PHASE {i+1}</div>
                  <div style={{ fontSize:16, fontWeight:700, color:ph.color, marginTop:2 }}>{ph.name}</div>
                  <div style={{ fontSize:11, color:"#6b7280", marginTop:2 }}>Weeks {ph.weeks[0]}–{ph.weeks[1]}</div>
                </div>
                <div style={{ fontSize:26, fontWeight:800, color:ph.color }}>{pct}%</div>
              </div>
              <div style={{ height:6, background:"#f3f4f6", borderRadius:4 }}>
                <div style={{ width:`${pct}%`, height:"100%", background:ph.color, borderRadius:4, transition:"width 0.5s" }} />
              </div>
              <div style={{ fontSize:11, color:"#9ca3af", marginTop:6 }}>{sessInPhase}/{maxSess} sessions · Wk {ph.weeks[0]}–{ph.weeks[1]}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const S = {
  app:           { background:"#f8f5ff", minHeight:"100vh", color:"#111827", fontFamily:"'Inter',-apple-system,BlinkMacSystemFont,sans-serif", maxWidth:520, margin:"0 auto", paddingBottom:60 },
  header:        { padding:"20px 16px 16px", borderBottom:"1px solid #e5e7eb" },
  headerRow:     { display:"flex", justifyContent:"space-between", alignItems:"center" },
  logo:          { fontSize:22, fontWeight:800, letterSpacing:2, color:"#111827" },
  sublogo:       { fontSize:11, color:"#6b7280", letterSpacing:1, marginTop:3, fontWeight:500 },
  progressBtn:   { background:"#fff", border:"1px solid", padding:"10px 14px", borderRadius:10, cursor:"pointer", fontSize:14, fontFamily:"inherit", fontWeight:600 },
  phaseBanner:   { margin:"12px 14px 8px", padding:"14px 16px", borderLeft:"4px solid", borderRadius:"0 12px 12px 0" },
  phaseBannerRow:{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:8 },
  phaseLabel:    { fontSize:11, letterSpacing:2, fontWeight:700, marginBottom:4 },
  phaseName:     { fontSize:19, fontWeight:800, marginBottom:4 },
  phaseFocus:    { fontSize:12, color:"#6b7280", lineHeight:1.5 },
  weekNav:       { display:"flex", alignItems:"center", justifyContent:"center", gap:28, padding:"14px 20px" },
  navBtn:        { background:"#fff", border:"2px solid", width:42, height:42, borderRadius:"50%", cursor:"pointer", fontSize:20, fontFamily:"inherit", fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 1px 4px rgba(0,0,0,0.08)" },
  weekCenter:    { textAlign:"center" },
  weekBig:       { fontSize:26, fontWeight:800 },
  weekSub:       { fontSize:13, color:"#6b7280", fontWeight:500 },
  dayGrid:       { display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:6, padding:"0 12px 14px" },
  dayCard:       { border:"2px solid", borderRadius:12, padding:"10px 4px", textAlign:"center", transition:"all 0.15s", minHeight:92, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:4 },
  dayLabel:      { fontSize:9, letterSpacing:1, fontWeight:700 },
  sessionBadge:  { fontSize:15, fontWeight:800, padding:"3px 9px", borderRadius:6 },
  phaseBar:      { padding:"0 14px 16px" },
  phaseBarLabel: { fontSize:10, color:"#9ca3af", letterSpacing:2, marginBottom:8, fontWeight:600 },
  phaseTrack:    { display:"flex", height:8, borderRadius:4, overflow:"hidden", gap:2 },
  statsRow:      { display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, padding:"0 14px" },
  statCard:      { background:"#fff", border:"1px solid #e5e7eb", borderRadius:14, padding:"16px 10px", textAlign:"center", boxShadow:"0 1px 4px rgba(0,0,0,0.06)" },
  statVal:       { fontSize:28, fontWeight:800 },
  statLabel:     { fontSize:10, color:"#6b7280", letterSpacing:1, marginTop:4, fontWeight:600 },
  workoutHeader: { display:"flex", alignItems:"center", gap:10, paddingTop:"calc(env(safe-area-inset-top,0px) + 52px)", paddingBottom:"14px", paddingLeft:"16px", paddingRight:"16px", borderBottom:"2px solid", position:"sticky", top:0, zIndex:10 },
  backBtn:       { border:"1px solid", padding:"8px 14px", borderRadius:8, cursor:"pointer", fontSize:14, fontFamily:"inherit", fontWeight:600, background:"#fff", whiteSpace:"nowrap" },
  completeBtn:   { border:"none", color:"#fff", fontWeight:800, padding:"10px 14px", borderRadius:10, cursor:"pointer", fontSize:13, fontFamily:"inherit", whiteSpace:"nowrap", boxShadow:"0 2px 8px rgba(0,0,0,0.15)" },
};
