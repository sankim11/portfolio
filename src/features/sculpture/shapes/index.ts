import type { HobbyId } from '../../../data/hobbies';
import type { Shape } from '../types';
import { bjj } from './bjj';
import { cooking } from './cooking';
import { football } from './football';
import { gaming } from './gaming';
import { golf } from './golf';
import { painting } from './painting';
import { venture } from './venture';

/**
 * One wireframe per pursuit. Typed by HobbyId, so adding a pursuit to the data
 * without drawing its shape is a compile error.
 */
export const SHAPES: Record<HobbyId, () => Shape> = {
  bjj,
  golf,
  cooking,
  venture,
  football,
  gaming,
  painting,
};
