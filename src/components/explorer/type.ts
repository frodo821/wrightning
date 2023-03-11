import type { File } from '../../types/files';

export const dirTreeMarker = Symbol('dirTreeMarker');

export type DirTree = {
  [dirTreeMarker]: true;
  [key: string]: DirTree | File;
};

export default {};
