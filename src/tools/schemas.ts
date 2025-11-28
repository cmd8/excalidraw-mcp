import { z } from 'zod';

export const shapeEnum = z.enum(['rectangle', 'ellipse', 'diamond']);
export type ShapeType = z.infer<typeof shapeEnum>;

export const colorEnum = z.enum([
  'transparent',
  'light-blue',
  'light-green',
  'light-yellow',
  'light-red',
  'light-orange',
  'light-purple',
  'blue',
  'green',
  'yellow',
  'red',
  'orange',
  'purple',
]);
export const edgeStyleEnum = z.enum(['solid', 'dashed']);
