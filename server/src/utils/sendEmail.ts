// src/utils/sendEmail.ts
// Email sending utility using Resend

import { Resend } from 'resend';
import { config } from '../config/env';
import { logger } from '../config/logger';

const resend = new Resend(config.RESEND_API_KEY);

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(options: SendEmailOptions): Promise<void> {
  const { to, subject, html } = options;

  const isResendConfigured =
    config.RESEND_API_KEY &&
    config.RESEND_API_KEY !== 're_your-resend-api-key' &&
    config.RESEND_API_KEY !== 're_placeholder' &&
    config.RESEND_API_KEY.trim() !== '';

  if (!isResendConfigured && process.env.NODE_ENV !== 'test') {
    logger.info(`[Email Mock] Email would be sent to: ${to} with subject: ${subject}`);
    return;
  }

  const { error } = await resend.emails.send({
    from: config.EMAIL_FROM,
    to,
    subject,
    html,
  });

  if (error) {
    logger.error('Failed to send email', { to, subject, error });
    throw new Error(`Email göndərmə xətası: ${error.message}`);
  }

  logger.info('Email sent successfully', { to, subject });
}

export function buildVerifyEmailHtml(name: string, verifyUrl: string): string {
  return `
    <!DOCTYPE html>
    <html lang="az">
    <head><meta charset="UTF-8"><title>Email Doğrulama</title></head>
    <body style="font-family:Arial,sans-serif;background:#f9fafb;padding:40px 20px;">
      <div style="max-width:500px;margin:0 auto;background:#fff;border-radius:12px;padding:40px;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
        <h1 style="color:#1e293b;font-size:24px;margin-bottom:8px;">Salam, ${name}!</h1>
        <p style="color:#64748b;margin-bottom:24px;">ShopFlow hesabınızı doğrulamaq üçün aşağıdakı düyməyə klikləyin:</p>
        <a href="${verifyUrl}" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#4f46e5);color:#fff;text-decoration:none;padding:14px 28px;border-radius:8px;font-weight:600;font-size:16px;">Emaili Doğrula</a>
        <p style="color:#94a3b8;margin-top:24px;font-size:14px;">Bu link 24 saat keçərlidir. Əgər siz bu emaili göndərməmisinizsə, bu emaili görməzdən gəlin.</p>
      </div>
    </body>
    </html>
  `;
}

export function buildResetPasswordHtml(name: string, resetUrl: string): string {
  return `
    <!DOCTYPE html>
    <html lang="az">
    <head><meta charset="UTF-8"><title>Şifrəni Sıfırla</title></head>
    <body style="font-family:Arial,sans-serif;background:#f9fafb;padding:40px 20px;">
      <div style="max-width:500px;margin:0 auto;background:#fff;border-radius:12px;padding:40px;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
        <h1 style="color:#1e293b;font-size:24px;margin-bottom:8px;">Şifrə Sıfırlama</h1>
        <p style="color:#64748b;margin-bottom:8px;">Salam, <strong>${name}</strong>!</p>
        <p style="color:#64748b;margin-bottom:24px;">Şifrənizi sıfırlamaq üçün aşağıdakı düyməyə klikləyin:</p>
        <a href="${resetUrl}" style="display:inline-block;background:linear-gradient(135deg,#f59e0b,#d97706);color:#fff;text-decoration:none;padding:14px 28px;border-radius:8px;font-weight:600;font-size:16px;">Şifrəni Sıfırla</a>
        <p style="color:#94a3b8;margin-top:24px;font-size:14px;">Bu link 1 saat keçərlidir. Əgər şifrə sıfırlama tələbi siz göndərməmisinizsə, bu emaili görməzliyə vurun.</p>
      </div>
    </body>
    </html>
  `;
}

interface OrderConfirmationData {
  orderNumber: string;
  items: { name: string; quantity: number; price: number }[];
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  createdDate: string;
  trackingUrl: string;
}

export function buildOrderConfirmationEmail(name: string, data: OrderConfirmationData): string {
  const itemsHtml = data.items
    .map(
      (item) => `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;">${item.name} x${item.quantity}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;text-align:right;">${item.price.toFixed(2)} AZN</td>
    </tr>`,
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html lang="az">
    <head><meta charset="UTF-8"><title>Sifariş Təsdiqi</title></head>
    <body style="font-family:Arial,sans-serif;background:#f9fafb;padding:40px 20px;">
      <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
        <div style="background:linear-gradient(135deg,#6366f1,#4f46e5);padding:32px;text-align:center;">
          <h1 style="color:#fff;font-size:22px;margin:0;">Sifarişiniz Təsdiqləndi!</h1>
          <p style="color:#c7d2fe;margin:8px 0 0;font-size:14px;">#${data.orderNumber}</p>
        </div>
        <div style="padding:32px;">
          <p style="color:#1e293b;">Salam, <strong>${name}</strong>!</p>
          <p style="color:#64748b;">Sifarişiniz uğurla qəbul edildi və hazırlanmağa başladı.</p>

          <table style="width:100%;margin:24px 0;border-collapse:collapse;">
            <thead>
              <tr style="background:#f1f5f9;">
                <th style="text-align:left;padding:10px 12px;border-bottom:2px solid #e2e8f0;font-size:13px;color:#475569;">Məhsul</th>
                <th style="text-align:right;padding:10px 12px;border-bottom:2px solid #e2e8f0;font-size:13px;color:#475569;">Cəmi</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div style="border-top:1px solid #e2e8f0;padding-top:16px;font-size:14px;color:#475569;">
            <div style="display:flex;justify-content:space-between;margin-bottom:4px;"><span>Ara cəm:</span><span>${data.subtotal.toFixed(2)} AZN</span></div>
            <div style="display:flex;justify-content:space-between;margin-bottom:4px;"><span>Çatdırılma:</span><span>${data.shippingCost.toFixed(2)} AZN</span></div>
            ${data.discount > 0 ? `<div style="display:flex;justify-content:space-between;margin-bottom:4px;color:#16a34a;"><span>Endirim:</span><span>-${data.discount.toFixed(2)} AZN</span></div>` : ''}
            <div style="display:flex;justify-content:space-between;margin-top:8px;padding-top:8px;border-top:2px solid #e2e8f0;font-weight:700;color:#1e293b;"><span>Ümumi:</span><span>${data.total.toFixed(2)} AZN</span></div>
          </div>

          <div style="margin-top:24px;text-align:center;">
            <a href="${data.trackingUrl}" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#4f46e5);color:#fff;text-decoration:none;padding:14px 28px;border-radius:8px;font-weight:600;font-size:14px;">Sifarişi İzlə</a>
          </div>

          <p style="color:#94a3b8;margin-top:24px;font-size:13px;text-align:center;">Sifariş tarixi: ${data.createdDate}</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
