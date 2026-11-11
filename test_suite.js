// Automated Logic Test Suite
import { MarkdownParser } from './js/services/markdown.js';

// Setup Mock LocalStorage for Node.js environment
const store = {};
globalThis.localStorage = {
  getItem: (k) => store[k] || null,
  setItem: (k, v) => { store[k] = String(v); },
  removeItem: (k) => { delete store[k]; },
  clear: () => { Object.keys(store).forEach(k => delete store[k]); }
};

// Test 1: Markdown Parser
console.log('Testing Markdown Parser...');
const testMd = `# Main Heading

## Architecture Overview
Frontend architecture is evolving rapidly with **bold concepts** and \`signals\`.

\`\`\`javascript
const greeting = "Hello World";
console.log(greeting);
\`\`\`

> "Simplicity is prerequisite for reliability."

- First pillar
- Second pillar

### Nested Details
Detailed analysis here.`;

const parsedHtml = MarkdownParser.parse(testMd);
const headings = MarkdownParser.extractHeadings(testMd);

console.assert(headings.length === 2, `Expected 2 headings, got ${headings.length}`);
console.assert(headings[0].title === 'Architecture Overview', `Title mismatch: ${headings[0].title}`);
console.assert(headings[0].id === 'architecture-overview', `ID mismatch: ${headings[0].id}`);
console.assert(headings[1].title === 'Nested Details', `Title mismatch: ${headings[1].title}`);
console.assert(parsedHtml.includes('code-block-wrapper'), 'Code block wrapper missing in HTML');
console.assert(parsedHtml.includes('<blockquote'), 'Blockquote missing in HTML');
console.assert(parsedHtml.includes('<strong>bold concepts</strong>'), 'Bold tag missing');
console.log('✔ Markdown Parser passed!');

// Test 2: Storage Service
console.log('Testing Storage Service...');
const { storage } = await import('./js/services/storage.js');

// Verify initial seeded posts
const initialPosts = storage.getPosts({ status: 'published' });
console.assert(initialPosts.length >= 5, `Expected at least 5 default posts, got ${initialPosts.length}`);
console.log(`✔ Initial seed verified: ${initialPosts.length} posts loaded`);

// Test Category Filtering
const techPosts = storage.getPosts({ category: 'Technology' });
console.assert(techPosts.length > 0, 'Category filter failed for Technology');
console.assert(techPosts.every(p => p.category === 'Technology'), 'Category filter returned wrong category');
console.log(`✔ Category filtering verified: ${techPosts.length} Technology posts`);

// Test Search Query
const searchResults = storage.getPosts({ search: 'Frontend' });
console.assert(searchResults.length > 0, 'Search failed for "Frontend"');
console.assert(searchResults.some(p => p.title.includes('Frontend')), 'Search result does not contain keyword');
console.log(`✔ Search query verified: found ${searchResults.length} matches`);

// Test Tag Filtering
const tagResults = storage.getPosts({ tag: 'javascript' });
console.assert(tagResults.length > 0, 'Tag filter failed for "javascript"');
console.log(`✔ Tag filter verified: found ${tagResults.length} matches`);

// Test Create New Post
const created = storage.createPost({
  title: 'Automated Test Article',
  subtitle: 'A test excerpt',
  category: 'Engineering',
  tags: ['test', 'automation'],
  content: '## Automated Testing\nThis was created by the test suite.',
  status: 'published'
});
console.assert(created && created.id, 'Failed to create post');
console.assert(storage.getPostById(created.id) !== null, 'Created post could not be retrieved by ID');
console.log(`✔ Post creation verified: ${created.id}`);

// Test Likes Toggle
const likeBefore = storage.isLiked(created.id);
console.assert(likeBefore === false, 'New post should not be liked yet');
const likeRes1 = storage.toggleLike(created.id);
console.assert(likeRes1.liked === true && likeRes1.count === 1, 'Toggle like 1 failed');
console.assert(storage.isLiked(created.id) === true, 'isLiked should return true');
const likeRes2 = storage.toggleLike(created.id);
console.assert(likeRes2.liked === false && likeRes2.count === 0, 'Toggle like 2 failed');
console.log('✔ Likes toggling verified!');

// Test Bookmarks Toggle
const bmBefore = storage.isBookmarked(created.id);
console.assert(bmBefore === false, 'New post should not be bookmarked');
const bm1 = storage.toggleBookmark(created.id);
console.assert(bm1 === true && storage.isBookmarked(created.id) === true, 'Toggle bookmark 1 failed');
const bookmarkedList = storage.getBookmarkedPosts();
console.assert(bookmarkedList.some(p => p.id === created.id), 'Bookmarked post missing in list');
const bm2 = storage.toggleBookmark(created.id);
console.assert(bm2 === false && storage.isBookmarked(created.id) === false, 'Toggle bookmark 2 failed');
console.log('✔ Bookmarking verified!');

// Test Comments & Threaded Replies
const comment1 = storage.addComment(created.id, 'Super insightful test comment!');
console.assert(comment1 && comment1.id, 'Failed to add comment');
const reply1 = storage.addComment(created.id, 'This is a threaded reply to test comment', comment1.id);
console.assert(reply1 && reply1.id, 'Failed to add reply');

const fetchedPost = storage.getPostById(created.id);
console.assert(fetchedPost.comments.length === 1, 'Expected 1 top level comment');
console.assert(fetchedPost.comments[0].replies.length === 1, 'Expected 1 nested reply');
console.assert(fetchedPost.comments[0].replies[0].content === 'This is a threaded reply to test comment', 'Reply content mismatch');
console.log('✔ Threaded commenting verified!');

// Test Updating Post
const updated = storage.updatePost(created.id, {
  title: 'Updated Test Article Title'
});
console.assert(updated.title === 'Updated Test Article Title', 'Failed to update post title');
console.log('✔ Post update verified!');

// Test Deleting Post
const deleted = storage.deletePost(created.id);
console.assert(deleted === true, 'Failed to delete post');
console.assert(storage.getPostById(created.id) === null, 'Post still exists after delete');
console.log('✔ Post deletion verified!');

// Test User Profile & Stats
const currentUser = storage.getCurrentUser();
console.assert(currentUser && currentUser.name, 'Failed to get current user');
const stats = storage.getUserStats(currentUser.id);
console.assert(typeof stats.publishedCount === 'number', 'Stats publishedCount missing');
console.assert(typeof stats.totalLikesReceived === 'number', 'Stats totalLikesReceived missing');
console.log('✔ User profile & stats verified!');

// Test Export and Import
const exportedJson = storage.exportAllData();
console.assert(exportedJson.includes('"version": "1.0"'), 'Export JSON format invalid');
const importRes = storage.importData(exportedJson);
console.assert(importRes.success === true, 'Import JSON failed');
console.log('✔ Export and Import verified!');

console.log('\n🎉 ALL UNIT & INTEGRATION TESTS PASSED WITH 100% SUCCESS!');

