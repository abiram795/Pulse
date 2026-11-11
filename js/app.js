/**
 * Main Application Orchestrator
 * Bootstraps views, routes, theme management, and global navigation.
 */

import { storage } from './services/storage.js';
import { router } from './services/router.js';
import { icons } from './components/icons.js';
import { toast } from './components/toast.js';
import { modal } from './components/modal.js';

// Views
import { feedView } from './views/feedView.js';
import { articleView } from './views/articleView.js';
import { editorView } from './views/editorView.js';
import { bookmarksView } from './views/bookmarksView.js';
import { profileView } from './views/profileView.js';

class App {
  constructor() {
    this.theme = 'light';
    this.views = {
      feed: document.getElementById('view-feed'),
      article: document.getElementById('view-article'),
      editor: document.getElementById('view-editor'),
      bookmarks: document.getElementById('view-bookmarks'),
      profile: document.getElementById('view-profile')
    };
  }

  init() {
    this.initTheme();
    this.setupGlobalNavigation();
    this.setupRoutes();
    this.setupDataBackup();
    this.updateUserNav();
    router.start();
  }

  // --- THEME MANAGEMENT ---

  initTheme() {
    const saved = localStorage.getItem('blong_theme_v1');
    if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      this.setTheme('dark');
    } else {
      this.setTheme('light');
    }

    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    if (themeToggleBtn) {
      themeToggleBtn.addEventListener('click', () => {
        const nextTheme = this.theme === 'light' ? 'dark' : 'light';
        this.setTheme(nextTheme);
        toast.info(`Switched to ${nextTheme} mode`);
      });
    }
  }

  setTheme(theme) {
    this.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('blong_theme_v1', theme);

    const toggleBtn = document.getElementById('theme-toggle-btn');
    if (toggleBtn) {
      toggleBtn.innerHTML = theme === 'dark' ? icons.sun : icons.moon;
      toggleBtn.setAttribute('title', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
    }
  }

  // --- NAVIGATION & USER UI ---

  updateUserNav() {
    const user = storage.getCurrentUser();
    const avatarImg = document.getElementById('nav-user-avatar');
    if (avatarImg && user.avatar) {
      avatarImg.src = user.avatar;
      avatarImg.alt = user.name;
    }

    // Update bookmark count badge
    const countBadge = document.getElementById('nav-bookmarks-count');
    if (countBadge) {
      const count = storage.getBookmarksList().length;
      countBadge.textContent = count;
      countBadge.style.display = count > 0 ? 'inline-flex' : 'none';
    }
  }

  setupGlobalNavigation() {
    // Quick search from navbar
    const navSearchForm = document.getElementById('nav-search-form');
    const navSearchInput = document.getElementById('nav-search-input');
    if (navSearchForm && navSearchInput) {
      navSearchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const q = navSearchInput.value.trim();
        if (q) {
          router.navigate(`feed?search=${encodeURIComponent(q)}`);
          navSearchInput.value = '';
        }
      });
    }

    // Mobile nav toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileNavDrawer = document.getElementById('mobile-nav-drawer');
    if (mobileMenuBtn && mobileNavDrawer) {
      mobileMenuBtn.addEventListener('click', () => {
        mobileNavDrawer.classList.toggle('open');
      });

      // Close mobile drawer on link click
      mobileNavDrawer.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          mobileNavDrawer.classList.remove('open');
        });
      });
    }

    // User Avatar dropdown toggle
    const userMenuBtn = document.getElementById('user-menu-btn');
    const userDropdown = document.getElementById('user-dropdown');
    if (userMenuBtn && userDropdown) {
      userMenuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        userDropdown.classList.toggle('hidden');
      });

      document.addEventListener('click', () => {
        userDropdown.classList.add('hidden');
      });
    }

    // Data backup button in dropdown & sidebar
    const backupBtn = document.getElementById('dropdown-backup-btn');
    if (backupBtn) {
      backupBtn.addEventListener('click', () => this.openBackupModal());
    }

    // Reset data button in dropdown
    const resetDataBtn = document.getElementById('dropdown-reset-btn');
    if (resetDataBtn) {
      resetDataBtn.addEventListener('click', () => {
        modal.confirm({
          title: 'Reset to Demo Data?',
          message: 'This will restore all default articles and profiles. Any custom articles or comments will be replaced.',
          confirmText: 'Reset Demo Data',
          isDanger: true,
          onConfirm: () => {
            storage.resetToDefault();
            toast.success('Platform reset to default demo data');
            this.updateUserNav();
            router.navigate('feed');
            window.location.reload();
          }
        });
      });
    }
  }

  // --- ROUTING ORCHESTRATION ---

  setupRoutes() {
    // Before hook: Switch visible section container & update active links
    router.beforeEach((rootRoute) => {
      this.updateUserNav();

      // Hide all views
      Object.values(this.views).forEach(el => {
        if (el) el.classList.add('hidden');
      });

      // Update navbar active state
      document.querySelectorAll('.nav-link').forEach(link => {
        const href = link.getAttribute('href');
        if (href === `#${rootRoute}`) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
    });

    // Register routes
    router.register('feed', (params, query) => {
      this.showView('feed');
      feedView.render(params, query);
    });

    router.register('article/:id', (params) => {
      this.showView('article');
      articleView.render(params);
    });

    router.register('write', (params) => {
      this.showView('editor');
      editorView.render(params);
    });

    router.register('edit/:id', (params) => {
      this.showView('editor');
      editorView.render(params);
    });

    router.register('bookmarks', (params) => {
      this.showView('bookmarks');
      bookmarksView.render();
    });

    router.register('profile', (params) => {
      this.showView('profile');
      profileView.render(params);
    });

    router.register('profile/:id', (params) => {
      this.showView('profile');
      profileView.render(params);
    });
  }

  showView(name) {
    const el = this.views[name];
    if (el) {
      el.classList.remove('hidden');
    }
  }

  // --- DATA BACKUP MODAL ---

  setupDataBackup() {
    document.addEventListener('click', (e) => {
      if (e.target && e.target.id === 'open-backup-btn') {
        e.preventDefault();
        this.openBackupModal();
      }
    });
  }

  openBackupModal() {
    const content = `
      <div class="backup-modal-content">
        <p class="backup-intro">
          All your articles, comments, likes, and profiles are saved locally in your browser storage.
          You can download a full JSON backup to safeguard your stories, or restore from a previous export.
        </p>

        <div class="backup-actions-grid">
          <div class="backup-card">
            <h4>Export Data</h4>
            <p>Download a JSON backup of all published articles, drafts, and user data.</p>
            <button type="button" class="btn btn-outline btn-block" id="modal-export-btn">
              ${icons.download} Export JSON Backup
            </button>
          </div>

          <div class="backup-card">
            <h4>Import Data</h4>
            <p>Restore articles and profiles from a previously saved JSON file.</p>
            <label class="btn btn-secondary btn-block file-upload-btn">
              ${icons.upload}
              <span>Import JSON File</span>
              <input type="file" id="modal-import-file" accept=".json" hidden />
            </label>
          </div>
        </div>
      </div>
    `;

    const container = modal.open('Storage & Data Management', content, '', { size: 'md' });

    // Export handler
    const exportBtn = container.querySelector('#modal-export-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        const jsonStr = storage.exportAllData();
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `modern-blog-backup-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('Backup file downloaded successfully!');
      });
    }

    // Import handler
    const importInput = container.querySelector('#modal-import-file');
    if (importInput) {
      importInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (evt) => {
            const res = storage.importData(evt.target.result);
            if (res.success) {
              toast.success('Data imported successfully!');
              modal.close();
              this.updateUserNav();
              router.navigate('feed');
              window.location.reload();
            } else {
              toast.error('Import failed: ' + res.error);
            }
          };
          reader.readAsText(file);
        }
      });
    }
  }
}

// Bootstrap app on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});
