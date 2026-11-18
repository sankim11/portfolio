import { experience } from '../data/experience';
import { hobbies } from '../data/hobbies';
import { projects } from '../data/projects';
import { skills } from '../data/skills';
import { useMediaQuery } from '../lib/useMediaQuery';
import { ThumbRail, type RailStop } from './ThumbRail';

/** Every section after the hero, in page order. Ids match the sections' own. */
const STOPS: RailStop[] = [
  { id: 'about', mark: 'A', label: 'About' },
  { id: 'experience', mark: 'E', label: 'Experience', meta: `${experience.length} roles` },
  { id: 'work', mark: 'W', label: 'Selected work', meta: `${projects.length} projects` },
  { id: 'skills', mark: 'T', label: 'Toolkit', meta: `${skills.length} groups` },
  { id: 'offhours', mark: 'O', label: 'Off-hours', meta: `${hobbies.length} pursuits` },
  { id: 'contact', mark: 'C', label: 'Contact' },
];

/**
 * The phone-only thumb rail for the page: it appears once the hero has
 * scrolled away and steps through the sections. Wider screens have the nav.
 */
export function PageRail() {
  const isPhone = useMediaQuery('(max-width: 760px)');
  if (!isPhone) return null;
  return <ThumbRail label="Jump to a section" hint="Slide to jump between sections" stops={STOPS} />;
}
