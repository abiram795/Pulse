/**
 * Single-Page Client-Side Router
 * Hash-based routing supporting history navigation, parameter extraction, and view switching.
 */

class Router {
  constructor() {
    this.routes = {};
    this.currentRoute = null;
    this.currentParams = {};
    this.currentQuery = {};
    this.beforeHooks = [];

    window.addEventListener('hashchange', () => this.handleRouting());
  }

  register(path, handler) {
    this.routes[path] = handler;
  }

  beforeEach(fn) {
    this.beforeHooks.push(fn);
  }

  navigate(hashPath) {
    window.location.hash = hashPath.startsWith('#') ? hashPath : '#' + hashPath;
  }

  handleRouting() {
    const rawHash = window.location.hash.slice(1) || 'feed';
    const [pathPart, queryPart] = rawHash.split('?');

    // Parse query params
    const query = {};
    if (queryPart) {
      new URLSearchParams(queryPart).forEach((val, key) => {
        query[key] = val;
      });
    }

    const segments = pathPart.split('/').filter(Boolean);
    const root = segments[0] || 'feed';

    let matchedHandler = null;
    let params = {};

    if (root === 'article' && segments[1]) {
      matchedHandler = this.routes['article/:id'];
      params = { id: segments[1] };
    } else if (root === 'edit' && segments[1]) {
      matchedHandler = this.routes['edit/:id'];
      params = { id: segments[1] };
    } else if (root === 'profile' && segments[1]) {
      matchedHandler = this.routes['profile/:id'];
      params = { id: segments[1] };
    } else if (this.routes[root]) {
      matchedHandler = this.routes[root];
    } else {
      matchedHandler = this.routes['feed'];
    }

    this.currentRoute = root;
    this.currentParams = params;
    this.currentQuery = query;

    // Run before hooks (e.g. updating active nav indicator)
    this.beforeHooks.forEach(hook => hook(root, params, query));

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'instant' });

    if (matchedHandler) {
      matchedHandler(params, query);
    }
  }

  start() {
    this.handleRouting();
  }
}

export const router = new Router();

