import message from './message';

type ShortcutKey = {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  metaKey?: boolean;
};

type ReversedKeyboardLayoutMap = Record<string, string>;

interface NavigatorExt {
  keyboard?: {
    getLayoutMap?(): Promise<Map<string, string>>;
  };
}

export interface IEventManager {
  initialize(): void;
  addShortcut(keyExpr: string, callback: () => void): void;
  removeShortcut(keyExpr: string): void;
  handleKeyUp(event: KeyboardEvent): void;
}

class EventManager implements IEventManager {
  reversedKeyboardLayoutMap: ReversedKeyboardLayoutMap = {};
  keyboardLayoutMap: Record<string, string> = {};
  shortcuts: Record<string, [ShortcutKey, () => void]> = {};

  fromKeyExpression(keyExpr: string): ShortcutKey {
    keyExpr = keyExpr.toLowerCase();
    const key = this.reversedKeyboardLayoutMap[keyExpr.split('+').pop() || ''];
    const ctrlKey = keyExpr.includes('ctrl');
    const altKey = keyExpr.includes('alt');
    const shiftKey = keyExpr.includes('shift');
    const metaKey = keyExpr.includes('meta');
    return { key, ctrlKey, altKey, shiftKey, metaKey };
  }

  toKeyExpression(key: ShortcutKey): string {
    const parts = [];
    if (key.ctrlKey) parts.push('ctrl');
    if (key.altKey) parts.push('alt');
    if (key.shiftKey) parts.push('shift');
    if (key.metaKey) parts.push('meta');
    parts.push(this.keyboardLayoutMap[key.key]);
    return parts.join('+');
  }

  /**
   * initializes the event manager
   */
  initialize = () => {
    const nav: NavigatorExt & Navigator = navigator as any;

    if (!nav.keyboard || !nav.keyboard.getLayoutMap) {
      message.fatal('This browser does not support keyboard layout maps.');
      console.warn('This browser does not support keyboard layout maps.');
      return;
    }

    this.reversedKeyboardLayoutMap = {};
    this.keyboardLayoutMap = {};
    this.shortcuts = {};

    nav.keyboard.getLayoutMap().then((layoutMap) => {
      [...layoutMap.entries()].forEach(([key, value]) => {
        this.reversedKeyboardLayoutMap[value] = key;
        this.keyboardLayoutMap[key] = value;
      });

      console.info(
        `Event manager initialized. Loaded ${
          Object.keys(this.keyboardLayoutMap).length
        } keyboard layouts.`,
      );
    });
  };

  addShortcut = (keyExpr: string, callback: () => void) => {
    const key = this.fromKeyExpression(keyExpr);
    this.shortcuts[this.toKeyExpression(key)] = [key, callback];
  };

  removeShortcut = (keyExpr: string) => {
    const key = this.fromKeyExpression(keyExpr);
    delete this.shortcuts[this.toKeyExpression(key)];
  };

  handleKeyUp = (event: KeyboardEvent) => {
    const key = this.reversedKeyboardLayoutMap[event.code] || event.code;
    const keyExpr = this.toKeyExpression({
      key,
      ctrlKey: event.ctrlKey,
      altKey: event.altKey,
      shiftKey: event.shiftKey,
      metaKey: event.metaKey,
    });

    const shortcut = this.shortcuts[keyExpr];

    if (shortcut) {
      event.preventDefault();
      shortcut[1]();
    }
  };
}

export default new EventManager() as IEventManager;
