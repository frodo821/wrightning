import type { MessageSeverity } from '../types/eventArgs';

function openMessage(msg: string, severity?: MessageSeverity) {
  const evt = new CustomEvent('snackbar-open', {
    detail: {
      message: msg,
      severity: severity ?? 'notice',
    },
  });

  window.dispatchEvent(evt);
}

export default {
  message: openMessage,
  info(msg: string) {
    openMessage(msg, 'notice');
  },
  success(msg: string) {
    openMessage(msg, 'success');
  },
  warning(msg: string) {
    openMessage(msg, 'warning');
  },
  error(msg: string) {
    openMessage(msg, 'error');
  },
  fatal(msg: string) {
    openMessage(msg, 'fatal');
  },
};
