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
