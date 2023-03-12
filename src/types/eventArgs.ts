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

  namespace svelte.JSX {
    interface HTMLProps<T extends 'svelte:window'> {
      'onsave-as'?: EventListener<SaveAsEventDetail>;
      'ondialog-open'?: EventListener<DialogOpenDetail>;
      'onsnackbar-open'?: EventListener<OpenMessageBarDetail>;
      'onopen-workspace'?: EventListener<OpenWorkspaceEventDetail>;
      'onopen-file'?: EventListener<OpenFileEventDetail>;
      'oncontent-changed'?: EventListener;
      'onfile-metadata-changed'?: EventListener<{ id: string }>;
      'oncreate-file'?: EventListener<{ path: string }>;
      'onrequest-for-file-creation'?: EventListener<{ key: string }>;
      'onworkspace-detail-edited'?: EventListener;
      'onexport-file-request'?: EventListener;
    }
  }
}
