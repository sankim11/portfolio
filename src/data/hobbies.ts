export type Hobby = {
  id: string;
  no: string;
  name: string;
  caption: string;
  copy: string;
  tempo: string;
  mood: string;
};

export const hobbies: Hobby[] = [
  {
    id: 'bjj',
    no: '01',
    name: 'Brazilian Jiu-Jitsu',
    caption: 'Gi, belt and the mat',
    copy: 'Four sessions a week on the mats. Drilling, positional rounds, open rolls. Leverage over strength, patience over panic, and plenty of humility.',
    tempo: '4 / week',
    mood: 'bjj',
  },
  {
    id: 'cooking',
    no: '02',
    name: 'Cooking',
    caption: "Chef's hat, knife and pan",
    copy: 'Pasta from scratch, every kind of meat, asian, brazilian, and whatever I find scrolling. The kitchen is where I prototype with my hands.',
    tempo: 'daily · 1 hr',
    mood: 'cooking',
  },
  {
    id: 'venture',
    no: '03',
    name: 'Entrepreneurship',
    caption: 'From zero to launch',
    copy: "Co-founded Munitora, and I still can't leave an idea alone. Find a real problem, build the smallest thing that tests it, put it in front of people.",
    tempo: 'always on',
    mood: 'venture',
  },
  {
    id: 'football',
    no: '04',
    name: 'Football',
    caption: 'The ball and the centre circle',
    copy: 'Ninety minutes where spacing, timing and trust in your teammates decide everything. The original systems game.',
    tempo: 'match days',
    mood: 'football',
  },
  {
    id: 'gaming',
    no: '05',
    name: 'Gaming',
    caption: 'Controller, hex grid, raid map',
    copy: "Rainbow Six Siege, Civilization VII, Arc Raiders, Assassin’s Creed. Systems thinking applied to itemization, macro play, and raid call-outs.",
    tempo: 'evenings · weekly',
    mood: 'gaming',
  },
  {
    id: 'painting',
    no: '06',
    name: 'Painting',
    caption: 'Hanging Gardens and Petra, in progress',
    copy: 'Realistic landscapes in acrylic and oil. Currently working on the Hanging Gardens of Babylon and Petra. Color theory rewires how I think about UI palettes.',
    tempo: 'daily · 1 hr',
    mood: 'painting',
  },
];
