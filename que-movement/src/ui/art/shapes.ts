// Line drawings for every card, carried over from the Q Movement card art.
// Each shape is drawn in the ink colour over a watercolour wash (see CardArt.tsx).
export type Shape = { t: 'path' | 'circle' | 'ellipse' | 'line' | 'rect'; a: Record<string, string | number>; soft?: true };

export const SHAPES: Record<string, Shape[]> = {
 "bridge-foundation": [
  {
   "t": "path",
   "a": {
    "d": "M18 84 H142"
   },
   "soft": true
  },
  {
   "t": "circle",
   "a": {
    "cx": "34",
    "cy": "76",
    "r": "6"
   }
  },
  {
   "t": "path",
   "a": {
    "d": "M41 78 C58 74 74 66 84 54"
   }
  },
  {
   "t": "path",
   "a": {
    "d": "M84 54 L108 52 L114 82"
   }
  },
  {
   "t": "path",
   "a": {
    "d": "M41 80 L70 84"
   },
   "soft": true
  }
 ],
 "bridge-working": [
  {
   "t": "path",
   "a": {
    "d": "M18 84 H142"
   },
   "soft": true
  },
  {
   "t": "circle",
   "a": {
    "cx": "34",
    "cy": "76",
    "r": "6"
   }
  },
  {
   "t": "path",
   "a": {
    "d": "M41 78 C58 74 74 66 84 52"
   }
  },
  {
   "t": "path",
   "a": {
    "d": "M84 52 L106 50 L112 82"
   }
  },
  {
   "t": "path",
   "a": {
    "d": "M84 52 L98 32 L118 40"
   }
  },
  {
   "t": "path",
   "a": {
    "d": "M41 80 L70 84"
   },
   "soft": true
  }
 ],
 "bridge-challenge": [
  {
   "t": "path",
   "a": {
    "d": "M18 84 H142"
   },
   "soft": true
  },
  {
   "t": "circle",
   "a": {
    "cx": "34",
    "cy": "76",
    "r": "6"
   }
  },
  {
   "t": "path",
   "a": {
    "d": "M41 78 C58 74 74 66 84 52"
   }
  },
  {
   "t": "path",
   "a": {
    "d": "M84 52 L104 52 L110 82"
   }
  },
  {
   "t": "path",
   "a": {
    "d": "M84 52 L132 26"
   }
  },
  {
   "t": "path",
   "a": {
    "d": "M41 80 L70 84"
   },
   "soft": true
  }
 ],
 "scapula-foundation": [
  {
   "t": "circle",
   "a": {
    "cx": "80",
    "cy": "28",
    "r": "9"
   }
  },
  {
   "t": "path",
   "a": {
    "d": "M80 38 V80"
   }
  },
  {
   "t": "path",
   "a": {
    "d": "M62 48 C70 42 77 50 75 60"
   }
  },
  {
   "t": "path",
   "a": {
    "d": "M98 48 C90 42 83 50 85 60"
   }
  },
  {
   "t": "path",
   "a": {
    "d": "M60 50 L46 74"
   },
   "soft": true
  },
  {
   "t": "path",
   "a": {
    "d": "M100 50 L114 74"
   },
   "soft": true
  }
 ],
 "scapula-working": [
  {
   "t": "path",
   "a": {
    "d": "M18 84 H142"
   },
   "soft": true
  },
  {
   "t": "circle",
   "a": {
    "cx": "40",
    "cy": "44",
    "r": "7"
   }
  },
  {
   "t": "path",
   "a": {
    "d": "M47 46 H104"
   }
  },
  {
   "t": "path",
   "a": {
    "d": "M52 48 V82"
   }
  },
  {
   "t": "path",
   "a": {
    "d": "M102 48 L112 66 L118 82"
   }
  },
  {
   "t": "path",
   "a": {
    "d": "M58 40 C66 34 74 40 72 48"
   },
   "soft": true
  }
 ],
 "scapula-challenge": [
  {
   "t": "path",
   "a": {
    "d": "M18 84 H142"
   },
   "soft": true
  },
  {
   "t": "circle",
   "a": {
    "cx": "34",
    "cy": "50",
    "r": "7"
   }
  },
  {
   "t": "path",
   "a": {
    "d": "M41 52 L126 72"
   }
  },
  {
   "t": "path",
   "a": {
    "d": "M46 54 V82"
   }
  },
  {
   "t": "path",
   "a": {
    "d": "M126 72 L134 82"
   }
  },
  {
   "t": "path",
   "a": {
    "d": "M54 46 C62 40 70 46 68 54"
   },
   "soft": true
  }
 ],
 "core-foundation": [
  {
   "t": "path",
   "a": {
    "d": "M18 86 H142"
   },
   "soft": true
  },
  {
   "t": "circle",
   "a": {
    "cx": "32",
    "cy": "78",
    "r": "6"
   }
  },
  {
   "t": "path",
   "a": {
    "d": "M39 82 H96"
   }
  },
  {
   "t": "path",
   "a": {
    "d": "M62 82 L54 50"
   }
  },
  {
   "t": "path",
   "a": {
    "d": "M94 82 L100 50 L118 44"
   }
  },
  {
   "t": "path",
   "a": {
    "d": "M39 84 L52 84"
   },
   "soft": true
  }
 ],
 "core-working": [
  {
   "t": "path",
   "a": {
    "d": "M18 86 H142"
   },
   "soft": true
  },
  {
   "t": "circle",
   "a": {
    "cx": "44",
    "cy": "58",
    "r": "7"
   }
  },
  {
   "t": "path",
   "a": {
    "d": "M50 62 C68 72 84 80 100 82"
   }
  },
  {
   "t": "path",
   "a": {
    "d": "M52 68 L88 78"
   }
  },
  {
   "t": "path",
   "a": {
    "d": "M100 82 L118 62 L130 82"
   }
  }
 ],
 "core-challenge": [
  {
   "t": "path",
   "a": {
    "d": "M18 86 H142"
   },
   "soft": true
  },
  {
   "t": "circle",
   "a": {
    "cx": "46",
    "cy": "40",
    "r": "7"
   }
  },
  {
   "t": "path",
   "a": {
    "d": "M52 44 L84 82"
   }
  },
  {
   "t": "path",
   "a": {
    "d": "M84 82 L128 34"
   }
  },
  {
   "t": "path",
   "a": {
    "d": "M56 50 L120 40"
   },
   "soft": true
  }
 ],
 "balance-foundation": [
  {
   "t": "path",
   "a": {
    "d": "M18 86 H142"
   },
   "soft": true
  },
  {
   "t": "path",
   "a": {
    "d": "M52 80 L80 74 L108 80"
   }
  },
  {
   "t": "circle",
   "a": {
    "cx": "62",
    "cy": "80",
    "r": "2.6",
    "fill": "var(--ink)"
   }
  },
  {
   "t": "circle",
   "a": {
    "cx": "98",
    "cy": "80",
    "r": "2.6",
    "fill": "var(--ink)"
   }
  },
  {
   "t": "circle",
   "a": {
    "cx": "80",
    "cy": "72",
    "r": "2.6",
    "fill": "var(--ink)"
   }
  },
  {
   "t": "path",
   "a": {
    "d": "M80 72 V40"
   },
   "soft": true
  },
  {
   "t": "circle",
   "a": {
    "cx": "80",
    "cy": "32",
    "r": "7"
   }
  }
 ],
 "balance-working": [
  {
   "t": "path",
   "a": {
    "d": "M18 86 H142"
   },
   "soft": true
  },
  {
   "t": "circle",
   "a": {
    "cx": "72",
    "cy": "26",
    "r": "7"
   }
  },
  {
   "t": "path",
   "a": {
    "d": "M72 34 V58"
   }
  },
  {
   "t": "path",
   "a": {
    "d": "M72 58 L54 84"
   }
  },
  {
   "t": "path",
   "a": {
    "d": "M72 58 L96 84"
   }
  },
  {
   "t": "path",
   "a": {
    "d": "M100 44 H128"
   },
   "soft": true
  },
  {
   "t": "path",
   "a": {
    "d": "M120 38 L128 44 L120 50"
   },
   "soft": true
  }
 ],
 "balance-challenge": [
  {
   "t": "path",
   "a": {
    "d": "M18 86 H142"
   },
   "soft": true
  },
  {
   "t": "circle",
   "a": {
    "cx": "80",
    "cy": "24",
    "r": "7"
   }
  },
  {
   "t": "path",
   "a": {
    "d": "M80 32 V58"
   }
  },
  {
   "t": "path",
   "a": {
    "d": "M80 58 L72 80 L84 84"
   }
  },
  {
   "t": "path",
   "a": {
    "d": "M80 58 L98 72"
   }
  },
  {
   "t": "path",
   "a": {
    "d": "M62 44 L80 38 L98 44"
   },
   "soft": true
  }
 ],
 "rise-foundation": [
  {
   "t": "path",
   "a": {
    "d": "M18 86 H142"
   },
   "soft": true
  },
  {
   "t": "circle",
   "a": {
    "cx": "56",
    "cy": "52",
    "r": "7"
   }
  },
  {
   "t": "path",
   "a": {
    "d": "M60 58 L84 76 H108"
   }
  },
  {
   "t": "path",
   "a": {
    "d": "M60 58 L46 82"
   }
  },
  {
   "t": "path",
   "a": {
    "d": "M84 76 L96 84"
   },
   "soft": true
  }
 ],
 "rise-working": [
  {
   "t": "path",
   "a": {
    "d": "M18 86 H142"
   },
   "soft": true
  },
  {
   "t": "circle",
   "a": {
    "cx": "70",
    "cy": "30",
    "r": "7"
   }
  },
  {
   "t": "path",
   "a": {
    "d": "M70 38 V60"
   }
  },
  {
   "t": "path",
   "a": {
    "d": "M70 60 L94 68 L96 84"
   }
  },
  {
   "t": "path",
   "a": {
    "d": "M70 60 L54 76 L44 84"
   }
  }
 ],
 "rise-challenge": [
  {
   "t": "path",
   "a": {
    "d": "M18 86 H142"
   },
   "soft": true
  },
  {
   "t": "circle",
   "a": {
    "cx": "86",
    "cy": "24",
    "r": "7"
   }
  },
  {
   "t": "path",
   "a": {
    "d": "M86 32 V56"
   }
  },
  {
   "t": "path",
   "a": {
    "d": "M86 56 L70 78 L60 84"
   }
  },
  {
   "t": "path",
   "a": {
    "d": "M86 56 L104 74 L112 84"
   }
  },
  {
   "t": "path",
   "a": {
    "d": "M40 84 C52 60 64 46 80 38"
   },
   "soft": true
  }
 ],
 "transition-roll": [
  {
   "t": "path",
   "a": {
    "d": "M28 30 C58 30 60 62 90 62 C112 62 116 44 132 44"
   }
  },
  {
   "t": "path",
   "a": {
    "d": "M124 38 L132 44 L124 50"
   }
  },
  {
   "t": "circle",
   "a": {
    "cx": "28",
    "cy": "30",
    "r": "4"
   }
  }
 ],
 "transition-turn": [
  {
   "t": "path",
   "a": {
    "d": "M104 44 A28 28 0 1 1 80 30"
   }
  },
  {
   "t": "path",
   "a": {
    "d": "M74 22 L82 30 L74 38"
   }
  },
  {
   "t": "circle",
   "a": {
    "cx": "80",
    "cy": "58",
    "r": "3.4"
   }
  }
 ],
 "transition-rise": [
  {
   "t": "path",
   "a": {
    "d": "M32 78 H60 V62 H88 V46 H116"
   }
  },
  {
   "t": "path",
   "a": {
    "d": "M108 38 L118 46 L108 54"
   }
  }
 ],
 "progression-narrow": [
  {
   "t": "path",
   "a": {
    "d": "M40 30 V78"
   },
   "soft": true
  },
  {
   "t": "path",
   "a": {
    "d": "M120 30 V78"
   },
   "soft": true
  },
  {
   "t": "path",
   "a": {
    "d": "M56 54 H76"
   }
  },
  {
   "t": "path",
   "a": {
    "d": "M70 48 L76 54 L70 60"
   }
  },
  {
   "t": "path",
   "a": {
    "d": "M104 54 H84"
   }
  },
  {
   "t": "path",
   "a": {
    "d": "M90 48 L84 54 L90 60"
   }
  }
 ],
 "progression-lever": [
  {
   "t": "path",
   "a": {
    "d": "M34 60 H124"
   }
  },
  {
   "t": "path",
   "a": {
    "d": "M70 60 L78 74 H62 Z"
   }
  },
  {
   "t": "circle",
   "a": {
    "cx": "124",
    "cy": "60",
    "r": "5"
   }
  }
 ],
 "progression-load": [
  {
   "t": "path",
   "a": {
    "d": "M46 46 A18 18 0 0 1 82 46"
   }
  },
  {
   "t": "path",
   "a": {
    "d": "M48 46 C36 58 36 76 64 78 C92 76 92 58 80 46 Z"
   }
  },
  {
   "t": "path",
   "a": {
    "d": "M100 40 V72"
   },
   "soft": true
  },
  {
   "t": "path",
   "a": {
    "d": "M112 34 V78"
   },
   "soft": true
  }
 ],
 "progression-tempo": [
  {
   "t": "circle",
   "a": {
    "cx": "80",
    "cy": "54",
    "r": "26"
   }
  },
  {
   "t": "path",
   "a": {
    "d": "M80 38 V56 L92 62"
   }
  },
  {
   "t": "path",
   "a": {
    "d": "M80 20 V26"
   },
   "soft": true
  }
 ],
 "progression-balance": [
  {
   "t": "path",
   "a": {
    "d": "M52 78 L80 40 L108 78 Z"
   }
  },
  {
   "t": "circle",
   "a": {
    "cx": "80",
    "cy": "30",
    "r": "7"
   }
  }
 ],
 "progression-coord": [
  {
   "t": "path",
   "a": {
    "d": "M52 54 A18 18 0 1 0 88 54"
   }
  },
  {
   "t": "path",
   "a": {
    "d": "M72 54 A18 18 0 1 1 108 54"
   },
   "soft": true
  }
 ]
};
