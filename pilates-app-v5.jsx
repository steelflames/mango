import { useState, useRef, useCallback, useEffect } from "react";

// ─── FONTS & STYLES ─────────────────────────────────────────────────────────
const fonts = `@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');`;
const hf = { fontFamily: "'Cormorant Garamond', serif" };
const bf = { fontFamily: "'DM Sans', sans-serif" };
const PC = {
  "Mobility": { primary: "#741b47", light: "#ead1dc" },
  "Flow": { primary: "#2D2A26", light: "#F5F2EE" },
  "Stability": { primary: "#073763", light: "#cfe2f3" },
  "Multi-Position": { primary: "#42627f", light: "#42627f18" },
  "Control": { primary: "#28185c", light: "#d9d2e9" },
  "Alignment": { primary: "#274e13", light: "#d9ead3" },
};

// ─── EXERCISE DATABASE WITH CUES ────────────────────────────────────────────
// Each exercise: name, position, focus, level, unilateral, cues {action, descriptive, breath, reps}
// Transition cues are generated dynamically based on position changes

const EXERCISES = {
  // ── STANDING ──
  "Neck Stretches": { pos: "standing", focus: "warmup", level: "all", uni: false,
    cues: { action: "Drop your right ear toward your right shoulder", descriptive: "Feel the length through the left side of your neck, keep both shoulders heavy", breath: "Breathe into the stretch, exhale to deepen", reps: 5 }},
  "Chin Nods": { pos: "standing", focus: "warmup", level: "all", uni: false,
    cues: { action: "Nod your chin gently toward your chest", descriptive: "Small movement, like you're saying yes. Feel the deep neck flexors engage", breath: "Inhale to prepare, exhale as you nod", reps: 8 }},
  "Standing Pelvic Tilts": { pos: "standing", focus: "warmup", level: "all", uni: false,
    cues: { action: "Tilt your pelvis under then release back to neutral", descriptive: "Think of your pelvis as a bowl of water, tip it forward and back", breath: "Exhale to tuck, inhale to release", reps: 8 }},
  "Standing Cat-Cow": { pos: "standing", focus: "warmup", level: "all", uni: false,
    cues: { action: "Round your spine forward then arch and open your chest", descriptive: "Hands on thighs, feel each vertebra moving sequentially", breath: "Exhale to round, inhale to extend", reps: 6 }},
  "Roll Down / Roll Up": { pos: "standing", focus: "warmup", level: "all", uni: false,
    cues: { action: "Nod your chin and roll down one vertebra at a time", descriptive: "Let your arms hang heavy, knees soft. Stack back up from the base", breath: "Exhale to roll down, inhale at the bottom, exhale to roll up", reps: 4 }},
  "Pilates Twist": { pos: "standing", focus: "warmup", level: "all", uni: false,
    cues: { action: "Rotate your torso to the right, arms follow", descriptive: "Keep your hips square, the rotation comes from your ribcage", breath: "Inhale to center, exhale to twist", reps: 8 }},
  "Standing Side Bend": { pos: "standing", focus: "warmup", level: "all", uni: true,
    cues: { action: "Reach your right arm overhead and side bend left", descriptive: "Think of lengthening over a beach ball, both feet stay grounded", breath: "Inhale to reach up, exhale to bend", reps: 5 }},
  "Arm Circles": { pos: "standing", focus: "warmup", level: "all", uni: false,
    cues: { action: "Circle both arms forward and up, then down and back", descriptive: "Keep your shoulders away from your ears, move from the shoulder joint", breath: "Inhale arms up, exhale arms down", reps: 8 }},
  "Chest Expansion": { pos: "standing", focus: "warmup", level: "all", uni: false,
    cues: { action: "Press your arms back behind you, open your chest wide", descriptive: "Squeeze between your shoulder blades, stand tall", breath: "Inhale to open, exhale to release", reps: 8 }},
  "Squats Parallel": { pos: "standing", focus: "functional", level: "all", uni: false,
    cues: { action: "Bend your knees and sit your hips back", descriptive: "Weight in your heels, knees track over toes, chest stays lifted", breath: "Inhale to lower, exhale to press up", reps: 10 }},
  "Squats Parallel + Overhead Press": { pos: "standing", focus: "functional", level: "int", uni: false,
    cues: { action: "Squat down then press arms overhead as you stand", descriptive: "Full body integration, core stays engaged through the transition", breath: "Inhale to squat, exhale to press up and overhead", reps: 8 }},
  "Sumo Squat": { pos: "standing", focus: "functional", level: "all", uni: false,
    cues: { action: "Wide stance, toes turned out, sink your hips down", descriptive: "Knees press out over pinky toes, tailbone drops straight down", breath: "Inhale to lower, exhale to rise", reps: 10 }},
  "Sumo Squat + Heel Lift": { pos: "standing", focus: "functional", level: "int", uni: false,
    cues: { action: "Sumo squat then lift both heels at the bottom", descriptive: "Find your balance, core lifts you. Lower heels before standing", breath: "Inhale down, exhale lift heels, inhale lower heels, exhale stand", reps: 6 }},
  "Single Leg Knee Raises": { pos: "standing", focus: "functional", level: "all", uni: true,
    cues: { action: "Drive your right knee up toward your chest", descriptive: "Standing leg is strong, hip bones stay level", breath: "Exhale to lift, inhale to lower", reps: 8 }},
  "Twist to High Knee": { pos: "standing", focus: "functional", level: "int", uni: true,
    cues: { action: "Lift your right knee and rotate your torso toward it", descriptive: "Opposite elbow toward the knee, stay tall through your spine", breath: "Exhale to twist and lift, inhale to return", reps: 8 }},
  "RDL Single Leg": { pos: "standing", focus: "functional", level: "int", uni: true,
    cues: { action: "Hinge forward on your right leg, left leg reaches back", descriptive: "Your body makes a T-shape. Soft standing knee, flat back", breath: "Inhale to hinge, exhale to return to standing", reps: 6 }},
  "Roll Down to Push-Ups": { pos: "standing", focus: "functional", level: "int", uni: false,
    cues: { action: "Roll down, walk your hands out to plank, push-up, walk back, roll up", descriptive: "Control the roll down, small steps out, elbows hug your ribs on the push-up", breath: "Exhale roll down, inhale walk out, exhale push-up, inhale walk back, exhale roll up", reps: 4 }},
  "Standing Lunge": { pos: "standing", focus: "functional", level: "all", uni: true,
    cues: { action: "Step your right foot forward and lower your back knee", descriptive: "Front knee at 90 degrees, back knee hovers above the floor", breath: "Inhale to lower, exhale to press back up", reps: 8 }},
  "Heel Raises (Parallel)": { pos: "standing", focus: "balance", level: "all", uni: false,
    cues: { action: "Press up onto the balls of your feet", descriptive: "Lift all ten toes first to find your balance, then press through all five metatarsals evenly", breath: "Inhale to lift, exhale to lower with control", reps: 10 }},
  "Standing Footwork": { pos: "standing", focus: "balance", level: "all", uni: false,
    cues: { action: "Shift your weight forward to toes, back to heels, find center", descriptive: "Feel the tripod of your foot: big toe, pinky toe, heel", breath: "Breathe naturally, stay present with your feet", reps: 6 }},
  "Single Leg Balance": { pos: "standing", focus: "balance", level: "all", uni: true,
    cues: { action: "Lift your right foot just off the floor and hold", descriptive: "Soft focus ahead, feel your standing foot working. Tall spine", breath: "Breathe steadily, find stillness in the hold", reps: 1 }},
  "Step Forwards & Back": { pos: "standing", focus: "balance", level: "all", uni: true,
    cues: { action: "Step your right foot forward, pause, then step back", descriptive: "Control the weight shift, feel the deceleration on the step back", breath: "Exhale to step, inhale to hold, exhale to return", reps: 6 }},
  "Seated Posture Check": { pos: "standing", focus: "alignment", level: "all", uni: false,
    cues: { action: "Sit tall on your sit bones, stack your spine", descriptive: "Ears over shoulders, shoulders over hips. Let your ribs soften down", breath: "Inhale to lengthen, exhale to settle into alignment", reps: 3 }},
  "Wall Roll Down": { pos: "standing", focus: "alignment", level: "all", uni: false,
    cues: { action: "Stand against the wall and peel your spine away one vertebra at a time", descriptive: "Feel each segment leave the wall. Roll back up pressing each vertebra into the wall", breath: "Exhale to roll away, inhale at the bottom, exhale to stack back", reps: 4 }},

  // ── SUPINE ──
  "Pelvic Clock": { pos: "supine", focus: "core_foundation", level: "all", uni: false,
    cues: { action: "Imagine a clock face on your pelvis. Tilt to 12, 3, 6, 9", descriptive: "Small subtle movements. Feel how your low back responds to each position", breath: "Breathe naturally, let the movement be exploratory", reps: 4 }},
  "Candle Breath Practice": { pos: "supine", focus: "core_foundation", level: "all", uni: false,
    cues: { action: "Inhale through your nose, exhale slowly as if blowing out a candle", descriptive: "Feel your deep abdominals draw in on the exhale. Ribs close like a book", breath: "Long slow exhale, twice as long as the inhale", reps: 6 }},
  "Diaphragmatic Breathing": { pos: "supine", focus: "core_foundation", level: "all", uni: false,
    cues: { action: "Place hands on your lower ribs and breathe into your hands", descriptive: "Feel the ribs expand laterally like an accordion. Back ribs press into the mat", breath: "Inhale wide into the ribs, exhale let everything soften", reps: 6 }},
  "Supine Head Hover": { pos: "supine", focus: "core_foundation", level: "all", uni: false,
    cues: { action: "Nod your chin and float your head just off the mat", descriptive: "Gaze at your thighs, not the ceiling. Feel the front of your neck, not strain", breath: "Exhale to lift, inhale to lower", reps: 8 }},
  "Leg Slides": { pos: "supine", focus: "core_foundation", level: "all", uni: true,
    cues: { action: "Slide your right heel along the mat to extend your leg", descriptive: "Keep your pelvis completely still. The challenge is stability, not the leg", breath: "Inhale to slide out, exhale to draw back", reps: 8 }},
  "Supine Toe Taps": { pos: "supine", focus: "core_foundation", level: "all", uni: true,
    cues: { action: "From tabletop, lower your right toe to tap the mat", descriptive: "Only go as far as you can without your back arching off the mat", breath: "Inhale to lower, exhale to lift back to tabletop", reps: 8 }},
  "Heel Taps (Center)": { pos: "supine", focus: "core_foundation", level: "all", uni: true,
    cues: { action: "From tabletop, extend one leg down and tap your heel to the mat", descriptive: "Maintain your neutral pelvis, deep abs stay connected", breath: "Inhale to extend, exhale to return", reps: 8 }},
  "Heel Taps (Oblique)": { pos: "supine", focus: "core_foundation", level: "all", uni: true,
    cues: { action: "From tabletop, lower your right leg on a diagonal", descriptive: "The oblique angle challenges your rotational stability. Hip bones stay level", breath: "Inhale to lower, exhale to return", reps: 8 }},
  "Dead Bug": { pos: "supine", focus: "core_foundation", level: "all", uni: true,
    cues: { action: "Extend opposite arm and leg away from center", descriptive: "Low back stays gently pressed to the mat. Move slowly with control", breath: "Exhale to extend, inhale to return to center", reps: 8 }},
  "Marching (Supine)": { pos: "supine", focus: "core_foundation", level: "all", uni: true,
    cues: { action: "Lift one knee to tabletop then set it down, alternate", descriptive: "Pelvis stays quiet. Imagine a cup of tea balanced on your belly", breath: "Exhale to lift, inhale to lower", reps: 10 }},
  "The Hundred": { pos: "supine", focus: "ab_series", level: "beg", uni: false,
    cues: { action: "Curl up, extend your legs, pump your arms vigorously", descriptive: "Gaze at your belly, arms pump from the shoulders, legs at your working level", breath: "Inhale for 5 pumps, exhale for 5 pumps", reps: 10 }},
  "Ab Curl": { pos: "supine", focus: "ab_series", level: "all", uni: false,
    cues: { action: "Nod your chin and curl your head and shoulders off the mat", descriptive: "Peel up just to the bottom of your shoulder blades. Hands behind your head, elbows wide", breath: "Exhale to curl up, inhale to lower", reps: 10 }},
  "Single Knee Stretch": { pos: "supine", focus: "ab_series", level: "beg", uni: true,
    cues: { action: "Pull one knee in, extend the other leg long", descriptive: "Stay curled up, switch with control. Scoop your belly deep", breath: "Exhale to switch, inhale to switch", reps: 10 }},
  "Double Knee Stretch": { pos: "supine", focus: "ab_series", level: "int", uni: false,
    cues: { action: "Extend arms and legs away then circle arms and hug knees back in", descriptive: "The reach is the challenge. Stay curled up the entire time", breath: "Inhale to reach out, exhale to circle and hug in", reps: 8 }},
  "Single Straight Leg Stretch": { pos: "supine", focus: "ab_series", level: "int", uni: true,
    cues: { action: "Scissor your legs, pulling one toward you, the other reaches away", descriptive: "Pulse pulse switch. Keep your curl, hands walk up toward your ankle", breath: "Exhale pull pull, inhale switch", reps: 10 }},
  "Double Straight Leg Stretch": { pos: "supine", focus: "ab_series", level: "int", uni: false,
    cues: { action: "Lower both straight legs toward the mat then lift back up", descriptive: "Hands behind your head, only lower as far as your back stays flat", breath: "Inhale to lower, exhale to lift", reps: 8 }},
  "Criss-Cross": { pos: "supine", focus: "ab_series", level: "int", uni: true,
    cues: { action: "Rotate your torso, bringing opposite elbow toward the bent knee", descriptive: "It's your ribs rotating, not your elbow reaching. Hold each side for a beat", breath: "Exhale to rotate, inhale through center", reps: 8 }},
  "Roll Down to Roll Up": { pos: "supine", focus: "ab_series", level: "int", uni: false,
    cues: { action: "From seated, roll back one vertebra at a time, then roll forward to return", descriptive: "Imagine pressing each vertebra into the mat like pearls on a string", breath: "Inhale to prepare, exhale to roll down, inhale at the bottom, exhale to roll up", reps: 6 }},
  "Reverse Crunch (Center)": { pos: "supine", focus: "ab_series", level: "int", uni: false,
    cues: { action: "Draw your knees toward your chest, lifting your hips off the mat", descriptive: "The curl comes from your low belly, not momentum. Small controlled lift", breath: "Exhale to curl hips up, inhale to lower", reps: 8 }},
  "Reverse Crunch (Oblique)": { pos: "supine", focus: "ab_series", level: "int", uni: true,
    cues: { action: "Curl your hips up and slightly to the right", descriptive: "Feel the oblique connection as you angle the lift. Alternate sides", breath: "Exhale to lift with rotation, inhale to lower", reps: 6 }},
  "Articulated Bridge": { pos: "supine", focus: "bridge", level: "all", uni: false,
    cues: { action: "Peel your spine off the mat from tailbone to shoulders", descriptive: "Press through your whole foot, knees reach over toes. One vertebra at a time", breath: "Inhale to prepare, exhale to peel up, inhale at the top, exhale to melt down", reps: 6 }},
  "Articulated Bridge on Toes": { pos: "supine", focus: "bridge", level: "int", uni: false,
    cues: { action: "Lift into bridge then rise onto your toes", descriptive: "Extra calf and ankle work. Keep your hips level and high", breath: "Exhale to peel up, inhale lift heels, exhale lower heels, inhale roll down", reps: 5 }},
  "Single-Leg Bridge": { pos: "supine", focus: "bridge", level: "int", uni: true,
    cues: { action: "In bridge, extend one leg to the ceiling, lower and lift your hips", descriptive: "Keep your hips absolutely level. The extended leg is quiet", breath: "Inhale to lower hips, exhale to press up", reps: 6 }},
  "Shoulder Bridge": { pos: "supine", focus: "bridge", level: "int", uni: false,
    cues: { action: "Hold your bridge at the top, clasp your hands underneath you", descriptive: "Press your upper arms into the mat, lift your chest toward your chin", breath: "Breathe steadily, maintain the hold", reps: 1 }},
  "Hip dips (Single)": { pos: "supine", focus: "bridge", level: "int", uni: true,
    cues: { action: "In bridge, dip one hip toward the mat then level out", descriptive: "Tiny controlled drop. Your hip stability muscles are working overtime", breath: "Inhale to dip, exhale to level", reps: 8 }},
  "Leg Circles": { pos: "supine", focus: "bridge", level: "int", uni: true,
    cues: { action: "Extend one leg to the ceiling and circle it", descriptive: "The circle comes from the hip socket. Pelvis stays anchored", breath: "Inhale for half the circle, exhale for the other half", reps: 5 }},
  "Windshield Wipers": { pos: "supine", focus: "bridge", level: "all", uni: false,
    cues: { action: "Knees together, drop them side to side", descriptive: "Let your low back rotate. Shoulders stay heavy on the mat", breath: "Inhale to center, exhale to drop to one side", reps: 8 }},
  "Teaser Prep": { pos: "supine", focus: "advanced", level: "int", uni: false,
    cues: { action: "Feet on the floor, roll up reaching your arms toward your knees", descriptive: "Find your V-shape with bent knees first. Scoop deep through your center", breath: "Exhale to roll up, inhale to hold, exhale to roll down", reps: 5 }},
  "Teaser": { pos: "supine", focus: "advanced", level: "adv", uni: false,
    cues: { action: "Roll up as your legs extend to 45 degrees, find the V", descriptive: "Arms parallel to legs, balance on your sit bones. Everything lifts at once", breath: "Exhale to roll up and extend, inhale to hold, exhale to roll everything down", reps: 3 }},
  "Corkscrew (Modified)": { pos: "supine", focus: "advanced", level: "int", uni: false,
    cues: { action: "Legs in tabletop, circle your knees as a unit", descriptive: "Your pelvis traces a small circle on the mat. This is your pelvic clock with load", breath: "Exhale as you circle, inhale to pause at the top", reps: 4 }},
  "Corkscrew": { pos: "supine", focus: "advanced", level: "adv", uni: false,
    cues: { action: "Straight legs to ceiling, circle them together down and around", descriptive: "Control the descent, obliques catch the rotation, pull back to center", breath: "Inhale to circle down, exhale to pull back up", reps: 3 }},

  // ── QUADRUPED ──
  "Cat-Cow": { pos: "quadruped", focus: "mobility", level: "all", uni: false,
    cues: { action: "Round your spine to the ceiling then let your belly drop and chest open", descriptive: "Initiate from your tailbone, let the wave travel up your spine", breath: "Exhale to round (cat), inhale to arch (cow)", reps: 6 }},
  "Wag the Tail": { pos: "quadruped", focus: "mobility", level: "all", uni: false,
    cues: { action: "Look toward your right hip as your hip reaches toward your ear", descriptive: "Lateral flexion through your spine, like a happy dog", breath: "Breathe naturally, keep it flowing", reps: 8 }},
  "Thread the Needle": { pos: "quadruped", focus: "mobility", level: "all", uni: true,
    cues: { action: "Reach your right arm under your body and rotate your thoracic spine", descriptive: "Let your shoulder and ear rest on the mat. Feel the twist between your shoulder blades", breath: "Exhale to thread under, inhale to open back up", reps: 5 }},
  "Sternum Drops": { pos: "quadruped", focus: "mobility", level: "all", uni: false,
    cues: { action: "Drop your sternum toward the mat between your arms", descriptive: "Keep your arms straight, the movement is between your shoulder blades", breath: "Inhale to drop the sternum, exhale to press back up", reps: 8 }},
  "Bird Dog": { pos: "quadruped", focus: "stability", level: "all", uni: true,
    cues: { action: "Extend your right arm forward and left leg back", descriptive: "Reach long in both directions. Hips and shoulders stay square to the mat", breath: "Inhale to reach out, exhale to draw back to center", reps: 8 }},
  "Bear Hold": { pos: "quadruped", focus: "stability", level: "int", uni: false,
    cues: { action: "Hover your knees 2 inches off the mat and hold", descriptive: "Quiet hold. Shoulders over wrists, hips over knees. Just breathe", breath: "Breathe steadily, maintain the hover", reps: 1 }},
  "Bear Hold + Shoulder Taps": { pos: "quadruped", focus: "stability", level: "int", uni: true,
    cues: { action: "In bear hold, tap your right hand to your left shoulder", descriptive: "Fight the rotation. Your hips should not rock side to side", breath: "Exhale to tap, inhale to return", reps: 8 }},
  "Leg Slide and Lift": { pos: "quadruped", focus: "stability", level: "all", uni: true,
    cues: { action: "Slide your right leg back then lift it to hip height", descriptive: "Keep your pelvis neutral, don't let your back arch as the leg lifts", breath: "Inhale to slide, exhale to lift, inhale to lower, exhale to slide in", reps: 6 }},
  "Fire Hydrant": { pos: "quadruped", focus: "stability", level: "all", uni: true,
    cues: { action: "Lift your bent knee out to the side", descriptive: "Keep your hips level, the lift is small and controlled. Feel your outer hip", breath: "Exhale to lift, inhale to lower", reps: 10 }},
  "Forearm Plank": { pos: "quadruped", focus: "plank", level: "int", uni: false,
    cues: { action: "Set your forearms on the mat, step back to plank", descriptive: "One long line from head to heels. Draw your front ribs in, press the floor away", breath: "Breathe steadily, don't hold your breath", reps: 1 }},
  "Forearm Plank + Shoulder Shift": { pos: "quadruped", focus: "plank", level: "int", uni: false,
    cues: { action: "In forearm plank, shift your body forward and back over your elbows", descriptive: "Feel the load change in your shoulders. Core stays locked in", breath: "Inhale to shift forward, exhale to shift back", reps: 6 }},
  "Plank to Pike": { pos: "quadruped", focus: "plank", level: "adv", uni: false,
    cues: { action: "From high plank, pike your hips to the ceiling", descriptive: "Press through your hands, draw your belly to your spine to initiate the lift", breath: "Exhale to pike up, inhale to lower back to plank", reps: 5 }},
  "Pilates Tricep Push-Ups": { pos: "quadruped", focus: "plank", level: "int", uni: false,
    cues: { action: "Bend your elbows straight back, hugging your ribs", descriptive: "Elbows graze your sides, not flaring out. Lower just a few inches", breath: "Inhale to lower, exhale to press up", reps: 8 }},

  // ── PRONE ──
  "Dart": { pos: "prone", focus: "extension", level: "all", uni: false,
    cues: { action: "Lift your chest, hands, and head just off the mat", descriptive: "Arms reach long by your sides, palms face in. Gentle lift, big engagement", breath: "Inhale to lift, exhale to lower", reps: 8 }},
  "Mini Swan with Hands": { pos: "prone", focus: "extension", level: "all", uni: false,
    cues: { action: "Press into your hands to lift your chest off the mat", descriptive: "Elbows stay close, shoulders away from ears. Lengthen forward, not just up", breath: "Inhale to lift and lengthen, exhale to lower", reps: 6 }},
  "Mini Swan without Hands": { pos: "prone", focus: "extension", level: "int", uni: false,
    cues: { action: "Hands hover off the mat, lift your chest with just your back muscles", descriptive: "This is pure back strength. Think of reaching your chest forward through a window", breath: "Inhale to lift, exhale to lower", reps: 6 }},
  "Cobra": { pos: "prone", focus: "extension", level: "all", uni: false,
    cues: { action: "Walk your hands under your shoulders, press up into a gentle back bend", descriptive: "Hips stay on the mat, shoulders roll back and down", breath: "Inhale to press up, exhale to lower", reps: 6 }},
  "Swimming Alternating": { pos: "prone", focus: "posterior", level: "int", uni: true,
    cues: { action: "Lift opposite arm and leg, alternate", descriptive: "Stay lifted through your chest. Quick controlled switches", breath: "Inhale for 2 counts, exhale for 2 counts", reps: 10 }},
  "Prone Leg Lifts": { pos: "prone", focus: "posterior", level: "all", uni: true,
    cues: { action: "Lift one straight leg off the mat behind you", descriptive: "Keep your hip bones on the mat. The lift is small but you'll feel your glute light up", breath: "Exhale to lift, inhale to lower", reps: 8 }},

  // ── SIDE-LYING ──
  "Clamshells": { pos: "sidelying", focus: "hip", level: "all", uni: true,
    cues: { action: "Feet together, open your top knee like a clamshell", descriptive: "Don't let your pelvis rock back. The rotation comes from your hip joint", breath: "Exhale to open, inhale to close", reps: 12 }},
  "Side-Lying Leg work": { pos: "sidelying", focus: "hip", level: "all", uni: true,
    cues: { action: "Lift your top leg to hip height and pulse", descriptive: "Long leg, slight external rotation. Control the lift and the lower", breath: "Exhale to lift, inhale to lower", reps: 10 }},
  "Side Leg Lift": { pos: "sidelying", focus: "hip", level: "all", uni: true,
    cues: { action: "Lift your top leg and hold at hip height", descriptive: "Stack your hips, reach your leg long out of your hip socket", breath: "Exhale to lift, breathe and hold, inhale to lower", reps: 8 }},
  "Inner Thigh Lift": { pos: "sidelying", focus: "hip", level: "all", uni: true,
    cues: { action: "Top leg forward, lift your bottom leg off the mat", descriptive: "Feel the inner thigh of the bottom leg engage. Small lift, big connection", breath: "Exhale to lift, inhale to lower", reps: 10 }},
  "Hip Dips (Side-Lying)": { pos: "sidelying", focus: "hip", level: "int", uni: true,
    cues: { action: "In side plank prep, dip your hip toward the mat then lift", descriptive: "Obliques control the movement. Don't collapse, hover and lift", breath: "Inhale to dip, exhale to lift", reps: 8 }},
  "Side Kick Series": { pos: "sidelying", focus: "hip", level: "int", uni: true,
    cues: { action: "Kick your top leg forward then sweep it back", descriptive: "Torso stays completely still. The leg swings freely from a stable trunk", breath: "Inhale kick forward (2 pulses), exhale sweep back", reps: 8 }},
  "Side Plank Prep": { pos: "sidelying", focus: "lateral", level: "beg", uni: true,
    cues: { action: "Forearm down, knees bent, lift your hips off the mat", descriptive: "One line from your knees to your head. Stack your hips", breath: "Exhale to lift, breathe and hold", reps: 3 }},
  "Side Plank Variations": { pos: "sidelying", focus: "lateral", level: "adv", uni: true,
    cues: { action: "Full side plank, add leg lift or rotation", descriptive: "Master the hold first, then layer on the movement challenge", breath: "Exhale to lift into plank, breathe through the variation", reps: 3 }},
  "Side Bend": { pos: "sidelying", focus: "lateral", level: "int", uni: true,
    cues: { action: "From side sit, press up into a side arc", descriptive: "Top arm reaches overhead creating a rainbow shape with your body", breath: "Inhale to lift, exhale to lower with control", reps: 4 }},
  "Telescope": { pos: "sidelying", focus: "lateral", level: "adv", uni: true,
    cues: { action: "In side-lying, extend your top arm and leg away simultaneously", descriptive: "Like a telescope extending. Feel the full lateral line stretch and engage", breath: "Inhale to extend, exhale to draw back in", reps: 5 }},

  // ── SEATED ──
  "Saw": { pos: "seated", focus: "spinal", level: "int", uni: true,
    cues: { action: "Twist to the right, then reach your left hand past your right foot", descriptive: "Saw off your pinky toe. Round forward as you reach, twist from your waist", breath: "Inhale to twist, exhale to reach and round forward", reps: 5 }},
  "Seated Spine Stretch": { pos: "seated", focus: "spinal", level: "all", uni: false,
    cues: { action: "Round forward reaching past your toes", descriptive: "Pull your belly away from your thighs. Stack back up tall, one vertebra at a time", breath: "Exhale to round forward, inhale to stack up", reps: 6 }},
  "Seated Roll Back": { pos: "seated", focus: "spinal", level: "all", uni: false,
    cues: { action: "Scoop your belly back and roll your spine toward the mat", descriptive: "Only go as far as you can control. C-curve of the spine the whole way", breath: "Exhale to roll back, inhale to hold, exhale to come back up", reps: 6 }},
  "Mermaid Stretch": { pos: "seated", focus: "spinal", level: "all", uni: true,
    cues: { action: "Side sit, reach your top arm up and over", descriptive: "Ground your sitting bones, reach long through your fingertips", breath: "Inhale to reach up, exhale to side bend over", reps: 4 }},
  "Protraction / Retraction": { pos: "seated", focus: "upper_body", level: "all", uni: false,
    cues: { action: "Push your shoulder blades apart then squeeze them together", descriptive: "Arms forward at shoulder height. Feel the movement between your shoulder blades", breath: "Exhale to protract, inhale to retract", reps: 8 }},
  "Hug a Moon": { pos: "seated", focus: "upper_body", level: "all", uni: false,
    cues: { action: "Arms rounded in front of you, squeeze as if hugging a large ball", descriptive: "Feel your chest wrap around the imaginary moon, then open back up", breath: "Exhale to hug in, inhale to open", reps: 8 }},
  "Serve a Tray": { pos: "seated", focus: "upper_body", level: "all", uni: false,
    cues: { action: "Elbows at your sides, extend your forearms forward like serving a tray", descriptive: "Palms up, external rotation of the shoulders. Elbows stay pinned", breath: "Exhale to extend, inhale to return", reps: 10 }},
  "Small Circles": { pos: "seated", focus: "upper_body", level: "all", uni: false,
    cues: { action: "Arms extended to the side, make small circles", descriptive: "Circles the size of a grapefruit. Keep your shoulders down, this is endurance work", breath: "Breathe naturally, don't hold your breath", reps: 10 }},
  "External Rotation": { pos: "seated", focus: "upper_body", level: "all", uni: false,
    cues: { action: "Elbows at sides, rotate your forearms out", descriptive: "This is pure rotator cuff work. Slow and controlled, don't rush", breath: "Exhale to rotate out, inhale to return", reps: 10 }},
  "Bicep Curl": { pos: "seated", focus: "upper_body", level: "all", uni: false,
    cues: { action: "Curl your hands toward your shoulders", descriptive: "Elbows stay still, shoulders stay down. Control the lower as much as the lift", breath: "Exhale to curl, inhale to lower", reps: 10 }},
  "Tricep Extension": { pos: "seated", focus: "upper_body", level: "all", uni: false,
    cues: { action: "Elbows high, extend your forearms overhead", descriptive: "Keep your elbows pointing forward, ribcage stays closed", breath: "Exhale to extend, inhale to bend", reps: 10 }},

  // ── RECOVERY ──
  "Constructive Rest Position": { pos: "recovery", focus: "rest", level: "all", uni: false,
    cues: { action: "Lie on your back, knees bent, feet flat, arms by your sides", descriptive: "Let everything release. Feel the weight of your body into the mat", breath: "Natural breath, let your belly rise and fall freely", reps: 1 }},
  "Body Scan": { pos: "recovery", focus: "rest", level: "all", uni: false,
    cues: { action: "Close your eyes and scan from your feet to the crown of your head", descriptive: "Notice without judging. Where are you holding, where have you released", breath: "Slow steady breath, let each exhale bring more softness", reps: 1 }},
  "Child's Pose": { pos: "recovery", focus: "active", level: "all", uni: false,
    cues: { action: "Sit your hips back toward your heels, arms reaching forward", descriptive: "Let your forehead rest, let your spine be long. This is your reset", breath: "Breathe into your back ribs, feel them expand", reps: 1 }},
  "Child's Pose + Twist": { pos: "recovery", focus: "active", level: "all", uni: true,
    cues: { action: "In child's pose, thread one arm under and rotate", descriptive: "Feel the twist through your mid-back. Let it be passive and releasing", breath: "Exhale to thread deeper, inhale to open", reps: 1 }},
  "Pinwheel": { pos: "recovery", focus: "active", level: "all", uni: true,
    cues: { action: "Side-lying, open your top arm in a big arc over and behind you", descriptive: "Follow your hand with your eyes. Let your chest open and your thoracic spine rotate", breath: "Inhale to open, exhale to return", reps: 4 }},
  "Figure-4 Stretch": { pos: "recovery", focus: "active", level: "all", uni: true,
    cues: { action: "Cross your right ankle over your left knee, draw the left knee in", descriptive: "Press your right knee away gently. Feel the stretch deep in your glute", breath: "Breathe into the stretch, exhale to deepen", reps: 1 }},
  "Lunge Stretch": { pos: "recovery", focus: "active", level: "all", uni: true,
    cues: { action: "Step one foot forward into a deep lunge", descriptive: "Sink your hips, feel the stretch through the back hip flexor", breath: "Breathe steadily, let gravity do the work", reps: 1 }},
  "Hamstring Stretch (Supine)": { pos: "recovery", focus: "active", level: "all", uni: true,
    cues: { action: "Extend one leg to the ceiling, gently draw it toward you", descriptive: "Keep the leg as straight as comfortable. Flex your foot", breath: "Exhale to draw the leg closer, inhale to ease off slightly", reps: 1 }},
  "Spinal Rotation Stretch": { pos: "recovery", focus: "active", level: "all", uni: true,
    cues: { action: "Knees to one side, arms wide, look the opposite direction", descriptive: "Let everything release into the twist. Don't force it", breath: "Exhale to sink deeper, let gravity pull you into the rotation", reps: 1 }},
  "90/90 Breathing": { pos: "recovery", focus: "rest", level: "all", uni: false,
    cues: { action: "Legs on a chair, hips and knees at 90 degrees, arms rest", descriptive: "This neutralizes your pelvis and takes tension off your low back", breath: "Full belly breaths, 4 count in, 6 count out", reps: 6 }},
  "Knee Sway": { pos: "recovery", focus: "rest", level: "all", uni: false,
    cues: { action: "Knees bent, gently sway your knees side to side", descriptive: "Tiny rocking motion. Let your low back release with each sway", breath: "Breathe naturally, let the rhythm soothe", reps: 8 }},
  "Hip Flexor Stretch (Half-Kneel)": { pos: "recovery", focus: "active", level: "all", uni: true,
    cues: { action: "Half-kneeling, shift your weight forward over your front foot", descriptive: "Tuck your pelvis slightly to deepen the stretch. Tall through your spine", breath: "Exhale to shift forward, breathe into the stretch", reps: 1 }},
};

// ─── SKILLS: Pre-built 4-6 exercise sequences ──────────────────────────────
const SKILLS = [
  { id: "cork_build", name: "Corkscrew Build", position: "Supine", goal: "Rotational core control", peak: "Corkscrew",
    exercises: ["Pelvic Clock", "Heel Taps (Center)", "Heel Taps (Oblique)", "Reverse Crunch (Center)", "Reverse Crunch (Oblique)", "Corkscrew (Modified)"] },
  { id: "teaser_build", name: "Teaser Build", position: "Supine", goal: "V-sit strength & balance", peak: "Teaser",
    exercises: ["Seated Roll Back", "Roll Down to Roll Up", "Ab Curl", "Single Knee Stretch", "Double Knee Stretch", "Teaser Prep"] },
  { id: "swan_build", name: "Swan Progression", position: "Prone", goal: "Back extension strength", peak: "Mini Swan without Hands",
    exercises: ["Dart", "Cobra", "Mini Swan with Hands", "Mini Swan without Hands", "Swimming Alternating"] },
  { id: "push_build", name: "Push-Up Build", position: "Quadruped → Standing", goal: "Upper body pressing power", peak: "Roll Down to Push-Ups",
    exercises: ["Forearm Plank", "Forearm Plank + Shoulder Shift", "Pilates Tricep Push-Ups", "Plank to Pike", "Roll Down to Push-Ups"] },
  { id: "hip_build", name: "Hip Stability Series", position: "Side-Lying", goal: "Glute med & lateral stability", peak: "Side Plank Variations",
    exercises: ["Clamshells", "Side-Lying Leg work", "Inner Thigh Lift", "Side Kick Series", "Hip Dips (Side-Lying)", "Side Plank Prep"] },
  { id: "bridge_build", name: "Bridge Power", position: "Supine", goal: "Posterior chain & pelvic control", peak: "Single-Leg Bridge",
    exercises: ["Pelvic Clock", "Articulated Bridge", "Articulated Bridge on Toes", "Hip dips (Single)", "Single-Leg Bridge"] },
  { id: "ab_series", name: "Classical Ab Series", position: "Supine", goal: "Core endurance & precision", peak: "Criss-Cross",
    exercises: ["The Hundred", "Single Knee Stretch", "Double Knee Stretch", "Single Straight Leg Stretch", "Double Straight Leg Stretch", "Criss-Cross"] },
  { id: "spinal_wave", name: "Spinal Wave", position: "Standing → Quadruped", goal: "Segmental spinal mobility", peak: "Roll Down / Roll Up",
    exercises: ["Standing Pelvic Tilts", "Roll Down / Roll Up", "Cat-Cow", "Wag the Tail", "Sternum Drops", "Wall Roll Down"] },
  { id: "balance_build", name: "Balance Challenge", position: "Standing", goal: "Proprioception & single leg control", peak: "RDL Single Leg",
    exercises: ["Heel Raises (Parallel)", "Standing Footwork", "Single Leg Balance", "Single Leg Knee Raises", "Step Forwards & Back", "RDL Single Leg"] },
  { id: "shoulder_rehab", name: "Shoulder Care", position: "Seated", goal: "Rotator cuff & scapular health", peak: "Serve a Tray",
    exercises: ["Protraction / Retraction", "External Rotation", "Hug a Moon", "Small Circles", "Serve a Tray"] },
];

// ─── CLASS TEMPLATES ────────────────────────────────────────────────────────
const CLASS_TEMPLATES = [
  { id: "mobility", name: "Mobility", principle: "Mobility", subPrinciple: "Stability", sections: [
    { name: "Centering", exercises: ["Constructive Rest Position", "Diaphragmatic Breathing", "Pelvic Clock"] },
    { name: "Spinal Mobility", exercises: ["Neck Stretches", "Chin Nods", "Standing Pelvic Tilts", "Roll Down / Roll Up", "Standing Cat-Cow", "Pilates Twist"] },
    { name: "Recovery", exercises: ["Child's Pose + Twist"] },
    { name: "Prone Extension", exercises: ["Dart", "Mini Swan with Hands", "Mini Swan without Hands", "Swimming Alternating"] },
    { name: "Recovery", exercises: ["Child's Pose", "Cat-Cow"] },
    { name: "Hip Mobility", exercises: ["Leg Circles", "Lunge Stretch", "Figure-4 Stretch"] },
    { name: "Shoulder Mobility", exercises: ["Sternum Drops", "Protraction / Retraction", "Hug a Moon", "Serve a Tray", "Small Circles", "External Rotation"] },
    { name: "Peak: Saw + Pinwheel", exercises: ["Saw", "Pinwheel"] },
    { name: "Cool-Down", exercises: ["Hamstring Stretch (Supine)", "Spinal Rotation Stretch", "Constructive Rest Position"] },
  ]},
  { id: "stability", name: "Stability", principle: "Stability", subPrinciple: "Control", sections: [
    { name: "Centering", exercises: ["90/90 Breathing", "Candle Breath Practice", "Pelvic Clock"] },
    { name: "Core Foundation", exercises: ["Dead Bug", "Supine Toe Taps", "The Hundred", "Bird Dog", "Bear Hold + Shoulder Taps"] },
    { name: "Recovery", exercises: ["Child's Pose"] },
    { name: "Shoulder Stability", exercises: ["Sternum Drops", "Forearm Plank + Shoulder Shift", "Pilates Tricep Push-Ups"] },
    { name: "Hip Stability", exercises: ["Clamshells", "Side-Lying Leg work", "Hip Dips (Side-Lying)", "Single-Leg Bridge"] },
    { name: "Recovery", exercises: ["Figure-4 Stretch"] },
    { name: "Balance", exercises: ["Heel Raises (Parallel)", "Standing Footwork", "Single Leg Balance", "RDL Single Leg"] },
    { name: "Peak: Plank Series", exercises: ["Forearm Plank", "Plank to Pike"] },
    { name: "Cool-Down", exercises: ["Hamstring Stretch (Supine)", "Spinal Rotation Stretch", "Constructive Rest Position"] },
  ]},
  { id: "control", name: "Control", principle: "Control", subPrinciple: "Alignment", sections: [
    { name: "Breath", exercises: ["Candle Breath Practice", "Diaphragmatic Breathing"] },
    { name: "Foundation", exercises: ["Pelvic Clock", "Heel Taps (Center)", "Heel Taps (Oblique)", "Dead Bug"] },
    { name: "Core Series", exercises: ["The Hundred", "Roll Down to Roll Up", "Single Knee Stretch", "Double Knee Stretch"] },
    { name: "Recovery", exercises: ["Knee Sway", "Hamstring Stretch (Supine)"] },
    { name: "Precision", exercises: ["Single Straight Leg Stretch", "Double Straight Leg Stretch", "Criss-Cross"] },
    { name: "Peak: Teaser Build", exercises: ["Teaser Prep", "Teaser"] },
    { name: "Advanced (Optional)", exercises: ["Corkscrew", "Side Plank Variations"] },
    { name: "Cool-Down", exercises: ["Spinal Rotation Stretch", "Constructive Rest Position", "Body Scan"] },
  ]},
  { id: "full_flow", name: "Full Flow", principle: "Multi-Position", subPrinciple: "", sections: [
    { name: "Standing Warm-Up", exercises: ["Neck Stretches", "Standing Pelvic Tilts", "Roll Down / Roll Up", "Arm Circles"] },
    { name: "Standing Strength", exercises: ["Squats Parallel + Overhead Press", "Sumo Squat + Heel Lift", "Twist to High Knee", "RDL Single Leg"] },
    { name: "Recovery", exercises: ["Child's Pose + Twist"] },
    { name: "Quadruped", exercises: ["Sternum Drops", "Bird Dog", "Bear Hold + Shoulder Taps", "Forearm Plank + Shoulder Shift"] },
    { name: "Recovery", exercises: ["Cat-Cow", "Wag the Tail"] },
    { name: "Supine", exercises: ["Articulated Bridge on Toes", "Hip dips (Single)", "Marching (Supine)", "Windshield Wipers"] },
    { name: "Side-Lying", exercises: ["Clamshells", "Side-Lying Leg work", "Side Kick Series"] },
    { name: "Peak: Ab Series", exercises: ["Single Knee Stretch", "Double Knee Stretch", "Criss-Cross", "Teaser Prep"] },
    { name: "Prone", exercises: ["Mini Swan with Hands", "Mini Swan without Hands", "Swimming Alternating"] },
    { name: "Cool-Down", exercises: ["Child's Pose", "Hamstring Stretch (Supine)", "Spinal Rotation Stretch", "Constructive Rest Position"] },
  ]},
  { id: "alignment", name: "Alignment", principle: "Alignment", subPrinciple: "Mobility", sections: [
    { name: "Awareness", exercises: ["Seated Posture Check", "Diaphragmatic Breathing"] },
    { name: "Head & Neck", exercises: ["Chin Nods", "Supine Head Hover"] },
    { name: "Spinal", exercises: ["Wall Roll Down", "Seated Spine Stretch", "Seated Roll Back", "Cat-Cow"] },
    { name: "Recovery", exercises: ["Child's Pose", "Thread the Needle"] },
    { name: "Lower Body", exercises: ["Standing Footwork", "Squats Parallel", "Heel Raises (Parallel)"] },
    { name: "Cool-Down", exercises: ["Constructive Rest Position", "Body Scan"] },
  ]},
];

// ─── POSITION TRANSITION CUES ───────────────────────────────────────────────
const TRANSITIONS = {
  "standing_supine": "Come down to the mat, lie on your back, find your neutral spine",
  "standing_quadruped": "Come down to the mat onto all fours, hands under shoulders, knees under hips",
  "standing_seated": "Have a seat on your mat, sit tall on your sit bones",
  "standing_prone": "Come down to the mat, turn onto your belly, forehead rests on your hands",
  "supine_quadruped": "Roll to one side, press yourself up onto all fours",
  "supine_prone": "Roll onto your belly, forehead rests on your hands",
  "supine_sidelying": "Roll onto your side, head rests on your bottom arm",
  "supine_seated": "Roll up to seated, or use your hands to press yourself up",
  "supine_standing": "Roll to one side, press up to seated, and come to standing",
  "quadruped_prone": "Lower yourself down onto your belly",
  "quadruped_supine": "Sit back, then roll down onto your back",
  "quadruped_standing": "Tuck your toes, press back to standing through a roll up",
  "quadruped_sidelying": "Lower down and roll onto your side",
  "prone_quadruped": "Press back up onto all fours",
  "prone_supine": "Roll onto your back",
  "prone_sidelying": "Roll onto your side",
  "prone_recovery": "Press back into child's pose, take a breath",
  "sidelying_supine": "Roll onto your back",
  "sidelying_prone": "Roll onto your belly",
  "sidelying_sidelying": "Roll through to the other side",
  "sidelying_quadruped": "Press up onto all fours",
  "seated_standing": "Come up to standing",
  "seated_supine": "Roll down onto your back",
  "recovery_supine": "Settle onto your back",
  "recovery_quadruped": "Come onto all fours",
  "recovery_standing": "Slowly come up to standing",
  "recovery_prone": "Transition onto your belly",
};

function getTransition(fromPos, toPos) {
  if (fromPos === toPos) return null;
  return TRANSITIONS[`${fromPos}_${toPos}`] || `Transition to ${toPos} position`;
}

// ─── COMPONENTS ─────────────────────────────────────────────────────────────

// NAV
function NavBar({ screen, setScreen }) {
  const tabs = [
    { id: "library", label: "Library", icon: "◈" },
    { id: "build", label: "Build", icon: "✦" },
    { id: "skills", label: "Skills", icon: "△" },
    { id: "teach", label: "Teach", icon: "▶" },
  ];
  return (
    <div style={{ display: "flex", justifyContent: "space-around", padding: "6px 0 10px", borderTop: "1px solid #E8E4DF", background: "#FFF", position: "sticky", bottom: 0, zIndex: 100 }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => setScreen(t.id)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1px", background: "none", border: "none", cursor: "pointer", color: screen === t.id ? "#2D2A26" : "#A8A29E", ...bf, fontSize: "10px", fontWeight: screen === t.id ? 600 : 400 }}>
          <span style={{ fontSize: "16px", lineHeight: 1 }}>{t.icon}</span>{t.label}
        </button>
      ))}
    </div>
  );
}

// LIBRARY SCREEN
function LibraryScreen() {
  const [search, setSearch] = useState("");
  const [posFilter, setPosFilter] = useState("all");
  const [expanded, setExpanded] = useState(null);

  const positions = [
    { key: "all", label: "All" },
    { key: "standing", label: "🧍 Standing", color: "#D4918E" },
    { key: "supine", label: "⬆️ Supine", color: "#8B7CB8" },
    { key: "quadruped", label: "🐾 Quadruped", color: "#6BA3CF" },
    { key: "prone", label: "⬇️ Prone", color: "#D4918E" },
    { key: "sidelying", label: "↔️ Side-Lying", color: "#4A7EA5" },
    { key: "seated", label: "🪑 Seated", color: "#6FA86B" },
    { key: "recovery", label: "🌿 Recovery", color: "#A8BCA0" },
  ];

  const entries = Object.entries(EXERCISES).filter(([name, ex]) => {
    if (posFilter !== "all" && ex.pos !== posFilter) return false;
    if (search && !name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // Group by position
  const grouped = {};
  entries.forEach(([name, ex]) => {
    if (!grouped[ex.pos]) grouped[ex.pos] = [];
    grouped[ex.pos].push([name, ex]);
  });

  return (
    <div style={{ padding: "16px 14px", paddingBottom: "8px" }}>
      <h1 style={{ ...hf, fontSize: "26px", fontWeight: 300, margin: "0 0 12px" }}>Exercise Library</h1>
      <input placeholder="Search exercises..." value={search} onChange={e => setSearch(e.target.value)}
        style={{ width: "100%", padding: "8px 10px", border: "1px solid #E8E4DF", borderRadius: "8px", fontSize: "13px", ...bf, background: "#FFF", boxSizing: "border-box", outline: "none", marginBottom: "8px" }} />
      <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginBottom: "12px" }}>
        {positions.map(p => (
          <button key={p.key} onClick={() => setPosFilter(p.key)} style={{ padding: "4px 10px", borderRadius: "12px", fontSize: "10px", fontWeight: 500, ...bf, cursor: "pointer", background: posFilter === p.key ? (p.color || "#2D2A26") : "#FFF", color: posFilter === p.key ? "#FFF" : "#78716C", border: posFilter === p.key ? "none" : "1px solid #E8E4DF" }}>{p.label}</button>
        ))}
      </div>

      {Object.entries(grouped).map(([pos, exs]) => (
        <div key={pos} style={{ marginBottom: "12px" }}>
          <div style={{ fontSize: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1.2px", color: "#A8A29E", marginBottom: "4px" }}>
            {positions.find(p => p.key === pos)?.label || pos} · {exs.length}
          </div>
          {exs.map(([name, ex]) => (
            <div key={name} style={{ marginBottom: "4px" }}>
              <div onClick={() => setExpanded(expanded === name ? null : name)}
                style={{ padding: "8px 10px", background: expanded === name ? "#F5F2EE" : "#FFF", border: "1px solid #E8E4DF", borderRadius: expanded === name ? "6px 6px 0 0" : "6px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <span style={{ fontSize: "13px", fontWeight: expanded === name ? 500 : 400 }}>{name}</span>
                  {ex.uni && <span style={{ fontSize: "9px", color: "#E8A87C", marginLeft: "6px", fontWeight: 600 }}>L/R</span>}
                  {ex.level !== "all" && <span style={{ fontSize: "9px", color: "#8B7CB8", marginLeft: "4px" }}>[{ex.level}]</span>}
                </div>
                <span style={{ fontSize: "9px", color: "#C8C3BD" }}>{expanded === name ? "▲" : "▼"}</span>
              </div>
              {expanded === name && (
                <div style={{ padding: "8px 10px", background: "#FAF8F5", border: "1px solid #E8E4DF", borderTop: "none", borderRadius: "0 0 6px 6px", fontSize: "12px" }}>
                  <div style={{ marginBottom: "4px" }}><span style={{ fontWeight: 600, color: "#2D2A26" }}>Action:</span> {ex.cues.action}</div>
                  <div style={{ marginBottom: "4px", color: "#555" }}><span style={{ fontWeight: 600 }}>Cue:</span> {ex.cues.descriptive}</div>
                  <div style={{ marginBottom: "4px", color: "#6BA3CF" }}><span style={{ fontWeight: 600 }}>Breath:</span> {ex.cues.breath}</div>
                  <div style={{ color: "#A8A29E" }}><span style={{ fontWeight: 600 }}>Reps:</span> {ex.cues.reps === 1 ? "Hold" : `${ex.cues.reps} reps`}{ex.uni ? " each side" : ""}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      ))}
      <div style={{ padding: "12px", textAlign: "center", fontSize: "11px", color: "#C8C3BD" }}>{entries.length} exercises</div>
    </div>
  );
}

// BUILD SCREEN - Improved UX with save, skill insertion, quick-add
function BuildScreen({ classData, setClassData, setScreen, savedFlows, setSavedFlows }) {
  const [expandedSec, setExpandedSec] = useState(null);
  const [showLib, setShowLib] = useState(null);
  const [view, setView] = useState(!classData ? "home" : "edit"); // home, templates, edit
  const [search, setSearch] = useState("");
  const [dragSec, setDragSec] = useState(null);
  const [dragEx, setDragEx] = useState(null);
  const [showAddMenu, setShowAddMenu] = useState(null); // section index to insert after, or "end"
  const [showSkillPicker, setShowSkillPicker] = useState(null); // insert position
  const [editingName, setEditingName] = useState(false);
  const [nameVal, setNameVal] = useState("");

  const quickSections = [
    { label: "🌿 Centering", name: "Centering", exercises: ["Constructive Rest Position", "Diaphragmatic Breathing", "Pelvic Clock"] },
    { label: "🔥 Warm-Up", name: "Warm-Up", exercises: ["Neck Stretches", "Chin Nods", "Standing Pelvic Tilts", "Roll Down / Roll Up", "Standing Cat-Cow"] },
    { label: "🌿 Recovery", name: "Recovery", exercises: ["Child's Pose", "Child's Pose + Twist"] },
    { label: "🌿 Cool-Down", name: "Cool-Down", exercises: ["Hamstring Stretch (Supine)", "Spinal Rotation Stretch", "Constructive Rest Position", "Body Scan"] },
    { label: "📝 Empty Section", name: null, exercises: [] },
  ];

  // HOME: saved flows + new flow options
  if (view === "home") {
    return (
      <div style={{ padding: "16px 14px" }}>
        <h1 style={{ ...hf, fontSize: "26px", fontWeight: 300, margin: "0 0 16px" }}>My Classes</h1>

        {/* Saved flows */}
        {savedFlows.length > 0 && (
          <div style={{ marginBottom: "20px" }}>
            <div style={{ fontSize: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1.2px", color: "#A8A29E", marginBottom: "8px" }}>Saved</div>
            {savedFlows.map((flow, i) => {
              const pc = PC[flow.principle] || PC["Flow"];
              const totalEx = flow.sections.reduce((a, s) => a + s.exercises.length, 0);
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                  <button onClick={() => { setClassData(JSON.parse(JSON.stringify(flow))); setView("edit"); }}
                    style={{ flex: 1, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", background: "#FFF", border: "1px solid #E8E4DF", borderRadius: "10px", cursor: "pointer", textAlign: "left", ...bf }}>
                    <div>
                      <div style={{ fontSize: "14px", fontWeight: 500 }}>{flow.name}</div>
                      <div style={{ fontSize: "10px", color: "#A8A29E", marginTop: "1px" }}>{flow.sections.length} sections · {totalEx} exercises</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ padding: "2px 8px", borderRadius: "10px", fontSize: "9px", fontWeight: 600, background: pc.light, color: pc.primary }}>{flow.principle}</span>
                    </div>
                  </button>
                  <button onClick={() => { if (confirm("Delete this flow?")) setSavedFlows(savedFlows.filter((_, j) => j !== i)); }}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "#D4A5A5", fontSize: "16px", padding: "4px 8px" }}>×</button>
                </div>
              );
            })}
          </div>
        )}

        {/* Create new */}
        <div style={{ fontSize: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1.2px", color: "#A8A29E", marginBottom: "8px" }}>Start New</div>

        <button onClick={() => setView("templates")}
          style={{ width: "100%", padding: "14px", background: "#FFF", border: "1px solid #E8E4DF", borderRadius: "10px", cursor: "pointer", ...bf, textAlign: "left", marginBottom: "6px" }}>
          <div style={{ fontSize: "14px", fontWeight: 500 }}>From Template</div>
          <div style={{ fontSize: "11px", color: "#A8A29E" }}>Pre-built class flows with recovery arcs</div>
        </button>

        <button onClick={() => { setClassData({ name: "New Class", principle: "Flow", subPrinciple: "", sections: [] }); setView("edit"); }}
          style={{ width: "100%", padding: "14px", background: "none", border: "1px dashed #D6D1CB", borderRadius: "10px", cursor: "pointer", ...bf, textAlign: "left" }}>
          <div style={{ fontSize: "14px", fontWeight: 500, color: "#78716C" }}>Blank Class</div>
          <div style={{ fontSize: "11px", color: "#A8A29E" }}>Build from scratch</div>
        </button>
      </div>
    );
  }

  // TEMPLATES
  if (view === "templates") {
    return (
      <div style={{ padding: "16px 14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
          <button onClick={() => setView("home")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "16px", color: "#A8A29E", padding: "0" }}>←</button>
          <h1 style={{ ...hf, fontSize: "26px", fontWeight: 300, margin: 0 }}>Templates</h1>
        </div>
        {CLASS_TEMPLATES.map(t => {
          const pc = PC[t.principle] || PC["Flow"];
          return (
            <button key={t.id} onClick={() => {
              setClassData({ ...t, sections: t.sections.map((s, i) => ({ ...s, id: `s${i}`, exercises: s.exercises.map((e, j) => ({ name: e, id: `e${i}_${j}` })) })) });
              setView("edit");
            }} style={{ width: "100%", padding: "12px 14px", background: "#FFF", border: "1px solid #E8E4DF", borderRadius: "10px", cursor: "pointer", textAlign: "left", ...bf, marginBottom: "6px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: "14px", fontWeight: 500 }}>{t.name}</div>
                <span style={{ padding: "2px 8px", borderRadius: "10px", fontSize: "9px", fontWeight: 600, background: pc.light, color: pc.primary }}>{t.principle}</span>
              </div>
              <div style={{ fontSize: "10px", color: "#A8A29E", marginTop: "3px" }}>
                {t.sections.length} sections · {t.sections.reduce((a, s) => a + s.exercises.length, 0)} exercises
                {t.subPrinciple ? ` · Sub: ${t.subPrinciple}` : ""}
              </div>
              <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginTop: "6px" }}>
                {t.sections.map((s, i) => {
                  const isR = s.name.toLowerCase().includes("recovery") || s.name.toLowerCase().includes("cool") || s.name.toLowerCase().includes("centering");
                  const isP = s.name.toLowerCase().includes("peak");
                  return <span key={i} style={{ fontSize: "9px", padding: "1px 6px", borderRadius: "8px", background: isP ? "#E8A87C22" : isR ? "#A8BCA022" : "#F5F2EE", color: isP ? "#E8A87C" : isR ? "#A8BCA0" : "#A8A29E" }}>{s.name}</span>;
                })}
              </div>
            </button>
          );
        })}
      </div>
    );
  }

  // EDIT VIEW
  const pc = PC[classData.principle] || PC["Flow"];
  const totalEx = classData.sections.reduce((a, s) => a + s.exercises.length, 0);

  const addExToSection = (si, name) => {
    const u = { ...classData, sections: [...classData.sections] };
    u.sections[si] = { ...u.sections[si], exercises: [...u.sections[si].exercises, { name, id: `n${Date.now()}${Math.random()}` }] };
    setClassData(u);
  };
  const remEx = (si, ei) => {
    const u = { ...classData, sections: [...classData.sections] };
    u.sections[si] = { ...u.sections[si], exercises: u.sections[si].exercises.filter((_, i) => i !== ei) };
    setClassData(u);
  };
  const moveEx = (si, from, to) => {
    const u = { ...classData, sections: [...classData.sections] };
    const e = [...u.sections[si].exercises]; const [m] = e.splice(from, 1); e.splice(to, 0, m);
    u.sections[si] = { ...u.sections[si], exercises: e }; setClassData(u);
  };
  const insertSectionAt = (idx, section) => {
    const u = { ...classData, sections: [...classData.sections] };
    u.sections.splice(idx, 0, { ...section, id: `s${Date.now()}`, exercises: section.exercises.map((e, j) => typeof e === "string" ? { name: e, id: `ne${Date.now()}_${j}` } : e) });
    setClassData(u);
    setShowAddMenu(null);
    setShowSkillPicker(null);
  };
  const insertSkillAt = (idx, skill) => {
    insertSectionAt(idx, { name: `${skill.name}`, exercises: skill.exercises });
  };

  const saveFlow = () => {
    const existing = savedFlows.findIndex(f => f.name === classData.name);
    if (existing >= 0) {
      const updated = [...savedFlows];
      updated[existing] = JSON.parse(JSON.stringify(classData));
      setSavedFlows(updated);
    } else {
      setSavedFlows([...savedFlows, JSON.parse(JSON.stringify(classData))]);
    }
  };

  const libEntries = Object.entries(EXERCISES).filter(([n]) => !search || n.toLowerCase().includes(search.toLowerCase()));

  // Render add menu (quick sections + skill picker)
  const renderAddMenu = (insertIdx) => (
    <div style={{ background: "#F5F2EE", borderRadius: "8px", padding: "8px", marginBottom: "6px", border: "1px solid #E8E4DF" }}>
      <div style={{ fontSize: "10px", fontWeight: 600, color: "#A8A29E", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "6px" }}>Quick Add</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "8px" }}>
        {quickSections.map((qs, i) => (
          <button key={i} onClick={() => {
            if (qs.name === null) {
              const n = prompt("Section name:");
              if (n) insertSectionAt(insertIdx, { name: n, exercises: [] });
            } else {
              insertSectionAt(insertIdx, { name: qs.name, exercises: qs.exercises });
            }
          }} style={{ padding: "5px 10px", borderRadius: "14px", fontSize: "11px", ...bf, cursor: "pointer", background: "#FFF", border: "1px solid #E8E4DF", color: "#2D2A26" }}>
            {qs.label}
          </button>
        ))}
      </div>
      <div style={{ fontSize: "10px", fontWeight: 600, color: "#A8A29E", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "6px" }}>Add Skill Builder</div>
      <div style={{ display: "flex", flexDirection: "column", gap: "3px", maxHeight: "160px", overflowY: "auto" }}>
        {SKILLS.map(sk => (
          <button key={sk.id} onClick={() => insertSkillAt(insertIdx, sk)}
            style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 10px", background: "#FFF", border: "1px solid #E8E4DF", borderRadius: "6px", cursor: "pointer", ...bf, textAlign: "left" }}>
            <div>
              <span style={{ fontSize: "12px", fontWeight: 500 }}>{sk.name}</span>
              <span style={{ fontSize: "9px", color: "#A8A29E", marginLeft: "6px" }}>{sk.exercises.length} ex</span>
            </div>
            <span style={{ fontSize: "9px", color: "#E8A87C", fontWeight: 600 }}>▲ {sk.peak}</span>
          </button>
        ))}
      </div>
      <button onClick={() => setShowAddMenu(null)} style={{ width: "100%", padding: "5px", marginTop: "6px", background: "none", border: "none", cursor: "pointer", fontSize: "10px", color: "#A8A29E", ...bf }}>Cancel</button>
    </div>
  );

  return (
    <div style={{ padding: "16px 14px", paddingBottom: "8px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
        <button onClick={() => setView("home")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "16px", color: "#A8A29E", padding: "0" }}>←</button>
        {editingName ? (
          <input autoFocus value={nameVal} onChange={e => setNameVal(e.target.value)}
            onBlur={() => { setClassData({ ...classData, name: nameVal || classData.name }); setEditingName(false); }}
            onKeyDown={e => { if (e.key === "Enter") { setClassData({ ...classData, name: nameVal || classData.name }); setEditingName(false); } }}
            style={{ ...hf, fontSize: "24px", fontWeight: 300, border: "none", borderBottom: "2px solid #E8E4DF", background: "transparent", outline: "none", padding: "0", width: "200px" }} />
        ) : (
          <h1 onClick={() => { setNameVal(classData.name); setEditingName(true); }}
            style={{ ...hf, fontSize: "24px", fontWeight: 300, margin: 0, cursor: "pointer", borderBottom: "1px dashed transparent" }}
            title="Tap to rename">{classData.name}</h1>
        )}
      </div>

      {/* Stats + actions bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", paddingLeft: "24px" }}>
        <span style={{ fontSize: "10px", color: "#A8A29E" }}>{classData.sections.length} sections · {totalEx} exercises</span>
        <div style={{ display: "flex", gap: "4px" }}>
          <button onClick={saveFlow} style={{ padding: "5px 12px", borderRadius: "14px", fontSize: "10px", background: "#FFF", border: "1px solid #E8E4DF", cursor: "pointer", ...bf, color: "#2D2A26", fontWeight: 500 }}>
            Save {savedFlows.some(f => f.name === classData.name) ? "✓" : ""}
          </button>
          <button onClick={() => setScreen("teach")} style={{ padding: "5px 12px", borderRadius: "14px", fontSize: "10px", background: pc.primary, border: "none", cursor: "pointer", ...bf, color: "#FFF", fontWeight: 500 }}>Teach ▶</button>
        </div>
      </div>

      {/* Insert point at top */}
      {showAddMenu === 0 ? renderAddMenu(0) : (
        <button onClick={() => setShowAddMenu(0)}
          style={{ width: "100%", padding: "4px", marginBottom: "4px", background: "none", border: "none", cursor: "pointer", fontSize: "16px", color: "#D6D1CB", ...bf, opacity: 0.6 }}
          title="Insert here">+</button>
      )}

      {/* Sections */}
      {classData.sections.map((sec, si) => {
        const isR = sec.name.toLowerCase().includes("recovery") || sec.name.toLowerCase().includes("cool") || sec.name.toLowerCase().includes("centering");
        const isP = sec.name.toLowerCase().includes("peak");
        const isSkill = SKILLS.some(sk => sk.name === sec.name);
        return (
          <div key={sec.id}>
            <div
              draggable onDragStart={() => setDragSec(si)} onDragOver={e => e.preventDefault()}
              onDrop={() => { if (dragSec !== null && dragSec !== si) { const s = [...classData.sections]; const [m] = s.splice(dragSec, 1); s.splice(si, 0, m); setClassData({ ...classData, sections: s }); } setDragSec(null); }}
              style={{
                background: "#FFF", borderRadius: "8px", border: "1px solid #E8E4DF", marginBottom: "2px", overflow: "hidden",
                borderLeft: isP ? "3px solid #E8A87C" : isR ? "3px solid #A8BCA0" : isSkill ? "3px solid #8B7CB8" : "3px solid transparent",
                opacity: dragSec === si ? 0.5 : 1, cursor: "grab",
              }}>
              {/* Section header */}
              <div onClick={() => setExpandedSec(expandedSec === si ? null : si)}
                style={{ padding: "9px 12px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ color: "#D6D1CB", fontSize: "8px" }}>⠿</span>
                  <span style={{ fontSize: "13px", fontWeight: 500 }}>
                    {isP ? "▲ " : isR ? "🌿 " : isSkill ? "△ " : ""}
                    {sec.name}
                  </span>
                  <span style={{ fontSize: "10px", color: "#A8A29E" }}>({sec.exercises.length})</span>
                </div>
                <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                  <button onClick={e => { e.stopPropagation(); setClassData({ ...classData, sections: classData.sections.filter((_, i) => i !== si) }); }}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "#D4A5A5", fontSize: "13px", padding: "2px 4px" }}>×</button>
                  <span style={{ fontSize: "9px", color: "#C8C3BD", transform: expandedSec === si ? "rotate(180deg)" : "", transition: "transform 0.15s" }}>▼</span>
                </div>
              </div>

              {/* Expanded exercises */}
              {expandedSec === si && (
                <div style={{ padding: "2px 8px 8px" }}>
                  {sec.exercises.map((ex, ei) => {
                    const exData = EXERCISES[ex.name];
                    return (
                      <div key={ex.id}
                        draggable onDragStart={e => { e.stopPropagation(); setDragEx({ si, ei }); }}
                        onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
                        onDrop={e => { e.stopPropagation(); if (dragEx?.si === si && dragEx?.ei !== ei) moveEx(si, dragEx.ei, ei); setDragEx(null); }}
                        style={{
                          display: "flex", justifyContent: "space-between", alignItems: "center",
                          padding: "6px 8px", margin: "2px 0", background: "#FAF8F5", borderRadius: "5px",
                          fontSize: "12px", cursor: "grab",
                          opacity: dragEx?.si === si && dragEx?.ei === ei ? 0.4 : 1,
                        }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span style={{ color: "#D6D1CB", fontSize: "7px" }}>⠿</span>
                          <span>{ex.name}</span>
                          {exData?.uni && <span style={{ fontSize: "8px", color: "#E8A87C", fontWeight: 600 }}>L/R</span>}
                        </div>
                        <button onClick={() => remEx(si, ei)} style={{ background: "none", border: "none", cursor: "pointer", color: "#C8C3BD", fontSize: "11px", padding: "0 2px" }}>×</button>
                      </div>
                    );
                  })}

                  {/* Add exercise to section */}
                  {showLib === si ? (
                    <div style={{ marginTop: "4px", background: "#F5F2EE", borderRadius: "6px", padding: "6px", maxHeight: "220px", overflowY: "auto" }}>
                      <input autoFocus placeholder="Search exercises..." value={search} onChange={e => setSearch(e.target.value)}
                        style={{ width: "100%", padding: "7px 8px", border: "1px solid #E8E4DF", borderRadius: "5px", fontSize: "12px", ...bf, background: "#FFF", boxSizing: "border-box", outline: "none", marginBottom: "4px" }} />
                      {libEntries.slice(0, 25).map(([n, ex]) => (
                        <button key={n} onClick={() => addExToSection(si, n)}
                          style={{ display: "flex", justifyContent: "space-between", width: "100%", textAlign: "left", padding: "5px 8px", background: "none", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "11px", ...bf }}>
                          <span>+ {n}</span>
                          <span style={{ fontSize: "9px", color: "#C8C3BD" }}>{ex.uni ? "L/R" : ""} {ex.level !== "all" ? ex.level : ""}</span>
                        </button>
                      ))}
                      <button onClick={() => { setShowLib(null); setSearch(""); }}
                        style={{ width: "100%", padding: "6px", marginTop: "2px", background: "none", border: "none", cursor: "pointer", fontSize: "10px", color: "#A8A29E", ...bf }}>Done</button>
                    </div>
                  ) : (
                    <button onClick={() => { setShowLib(si); setSearch(""); }}
                      style={{ width: "100%", padding: "7px", marginTop: "3px", background: "none", border: "1px dashed #D6D1CB", borderRadius: "5px", cursor: "pointer", fontSize: "11px", color: "#A8A29E", ...bf }}>+ Add Exercise</button>
                  )}
                </div>
              )}
            </div>

            {/* Insert point between sections */}
            {showAddMenu === si + 1 ? renderAddMenu(si + 1) : (
              <button onClick={() => setShowAddMenu(si + 1)}
                style={{ width: "100%", padding: "2px", margin: "2px 0", background: "none", border: "none", cursor: "pointer", fontSize: "14px", color: "#D6D1CB", ...bf, opacity: 0.5 }}
                title="Insert here">+</button>
            )}
          </div>
        );
      })}

      {/* Final add menu if no sections */}
      {classData.sections.length === 0 && (
        showAddMenu === "empty" ? renderAddMenu(0) : (
          <button onClick={() => setShowAddMenu("empty")}
            style={{ width: "100%", padding: "16px", background: "#FFF", border: "1px dashed #D6D1CB", borderRadius: "10px", cursor: "pointer", fontSize: "13px", color: "#78716C", ...bf, marginTop: "8px" }}>
            + Add your first section
          </button>
        )
      )}
    </div>
  );
}

// SKILLS SCREEN - with Add to Flow
function SkillsScreen({ classData, setClassData, setScreen }) {
  const [expanded, setExpanded] = useState(null);
  const [addedFeedback, setAddedFeedback] = useState(null);

  const addSkillToFlow = (sk) => {
    if (!classData) {
      // Create new flow from skill
      setClassData({
        name: "New Class", principle: "Flow", subPrinciple: "",
        sections: [{ name: sk.name, id: `s${Date.now()}`, exercises: sk.exercises.map((e, j) => ({ name: e, id: `se${Date.now()}_${j}` })) }],
      });
    } else {
      // Append skill as new section
      setClassData({
        ...classData,
        sections: [...classData.sections, {
          name: sk.name, id: `s${Date.now()}`,
          exercises: sk.exercises.map((e, j) => ({ name: e, id: `se${Date.now()}_${j}` })),
        }],
      });
    }
    setAddedFeedback(sk.id);
    setTimeout(() => setAddedFeedback(null), 1500);
  };

  return (
    <div style={{ padding: "16px 14px", paddingBottom: "8px" }}>
      <h1 style={{ ...hf, fontSize: "26px", fontWeight: 300, margin: "0 0 4px" }}>Skill Builders</h1>
      <p style={{ color: "#A8A29E", fontSize: "12px", margin: "0 0 6px" }}>Same-position sequences that build to a peak</p>

      {/* Active flow indicator */}
      {classData && (
        <div style={{ padding: "6px 10px", background: "#F5F2EE", borderRadius: "8px", marginBottom: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "11px", color: "#78716C" }}>Adding to: <span style={{ fontWeight: 600 }}>{classData.name}</span> ({classData.sections.length}s)</span>
          <button onClick={() => setScreen("build")} style={{ fontSize: "10px", color: "#6BA3CF", background: "none", border: "none", cursor: "pointer", ...bf, fontWeight: 500 }}>View Flow →</button>
        </div>
      )}

      {SKILLS.map(sk => (
        <div key={sk.id} style={{ background: "#FFF", borderRadius: "8px", border: "1px solid #E8E4DF", marginBottom: "8px", overflow: "hidden", borderLeft: "3px solid #8B7CB8" }}>
          <div style={{ padding: "10px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div onClick={() => setExpanded(expanded === sk.id ? null : sk.id)} style={{ cursor: "pointer", flex: 1 }}>
              <div style={{ fontSize: "13px", fontWeight: 500 }}>{sk.name}</div>
              <div style={{ fontSize: "10px", color: "#A8A29E" }}>{sk.position} · {sk.exercises.length} exercises · Peak: <span style={{ color: "#E8A87C", fontWeight: 500 }}>{sk.peak}</span></div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <button onClick={() => addSkillToFlow(sk)}
                style={{
                  padding: "5px 12px", borderRadius: "14px", fontSize: "10px", fontWeight: 600,
                  ...bf, cursor: "pointer", border: "none",
                  background: addedFeedback === sk.id ? "#A8BCA0" : "#8B7CB822",
                  color: addedFeedback === sk.id ? "#FFF" : "#8B7CB8",
                  transition: "all 0.2s",
                }}>
                {addedFeedback === sk.id ? "Added ✓" : "+ Add"}
              </button>
              <span onClick={() => setExpanded(expanded === sk.id ? null : sk.id)}
                style={{ fontSize: "9px", color: "#C8C3BD", cursor: "pointer", padding: "4px" }}>{expanded === sk.id ? "▲" : "▼"}</span>
            </div>
          </div>

          {expanded === sk.id && (
            <div style={{ padding: "0 12px 10px" }}>
              <p style={{ fontSize: "11px", color: "#78716C", margin: "0 0 8px", fontStyle: "italic" }}>Goal: {sk.goal}</p>
              <div style={{ position: "relative", paddingLeft: "16px" }}>
                <div style={{ position: "absolute", left: "6px", top: "4px", bottom: "4px", width: "2px", background: "linear-gradient(to bottom, #E8E4DF, #E8A87C)" }} />
                {sk.exercises.map((exName, i) => {
                  const ex = EXERCISES[exName];
                  const isPeak = i === sk.exercises.length - 1;
                  return (
                    <div key={i} style={{ position: "relative", marginBottom: "6px" }}>
                      <div style={{ position: "absolute", left: "-12px", top: "6px", width: isPeak ? "10px" : "6px", height: isPeak ? "10px" : "6px", borderRadius: "50%", background: isPeak ? "#E8A87C" : "#E8E4DF", border: isPeak ? "2px solid #D4918E" : "2px solid #D6D1CB", marginLeft: isPeak ? "-2px" : "0", marginTop: isPeak ? "-2px" : "0" }} />
                      <div style={{ background: isPeak ? "#FFF8F0" : "#FAF8F5", borderRadius: "5px", padding: "6px 8px", border: isPeak ? "1px solid #E8A87C33" : "none" }}>
                        <div style={{ fontSize: "12px", fontWeight: isPeak ? 600 : 400 }}>{exName}
                          {ex?.uni && <span style={{ fontSize: "8px", color: "#E8A87C", marginLeft: "4px" }}>L/R</span>}
                        </div>
                        {ex && <div style={{ fontSize: "10px", color: "#A8A29E", marginTop: "1px" }}>{ex.cues.reps === 1 ? "Hold" : `${ex.cues.reps} reps`}{ex.uni ? " each side" : ""} · {ex.cues.descriptive.slice(0, 60)}...</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// TEACH SCREEN - Adaptive audible cueing
function TeachScreen({ classData }) {
  const [isRunning, setIsRunning] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [phase, setPhase] = useState("idle"); // idle, transition, action, descriptive, breath, counting, lastRep, lastTwo, pause
  const [repCount, setRepCount] = useState(0);
  const [currentSide, setCurrentSide] = useState(null); // null, "right", "left"
  const [displayText, setDisplayText] = useState("");
  const [subText, setSubText] = useState("");
  const timerRef = useRef(null);
  const synthRef = useRef(null);

  // Flatten exercises
  const allEx = [];
  if (classData?.sections) {
    classData.sections.forEach(sec => {
      sec.exercises.forEach(ex => allEx.push({ name: ex.name, section: sec.name }));
    });
  }

  const speak = useCallback((text, rate = 0.92) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = rate;
    utt.pitch = 1.0;
    synthRef.current = utt;
    window.speechSynthesis.speak(utt);
  }, []);

  const wait = useCallback((ms) => new Promise(resolve => { timerRef.current = setTimeout(resolve, ms); }), []);

  const runExercise = useCallback(async (idx, side) => {
    const item = allEx[idx];
    if (!item) { setIsRunning(false); setPhase("idle"); setDisplayText("Class Complete"); setSubText("Great work today"); speak("Class complete. Great work today."); return; }

    const ex = EXERCISES[item.name];
    if (!ex) { setCurrentIdx(idx + 1); runExercise(idx + 1, null); return; }

    const prevItem = idx > 0 ? allEx[idx - 1] : null;
    const prevEx = prevItem ? EXERCISES[prevItem.name] : null;
    const prevPos = prevEx?.pos;

    // Transition cue if position changed
    if (prevPos && prevPos !== ex.pos && side !== "left") {
      const trans = getTransition(prevPos, ex.pos);
      if (trans) {
        setPhase("transition");
        setDisplayText("Transition");
        setSubText(trans);
        speak(trans);
        await wait(4000);
      }
    }

    const sideLabel = side === "right" ? " — Right Side" : side === "left" ? " — Left Side" : "";
    const sideSpeech = side === "right" ? ", right side" : side === "left" ? ", now left side" : "";

    // Action cue
    setPhase("action");
    setCurrentIdx(idx);
    setCurrentSide(side);
    setDisplayText(item.name + sideLabel);
    setSubText(ex.cues.action + (side === "right" ? "" : side === "left" ? ex.cues.action.replace(/right/gi, "left").replace(/left/gi, "right") !== ex.cues.action ? "" : "" : ""));

    const actionText = side === "left"
      ? "Other side. " + ex.cues.action.replace(/right/gi, "LEFT_TEMP").replace(/left/gi, "right").replace(/LEFT_TEMP/gi, "left")
      : item.name + sideSpeech + ". " + ex.cues.action;
    speak(actionText);
    await wait(4500);

    // Descriptive cue
    setPhase("descriptive");
    setSubText(ex.cues.descriptive);
    speak(ex.cues.descriptive, 0.88);
    await wait(4500);

    // Breath cue
    setPhase("breath");
    setSubText(ex.cues.breath);
    speak(ex.cues.breath, 0.88);
    await wait(3500);

    // Counting phase (for rep-based exercises)
    if (ex.cues.reps > 1) {
      setPhase("counting");
      const totalReps = ex.cues.reps;

      // Count through reps with pauses
      for (let r = 1; r <= totalReps; r++) {
        setRepCount(r);
        setSubText(`Rep ${r} of ${totalReps}`);
        if (r === totalReps - 1) {
          setPhase("lastRep");
          setSubText("Last rep coming up");
          speak("Last rep");
          await wait(2200);
        } else if (r === totalReps - 2 && totalReps > 3) {
          speak("Last two");
          await wait(2200);
        } else {
          await wait(1800);
        }
      }
    } else {
      // Hold exercises
      setPhase("counting");
      setSubText("Hold...");
      speak("Hold here. Breathe.");
      await wait(8000);
    }

    // 7 second pause
    setPhase("pause");
    setSubText("Rest");
    await wait(7000);

    // Handle unilateral: do right then left
    if (ex.uni && side !== "left") {
      runExercise(idx, "left");
      return;
    }

    // Move to next
    runExercise(idx + 1, ex.uni ? null : null);
  }, [allEx, speak, wait]);

  const startClass = () => {
    setIsRunning(true);
    setCurrentIdx(0);
    setPhase("action");
    runExercise(0, null);
  };

  const stopClass = () => {
    setIsRunning(false);
    setPhase("idle");
    window.speechSynthesis?.cancel();
    if (timerRef.current) clearTimeout(timerRef.current);
    setDisplayText("");
    setSubText("");
  };

  useEffect(() => { return () => { window.speechSynthesis?.cancel(); if (timerRef.current) clearTimeout(timerRef.current); }; }, []);

  if (!classData?.sections?.length) {
    return <div style={{ padding: "40px 20px", textAlign: "center" }}><p style={{ ...hf, fontSize: "22px", fontWeight: 300, color: "#A8A29E" }}>Build a class first</p></div>;
  }

  const pc = PC[classData.principle] || PC["Flow"];
  const currentItem = allEx[currentIdx];
  const currentEx = currentItem ? EXERCISES[currentItem.name] : null;

  const phaseColors = { idle: "#A8A29E", transition: "#6BA3CF", action: pc.primary, descriptive: "#555", breath: "#6BA3CF", counting: pc.primary, lastRep: "#E8A87C", lastTwo: "#E8A87C", pause: "#A8BCA0" };
  const phaseLabels = { idle: "", transition: "TRANSITION", action: "ACTION", descriptive: "CUE", breath: "BREATH", counting: "REPS", lastRep: "LAST REP", lastTwo: "LAST TWO", pause: "REST" };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ background: pc.primary, padding: "12px 16px" }}>
        <h1 style={{ ...hf, fontSize: "20px", fontWeight: 300, color: "#FFF", margin: 0 }}>{classData.name}</h1>
        <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.5)", margin: "2px 0 0" }}>{allEx.length} exercises</p>
      </div>

      {/* Main display */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "24px 20px", textAlign: "center" }}>
        {!isRunning ? (
          <div>
            <p style={{ ...hf, fontSize: "22px", fontWeight: 300, color: "#2D2A26", marginBottom: "16px" }}>Ready to teach</p>
            <button onClick={startClass} style={{ padding: "14px 36px", borderRadius: "28px", background: pc.primary, border: "none", cursor: "pointer", color: "#FFF", fontSize: "16px", fontWeight: 500, ...bf }}>
              Start Class ▶
            </button>
            {/* Preview list */}
            <div style={{ marginTop: "20px", textAlign: "left", maxWidth: "300px" }}>
              {classData.sections.map((sec, si) => (
                <div key={si} style={{ marginBottom: "6px" }}>
                  <div style={{ fontSize: "10px", fontWeight: 600, color: "#A8A29E", textTransform: "uppercase", letterSpacing: "1px" }}>{sec.name}</div>
                  {sec.exercises.map((ex, ei) => (
                    <div key={ei} style={{ fontSize: "12px", color: "#78716C", padding: "1px 0 1px 8px" }}>{ex.name}</div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ width: "100%" }}>
            {/* Phase indicator */}
            <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "2px", color: phaseColors[phase] || "#A8A29E", marginBottom: "8px" }}>
              {phaseLabels[phase]}
            </div>

            {/* Exercise name */}
            <h1 style={{ ...hf, fontSize: "32px", fontWeight: 400, margin: "0 0 4px", color: "#2D2A26", lineHeight: 1.2 }}>
              {displayText || currentItem?.name}
            </h1>
            {currentSide && <div style={{ fontSize: "13px", color: "#E8A87C", fontWeight: 600, marginBottom: "4px" }}>{currentSide === "right" ? "→ Right Side" : "← Left Side"}</div>}

            {/* Sub text */}
            <p style={{ fontSize: "15px", color: "#555", margin: "12px auto", maxWidth: "320px", lineHeight: 1.5, ...hf, fontStyle: "italic" }}>
              {subText}
            </p>

            {/* Rep counter */}
            {phase === "counting" && currentEx?.cues.reps > 1 && (
              <div style={{ fontSize: "36px", fontWeight: 300, color: pc.primary, margin: "8px 0", ...hf }}>{repCount}</div>
            )}

            {/* Progress */}
            <div style={{ marginTop: "20px" }}>
              <div style={{ height: "3px", background: "#E8E4DF", borderRadius: "2px" }}>
                <div style={{ height: "100%", background: pc.primary, borderRadius: "2px", width: `${((currentIdx + 1) / allEx.length) * 100}%`, transition: "width 0.5s" }} />
              </div>
              <div style={{ fontSize: "10px", color: "#A8A29E", marginTop: "4px" }}>{currentIdx + 1} of {allEx.length} · {currentItem?.section}</div>
            </div>

            {/* Stop button */}
            <button onClick={stopClass} style={{ marginTop: "20px", padding: "10px 24px", borderRadius: "20px", background: "#FFF", border: "1px solid #E8E4DF", cursor: "pointer", fontSize: "13px", ...bf, color: "#78716C" }}>
              Stop
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── MAIN ───────────────────────────────────────────────────────────────────
export default function PilatesApp() {
  const [screen, setScreen] = useState("build");
  const [classData, setClassData] = useState(null);
  const [savedFlows, setSavedFlows] = useState([]);
  const [loaded, setLoaded] = useState(false);

  // Load saved flows from persistent storage
  useEffect(() => {
    (async () => {
      try {
        const result = await window.storage.get("saved-flows");
        if (result?.value) setSavedFlows(JSON.parse(result.value));
      } catch (e) { /* no saved data yet */ }
      setLoaded(true);
    })();
  }, []);

  // Save flows whenever they change
  useEffect(() => {
    if (!loaded) return;
    (async () => {
      try {
        await window.storage.set("saved-flows", JSON.stringify(savedFlows));
      } catch (e) { /* storage not available */ }
    })();
  }, [savedFlows, loaded]);

  return (
    <div style={{ ...bf, background: "#FAF8F5", color: "#2D2A26", maxWidth: "420px", margin: "0 auto", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <style>{fonts}</style>
      <div style={{ flex: 1, overflowY: "auto" }}>
        {screen === "library" && <LibraryScreen />}
        {screen === "build" && <BuildScreen classData={classData} setClassData={setClassData} setScreen={setScreen} savedFlows={savedFlows} setSavedFlows={setSavedFlows} />}
        {screen === "skills" && <SkillsScreen classData={classData} setClassData={setClassData} setScreen={setScreen} />}
        {screen === "teach" && <TeachScreen classData={classData} />}
      </div>
      <NavBar screen={screen} setScreen={setScreen} />
    </div>
  );
}
