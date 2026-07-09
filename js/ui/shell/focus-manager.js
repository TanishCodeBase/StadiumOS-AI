import { BaseManager } from '../../core/base-manager.js';
import { logger } from '../../diagnostics/logger.js';

class FocusManager extends BaseManager {
  constructor() {
    super('1.0.0');
    this.trapContainer = null;
    this.previousFocusedElement = null;
    this.keydownHandler = null;
    this.context = null;
  }

  /**
   * Initializes FocusManager with context dependencies
   * @param {AppContext} context 
   */
  initialize(context) {
    if (this.initialized) return;
    super.initialize();

    this.context = context;

    // Hook tab key event interceptor for accessibility modal traps
    this.keydownHandler = (e) => this.handleKeyDown(e);
    this.addListener(window, 'keydown', this.keydownHandler);
    
    logger.info('System', 'FocusManager: Accessibility interceptors initialized.');
  }

  focusElement(element) {
    if (element && typeof element.focus === 'function') {
      element.setAttribute('tabindex', '-1');
      element.focus();
      logger.debug('System', 'FocusManager: Shifted keyboard focus to element.');
    }
  }

  setFocusTrap(container) {
    this.trapContainer = container;
    this.previousFocusedElement = document.activeElement;

    if (container) {
      const focusable = this.getFocusableElements(container);
      if (focusable.length > 0) {
        focusable[0].focus();
      }
    }
    logger.debug('System', 'FocusManager: Enabled modal keyboard focus trap container.');
  }

  clearFocusTrap() {
    this.trapContainer = null;
    if (this.previousFocusedElement && typeof this.previousFocusedElement.focus === 'function') {
      this.previousFocusedElement.focus();
      this.previousFocusedElement = null;
    }
    logger.debug('System', 'FocusManager: Disabled focus trap container.');
  }

  getFocusableElements(parent) {
    if (!parent) return [];
    return Array.from(parent.querySelectorAll(
      'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex="0"], [contenteditable]'
    ));
  }

  handleKeyDown(e) {
    if (!this.initialized || !this.trapContainer) return;

    if (e.key === 'Tab') {
      const focusables = this.getFocusableElements(this.trapContainer);
      if (focusables.length === 0) {
        e.preventDefault();
        return;
      }

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          last.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === last) {
          first.focus();
          e.preventDefault();
        }
      }
    }
  }

  dispose() {
    this.trapContainer = null;
    this.previousFocusedElement = null;
    this.context = null;
    super.dispose();
  }

  getDiagnostics() {
    return {
      isFocusTrapped: !!this.trapContainer,
      activeElementTag: document.activeElement ? document.activeElement.tagName : 'NONE'
    };
  }
}

export const focusManager = new FocusManager();
export default focusManager;
