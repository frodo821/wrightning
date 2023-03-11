import type { File } from '../../types/files';

export const dirTreeMarker = Symbol('dirTreeMarker');

export type DirTree = {
  [dirTreeMarker]: true;
  [key: string]: DirTree | File;
};

declare global {
  namespace svelte.JSX {
    interface HTMLAttributes<T> {
      'onselect-entry-changed': (ev: CustomEvent<{ key: string }>) => void;
    }
  }
}

export default {};
