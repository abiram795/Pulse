/**
 * Modal Manager Component
 * Handles open/close states, keyboard traps (ESC to close), backdrop clicks, and animation.
 */

import { icons } from './icons.js';

class ModalManager {
  constructor() {
    this.activeModal = null;
    this.setupListeners();
  }

  setupListeners() {
    // Global ESC listener to dismiss modal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.activeModal) {
        this.close();
      }
    });

    // Close when clicking modal backdrop
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal-backdrop')) {
        this.close();
      }
    });
  }

  open(title, contentHtml, footerHtml = '', options = {}) {
    this.close(); // Close any currently open modal

    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    backdrop.id = 'active-modal-backdrop';

    const container = document.createElement('div');
    container.className = `modal-container ${options.size ? `modal-${options.size}` : ''}`;
    container.setAttribute('role', 'dialog');
    container.setAttribute('aria-modal', 'true');

    container.innerHTML = `
      <div class="modal-header">
        <h3 class="modal-title">${title}</h3>
        <button class="modal-close-btn" aria-label="Close modal">${icons.x}</button>
      </div>
      <div class="modal-body">
        ${contentHtml}
      </div>
      ${footerHtml ? `<div class="modal-footer">${footerHtml}</div>` : ''}
    `;

    backdrop.appendChild(container);
    document.body.appendChild(backdrop);
    document.body.classList.add('modal-open');

    const closeBtn = container.querySelector('.modal-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close());
    }

    requestAnimationFrame(() => {
      backdrop.classList.add('modal-visible');
    });

    this.activeModal = backdrop;

    // Focus first input if present
    setTimeout(() => {
      const firstInput = container.querySelector('input, textarea, button:not(.modal-close-btn)');
      if (firstInput) firstInput.focus();
    }, 100);

    return container;
  }

  close() {
    if (!this.activeModal) return;
    const modal = this.activeModal;
    this.activeModal = null;

    modal.classList.remove('modal-visible');
    document.body.classList.remove('modal-open');

    setTimeout(() => {
      if (modal.parentNode) {
        modal.parentNode.removeChild(modal);
      }
    }, 200);
  }

  confirm({ title, message, confirmText = 'Confirm', cancelText = 'Cancel', isDanger = false, onConfirm }) {
    const content = `<p class="modal-confirm-text">${message}</p>`;
    const footer = `
      <button class="btn btn-secondary modal-cancel-btn">${cancelText}</button>
      <button class="btn ${isDanger ? 'btn-danger' : 'btn-primary'} modal-confirm-btn">${confirmText}</button>
    `;

    const container = this.open(title, content, footer, { size: 'sm' });

    const cancelBtn = container.querySelector('.modal-cancel-btn');
    const confirmBtn = container.querySelector('.modal-confirm-btn');

    cancelBtn.addEventListener('click', () => this.close());
    confirmBtn.addEventListener('click', () => {
      this.close();
      if (typeof onConfirm === 'function') onConfirm();
    });
  }
}

export const modal = new ModalManager();

