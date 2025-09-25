import { test, expect } from '@playwright/test';

test.describe('UI Improvements E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto('/auth');
    
    // Login (assuming test credentials exist)
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Wait for navigation to dashboard
    await page.waitForURL('/');
  });

  test('Signup/login → create post → post visible in feed', async ({ page }) => {
    // Verify we're on the dashboard
    await expect(page.locator('h1')).toContainText('Welcome to COZI');

    // Test desktop create button in header
    await page.click('button:has-text("Create")');
    
    // Fill out post form
    await page.fill('input[placeholder*="title"]', 'Test Post Title');
    await page.fill('textarea[placeholder*="content"]', 'This is a test post content for E2E testing.');
    
    // Select a group (assuming there's at least one available)
    await page.click('select[name="groupId"]');
    await page.selectOption('select[name="groupId"]', { index: 0 });
    
    // Submit the post
    await page.click('button:has-text("Publish Post")');
    
    // Verify success toast appears
    await expect(page.locator('.sonner-toast')).toContainText('Post Published');
    
    // Wait for page reload and verify post appears in feed
    await page.waitForTimeout(2000);
    await expect(page.locator('[data-testid="post-card"]').first()).toContainText('Test Post Title');
  });

  test('Open a Group page → open a post → return to group', async ({ page }) => {
    // Navigate to a category first
    const categoryCard = page.locator('.category-card').first();
    await categoryCard.click();
    
    // Wait for category page to load
    await page.waitForLoadState('networkidle');
    
    // Click on a group
    const groupCard = page.locator('.group-card').first();
    await groupCard.click();
    
    // Verify we're on group page
    await expect(page.locator('[data-testid="context-bar"]')).toContainText('Group:');
    
    // Click on a post in the group
    const postCard = page.locator('[data-testid="post-card"]').first();
    await postCard.click();
    
    // Verify we're on post detail page
    await expect(page.locator('h1')).toBeVisible();
    
    // Use browser back button to return to group
    await page.goBack();
    
    // Verify we're back on group page
    await expect(page.locator('[data-testid="context-bar"]')).toContainText('Group:');
  });

  test('Create a post and observe success toast', async ({ page }) => {
    // Test mobile floating action button
    await page.setViewportSize({ width: 375, height: 667 }); // Mobile viewport
    
    // Click the floating action button
    await page.click('button[aria-label="Create post"]');
    
    // Fill out the form
    await page.fill('input[placeholder*="title"]', 'Mobile Test Post');
    await page.fill('textarea[placeholder*="content"]', 'Testing mobile post creation flow.');
    
    // Select a group
    await page.click('select[name="groupId"]');
    await page.selectOption('select[name="groupId"]', { index: 0 });
    
    // Submit
    await page.click('button:has-text("Publish Post")');
    
    // Verify success toast
    await expect(page.locator('.sonner-toast')).toContainText('Post Published');
    
    // Verify dialog closes
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();
  });

  test('Header accessibility and navigation', async ({ page }) => {
    // Test skip to content link
    await page.keyboard.press('Tab');
    await expect(page.locator('a:has-text("Skip to content")')).toBeFocused();
    
    // Test header navigation items have proper ARIA attributes
    const homeLink = page.locator('nav button:has-text("Home")');
    await expect(homeLink).toHaveAttribute('aria-current', 'page');
    
    // Test profile menu accessibility
    const profileButton = page.locator('button[aria-label="User profile menu"]');
    await expect(profileButton).toBeVisible();
    await profileButton.click();
    
    // Verify dropdown menu appears
    await expect(page.locator('[role="menu"]')).toBeVisible();
    
    // Test keyboard navigation
    await page.keyboard.press('Escape');
    await expect(page.locator('[role="menu"]')).not.toBeVisible();
  });

  test('Mobile responsive behavior', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Verify hamburger menu is visible
    await expect(page.locator('button[aria-label="Open navigation menu"]')).toBeVisible();
    
    // Verify primary CTA is hidden on mobile (replaced by FAB)
    await expect(page.locator('button:has-text("Create")')).not.toBeVisible();
    
    // Verify floating action button is visible
    await expect(page.locator('button[aria-label="Create post"]')).toBeVisible();
    
    // Test hamburger menu
    await page.click('button[aria-label="Open navigation menu"]');
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    // Test navigation in mobile menu
    await page.click('button:has-text("News")');
    await page.waitForURL('/news');
    await expect(page.locator('[data-testid="context-bar"]')).toContainText('News');
  });

  test('Skeleton loaders appear during loading states', async ({ page }) => {
    // Navigate to a page that shows loading state
    await page.goto('/group/some-group-id');
    
    // Verify skeleton loaders appear initially
    await expect(page.locator('.animate-pulse')).toBeVisible();
    
    // Wait for content to load
    await page.waitForLoadState('networkidle');
    
    // Verify actual content appears
    await expect(page.locator('[data-testid="post-card"]')).toBeVisible();
  });

  test('Context bar shows correct page context', async ({ page }) => {
    // Test home context
    await expect(page.locator('[data-testid="context-bar"]')).toContainText('Home');
    
    // Navigate to news
    await page.click('button:has-text("News")');
    await expect(page.locator('[data-testid="context-bar"]')).toContainText('News');
    
    // Navigate to a category
    await page.goto('/');
    const categoryCard = page.locator('.category-card').first();
    await categoryCard.click();
    await expect(page.locator('[data-testid="context-bar"]')).toContainText('Category');
  });
});