import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to homepage
    await page.goto('/')
  })

  test('should navigate from homepage to login page', async ({ page }) => {
    // Click login button on homepage
    await page.click('text=Accedi')
    
    // Should be on login page
    await expect(page).toHaveURL('/login')
    await expect(page.locator('h1')).toContainText('Bentornato!')
  })

  test('should navigate from homepage to register page', async ({ page }) => {
    // Click register button on homepage
    await page.click('text=Registrati')
    
    // Should be on register page
    await expect(page).toHaveURL('/register')
    await expect(page.locator('h1')).toContainText('Inizia oggi!')
  })

  test('should show validation errors on login form', async ({ page }) => {
    await page.goto('/login')
    
    // Try to submit empty form
    await page.click('button[type="submit"]')
    
    // Should show validation errors
    await expect(page.locator('text=Email is required')).toBeVisible()
    await expect(page.locator('text=Password is required')).toBeVisible()
  })

  test('should show validation errors on register form', async ({ page }) => {
    await page.goto('/register')
    
    // Try to submit empty form
    await page.click('button[type="submit"]')
    
    // Should show validation errors
    await expect(page.locator('text=Email is required')).toBeVisible()
    await expect(page.locator('text=Password is required')).toBeVisible()
  })

  test('should validate email format on login', async ({ page }) => {
    await page.goto('/login')
    
    // Enter invalid email
    await page.fill('input[type="email"]', 'invalid-email')
    await page.click('button[type="submit"]')
    
    // Should show email validation error
    await expect(page.locator('text=Invalid email address')).toBeVisible()
  })

  test('should validate password requirements on register', async ({ page }) => {
    await page.goto('/register')
    
    // Enter weak password
    await page.fill('input[id="password"]', 'weak')
    await page.click('button[type="submit"]')
    
    // Should show password validation error
    await expect(page.locator('text=Password must contain at least one uppercase letter')).toBeVisible()
  })

  test('should validate password confirmation on register', async ({ page }) => {
    await page.goto('/register')
    
    // Enter mismatched passwords
    await page.fill('input[id="password"]', 'Password123')
    await page.fill('input[id="confirmPassword"]', 'DifferentPassword123')
    await page.click('button[type="submit"]')
    
    // Should show password match error
    await expect(page.locator('text=Passwords do not match')).toBeVisible()
  })

  test('should navigate between login and register pages', async ({ page }) => {
    await page.goto('/login')
    
    // Click register link
    await page.click('text=Registrati qui')
    await expect(page).toHaveURL('/register')
    
    // Click login link
    await page.click('text=Accedi qui')
    await expect(page).toHaveURL('/login')
  })

  test('should redirect to dashboard when accessing protected route without auth', async ({ page }) => {
    // Try to access dashboard directly
    await page.goto('/dashboard')
    
    // Should be redirected to login
    await expect(page).toHaveURL('/login')
  })
})
