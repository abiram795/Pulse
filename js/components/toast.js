/**
 * Toast Notification System
 * Non-intrusive, accessible notifications with smooth micro-animations.
 */

import { icons } from './icons.js';

class ToastManager {
  constructor() {
    this.container = null;
    this.ensureContainer();
  }

  ensureContainer() {
    if (!this.container) {
      let el = document.getElementById('toast-container');
      if (!el) {
        el = document.createElement('div');
        el.id = 'toast-container';
        el.className = 'toast-container';
        el.setAttribute('aria-live', 'polite');
        el.setAttribute('role', 'status');
        document.body.appendChild(el);
      }
      this.container = el;
    }
  }

  show(message, type = 'info', duration = 3200) {
    this.ensureContainer();

    const toast = document.createElement('div');
    toast.className = `toast-item toast-${type}`;

    let iconHtml = icons.sparkles;
    if (type === 'success') iconHtml = icons.check;
    if (type === 'error') iconHtml = icons.x;
    if (type === 'bookmark') iconHtml = icons.bookmarkFill;

    toast.innerHTML = `
      <div class="toast-icon">${iconHtml}</div>
      <div class="toast-message">${message}</div>
      <button class="toast-close" aria-label="Close notification">${icons.x}</button>
      <div class="toast-progress"></div>
    `;

    const closeBtn = toast.querySelector('.toast-close');
    const dismiss = () => {
      toast.classList.add('toast-leaving');
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 250);
    };

    closeBtn.addEventListener('click', dismiss);

    this.container.appendChild(toast);

    // Auto dismiss after duration
    if (duration > 0) {
      const progressBar = toast.querySelector('.toast-progress');
      if (progressBar) {
        progressBar.style.transitionDuration = `${duration}ms`;
        requestAnimationFrame(() => {
          progressBar.classList.add('toast-progress-active');
        });
      }

      setTimeout(dismiss, duration);
    }

    return toast;
  }

  success(msg, duration) {
    return this.show(msg, 'success', duration);
  }

  error(msg, duration) {
    return this.show(msg, 'error', duration);
  }

  info(msg, duration) {
    return this.show(msg, 'info', duration);
  }
}

export const toast = new ToastManager();

