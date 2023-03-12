import type { NodeType } from '../data/structure';
import type { File, Workspace } from './files';

export type EventArg<TEvent, TTarget> = TEvent & { currentTarget: EventTarget & TTarget };

export interface SaveAsEventDetail {
  node: NodeType;
  file: File;
  forceOverwrite?: boolean;
}

export type DialogOpenDetail = {
  title: string;
  message: string;
} & (
  | {
      type: 'confirm';
      ok?: string;
      cancel?: string;
      onOk?: () => void;
      onCancel?: () => void;
    }
  | {
      type: 'prompt';
      placeholder?: string;
      onEnter?: (value: string) => void;
      onCancel?: () => void;
    }
  | {
      type: 'alert';
      ok?: string;
      onOk?: () => void;
    }
  | {
      type: 'notice';
      ok?: string;
      onOk?: () => void;
    }
);

export interface OpenWorkspaceEventDetail {
  workspace: Workspace;
}

export interface OpenFileEventDetail {
  file: File;
}

export type DialogType = DialogOpenDetail['type'];

export type MessageSeverity = 'success' | 'notice' | 'warning' | 'error' | 'fatal';

export type OpenMessageBarDetail = {
  message: string;
  severity: MessageSeverity;
};

type EventListener<T = never> = (ev: CustomEvent<T>) => void;
type Only<T, U, V> = T extends U ? V : never;

declare global {
  interface WindowEventMap {
    'save-as': CustomEvent<SaveAsEventDetail>;
    'dialog-open': CustomEvent<DialogOpenDetail>;
    'snackbar-open': CustomEvent<OpenMessageBarDetail>;
    'open-workspace': CustomEvent<OpenWorkspaceEventDetail>;
    'open-file': CustomEvent<OpenFileEventDetail>;
    'content-changed': CustomEvent;
    'file-metadata-changed': CustomEvent<{ id: string }>;
    'create-file': CustomEvent<{ path: string }>;
    'request-for-file-creation': CustomEvent<{ key: string }>;
    'workspace-detail-edited': CustomEvent;
    'export-file-request': CustomEvent;
  }

  namespace svelteHTML {
    interface HTMLAttributes<T> {
      'on:save-as'?: Only<T, Window, EventListener<SaveAsEventDetail>>;
      'on:dialog-open'?: Only<T, Window, EventListener<DialogOpenDetail>>;
      'on:snackbar-open'?: Only<T, Window, EventListener<OpenMessageBarDetail>>;
      'on:open-workspace'?: Only<T, Window, EventListener<OpenWorkspaceEventDetail>>;
      'on:open-file'?: Only<T, Window, EventListener<OpenFileEventDetail>>;
      'on:content-changed'?: Only<T, Window, EventListener>;
      'on:file-metadata-changed'?: Only<T, Window, EventListener<{ id: string }>>;
      'on:create-file'?: Only<T, Window, EventListener<{ path: string }>>;
      'on:request-for-file-creation'?: Only<T, Window, EventListener<{ key: string }>>;
      'on:workspace-detail-edited'?: Only<T, Window, EventListener>;
      'on:export-file-request'?: Only<T, Window, EventListener>;
    }
  }
}
