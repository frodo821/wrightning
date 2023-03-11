import { generateId } from '../data/id';
import type { Workspace, File } from '../types/files';

export class FileSystem {
  public readonly version = 1;
  public readonly waitForReady: Promise<FileSystem>;
  private _ready = false;
  private _db: IDBDatabase | null = null;
  private _error: Error | null = null;

  private readyResolve: (value: FileSystem) => void = () => {};
  private readyReject: (reason: Error) => void = () => {};

  constructor() {
    this.waitForReady = new Promise((res, rej) => {
      this.readyResolve = res;
      this.readyReject = rej;
    });
  }

  initialize() {
    const req = indexedDB.open('workspaces', this.version);

    req.onsuccess = () => {
      this._db = req.result;
      this._ready = true;
      this.readyResolve(this);
    };

    req.onerror = () => {
      this._error = req.error;
      this.readyReject(req.error!);
    };

    req.onupgradeneeded = () => {
      req.result.onerror = () => {
        this._ready = false;
        this._error = new Error('Unable to open database.');
        throw this._error;
      };

      const ws = req.result?.createObjectStore('workspaces', { keyPath: 'id' });
      if (!ws) {
        throw new Error('Unable to create object store.');
      }

      const file = req.result?.createObjectStore('files', { keyPath: 'id' });
      if (!file) {
        throw new Error('Unable to create object store.');
      }
      file.createIndex('workspace', 'workspace', { unique: false });
      file.createIndex('path', 'path', { unique: true });
    };
  }

  get ready() {
    return this._ready;
  }

  get error() {
    return this._error;
  }

  createWorkspace(name: string): Promise<Workspace> {
    if (!this._ready) {
      throw new Error('Database is not ready.');
    }

    const ws: Workspace = {
      id: generateId(),
      name,
      lastOpened: Date.now(),
      lastModified: Date.now(),
      created: Date.now(),
    };

    const tx = this._db!.transaction(['workspaces'], 'readwrite');
    const store = tx.objectStore('workspaces');
    store.add(ws);
    tx.commit();

    return new Promise((res, rej) => {
      tx.oncomplete = () => res(ws);
      tx.onerror = () => rej(tx.error);
    });
  }

  getWorkspaces(): Promise<Workspace[]> {
    if (!this._ready) {
      throw new Error('Database is not ready.');
    }

    const tx = this._db!.transaction(['workspaces'], 'readonly');
    const store = tx.objectStore('workspaces');
    const req = store.getAll();

    return new Promise((res, rej) => {
      req.onsuccess = () => res(req.result);
      req.onerror = () => rej(req.error);
    });
  }

  saveWorkspace(workspace: Workspace): Promise<void> {
    if (!this._ready) {
      throw new Error('Database is not ready.');
    }

    const tx = this._db!.transaction(['workspaces'], 'readwrite');
    const store = tx.objectStore('workspaces');
    store.put(workspace);
    tx.commit();

    return new Promise((res, rej) => {
      tx.oncomplete = () => res();
      tx.onerror = () => rej(tx.error);
    });
  }

  deleteWorkspace(id: string): Promise<void> {
    if (!this._ready) {
      throw new Error('Database is not ready.');
    }

    const tx = this._db!.transaction(['workspaces', 'files'], 'readwrite');
    const wsStore = tx.objectStore('workspaces');
    const fileStore = tx.objectStore('files');
    wsStore.delete(id);
    fileStore.index('workspace').openCursor(IDBKeyRange.only(id)).onsuccess = (e) => {
      const cursor: IDBCursor = (e.target! as IDBRequest).result;
      if (cursor) {
        fileStore.delete(cursor.primaryKey);
        cursor.continue();
      }
    };
    tx.commit();

    return new Promise((res, rej) => {
      tx.oncomplete = () => res();
      tx.onerror = () => rej(tx.error);
    });
  }

  createFile(workspace: string, path: string, content: string): Promise<File> {
    if (!this._ready) {
      throw new Error('Database is not ready.');
    }

    const file: File = {
      id: generateId(),
      workspace,
      path,
      content,
      lastModified: Date.now(),
      lastOpened: Date.now(),
      created: Date.now(),
    };

    const tx = this._db!.transaction(['files'], 'readwrite');
    const store = tx.objectStore('files');
    store.add(file);
    tx.commit();

    return new Promise((res, rej) => {
      tx.oncomplete = () => res(file);
      tx.onerror = () => rej(tx.error);
    });
  }

  getFile(workspace: string, path: string): Promise<File | undefined> {
    if (!this._ready) {
      throw new Error('Database is not ready.');
    }

    const tx = this._db!.transaction(['files'], 'readonly');
    const store = tx.objectStore('files');
    const req = store.index('path').get([workspace, path]);

    return new Promise((res, rej) => {
      req.onsuccess = () => res(req.result);
      req.onerror = () => rej(req.error);
    });
  }

  getFiles(workspace: string): Promise<File[]> {
    if (!this._ready) {
      throw new Error('Database is not ready.');
    }

    const tx = this._db!.transaction(['files'], 'readonly');
    const store = tx.objectStore('files');
    const req = store.index('workspace').getAll(IDBKeyRange.only(workspace));

    return new Promise((res, rej) => {
      req.onsuccess = () => res(req.result);
      req.onerror = () => rej(req.error);
    });
  }

  saveFile(file: File): Promise<void> {
    if (!this._ready) {
      throw new Error('Database is not ready.');
    }

    const tx = this._db!.transaction(['files'], 'readwrite');
    const store = tx.objectStore('files');
    store.put(file);
    tx.commit();

    return new Promise((res, rej) => {
      tx.oncomplete = () => res();
      tx.onerror = () => rej(tx.error);
    });
  }

  deleteFile(id: string): Promise<void> {
    if (!this._ready) {
      throw new Error('Database is not ready.');
    }

    const tx = this._db!.transaction(['files'], 'readwrite');
    const store = tx.objectStore('files');
    store.delete(id);
    tx.commit();

    return new Promise((res, rej) => {
      tx.oncomplete = () => res();
      tx.onerror = () => rej(tx.error);
    });
  }

  batchDeleteFiles(ids: string[]): Promise<void> {
    if (!this._ready) {
      throw new Error('Database is not ready.');
    }

    const tx = this._db!.transaction(['files'], 'readwrite');
    const store = tx.objectStore('files');
    ids.forEach((id) => store.delete(id));
    tx.commit();

    return new Promise((res, rej) => {
      tx.oncomplete = () => res();
      tx.onerror = () => rej(tx.error);
    });
  }

  close() {
    if (this._db) {
      this._db.close();
    }
  }
}

export default new FileSystem();
