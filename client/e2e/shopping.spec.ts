import { test, expect } from '@playwright/test';

test.describe('Alış-veriş axını', () => {
  test('məhsul səhifəsi → səbətə əlavə etmə → checkout', async ({ page }) => {
    const uniqueEmail = `e2e_shop_${Math.random().toString(36).substring(7)}@test.com`;

    // 1. Qeydiyyatdan keç
    await page.goto('/az/register');
    await page.fill('[name="name"]', 'E2E Shopping User');
    await page.fill('[name="email"]', uniqueEmail);
    await page.fill('[name="password"]', 'Test@1234');
    await page.fill('[name="confirmPassword"]', 'Test@1234');
    await page.click('button[type="submit"]');

    // Uğurlu qeydiyyatdan sonra login-ə yönləndirilməlidir
    await expect(page).toHaveURL(/\/login/);
    await expect(page.locator('text=Qeydiyyat uğurludur')).toBeVisible();

    // 2. Giriş et
    await page.fill('[name="email"]', uniqueEmail);
    await page.fill('[name="password"]', 'Test@1234');
    await page.click('button[type="submit"]');

    // Uğurlu girişdən sonra ana səhifəyə yönləndirilməlidir
    await expect(page).toHaveURL(/\/az$/);

    // 3. Məhsul detal səhifəsinə get
    await page.goto('/az/products/iphone-15-pro-256gb');

    // Səhifə başlığını yoxla
    const title = await page.title();
    expect(title).toContain('iPhone');

    // 4. Səbətə əlavə et düyməsinə kliklə
    const addToCartBtn = page.locator('[data-testid="add-to-cart-btn"]');
    await expect(addToCartBtn).toBeVisible();
    await addToCartBtn.click();

    // Uğurlu mesajı yoxla
    await expect(page.locator('text=Səbətə əlavə edildi!')).toBeVisible();

    // 5. Səbət panelinin (Cart Drawer) açıldığını yoxla
    const drawerTitle = page.locator('text=Səbətiniz');
    await expect(drawerTitle).toBeVisible();

    // Səbətdə əlavə olunmuş məhsulun göründüyünü yoxla
    await expect(page.locator('text=iPhone 15 Pro 256GB')).toBeVisible();

    // 6. Checkout (Sifarişi rəsmiləşdir) düyməsinə kliklə
    const checkoutLink = page.locator('a:has-text("Sifarişi rəsmiləşdir")');
    await expect(checkoutLink).toBeVisible();
    await checkoutLink.click();

    // 7. Checkout səhifəsinə yönləndirilməsini yoxla
    await expect(page).toHaveURL(/\/checkout/);
  });

  test('məhsul səhifəsinin SEO meta tag-ları yoxlanır', async ({ page }) => {
    await page.goto('/az/products/iphone-15-pro-256gb');

    const title = await page.title();
    expect(title).toContain('iPhone');
    expect(title).toContain('ShopFlow');

    // Canonical link-i yoxla
    const canonical = await page.$eval(
      'link[rel="canonical"]',
      (el) => el.getAttribute('href')
    );
    expect(canonical).toContain('/products/iphone-15-pro-256gb');

    // Hreflang alternates yoxla
    const hreflangAz = await page.$eval(
      'link[hreflang="az"]',
      (el) => el.getAttribute('href')
    );
    expect(hreflangAz).toContain('/az/products/iphone-15-pro-256gb');
  });
});
