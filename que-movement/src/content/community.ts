// The movers of the market: the creators behind In the Queue, the people who visit your
// Studio, and what they say. A simulated community, kept on this device, until there's a real one.

export interface Creator {
  id: string;
  name: string;
  studio: string;
  hue: string;
  specialty: string;
}

export const CREATORS: Creator[] = [
  { id: 'rivermoves', name: 'RiverMoves', studio: 'Riverside Room', hue: '--forest', specialty: 'Glutes before coffee' },
  { id: 'pip', name: 'Pip Okafor', studio: 'The Moss Room', hue: '--aubergine', specialty: 'Flexion ladders' },
  { id: 'luna', name: 'LunaMoves', studio: 'Luna’s Loft', hue: '--dusty-blue', specialty: 'Rescue for desk bodies' },
  { id: 'fern', name: 'Studio Fern', studio: 'Studio Fern', hue: '--sage', specialty: 'Slow strength' },
  { id: 'marguerite', name: 'Marguerite', studio: 'The Attic Barre', hue: '--gold', specialty: 'Hands, then heart' },
  { id: 'sol', name: 'Sol Reyes', studio: 'Sunday Mat Club', hue: '--forest', specialty: 'Whole-mat flows' },
  { id: 'ada', name: 'Ada Lindqvist', studio: 'North Light Pilates', hue: '--dusty-blue', specialty: 'The classical order' },
  { id: 'kemi', name: 'Kemi Adebayo', studio: 'Kinfolk Mat', hue: '--aubergine', specialty: 'Pre and postnatal' },
  { id: 'wren', name: 'Wren Hollis', studio: 'The Lantern Room', hue: '--gold', specialty: 'Evening wind-downs' },
  { id: 'june', name: 'June Matsuda', studio: 'Paper Moon Studio', hue: '--sage', specialty: 'Rotation and breath' }
];

export const creatorByName = (name: string) => CREATORS.find((c) => c.name === name);

export const MOODS: { id: string; glyph: string; label: string }[] = [
  { id: 'unhurried', glyph: '☾', label: 'unhurried' },
  { id: 'strong', glyph: '⋀', label: 'strong' },
  { id: 'curious', glyph: '✧', label: 'curious' },
  { id: 'restoring', glyph: '∿', label: 'restoring' },
  { id: 'playful', glyph: '❀', label: 'playful' }
];

export interface GuestNote {
  id: string;
  from: string;
  studio: string;
  text: string;
  at: number;
}

export const WELCOME_NOTES: GuestNote[] = [
  { id: 'g-welcome-pip', from: 'Pip Okafor', studio: 'The Moss Room', text: 'Welcome to the market! Pin something to your class board and I’ll come and try it.', at: 0 },
  { id: 'g-welcome-wren', from: 'Wren Hollis', studio: 'The Lantern Room', text: 'Lovely little room. The lantern suits it.', at: 0 }
];

/** What visitors say at your class board, keyed to the Harmonies your pinned Sequence has. */
export const VISITOR_LINES: Record<string, string[]> = {
  arrive: ['Starting on the breath got me. I actually arrived.', 'That opening. Quiet in the best way.'],
  'rising-arc': ['It builds so nicely. I didn’t notice it getting hard until it was.', 'Peak right in the middle. Textbook.'],
  counterpose: ['An extension after all that flexion. My spine says thank you.', 'The counterpose! Someone’s been listening to the Council.'],
  seamless: ['Not one scramble between positions. Lovely.', 'Every change of position bridged. So smooth.'],
  economy: ['So little fuss getting up and down. Stealing this.', 'Flow beats fuss, and you proved it.'],
  'whole-body': ['Everything got a turn. Back, centre, shoulders.', 'A whole body in a handful of cards.'],
  settle: ['I left calmer than I came.', 'That ending. I could have napped on the mat.'],
  none: ['Pinning this for Thursday’s class.', 'Cozy room. I’ll be back.', 'Your plant is doing better than mine.']
};

export const VISITOR_NAMES = ['Hana', 'Odile', 'Priti', 'Marisol', 'Greta', 'Noor', 'Bea', 'Tomasz', 'Ines', 'Yuki', 'Delphine', 'Rosa'];

/** Up to this many visitors a day leave kudos and a note. More can still wander in. */
export const VISITS_PER_DAY = 3;
