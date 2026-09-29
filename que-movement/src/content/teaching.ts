// The Pilates Education Council's teaching notes for every Qcard: how to set up, breathe,
// cue, see, make it easier or harder, and who should take care.
// DRAFT: written to widely taught principles for the named Council educators to review and
// sign off before launch (see docs/PILATES_COUNCIL_REVIEW.md). General guidance, never
// medical advice. Keyed by card id; ids must match src/content/mat.ts exactly.

export interface Variation { name: string; how: string }

export interface MovementTeaching {
  /** Getting into the start position, 1–2 sentences. */
  setup: string;
  /** The breath pattern for one repetition. */
  breath: string;
  /** 3–4 cues in the house voice: imagery over anatomy. */
  cues: string[];
  /** 2–3 things a teacher's eye catches (common compensations). */
  watchFor: string[];
  /** A regression that keeps the intent. */
  easier: Variation;
  /** A progression, if one is sensible. */
  harder?: Variation;
  /** Who might modify or skip it. General, never diagnostic. */
  takeCare: string;
}

export interface SpecialTeaching { cues: string[]; takeCare?: string }

export const TEACHING: Record<string, MovementTeaching> = {
  // ---------------- Core ----------------
  breathing: {
    setup: 'Lie on your back with knees bent and feet flat, hip-width apart. Rest your hands on the sides of your ribs so you can feel them move.',
    breath: 'Breathe in through the nose and widen the ribs into your hands; breathe out through softly parted lips and let them draw back in and down.',
    cues: [
      'Let the back of the ribcage spread into the mat as you breathe in.',
      'Breathe out slowly, as if fogging a cold window.',
      'Let each exhale settle the ribs home, heavy and quiet.',
      'Nothing to grip: jaw, throat and shoulders stay soft.'
    ],
    watchFor: [
      'Breath going only into the belly, or only up into the top of the chest.',
      'Shoulders creeping towards the ears on the in-breath.',
      'Forcing the exhale until the neck or jaw tightens.'
    ],
    easier: { name: 'Just notice', how: 'Rest one hand on the belly and one on the ribs, and simply notice the breath without shaping it.' },
    harder: { name: 'Longer exhale', how: 'Breathe in for three counts and out for six, keeping the ribs heavy all the way to the end of the breath.' },
    takeCare: 'If lying on your back is uncomfortable, or you are pregnant, breathe seated or side-lying instead. If breath work makes you light-headed, return to your natural breath.'
  },

  'dead-bug': {
    setup: 'Lie on your back and bring your legs to tabletop, knees over hips and shins level with the mat. Reach both arms up to the ceiling above your shoulders.',
    breath: 'Breathe out as one arm and the opposite leg travel away; breathe in as they come home. Alternate sides.',
    cues: [
      'Ribs heavy, as if a warm hand is resting on them.',
      'Reach away only as far as the back stays quiet on the mat.',
      'Bring the limbs home as slowly as they left.',
      'Let the neck and jaw stay soft; the work lives in the middle.'
    ],
    watchFor: [
      'The lower back lifting away from the mat as the leg reaches.',
      'The front ribs popping up as the arm travels overhead.',
      'Rushing, or holding the breath to stay still.'
    ],
    easier: { name: 'One limb at a time', how: 'Keep the feet on the mat and move one arm at a time, or keep the arms still and slide one heel away along the mat.' },
    harder: { name: 'Low hover', how: 'Let the reaching leg hover closer to the mat, only as low as the back stays still.' },
    takeCare: 'If the lower back lifts or aches, shorten the reach or keep the feet down. If you have recently had a baby or abdominal surgery, check with your teacher or clinician first.'
  },

  'toe-taps': {
    setup: 'Lie on your back and bring both legs to tabletop, knees over hips. Arms rest long by your sides, palms down.',
    breath: 'Breathe out as one foot lowers to tap the mat; breathe in as it returns to tabletop. Alternate sides.',
    cues: [
      'Keep the knee angle fixed; the leg moves from the hip, like a hinge.',
      'Lower the foot as if dipping a toe into a warm bath.',
      'The back stays quiet, resting in sand you don’t want to disturb.',
      'Bring the leg home with the same care you lowered it.'
    ],
    watchFor: [
      'The lower back arching as the foot lowers.',
      'The knee opening so the foot swings rather than lowers.',
      'The belly pushing up into a dome.'
    ],
    easier: { name: 'One leg at a time', how: 'Keep one foot on the mat and lift only the other leg to tabletop, tapping down from there.' },
    harder: { name: 'Both feet together', how: 'Lower both feet towards the mat at once, only as far as the back stays still.' },
    takeCare: 'If you feel it in the lower back or the front of the hips, make the tap smaller. If you have recently had a baby or abdominal surgery, check with your teacher or clinician first.'
  },

  'hundred-prep': {
    setup: 'Lie on your back, knees bent and feet flat. Nod the chin and curl the head and shoulders up until the tips of the shoulder blades just brush the mat, arms long and hovering beside you.',
    breath: 'Breathe in for five small arm pulses and out for five. About four breath cycles makes one set.',
    cues: [
      'Curl up from the breastbone, as if a thread draws it gently forward.',
      'Pulse the arms from the shoulders, small and bright, like patting the surface of water.',
      'Keep a clementine’s worth of space under the chin.',
      'Stay at the height you can keep. If the head grows heavy, lower it and keep pulsing.'
    ],
    watchFor: [
      'The chin jamming to the chest, or the neck straining forward.',
      'The belly pushing up into a dome.',
      'The breath held, or drifting out of time with the pulses.'
    ],
    easier: { name: 'Head down', how: 'Keep the head resting on the mat or a small cushion and pulse the arms with the breath.' },
    harder: { name: 'Legs lifted', how: 'Bring the legs to tabletop, or reach them long on a high diagonal, only as low as the back stays quiet.' },
    takeCare: 'Curling up under load isn’t for everyone. If you have low bone density, neck discomfort, are pregnant or have recently given birth, keep the head down or check with your teacher or clinician first.'
  },

  'roll-up': {
    setup: 'Lie on your back with legs long, hip-width apart, feet softly flexed. Reach the arms up towards the ceiling, or overhead if the ribs stay soft.',
    breath: 'Breathe in as the arms come forward and the chin nods; breathe out to peel up and reach past the feet. Breathe in to begin rolling back; breathe out to lower bone by bone.',
    cues: [
      'Peel the spine off the mat slowly, like lifting a sticker from its backing.',
      'Reach forward past the feet, long through the arms and the crown.',
      'Roll back down as though laying a string of pearls, one at a time.',
      'Keep the legs heavy and the heels anchored.'
    ],
    watchFor: [
      'The legs lifting off the mat as you come up.',
      'Throwing the arms or jerking to get momentum.',
      'Flat sections where the spine moves as one block instead of bone by bone.'
    ],
    easier: { name: 'Half Roll Back', how: 'Sit tall with knees bent, hold the backs of the thighs, and roll back only halfway before returning.' },
    harder: { name: 'Arms overhead', how: 'Begin with the arms reaching overhead and keep them framing the ears as you roll up and down.' },
    takeCare: 'Rolling through the spine under load isn’t for everyone. If you have low bone density, a back condition, are pregnant or have recently given birth, check with your teacher or clinician; Half Roll Back or a neutral-spine card may suit you better.'
  },

  'teaser-prep': {
    setup: 'Lie on your back with knees bent and feet flat. Extend one leg long on a diagonal with the knees level, and reach the arms up towards the ceiling.',
    breath: 'Breathe in to prepare; breathe out as you roll up to balance. Breathe in to hold the shape; breathe out as you roll down.',
    cues: [
      'Roll up through the spine, arms reaching parallel to the lifted leg.',
      'Find the balance point just behind the sit bones: perched, not slumped.',
      'Lift out of the waist, as if a ribbon draws the breastbone forward and up.',
      'Keep the knees level all the way down.'
    ],
    watchFor: [
      'Slumping back behind the balance point.',
      'Shoulders hunching towards the ears.',
      'The lifted leg dropping as you roll up.'
    ],
    easier: { name: 'Hands behind the thighs', how: 'Keep both feet down, hold the backs of the thighs, and roll up to balance with the hands helping.' },
    harder: { name: 'Full Teaser', how: 'Begin with both legs long on a diagonal and roll up to balance, arms reaching towards the feet.' },
    takeCare: 'This is peak-of-class work. If you have low bone density, a back condition, are pregnant or have recently given birth, check with your teacher or clinician first. Build through Hundred Preparation and Roll Up before you try it.'
  },

  // ---------------- Bridging ----------------
  bridge: {
    setup: 'Lie on your back, knees bent, feet flat and hip-width apart, heels a comfortable distance from your sit bones. Arms rest long by your sides, palms down.',
    breath: 'Breathe out to lift the hips; breathe in at the top; breathe out to lower home.',
    cues: [
      'Reach the knees forward over the toes as the hips rise.',
      'Press evenly through both feet, big toe and heel alike.',
      'Stop at a long line from knees to shoulders; the front ribs stay soft.',
      'Lower slowly, the ribs arriving first and the pelvis last.'
    ],
    watchFor: [
      'Arching the lower back to get higher, so the front ribs lift.',
      'Knees falling in or splaying apart.',
      'Pushing into the neck and shoulders rather than the legs.'
    ],
    easier: { name: 'Small lift', how: 'Lift the hips only a few centimetres and lower. Add height only while the back stays easy.' },
    harder: { name: 'Pause at the top', how: 'Hold at the top for three slow breaths, hips level and knees reaching, before you lower.' },
    takeCare: 'If the back or knees complain, make the lift smaller or bring the heels closer. Keep the weight across the upper back, never on the neck, and stop if anything hurts.'
  },

  'bridge-march': {
    setup: 'Begin in your Bridge: hips lifted, a long line from knees to shoulders, arms long and pressing lightly into the mat.',
    breath: 'Breathe out as one foot floats a few centimetres off the mat; breathe in as you set it down. Alternate sides.',
    cues: [
      'Keep the pelvis level, like a tray of tea you mustn’t spill.',
      'Shift your weight into the grounded foot before the other one leaves.',
      'Float the foot only as high as the hips stay still.',
      'Let the arms press lightly into the mat to steady you.'
    ],
    watchFor: [
      'The hip on the lifting side dropping or tipping.',
      'The hips sinking lower with each march.',
      'Holding the breath to stay still.'
    ],
    easier: { name: 'Heel lifts', how: 'Keep the toes down and lift one heel at a time, feeling the weight shift without the hips moving.' },
    harder: { name: 'Arms to the ceiling', how: 'Reach both arms up to the ceiling so the mat helps you less.' },
    takeCare: 'If the backs of the thighs cramp, lower down, rest, and try again with the heels a little further away. Stop if the back or hips feel pinched.'
  },

  clam: {
    setup: 'Lie on your side with hips and shoulders stacked, knees bent in front of you and heels in line with your spine. Rest your head on your lower arm or a small cushion.',
    breath: 'Breathe out as the top knee opens; breathe in as it closes.',
    cues: [
      'Heels stay together; the top knee opens like the cover of a book.',
      'Open only as far as the top hip stays stacked over the bottom one.',
      'Feel the work behind the hip, where a back pocket would sit.',
      'Close the book slowly; don’t let it snap shut.'
    ],
    watchFor: [
      'The top hip rolling back to make the knee go higher.',
      'The waist sagging into the mat.',
      'The feet peeling apart.'
    ],
    easier: { name: 'Smaller book', how: 'Open just a little, with your top hand resting on the hip so you can feel it stay still.' },
    harder: { name: 'Feet hovering', how: 'Lift both feet a few centimetres off the mat, together, and keep them there as the knee opens and closes.' },
    takeCare: 'If lying on your side presses on a shoulder or hip, add padding under the head or between the knees. Shorten the range or skip it if the hip feels pinched.'
  },

  'single-leg-bridge': {
    setup: 'Lie on your back, knees bent, feet flat and hip-width apart. Float one leg up to tabletop; the other foot stays grounded, arms long by your sides.',
    breath: 'Breathe out to lift the hips; breathe in at the top; breathe out to lower.',
    cues: [
      'Press down through the grounded foot, as if into firm sand.',
      'Both hip bones stay level, like headlights pointing at the ceiling.',
      'Lift only as high as the pelvis stays square.',
      'Lower slowly, both sides of the pelvis arriving together.'
    ],
    watchFor: [
      'The hip on the lifted-leg side dropping.',
      'The lower back arching to gain height.',
      'The grounded knee drifting in or out.'
    ],
    easier: { name: 'Bridge, then float', how: 'Lift into a two-footed Bridge first, then float one foot for a breath and set it back down before you lower.' },
    harder: { name: 'Long leg', how: 'Extend the lifted leg long, in line with the other thigh, and keep it there as you rise and lower.' },
    takeCare: 'This asks a lot of one hip and thigh. If you feel it in your lower back or knee instead, return to Bridge March, and stop if anything hurts.'
  },

  // ---------------- Shoulders ----------------
  'scapular-glide': {
    setup: 'Sit tall on the mat, or on a cushion or chair if that’s kinder to your hips, and reach both arms forward at shoulder height, palms facing each other.',
    breath: 'Breathe out as the shoulder blades slide wide and the arms reach a little further; breathe in as they gather home.',
    cues: [
      'Let the shoulder blades glide around the ribs, like drawers sliding open.',
      'The arms stay long; the movement lives behind you.',
      'Gather them home gently: no squeezing, no pinching.',
      'Sit tall through the crown, the neck long and easy.'
    ],
    watchFor: [
      'Shoulders shrugging up towards the ears.',
      'The chest collapsing, or the ribs pushing forward instead of the blades moving.',
      'Elbows bending so the arms do the work.'
    ],
    easier: { name: 'Supported arms', how: 'Rest your hands on your thighs or a table and let the shoulder blades glide without holding the arms up.' },
    harder: { name: 'Wall press', how: 'Stand facing a wall with your hands on it at shoulder height, and glide the blades wide and home as you lean in a little.' },
    takeCare: 'If sitting on the floor strains your hips or back, sit on a cushion or a chair. If lifting the arms is uncomfortable, keep them lower or rest them.'
  },

  'quad-press': {
    setup: 'Come onto all fours with hands under shoulders and knees under hips. Spread the fingers and let the spine rest long from crown to tailbone.',
    breath: 'Breathe out as you press the floor away and the space between the shoulder blades widens; breathe in as you melt a little between the arms.',
    cues: [
      'Press the floor away, as if pushing the mat gently down and forward.',
      'Melt between the arms without sinking into the shoulders.',
      'Elbows long but soft, never locked.',
      'The head is part of the spine: gaze just ahead of the hands.'
    ],
    watchFor: [
      'Elbows bending, turning it into a small press-up.',
      'The middle of the back rounding or arching instead of the shoulder blades moving.',
      'Weight rocking back into the knees.'
    ],
    easier: { name: 'At the wall', how: 'Stand facing a wall, hands on it at shoulder height, and do the same press and melt standing up.' },
    harder: { name: 'Knees hovering', how: 'Tuck the toes and hover the knees a few centimetres off the mat, then press and melt.' },
    takeCare: 'Weight on the hands can be hard on sensitive wrists: try fists, a folded towel under the heels of the hands, or the wall version. Pad the knees if kneeling bothers you, and skip it if the wrists or shoulders hurt.'
  },

  'bird-dog': {
    setup: 'Come onto all fours, hands under shoulders and knees under hips, with a long, level back.',
    breath: 'Breathe out as you reach one arm forward and the opposite leg back; breathe in as they come home. Alternate sides.',
    cues: [
      'Reach long through the opposite hand and heel, as if drawn gently from both ends.',
      'Both hip bones point at the floor like headlights.',
      'Slide the foot along the mat before it lifts, and lift only to hip height.',
      'Press the supporting hand into the floor so that shoulder stays wide.'
    ],
    watchFor: [
      'The hip of the lifted leg rolling open towards the ceiling.',
      'The lower back sagging, or the leg lifting higher than the hip.',
      'Weight sliding sideways, or the supporting shoulder sinking.'
    ],
    easier: { name: 'One limb at a time', how: 'Slide one leg back along the mat, or reach one arm forward, keeping everything else still.' },
    harder: { name: 'Hold and draw', how: 'Hold the long line for three breaths, drawing small, slow circles with the lifted hand and foot.' },
    takeCare: 'Pad the knees, use fists for sensitive wrists, and stop if the back or wrists ache. Keep one hand ready to steady yourself if balance on a narrow base feels uncertain.'
  },

  'swan-prep': {
    setup: 'Lie on your front with your forehead on the mat or a folded towel. Place the hands flat beside the shoulders, elbows bent and close to the ribs, legs long and hip-width apart.',
    breath: 'Breathe in as the chest glides forward and up; breathe out as you lower with control.',
    cues: [
      'Lengthen through the crown before you lift, as if someone is drawing your head forward.',
      'Let the breastbone glide forward and up, like the prow of a boat.',
      'Shoulders soft and wide; the hands guide more than they push.',
      'Keep the lift in the upper back while the front of the hips stays heavy.'
    ],
    watchFor: [
      'Pushing up with the arms until the lower back pinches.',
      'Tipping the head back and shortening the neck.',
      'Shoulders hunching towards the ears.'
    ],
    easier: { name: 'Small lift', how: 'Lift only the head and the top of the chest a few centimetres, hands barely pressing, then lower.' },
    harder: { name: 'Hands light', how: 'At the top, hover the hands just off the mat for a breath so the upper back holds the lift on its own.' },
    takeCare: 'If lying on your front is uncomfortable, including in pregnancy or after abdominal surgery, ask your teacher for a seated or standing upper-back extension instead. Keep the range small and stop if the lower back pinches.'
  },

  'plank-control': {
    setup: 'From all fours, step the feet back one at a time into a long line from head to heels, hands under shoulders and fingers spread.',
    breath: 'Breathe slowly and evenly throughout the hold: in through the nose, out through softly parted lips. Never hold the breath.',
    cues: [
      'Press the floor away so the shoulder blades stay wide across the back.',
      'One long line from crown to heels, like a plank of polished wood.',
      'Heels reach back while the crown reaches forward.',
      'Knees down the moment the shape starts to sag: a good short plank beats a long wobbly one.'
    ],
    watchFor: [
      'The hips sagging towards the floor, or piking up high.',
      'The chest sinking between the shoulder blades.',
      'The head dropping, or the breath held.'
    ],
    easier: { name: 'Kneeling plank', how: 'Lower the knees to the mat and keep a long line from knees to crown.' },
    harder: { name: 'Press and melt', how: 'In the plank, let the chest melt slowly between the shoulder blades and press it back up, five times, without bending the elbows.' },
    takeCare: 'This loads the wrists and shoulders fully. Use fists or forearms for sensitive wrists, drop to the knees whenever the back sags, and skip it if the shoulders or wrists hurt. If you are pregnant or have recently given birth, check with your teacher or clinician first.'
  }
};

export const SPECIAL_TEACHING: Record<string, SpecialTeaching> = {
  // ---------------- Transitions ----------------
  'tr-seated-supine': {
    cues: [
      'Sit tall with knees bent and feet flat, arms reaching forward.',
      'Curl the tailbone under and roll back one bone at a time.',
      'Let the hands walk along the thighs to help if you like.',
      'The head arrives last, like setting down a teacup.'
    ],
    takeCare: 'If rolling through the spine isn’t right for you, lower down onto one side using your hands, then turn onto your back.'
  },
  'tr-supine-side': {
    cues: [
      'Bend the knees and draw them together.',
      'Roll ribs and pelvis as one piece, like a log turning on the water.',
      'Let the head travel with you and rest it on your lower arm.'
    ],
    takeCare: 'If turning makes you dizzy, pause on your back for a breath first, and roll slowly.'
  },
  'tr-roll-to-quadruped': {
    cues: [
      'Roll to one side as one piece.',
      'Place the top hand in front of your chest and press the floor away to come up.',
      'Arrive on all fours, hands under shoulders and knees under hips.',
      'Take one breath here before you begin.'
    ],
    takeCare: 'Pad the knees if kneeling is uncomfortable, and rise slowly if you feel light-headed when changing level.'
  },
  'tr-quad-prone': {
    cues: [
      'From all fours, walk the hands forward a little.',
      'Lower the hips and chest together, ribs long, until you rest on your front.',
      'Turn the head to one side, or rest the forehead on your hands.'
    ],
    takeCare: 'If lying on your front isn’t comfortable, stay on all fours and ask your teacher for an alternative.'
  },
  'tr-quad-seated': {
    cues: [
      'From all fours, let the hips travel back towards the heels.',
      'Swing the hips around to one side and sit, hands resting quietly on the mat.',
      'Arrive tall, sitting on a cushion if the hips or knees prefer.'
    ],
    takeCare: 'If the knees dislike deep bending, skip the sit-back: walk the hands in and come up to kneeling or sitting instead.'
  },

  // ---------------- Progressions ----------------
  'pr-slow-tempo': {
    cues: [
      'Take twice as long going out and twice as long coming home.',
      'Let the breath set the pace: one long exhale for the effort.',
      'Slow never means holding the breath; keep it flowing.',
      'Fewer, slower repetitions beat many rushed ones.'
    ],
    takeCare: 'Slow work tires you in a new way. Rest between sides whenever you need to.'
  },
  'pr-longer-lever': {
    cues: [
      'Straighten the limb a little further so it reaches further from its joint.',
      'The back tells you how far: lengthen only while it stays quiet.',
      'If the shape starts to wobble, shorten the lever and try again.'
    ],
    takeCare: 'A longer lever asks more of the back and hips. Shorten it the moment the lower back lifts or aches.'
  },
  'pr-add-coordination': {
    cues: [
      'Layer one second task at a time: opposite limbs, a breath count, or a gentle hold.',
      'Add it only when the base movement already feels easy.',
      'Keep it slow; coordination grows with time, not speed.',
      'Close the eyes only on a steady base, and only if you feel safe.'
    ],
    takeCare: 'Closing the eyes or narrowing the base changes your balance. Keep a hand or knee ready to steady yourself, and skip eyes-closed work if balance is a concern.'
  }
};
