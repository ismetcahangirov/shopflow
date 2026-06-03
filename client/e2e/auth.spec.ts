import { test, expect } from '@playwright/test';

test.describe('Autentifikasiya axını', () => {
  test('qeydiyyat → giriş → çıxış', async ({ page }) => {
    const uniqueEmail = `e2e_${Math.random().toString(36).substring(7)}@test.com`;

    // Qeydiyyat səhifəsinə get
    await page.goto('/az/register');

    // Formu doldur
    await page.fill('[name="name"]', 'E2E Test İstifadəçi');
    await page.fill('[name="email"]', uniqueEmail);
    await page.fill('[name="password"]', 'Test@1234');
    await page.fill('[name="confirmPassword"]', 'Test@1234');
    await page.click('button[type="submit"]');

    // Uğurlu qeydiyyatdan sonra login səhifəsinə yönləndirilməlidir
    await expect(page).toHaveURL(/\/login/);
    await expect(page.locator('text=Qeydiyyat uğurludur')).toBeVisible();

    // Giriş et
    await page.fill('[name="email"]', uniqueEmail);
    await page.fill('[name="password"]', 'Test@1234');
    await page.click('button[type="submit"]');

    // Giriş uğurlu olduqda ana səhifəyə yönləndirilir
    await expect(page).toHaveURL(/\/az$/);

    // Profil menyusunu aç
    await page.click('button[aria-expanded]');

    // Çıxış düyməsinə kliklə
    await page.click('button:has-text("Çıxış")');

    // Çıxış uğurlu olduqda login düyməsi yenidən görünməlidir
    await expect(page.locator('a:has-text("Daxil ol")')).toBeVisible();
  });

  test('yanlış credentials ilə giriş', async ({ page }) => {
    await page.goto('/az/login');
    await page.fill('[name="email"]', 'wrong@test.com');
    await page.fill('[name="password"]', 'WrongPass');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=Email və ya şifrə yanlışdır')).toBeVisible();
  });
});
