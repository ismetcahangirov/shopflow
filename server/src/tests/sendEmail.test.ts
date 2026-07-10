import {
  buildOrderConfirmationEmail,
  buildResetPasswordHtml,
  buildVerifyEmailHtml,
  sendEmail,
  extractSenderDomain,
  isUnverifiableSenderDomain,
} from '../utils/sendEmail';
import { config } from '../config/env';

var mockResendSend: jest.Mock;

jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => {
    mockResendSend = jest.fn();
    return {
      emails: {
        send: mockResendSend,
      },
    };
  }),
}));

beforeEach(() => {
  mockResendSend.mockReset();
  jest.clearAllMocks();
});

describe('email template builders', () => {
  it('builds verify email html with recipient name and verification link', () => {
    const html = buildVerifyEmailHtml('Ali Valiyev', 'https://shopflow.test/verify/token');

    expect(html).toContain('Ali Valiyev');
    expect(html).toContain('https://shopflow.test/verify/token');
    expect(html).toContain('Emaili');
  });

  it('builds reset password html with recipient name and reset link', () => {
    const html = buildResetPasswordHtml('Leyla', 'https://shopflow.test/reset/token');

    expect(html).toContain('Leyla');
    expect(html).toContain('https://shopflow.test/reset/token');
  });

  it('builds order confirmation html with item totals and discount', () => {
    const html = buildOrderConfirmationEmail('Nigar', {
      orderNumber: 'ORD-20260605-0001',
      items: [
        { name: 'Phone Case', quantity: 2, price: 12.5 },
        { name: 'Cable', quantity: 1, price: 8 },
      ],
      subtotal: 33,
      shippingCost: 5,
      discount: 3,
      total: 35,
      createdDate: '2026-06-05',
      trackingUrl: 'https://shopflow.test/orders/1',
    });

    expect(html).toContain('Nigar');
    expect(html).toContain('ORD-20260605-0001');
    expect(html).toContain('Phone Case x2');
    expect(html).toContain('12.50 AZN');
    expect(html).toContain('-3.00 AZN');
    expect(html).toContain('35.00 AZN');
    expect(html).toContain('https://shopflow.test/orders/1');
  });

  it('omits discount row when order has no discount', () => {
    const html = buildOrderConfirmationEmail('Nigar', {
      orderNumber: 'ORD-20260605-0002',
      items: [{ name: 'Cable', quantity: 1, price: 8 }],
      subtotal: 8,
      shippingCost: 5,
      discount: 0,
      total: 13,
      createdDate: '2026-06-05',
      trackingUrl: 'https://shopflow.test/orders/2',
    });

    expect(html).not.toContain('Endirim');
    expect(html).toContain('13.00 AZN');
  });

  it('sends email through Resend with configured sender', async () => {
    mockResendSend.mockResolvedValue({ error: null });

    await sendEmail({
      to: 'customer@test.com',
      subject: 'Welcome',
      html: '<p>Hello</p>',
    });

    expect(mockResendSend).toHaveBeenCalledWith({
      from: config.EMAIL_FROM,
      to: 'customer@test.com',
      subject: 'Welcome',
      html: '<p>Hello</p>',
    });
  });

  it('throws when Resend returns an error', async () => {
    const error = { message: 'API unavailable' };
    mockResendSend.mockResolvedValue({ error });

    await expect(
      sendEmail({
        to: 'customer@test.com',
        subject: 'Welcome',
        html: '<p>Hello</p>',
      }),
    ).rejects.toThrow('API unavailable');
  });
});

describe('sender domain detection (issue #89)', () => {
  it('extracts the domain from a bare address', () => {
    expect(extractSenderDomain('no-reply@shopflow.az')).toBe('shopflow.az');
  });

  it('extracts the domain from a "Name <addr>" form', () => {
    expect(extractSenderDomain('ShopFlow <No-Reply@ShopFlow.AZ>')).toBe('shopflow.az');
  });

  it('returns null when there is no address', () => {
    expect(extractSenderDomain('not-an-email')).toBeNull();
  });

  it('flags public mailbox domains Resend cannot verify', () => {
    expect(isUnverifiableSenderDomain('ShopFlow <shopflow@gmail.com>')).toBe(true);
    expect(isUnverifiableSenderDomain('someone@outlook.com')).toBe(true);
    expect(isUnverifiableSenderDomain('someone@yahoo.com')).toBe(true);
  });

  it('accepts a custom/verifiable domain', () => {
    expect(isUnverifiableSenderDomain('ShopFlow <no-reply@shopflow.az>')).toBe(false);
    expect(isUnverifiableSenderDomain('onboarding@resend.dev')).toBe(false);
  });
});
