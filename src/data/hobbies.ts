/** Every pursuit has a particle sculpture; see src/features/sculpture/shapes. */
export type HobbyId =
  | 'bjj'
  | 'golf'
  | 'cooking'
  | 'venture'
  | 'football'
  | 'gaming'
  | 'painting';

export type Hobby = {
  id: HobbyId;
  name: string;
  /** What the sculpture shows. */
  caption: string;
  copy: string;
  /** How often, in a few words. */
  tempo: string;
};

/** In the order the tabs appear. */
export const hobbies: Hobby[] = [
  {
    id: 'bjj',
    name: 'Brazilian Jiu-Jitsu',
    caption: 'Gi, belt and the mat',
    copy: 'Four sessions a week on the mats. Drilling, positional rounds, open rolls. Leverage over strength, patience over panic, and plenty of humility.',
    tempo: '4 / week',
  },
  {
    id: 'golf',
    name: 'Golf',
    caption: 'Flag, green and a ball by the hole',
    copy: 'Eighteen holes of patience. One swing at a time, and the course always has the last word.',
    tempo: 'in season',
  },
  {
    id: 'cooking',
    name: 'Cooking',
    caption: 'A pot on the flame',
    copy: 'Pasta from scratch, every kind of meat, asian, brazilian, and whatever I find scrolling. The kitchen is where I prototype with my hands.',
    tempo: 'daily · 1 hr',
  },
  {
    id: 'venture',
    name: 'Entrepreneurship',
    caption: 'From zero to launch',
    copy: "Co-founded Munitora, and I still can't leave an idea alone. Find a real problem, build the smallest thing that tests it, put it in front of people.",
    tempo: 'always on',
  },
  {
    id: 'football',
    name: 'Football',
    caption: 'The ball and the centre circle',
    copy: 'Ninety minutes where spacing, timing and trust in your teammates decide everything. The original systems game.',
    tempo: 'match days',
  },
  {
    id: 'gaming',
    name: 'Gaming',
    caption: 'Controller in hand',
    copy: "Rainbow Six Siege, Civilization VII, Arc Raiders, Assassin’s Creed. Systems thinking applied to itemization, macro play, and raid call-outs.",
    tempo: 'evenings · weekly',
  },
  {
    id: 'painting',
    name: 'Painting',
    caption: 'A landscape on the easel',
    copy: 'Realistic landscapes in acrylic and oil. Currently working on the Hanging Gardens of Babylon and Petra. Color theory rewires how I think about UI palettes.',
    tempo: 'daily · 1 hr',
  },
];
