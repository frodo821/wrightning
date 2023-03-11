export interface Workspace {
  id: string;
  name: string;
  lastOpened: number;
  lastModified: number;
  created: number;
}

export interface File {
  id: string;
  workspace: string;
  path: string;
  content: string;
  lastModified: number;
  lastOpened: number;
  created: number;
}
