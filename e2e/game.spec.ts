import { test, expect } from '@playwright/test';

test.describe('EquiJump Game', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('landing page loads correctly', async ({ page }) => {
    // Check title
    await expect(page).toHaveTitle(/EquiJump/);

    // Check main heading
    await expect(page.getByRole('heading', { name: /EquiJump/i })).toBeVisible();

    // Check play button
    await expect(page.getByRole('link', { name: /Play Now/i })).toBeVisible();

    // Check courses button
    await expect(page.getByRole('link', { name: /Browse Courses/i })).toBeVisible();
  });

  test('can navigate to courses page', async ({ page }) => {
    await page.click('text=Browse Courses');

    await expect(page).toHaveURL('/courses');
    await expect(page.getByRole('heading', { name: /Choose Your Course/i })).toBeVisible();
  });

  test('can start a game', async ({ page }) => {
    // Navigate to game
    await page.click('text=Play Now');

    // Wait for game canvas to load
    await page.waitForSelector('canvas', { timeout: 10000 });

    // Game canvas should be visible (use first() as Phaser creates multiple canvases)
    await expect(page.locator('canvas').first()).toBeVisible();
  });

  test('HUD elements are visible during gameplay', async ({ page }) => {
    await page.goto('/play/beginner-1');
    await page.waitForSelector('canvas', { timeout: 10000 });

    // Wait for game to initialize
    await page.waitForTimeout(1000);

    // Check HUD elements are present (they're React overlays)
    // Speed/gait indicator
    await expect(page.locator('text=HALT').or(page.locator('text=WALK'))).toBeVisible();

    // Timer should be visible
    await expect(page.locator('text=/\\d{2}:\\d{2}\\.\\d{2}/')).toBeVisible();
  });

  test('game initializes with correct state', async ({ page }) => {
    await page.goto('/play/beginner-1');
    await page.waitForSelector('canvas', { timeout: 10000 });
    await page.waitForTimeout(1000);

    // Initial state should be HALT
    await expect(page.locator('text=HALT')).toBeVisible();

    // Speed should be 0 initially
    await expect(page.locator('text=0 px/s')).toBeVisible();

    // Timer should be running
    const timerBefore = await page.locator('text=/\\d{2}:\\d{2}\\.\\d{2}/').textContent();
    await page.waitForTimeout(500);
    const timerAfter = await page.locator('text=/\\d{2}:\\d{2}\\.\\d{2}/').textContent();
    expect(timerBefore).not.toBe(timerAfter);
  });

  test('pause functionality works', async ({ page }) => {
    await page.goto('/play/beginner-1');
    await page.waitForSelector('canvas', { timeout: 10000 });
    await page.waitForTimeout(1000);

    // Find and click pause button (SVG with pause icon)
    const pauseButton = page.locator('button').filter({ has: page.locator('svg') }).first();
    await pauseButton.click();

    // Pause overlay should appear
    await expect(page.locator('text=Paused')).toBeVisible();
    await expect(page.locator('text=Resume')).toBeVisible();

    // Click resume
    await page.click('text=Resume');

    // Pause overlay should disappear
    await expect(page.locator('text=Paused')).not.toBeVisible();
  });
});

test.describe('Courses Page', () => {
  test('displays available courses', async ({ page }) => {
    await page.goto('/courses');

    // Check for course cards
    await expect(page.locator('text=First Steps')).toBeVisible();
    await expect(page.locator('text=Gentle Curves')).toBeVisible();

    // Check for locked courses
    await expect(page.locator('text=Locked').first()).toBeVisible();
  });

  test('can start unlocked course', async ({ page }) => {
    await page.goto('/courses');

    // Click play on first course
    await page.locator('text=First Steps').locator('..').locator('text=Play').click();

    // Should navigate to game
    await expect(page).toHaveURL('/play/beginner-1');
    await page.waitForSelector('canvas', { timeout: 10000 });
  });
});

test.describe('Mobile', () => {
  test.use({ viewport: { width: 375, height: 667 }, hasTouch: true });

  test('touch controls visible on mobile', async ({ page }) => {
    await page.goto('/play/beginner-1');
    await page.waitForSelector('canvas', { timeout: 10000 });
    await page.waitForTimeout(2000); // Wait for mobile detection and controls render

    // On mobile viewport with touch, JUMP button should be visible
    // Use role selector with name
    await expect(page.getByRole('button', { name: /jump/i })).toBeVisible({ timeout: 5000 });
  });

  test('landing page is responsive', async ({ page }) => {
    await page.goto('/');

    // Title should be visible
    await expect(page.getByRole('heading', { name: /EquiJump/i })).toBeVisible();

    // Buttons should stack on mobile
    const playButton = page.getByRole('link', { name: /Play Now/i });
    const coursesButton = page.getByRole('link', { name: /Browse Courses/i });

    await expect(playButton).toBeVisible();
    await expect(coursesButton).toBeVisible();
  });
});
